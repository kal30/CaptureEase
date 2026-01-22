const { onRequest, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const crypto = require("crypto");
const {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

const rpName = "CaptureEz";
const allowedOrigins = new Set([
  "https://carelog.web.app",
  "https://captureease-ef82f.web.app",
  "https://carelogjournal.com",
  "https://www.carelogjournal.com",
  "https://captureez.com",
  "https://www.captureez.com",
  "http://localhost:3000",
]);

const toBase64Url = (buffer) => Buffer.from(buffer).toString("base64url");
const fromBase64Url = (value) => Buffer.from(value, "base64url");

const normalizeOrigin = (origin) =>
  String(origin || "")
    .trim()
    .replace(/\/$/, "")
    .toLowerCase();

const isAllowedOrigin = (origin) => {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  if (allowedOrigins.has(normalized)) return true;
  if (normalized.endsWith(".captureez.com")) return true;
  if (normalized.endsWith(".carelogjournal.com")) return true;
  return false;
};

const getOrigin = (req) => req.allowedOrigin || req.headers.origin || "";

const requireAllowedOrigin = (req) => {
  const origin = getOrigin(req);
  if (!isAllowedOrigin(origin)) {
    throw new HttpsError("permission-denied", "Origin not allowed");
  }
  return normalizeOrigin(origin);
};

const requireAuth = async (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;
  if (!token) {
    throw new HttpsError("unauthenticated", "Missing auth token");
  }
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    throw new HttpsError("unauthenticated", "Invalid auth token");
  }
};

const normalizeChallenge = (challenge) => {
  if (!challenge) {
    return null;
  }
  if (typeof challenge === "string") {
    return challenge;
  }
  return toBase64Url(challenge);
};

const createChallengeDoc = async ({ type, userId, challenge, origin, rpId }) => {
  const db = admin.firestore();
  const challengeRef = db.collection("passkeyChallenges").doc();
  const normalizedChallenge = normalizeChallenge(challenge);
  if (!normalizedChallenge) {
    throw new HttpsError("internal", "Failed to generate passkey challenge");
  }
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 5 * 60 * 1000)
  );
  await challengeRef.set({
    type,
    userId: userId || null,
    challenge: normalizedChallenge,
    origin,
    rpId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt,
  });
  return challengeRef.id;
};

const consumeChallenge = async (challengeId, type) => {
  const db = admin.firestore();
  const challengeRef = db.collection("passkeyChallenges").doc(challengeId);
  const snapshot = await challengeRef.get();
  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Challenge not found");
  }
  const data = snapshot.data();
  if (data.type !== type) {
    throw new HttpsError("invalid-argument", "Challenge type mismatch");
  }
  if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
    await challengeRef.delete();
    throw new HttpsError("deadline-exceeded", "Challenge expired");
  }
  await challengeRef.delete();
  return data;
};

const respond = (res, handler) => {
  Promise.resolve(handler())
    .then((payload) => res.status(200).json(payload))
    .catch((error) => {
      const status =
        error instanceof HttpsError
          ? error.code === "permission-denied"
            ? 403
            : error.code === "unauthenticated"
              ? 401
              : error.code === "not-found"
                ? 404
                : error.code === "deadline-exceeded"
                  ? 408
                  : 400
          : 500;
      res.status(status).json({ error: error.message || "Request failed" });
    });
};

const handleCors = (req, res, next) => {
  const origin = req.headers.origin || "";
  const normalizedOrigin = normalizeOrigin(origin);
  if (normalizedOrigin) {
    res.set("Access-Control-Allow-Origin", normalizedOrigin);
    res.set("Vary", "Origin");
  }
  cors(req, res, () => {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).send("");
    }
    if (!isAllowedOrigin(origin)) {
      return res.status(403).json({ error: "Origin not allowed" });
    }
    req.allowedOrigin = normalizedOrigin;
    return next();
  });
};

exports.passkeyRegisterOptions = onRequest({ invoker: "public" }, (req, res) =>
  handleCors(req, res, () =>
    respond(res, async () => {
      if (req.method !== "POST") {
        throw new HttpsError("invalid-argument", "Method not allowed");
      }

      const origin = requireAllowedOrigin(req);
      const rpId = new URL(origin).hostname;
      const decoded = await requireAuth(req);
      const userRecord = await admin.auth().getUser(decoded.uid);

      const options = generateRegistrationOptions({
        rpName,
        rpID: rpId,
        userID: Buffer.from(decoded.uid, "utf8"),
        userName: userRecord.email || decoded.uid,
        userDisplayName: userRecord.displayName || userRecord.email || "User",
        attestationType: "none",
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
      });
      if (!options.user || !options.user.id) {
        options.user = {
          id: toBase64Url(Buffer.from(decoded.uid, "utf8")),
          name: userRecord.email || decoded.uid,
          displayName: userRecord.displayName || userRecord.email || "User",
        };
      }
      if (!options.challenge) {
        options.challenge = toBase64Url(crypto.randomBytes(32));
      }

      const challengeId = await createChallengeDoc({
        type: "registration",
        userId: decoded.uid,
        challenge: options.challenge,
        origin,
        rpId,
      });

      return { options, challengeId };
    })
  )
);

exports.passkeyRegisterVerify = onRequest({ invoker: "public" }, (req, res) =>
  handleCors(req, res, () =>
    respond(res, async () => {
      if (req.method !== "POST") {
        throw new HttpsError("invalid-argument", "Method not allowed");
      }

      const decoded = await requireAuth(req);
      const { challengeId, response } = req.body || {};
      if (!challengeId || !response) {
        throw new HttpsError("invalid-argument", "Missing registration response");
      }

      const challenge = await consumeChallenge(challengeId, "registration");
      if (challenge.userId && challenge.userId !== decoded.uid) {
        throw new HttpsError("permission-denied", "Challenge user mismatch");
      }

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: challenge.origin,
        expectedRPID: challenge.rpId,
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new HttpsError("invalid-argument", "Registration not verified");
      }

      const { registrationInfo } = verification;
      const credentialId = toBase64Url(registrationInfo.credentialID);
      const credentialPublicKey = toBase64Url(registrationInfo.credentialPublicKey);

      await admin.firestore().collection("passkeys").doc(credentialId).set({
        userId: decoded.uid,
        credentialPublicKey,
        counter: registrationInfo.counter || 0,
        deviceType: registrationInfo.credentialDeviceType || "unknown",
        backedUp: registrationInfo.credentialBackedUp || false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUsed: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { verified: true };
    })
  )
);

exports.passkeyAuthOptions = onRequest({ invoker: "public" }, (req, res) =>
  handleCors(req, res, () =>
    respond(res, async () => {
      if (req.method !== "POST") {
        throw new HttpsError("invalid-argument", "Method not allowed");
      }

      const origin = requireAllowedOrigin(req);
      const rpId = new URL(origin).hostname;
      const { email } = req.body || {};

      let allowCredentials;
      if (email) {
        const userRecord = await admin
          .auth()
          .getUserByEmail(email)
          .catch(() => null);
        if (userRecord) {
          const snapshot = await admin
            .firestore()
            .collection("passkeys")
            .where("userId", "==", userRecord.uid)
            .get();
          const credentials = snapshot.docs.map((doc) => ({
            id: fromBase64Url(doc.id),
            type: "public-key",
          }));
          if (credentials.length) {
            allowCredentials = credentials;
          }
        }
      }

      const options = generateAuthenticationOptions({
        rpID: rpId,
        allowCredentials,
        userVerification: "preferred",
      });
      if (!options.challenge) {
        options.challenge = toBase64Url(crypto.randomBytes(32));
      }

      const challengeId = await createChallengeDoc({
        type: "authentication",
        userId: null,
        challenge: options.challenge,
        origin,
        rpId,
      });

      return { options, challengeId };
    })
  )
);

exports.passkeyAuthVerify = onRequest({ invoker: "public" }, (req, res) =>
  handleCors(req, res, () =>
    respond(res, async () => {
      if (req.method !== "POST") {
        throw new HttpsError("invalid-argument", "Method not allowed");
      }

      const { challengeId, response } = req.body || {};
      if (!challengeId || !response || !response.id) {
        throw new HttpsError("invalid-argument", "Missing authentication response");
      }

      const challenge = await consumeChallenge(challengeId, "authentication");
      const passkeySnap = await admin
        .firestore()
        .collection("passkeys")
        .doc(response.id)
        .get();

      if (!passkeySnap.exists) {
        throw new HttpsError("not-found", "Passkey not found");
      }

      const passkey = passkeySnap.data();

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: challenge.origin,
        expectedRPID: challenge.rpId,
        authenticator: {
          credentialID: fromBase64Url(response.id),
          credentialPublicKey: fromBase64Url(passkey.credentialPublicKey),
          counter: passkey.counter || 0,
        },
      });

      if (!verification.verified) {
        throw new HttpsError("invalid-argument", "Authentication failed");
      }

      await passkeySnap.ref.update({
        counter: verification.authenticationInfo.newCounter,
        lastUsed: admin.firestore.FieldValue.serverTimestamp(),
      });

      const customToken = await admin.auth().createCustomToken(passkey.userId);

      return { verified: true, customToken, userId: passkey.userId };
    })
  )
);

exports.passkeyList = onRequest({ invoker: "public" }, (req, res) =>
  handleCors(req, res, () =>
    respond(res, async () => {
      if (req.method !== "POST") {
        throw new HttpsError("invalid-argument", "Method not allowed");
      }

      const decoded = await requireAuth(req);
      const snapshot = await admin
        .firestore()
        .collection("passkeys")
        .where("userId", "==", decoded.uid)
        .get();

      const passkeys = snapshot.docs.map((doc) => ({
        credentialID: doc.id,
        ...doc.data(),
      }));

      return { passkeys };
    })
  )
);

exports.passkeyRemove = onRequest({ invoker: "public" }, (req, res) =>
  handleCors(req, res, () =>
    respond(res, async () => {
      if (req.method !== "POST") {
        throw new HttpsError("invalid-argument", "Method not allowed");
      }

      const decoded = await requireAuth(req);
      const { credentialID } = req.body || {};
      if (!credentialID) {
        throw new HttpsError("invalid-argument", "Missing credential ID");
      }

      const passkeyRef = admin.firestore().collection("passkeys").doc(credentialID);
      const snapshot = await passkeyRef.get();
      if (!snapshot.exists) {
        throw new HttpsError("not-found", "Passkey not found");
      }
      if (snapshot.data().userId !== decoded.uid) {
        throw new HttpsError("permission-denied", "Cannot remove passkey");
      }

      await passkeyRef.delete();
      return { success: true };
    })
  )
);

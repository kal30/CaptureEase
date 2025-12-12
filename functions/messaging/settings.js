/**
 * Messaging Settings – Child SMS Eligibility Management
 *
 * This module controls whether SMS / WhatsApp logging is enabled for a specific child.
 * It does NOT send or receive messages directly.
 *
 * Responsibilities:
 * - Validates that the requesting user is authenticated
 * - Verifies the user has access to the specified child
 * - Updates the child’s messaging settings in Firestore
 * - Records who made the change and when
 *
 * The stored `settings.notifications.smsEnabled` flag is later used by
 * Twilio webhook handlers to decide whether incoming messages should be
 * accepted, routed, or rejected for a given child.
 *
 * Architecture:
 * - `updateChildSmsSettingsCore` contains shared business logic
 * - `updateChildSmsSettings` is the primary callable function used by the React app
 * - `updateChildSmsSettingsHttp` is an HTTP + CORS variant for custom clients or debugging
 */
const {
  onCall,
  onRequest,
  HttpsError,
} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

/**
 * Shared business logic for updating a child's SMS settings.
 * Keeps the auth/checks in one place so both callable and HTTP handlers stay in sync.
 */
const updateChildSmsSettingsCore = async ({ uid, childId, smsEnabled }) => {
  const db = admin.firestore();

  // Check if user has access to the specified child
  const childDoc = await db.collection("children").doc(childId).get();
  if (!childDoc.exists) {
    throw new HttpsError("not-found", "Child not found");
  }

  const childData = childDoc.data();
  const childMembers = childData.users?.members || [];

  if (!childMembers.includes(uid)) {
    throw new HttpsError(
      "permission-denied",
      "User does not have access to this child"
    );
  }

  // Update child SMS notification settings - ensure proper structure
  const childRef = db.collection("children").doc(childId);

  // Get current child data to merge settings properly
  const currentChild = await childRef.get();
  const currentData = currentChild.data();

  // Prepare the settings structure (handle undefined settings)
  const updatedSettings = {
    ...(currentData.settings || {}),
    notifications: {
      ...(currentData.settings?.notifications || {}),
      smsEnabled: smsEnabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: uid,
    },
  };

  await childRef.update({
    settings: updatedSettings,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: uid,
  });

  logger.info("Child SMS settings updated successfully", {
    uid,
    childId,
    smsEnabled,
    childName: childData.name,
  });

  return {
    success: true,
    message: `SMS notifications ${smsEnabled ? "enabled" : "disabled"} for ${childData.name}`,
    childId,
    childName: childData.name,
    smsEnabled,
  };
};

const normalizeError = (error) => {
  if (error instanceof HttpsError) {
    return error;
  }

  return new HttpsError("internal", error.message || "Internal error");
};

/**
 * Update SMS notification settings for a child
 * Callable function that accepts { childId, smsEnabled } as input
 */
const updateChildSmsSettings = onCall(
  {
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      // Verify user is authenticated
      if (!request.auth || !request.auth.uid) {
        throw new HttpsError(
          "unauthenticated",
          "User must be authenticated to update SMS settings"
        );
      }

      const { childId, smsEnabled } = request.data;

      if (!childId || typeof smsEnabled !== "boolean") {
        throw new HttpsError(
          "invalid-argument",
          "childId and smsEnabled (boolean) are required"
        );
      }

      const uid = request.auth.uid;

      return await updateChildSmsSettingsCore({ uid, childId, smsEnabled });
    } catch (error) {
      logger.error("Child SMS settings update failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid,
        data: request.data,
      });

      throw normalizeError(error);
    }
  }
);

/**
 * HTTP endpoint version with explicit CORS for local dev / custom fetch usage.
 */
const updateChildSmsSettingsHttp = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "")
        : null;

      if (!token) {
        throw new HttpsError("unauthenticated", "Missing auth token");
      }

      const decoded = await admin.auth().verifyIdToken(token);

      const { childId, smsEnabled } = req.body || {};
      if (!childId || typeof smsEnabled !== "boolean") {
        throw new HttpsError(
          "invalid-argument",
          "childId and smsEnabled (boolean) are required"
        );
      }

      const result = await updateChildSmsSettingsCore({
        uid: decoded.uid,
        childId,
        smsEnabled,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Child SMS settings HTTP update failed", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.uid,
        body: req.body,
      });

      const normalized = normalizeError(error);
      const status =
        normalized.code === "invalid-argument"
          ? 400
          : normalized.code === "permission-denied"
            ? 403
            : normalized.code === "unauthenticated"
              ? 401
              : 500;

      return res.status(status).json({
        error: normalized.code,
        message: normalized.message,
      });
    }
  });
});

module.exports = {
  updateChildSmsSettings,
  updateChildSmsSettingsHttp,
};

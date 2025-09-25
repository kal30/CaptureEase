const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const twilio = require("twilio");
const { getAppConfig } = require("../utils/config");
const { uploadMediaToStorage } = require("../utils/storage");
const { hasChildAccess } = require("../utils/auth");
const {
  resolveChildForMessage,
  parseMessageTags,
  createMessageHash
} = require("../messageRouting");

// Declare secrets
const TWILIO_AUTH_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");

// Public URL for Twilio webhook validation
const PUBLIC_INGEST_URL = "https://ingestmessage-rj2mc3r72a-uc.a.run.app";

/**
 * Parse child tag from message text
 * @param {string} text - Message text to parse
 * @returns {string|null} Child tag or null if not found
 */
const parseChildTag = (text) => {
  const match = text.match(/#([a-zA-Z0-9_-]+)/i);
  return match ? match[1].toLowerCase() : null;
};

/**
 * Find child by tag name
 * @param {string} uid - User ID
 * @param {string} childTag - Child tag to search for
 * @returns {Promise<string|null>} Child ID or null if not found
 */
const findChildByTag = async (uid, childTag) => {
  try {
    const db = admin.firestore();
    const childrenQuery = await db
      .collection("children")
      .where("users.members", "array-contains", uid)
      .where("status", "==", "active")
      .get();

    for (const doc of childrenQuery.docs) {
      const childData = doc.data();
      if (childData.name && childData.name.toLowerCase() === childTag) {
        return doc.id;
      }
    }
    return null;
  } catch (error) {
    logger.error("Error finding child by tag:", error);
    return null;
  }
};

/**
 * Ingest SMS/WhatsApp messages from Twilio webhook
 */
const ingestMessage = onRequest(
  {
    secrets: [TWILIO_AUTH_TOKEN],
    cors: false,
  },
  async (req, res) => {
    try {
      // Only accept POST requests
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      const config = await getAppConfig();
      const twilioSignature = req.headers["x-twilio-signature"];
      const authToken = TWILIO_AUTH_TOKEN.value();
      const rawBody = req.rawBody?.toString("utf8") ?? "";

      const {
        From: fromPhone,
        Body: messageBody = "",
        MessageSid: messageSid,
        NumMedia: numMedia = "0",
        ...mediaFields
      } = req.body;

      // Determine channel type early for feature flags
      const isWhatsApp = fromPhone && fromPhone.startsWith("whatsapp:");
      const source = isWhatsApp ? "whatsapp" : "sms";

      // Feature flag: skip validation for sandbox testing or if disabled
      const shouldVerifySignature = config.verifySignatures && !isWhatsApp;

      if (shouldVerifySignature) {
        // Handle missing signature
        if (!twilioSignature) {
          logger.warn("Missing Twilio signature");
          res.status(403).send("Forbidden");
          return;
        }

        // Verify Twilio signature using official library
        const isValidSignature = twilio.validateRequest(
          authToken,
          twilioSignature,
          PUBLIC_INGEST_URL,
          rawBody
        );

        if (!isValidSignature) {
          // Safe diagnostics (no secrets)
          const sigPrefix = twilioSignature?.slice(0, 8);
          const tokenLen = authToken?.length;
          const rawLen = rawBody?.length;
          const url = PUBLIC_INGEST_URL;

          logger.warn("Invalid Twilio signature", {
            sigPrefix,
            tokenLen,
            rawLen,
            url,
          });
          res.status(403).send("Forbidden");
          return;
        }
      } else {
        logger.info("Signature verification skipped", {
          reason: isWhatsApp ? "whatsapp" : "disabled",
          verifySignatures: config.verifySignatures,
        });
      }

      // Clean phone number for processing
      const cleanPhone = isWhatsApp
        ? fromPhone.replace("whatsapp:", "")
        : fromPhone;

      // Check if channel is enabled
      if (
        (isWhatsApp && !config.whatsappEnabled) ||
        (!isWhatsApp && !config.smsEnabled)
      ) {
        logger.info(`${source} channel disabled`, { from: fromPhone });
        res.status(200).type("text/xml").send(`
          <Response>
            <Message>Service temporarily unavailable.</Message>
          </Response>
        `);
        return;
      }

      // Enhanced dedupe with message hash
      const db = admin.firestore();
      const messageHash = createMessageHash(cleanPhone, messageBody);
      const dedupeRef = db.collection("ingest_dedupe").doc(messageHash);
      const dedupeDoc = await dedupeRef.get();

      if (dedupeDoc.exists) {
        const dedupeData = dedupeDoc.data();
        const timeDiff = Date.now() - dedupeData.timestamp.toMillis();
        
        // Consider duplicate if within 30 seconds
        if (timeDiff < 30000) {
          logger.info("Duplicate message ignored", { messageSid, messageHash });
          res.status(200).type("text/xml").send(`
            <Response>
              <Message>Thanks, logged.</Message>
            </Response>
          `);
          return;
        }
      }

      // Create dedupe record
      await dedupeRef.set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        messageSid: messageSid,
        from: fromPhone,
        body: messageBody,
        hash: messageHash
      });

      // Look up user by phone
      const phoneIndexDoc = await db
        .collection("phone_index")
        .doc(cleanPhone)
        .get();

      if (!phoneIndexDoc.exists) {
        logger.info("Unrecognized phone number", { phone: cleanPhone });
        res.status(200).type("text/xml").send(`
          <Response>
            <Message>Welcome! Please register your phone number in the CaptureEZ first.</Message>
          </Response>
        `);
        return;
      }

      const { uid } = phoneIndexDoc.data();

      // Get user data and verify phone verification
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        logger.error("User document not found", { uid });
        res.status(200).type("text/xml").send(`
          <Response>
            <Message>Account error. Please contact support.</Message>
          </Response>
        `);
        return;
      }

      const userData = userDoc.data();
      
      // Require phone verification
      if (!userData.phoneVerified) {
        logger.warn("Phone not verified", { uid, phone: cleanPhone });
        res.status(200).type("text/xml").send(`
          <Response>
            <Message>Please verify your phone number in CaptureEZ settings first.</Message>
          </Response>
        `);
        return;
      }

      // Resolve child using enhanced logic
      const childResolution = await resolveChildForMessage({
        uid,
        text: messageBody,
        defaultChildId: userData.defaultChildId
      });

      if (!childResolution.childId) {
        logger.info("No child resolved", { 
          uid, 
          reason: childResolution.reason,
          tokenMatched: childResolution.tokenMatched 
        });
        
        // Queue message for manual routing if needed
        await db.collection("ingest_queue").add({
          uid,
          fromPhone: cleanPhone,
          messageBody,
          messageSid,
          source,
          status: "needs_child",
          reason: childResolution.reason,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).type("text/xml").send(`
          <Response>
            <Message>Please include a child tag like #Emma or #childId. Your message wasn't logged.</Message>
          </Response>
        `);
        return;
      }

      const { childId, reason, tokenMatched, matchedBy } = childResolution;

      // Check if SMS is enabled for this child
      const childDoc = await db.collection("children").doc(childId).get();
      if (!childDoc.exists) {
        logger.error("Child not found", { childId, uid });
        res.status(200).type("text/xml").send(`
          <Response>
            <Message>Child not found. Please contact support.</Message>
          </Response>
        `);
        return;
      }

      const childData = childDoc.data();

      // Enhanced debugging for SMS settings
      const smsEnabled = childData.settings?.notifications?.smsEnabled;
      logger.info("Child SMS settings debug", {
        uid,
        childId,
        childName: childData.name,
        sms: smsEnabled,
        smsType: typeof smsEnabled,
        hasSettings: !!childData.settings,
        hasNotifications: !!childData.settings?.notifications,
        settingsStructure: JSON.stringify({
          settings: childData.settings ? {
            notifications: childData.settings.notifications || 'MISSING'
          } : 'MISSING_SETTINGS'
        }),
        childResolution: { reason, tokenMatched, matchedBy }
      });

      // Check SMS enabled for child
      if (!childData.settings?.notifications?.smsEnabled) {
        logger.warn("SMS disabled for child - detailed debug", {
          uid,
          childId,
          childName: childData.name,
          sms: smsEnabled,
          smsType: typeof smsEnabled,
          reason,
          tokenMatched,
          matchedBy,
          fullSettings: JSON.stringify(childData.settings || 'NO_SETTINGS')
        });
        res.status(200).type("text/xml").send(`
          <Response>
            <Message>SMS is disabled for ${childData.name}. Enable it in Settings.</Message>
          </Response>
        `);
        return;
      }

      // Verify user has access to this child
      const hasAccess = await hasChildAccess(uid, childId);
      if (!hasAccess) {
        logger.warn("User lacks access to child", { uid, childId });
        
        // Queue for admin review
        await db.collection("ingest_queue").add({
          uid,
          childId,
          fromPhone: cleanPhone,
          messageBody,
          messageSid,
          source,
          status: "not_allowed",
          childName: childData.name,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).type("text/xml").send(`
          <Response>
            <Message>You don't have access to ${childData.name}. Ask the care owner.</Message>
          </Response>
        `);
        return;
      }

      // Process media attachments
      const attachments = [];
      const mediaCount = parseInt(numMedia) || 0;

      if (mediaCount > 0 && mediaCount <= config.maxMedia) {
        for (let i = 0; i < mediaCount; i++) {
          const mediaUrl = mediaFields[`MediaUrl${i}`];
          const mediaType = mediaFields[`MediaContentType${i}`];

          if (mediaUrl && config.allowedMime.includes(mediaType)) {
            try {
              const filename = `media_${i}_${Date.now()}`;
              const attachment = await uploadMediaToStorage(
                mediaUrl,
                childId,
                messageSid,
                filename,
                mediaType
              );
              attachments.push(attachment);
            } catch (error) {
              logger.error("Failed to process media attachment", {
                mediaUrl,
                mediaType,
                error: error.message,
              });
            }
          }
        }
      }

      // Parse hashtags into tags (excluding child token and reserved words)
      const messageTags = parseMessageTags(messageBody, tokenMatched);

      // Create enhanced log entry
      const logData = {
        childId,
        type: "note",
        note: messageBody,
        source,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        fromPhone: cleanPhone,
        sourceMessageId: messageSid,
        originalNote: messageBody,
        tags: messageTags,
        attachments,
        createdBy: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        timeStart: admin.firestore.FieldValue.serverTimestamp(),
        meta: {
          childResolution: {
            reason,
            tokenMatched,
            matchedBy
          }
        }
      };

      const logRef = await db.collection("logs").add(logData);

      logger.info("Message ingested successfully", {
        logId: logRef.id,
        messageSid,
        childId,
        childName: childData.name,
        source,
        mediaCount: attachments.length,
        childResolution: { reason, tokenMatched, matchedBy },
        tags: messageTags
      });

      // Send success response with child name
      res.status(200).type("text/xml").send(`
        <Response>
          <Message>Logged for ${childData.name}. Thanks!</Message>
        </Response>
      `);
    } catch (error) {
      logger.error("Message ingest failed", {
        error: error.message,
        stack: error.stack,
      });

      res.status(200).type("text/xml").send(`
        <Response>
          <Message>Error processing message. Please try again.</Message>
        </Response>
      `);
    }
  }
);

module.exports = {
  ingestMessage
};
const { admin, logger } = require("../../init");
const { getPhoneLink } = require("./phoneLinks");

/**
 * Create log entry in Firestore
 */
async function createEvent({ childId, text, source, from, fromE164, raw, matchedBy, segmentIndex, segmentsTotal }) {
  const phoneLink = await getPhoneLink(fromE164);
  const createdBy = phoneLink?.ownerUserId || null;

  const logDoc = {
    childId,
    type: "note",
    note: text.trim(),
    source: source || "whatsapp",
    createdBy,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    timeStart: admin.firestore.FieldValue.serverTimestamp(),
    status: "active",
    originalNote: raw?.Body || raw?.body || text,
    fromPhone: fromE164 || null,
    sourceMessageId: raw?.MessageSid || raw?.SmsSid || null,
    audit: {
      matchedBy,
      segmentIndex,
      segmentsTotal
    }
  };

  const docRef = await admin.firestore().collection("logs").add(logDoc);
  logger.info(`Log created: ${docRef.id}`, { childId, source, segmentIndex });

  return docRef.id;
}

module.exports = {
  createEvent
};

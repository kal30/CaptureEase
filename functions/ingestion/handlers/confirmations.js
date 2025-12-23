const { admin, logger } = require("../../init");
const { replyText } = require("../../utils/replyText");
const { normalizeE164 } = require("../utils");
const { createEvent } = require("../services/events");

/**
 * Handle YES confirmation
 */
async function handleConfirmation(e164, payload, pendingConfirms) {
  const pending = pendingConfirms.get(e164);

  if (!pending || Date.now() > pending.expiresAt) {
    pendingConfirms.delete(e164);
    return replyText.missingChildName;
  }

  try {
    const { source } = normalizeE164(payload.From || payload.from);
    await createEvent({
      childId: pending.candidateChildId,
      text: pending.originalText,
      source,
      from: payload.From || payload.from,
      fromE164: e164,
      raw: payload,
      matchedBy: "fuzzy",
      segmentIndex: 0,
      segmentsTotal: 1
    });

    pendingConfirms.delete(e164);

    const childDoc = await admin.firestore()
      .collection("children")
      .doc(pending.candidateChildId)
      .get();

    const childName = childDoc.exists ? childDoc.data().name : "Unknown";

    const numMedia = parseInt(payload.NumMedia || "0", 10);
    let mediaInfo = "";
    if (numMedia === 1) {
      mediaInfo = " (photo saved)";
    } else if (numMedia > 1) {
      mediaInfo = ` (media x${numMedia})`;
    }

    return replyText.loggedFor(childName, mediaInfo);
  } catch (error) {
    logger.error("Error handling confirmation:", error);
    pendingConfirms.delete(e164);
    return replyText.errorProcessing;
  }
}

module.exports = {
  handleConfirmation
};

const { logger } = require("../../init");
const { replyText } = require("../../utils/replyText");
const { getPhoneLink } = require("../services/phoneLinks");
const { resolveChild } = require("../services/children");
const { createEvent } = require("../services/events");

/**
 * Process individual child segment
 */
async function processChildSegment(segment, e164, source, payload, segmentIndex, segmentsTotal, pendingConfirms) {
  try {
    const phoneLink = await getPhoneLink(e164);
    if (!phoneLink || !phoneLink.verified) {
      return replyText.missingChildName;
    }

    const childResolution = await resolveChild(segment.childToken, phoneLink);

    if (childResolution.type === "not_found") {
      return replyText.missingChildName;
    }

    if (childResolution.type === "unauthorized") {
      return replyText.cannotLogFromNumber(childResolution.childName);
    }

    if (childResolution.type === "fuzzy_match") {
      pendingConfirms.set(e164, {
        candidateChildId: childResolution.childId,
        originalText: segment.text,
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      return replyText.confirmChildName(childResolution.childName);
    }

    await createEvent({
      childId: childResolution.childId,
      text: segment.text,
      source,
      from: payload.From || payload.from,
      fromE164: e164,
      raw: payload,
      matchedBy: childResolution.matchedBy,
      segmentIndex,
      segmentsTotal
    });

    const numMedia = parseInt(payload.NumMedia || "0", 10);
    let mediaInfo = "";
    if (numMedia === 1) {
      mediaInfo = " (photo saved)";
    } else if (numMedia > 1) {
      mediaInfo = ` (media x${numMedia})`;
    }

    return replyText.loggedFor(childResolution.childName, mediaInfo);
  } catch (error) {
    logger.error("Error processing segment:", error);
    return replyText.errorProcessing;
  }
}

module.exports = {
  processChildSegment
};

const { admin, logger } = require("../../init");
const { getPhoneLink } = require("./phoneLinks");

/**
 * Create event in Firestore
 */
async function createEvent({ childId, text, source, from, fromE164, raw, matchedBy, segmentIndex, segmentsTotal }) {
  const phoneLink = await getPhoneLink(fromE164);

  const eventDoc = {
    childId,
    source,
    from,
    fromE164,
    text: text.trim(),
    raw: {
      Body: raw.Body || raw.body,
      From: raw.From || raw.from,
      To: raw.To || raw.to,
      NumMedia: raw.NumMedia || "0"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: phoneLink?.ownerUserId || null,
    status: "active",
    ingest: {
      meta: {
        matchedBy,
        segmentIndex,
        segmentsTotal
      }
    }
  };

  const numMedia = parseInt(raw.NumMedia || "0", 10);
  for (let i = 0; i < numMedia; i++) {
    const mediaUrl = raw[`MediaUrl${i}`];
    if (mediaUrl) {
      if (!eventDoc.raw.MediaUrls) eventDoc.raw.MediaUrls = [];
      eventDoc.raw.MediaUrls.push(mediaUrl);
    }
  }

  const docRef = await admin.firestore().collection("events").add(eventDoc);
  logger.info(`Event created: ${docRef.id}`, { childId, source, segmentIndex });

  return docRef.id;
}

module.exports = {
  createEvent
};

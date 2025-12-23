const { admin, logger } = require("../../init");

/**
 * Get phone link data
 */
async function getPhoneLink(e164) {
  try {
    const doc = await admin.firestore()
      .collection("phoneLinks")
      .doc(e164)
      .get();

    return doc.exists ? doc.data() : null;
  } catch (error) {
    logger.error("Error getting phone link:", error);
    return null;
  }
}

module.exports = {
  getPhoneLink
};

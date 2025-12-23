const { logger, admin } = require("../init");
const { parseImplicitChildFromTokens } = require("./utils");
const { getPhoneLink } = require("./services/phoneLinks");

/**
 * Allow forgiving parsing when the user doesn't include a colon.
 * Matches known child names or alias codes at the start of the message.
 */
async function tryParseImplicitChild(body, fromE164) {
  try {
    const phoneLink = await getPhoneLink(fromE164);
    if (!phoneLink || !phoneLink.allowedChildIds?.length) return null;

    const tokens = [];

    for (const aliasCode of Object.values(phoneLink.aliasCodes || {})) {
      if (aliasCode) tokens.push(aliasCode);
    }

    for (const childId of phoneLink.allowedChildIds) {
      const childDoc = await admin.firestore()
        .collection("children")
        .doc(childId)
        .get();

      if (childDoc.exists) {
        const name = childDoc.data().name;
        if (name) tokens.push(name);
      }
    }

    return parseImplicitChildFromTokens(body, tokens);
  } catch (error) {
    logger.error("Error parsing implicit child prefix:", error);
    return null;
  }
}

module.exports = {
  tryParseImplicitChild
};

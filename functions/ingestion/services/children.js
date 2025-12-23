const { admin, logger } = require("../../init");
const { levenshteinDistance } = require("../utils");

/**
 * Check log permission
 */
async function checkLogPermission(userId, childId) {
  try {
    const doc = await admin.firestore()
      .collection("childAuth")
      .doc(childId)
      .collection("members")
      .doc(userId)
      .get();

    if (doc.exists) {
      const data = doc.data();
      return data.canLog === true;
    }

    const childDoc = await admin.firestore()
      .collection("children")
      .doc(childId)
      .get();

    if (!childDoc.exists) return false;

    const childData = childDoc.data();
    const members = childData.users?.members || [];
    return members.includes(userId);
  } catch (error) {
    logger.error("Error checking log permission:", error);
    return false;
  }
}

/**
 * Resolve child from token
 */
async function resolveChild(childToken, phoneLink) {
  for (const [childId, aliasCode] of Object.entries(phoneLink.aliasCodes || {})) {
    if (childToken.toLowerCase() === aliasCode.toLowerCase()) {
      const childDoc = await admin.firestore()
        .collection("children")
        .doc(childId)
        .get();

      if (childDoc.exists && phoneLink.allowedChildIds.includes(childId)) {
        const canLog = await checkLogPermission(phoneLink.ownerUserId, childId);
        if (!canLog) {
          return {
            type: "unauthorized",
            childName: childDoc.data().name
          };
        }

        return {
          type: "exact_match",
          childId,
          childName: childDoc.data().name,
          matchedBy: "shortcode"
        };
      }
    }
  }

  for (const childId of phoneLink.allowedChildIds) {
    const childDoc = await admin.firestore()
      .collection("children")
      .doc(childId)
      .get();

    if (childDoc.exists) {
      const childData = childDoc.data();
      const childName = childData.name || "";

      if (childToken.toLowerCase() === childName.toLowerCase()) {
        const canLog = await checkLogPermission(phoneLink.ownerUserId, childId);
        if (!canLog) {
          return {
            type: "unauthorized",
            childName: childData.name
          };
        }

        return {
          type: "exact_match",
          childId,
          childName: childData.name,
          matchedBy: "name"
        };
      }
    }
  }

  let bestMatch = null;
  let bestDistance = Infinity;

  for (const childId of phoneLink.allowedChildIds) {
    const childDoc = await admin.firestore()
      .collection("children")
      .doc(childId)
      .get();

    if (childDoc.exists) {
      const childData = childDoc.data();
      const childName = childData.name || "";

      const distance = levenshteinDistance(
        childToken.toLowerCase(),
        childName.toLowerCase()
      );

      if (distance <= 2 && distance < bestDistance) {
        const canLog = await checkLogPermission(phoneLink.ownerUserId, childId);
        if (canLog) {
          bestMatch = {
            childId,
            childName: childData.name,
            distance
          };
          bestDistance = distance;
        } else {
          return {
            type: "unauthorized",
            childName: childData.name
          };
        }
      }
    }
  }

  if (bestMatch) {
    return {
      type: "fuzzy_match",
      childId: bestMatch.childId,
      childName: bestMatch.childName
    };
  }

  return { type: "not_found" };
}

module.exports = {
  resolveChild
};

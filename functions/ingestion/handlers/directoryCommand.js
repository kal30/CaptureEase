const { admin, logger } = require("../../init");
const { getPhoneLink } = require("../services/phoneLinks");

/**
 * Handle directory command (children?, child?, kids?)
 */
async function handleDirectoryCommand(from, fromE164) {
  try {
    const phoneLink = await getPhoneLink(fromE164);

    logger.info("directory command", {
      from,
      fromE164,
      childrenCount: phoneLink?.allowedChildIds?.length || 0
    });

    if (!phoneLink || !phoneLink.verified) {
      return "This number is not linked to any account. Contact your caregiver to get set up.";
    }

    if (phoneLink.allowedChildIds.length === 0) {
      return "No children authorized for this number.";
    }

    // Get child names with numbering
    const childNames = [];
    let index = 1;
    for (const childId of phoneLink.allowedChildIds) {
      const childDoc = await admin.firestore()
        .collection("children")
        .doc(childId)
        .get();

      if (childDoc.exists) {
        const childData = childDoc.data();
        const aliasCode = phoneLink.aliasCodes?.[childId];
        const name = childData.name || "Unknown";

        const aliasHint = aliasCode
          ? ` (use "${aliasCode}:" or "${name}:")`
          : ` (use "${name}:")`;
        childNames.push(`${index}. ${name}${aliasHint}`);
        index++;
      }
    }

    if (childNames.length === 0) {
      return "No children found.";
    }

    const firstChildId = phoneLink.allowedChildIds[0];
    const firstAlias = firstChildId ? phoneLink.aliasCodes?.[firstChildId] : null;
    const exampleToken =
      firstAlias || (childNames[0]?.split(". ")[1]?.split(" (use")[0]) || "Child";
    const hint = `\n\nExample: "${exampleToken}: had a great day"`;

    return `You can log for:\n${childNames.join("\n")}${hint}`;
  } catch (error) {
    logger.error("Error handling directory command:", error);
    return "Error retrieving children list. Please try again.";
  }
}

module.exports = {
  handleDirectoryCommand
};

const admin = require("firebase-admin");

/**
 * Helper function to update members field for child documents
 * @param {Object} users - Users object from child document
 * @returns {Array<string>} Array of all member user IDs
 */
const updateMembersField = (users) => {
  const members = new Set();

  // Add care owner
  if (users.care_owner) {
    members.add(users.care_owner);
  }

  // Add all role arrays
  if (users.care_partners) {
    users.care_partners.forEach((id) => members.add(id));
  }
  if (users.caregivers) {
    users.caregivers.forEach((id) => members.add(id));
  }
  if (users.therapists) {
    users.therapists.forEach((id) => members.add(id));
  }

  return Array.from(members);
};

/**
 * Check if user has access to a specific child
 * @param {string} uid - User ID
 * @param {string} childId - Child ID
 * @returns {Promise<boolean>} True if user has access
 */
const hasChildAccess = async (uid, childId) => {
  try {
    const db = admin.firestore();
    const childDoc = await db.collection("children").doc(childId).get();
    
    if (!childDoc.exists) {
      return false;
    }
    
    const childData = childDoc.data();
    const members = childData.users?.members || [];
    
    return members.includes(uid);
  } catch (error) {
    return false;
  }
};

module.exports = {
  updateMembersField,
  hasChildAccess
};
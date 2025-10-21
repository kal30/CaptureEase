const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

/**
 * Update SMS notification settings for a child
 * Callable function that accepts { childId, smsEnabled } as input
 */
const updateChildSmsSettings = onCall(
  {
    region: "us-central1",
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      // Verify user is authenticated
      if (!request.auth || !request.auth.uid) {
        throw new HttpsError(
          "unauthenticated",
          "User must be authenticated to update SMS settings"
        );
      }

      const { childId, smsEnabled } = request.data;

      if (!childId || typeof smsEnabled !== "boolean") {
        throw new HttpsError(
          "invalid-argument",
          "childId and smsEnabled (boolean) are required"
        );
      }

      const db = admin.firestore();
      const uid = request.auth.uid;

      // Check if user has access to the specified child
      const childDoc = await db.collection("children").doc(childId).get();
      if (!childDoc.exists) {
        throw new HttpsError("not-found", "Child not found");
      }

      const childData = childDoc.data();
      const childMembers = childData.users?.members || [];

      if (!childMembers.includes(uid)) {
        throw new HttpsError(
          "permission-denied",
          "User does not have access to this child"
        );
      }

      // Update child SMS notification settings - ensure proper structure
      const childRef = db.collection("children").doc(childId);

      // Get current child data to merge settings properly
      const currentChild = await childRef.get();
      const currentData = currentChild.data();

      // Prepare the settings structure
      const updatedSettings = {
        ...currentData.settings,
        notifications: {
          ...currentData.settings?.notifications,
          smsEnabled: smsEnabled,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: uid,
        },
      };

      await childRef.update({
        settings: updatedSettings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: uid,
      });

      logger.info("Child SMS settings updated successfully", {
        uid,
        childId,
        smsEnabled,
        childName: childData.name,
      });

      return {
        success: true,
        message: `SMS notifications ${smsEnabled ? "enabled" : "disabled"} for ${childData.name}`,
        childId,
        childName: childData.name,
        smsEnabled,
      };
    } catch (error) {
      logger.error("Child SMS settings update failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid,
        data: request.data,
      });

      throw new HttpsError("internal", error.message);
    }
  }
);

module.exports = {
  updateChildSmsSettings,
};

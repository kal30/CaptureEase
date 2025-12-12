const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { updateMembersField } = require("../utils/auth");
const { validateRole } = require("../utils/validation");

/**
 * Accept care team invitation
 */
const acceptInvitation = onCall(
  {
    enforceAppCheck: false,
    cors: true,
    region: "us-central1",
  },
  async (request) => {
    try {
      // Verify user is authenticated
      if (!request.auth || !request.auth.uid) {
        throw new Error("User must be authenticated to accept invitations");
      }

      const { token } = request.data;

      if (!token) {
        throw new Error("Invitation token is required");
      }

      // Decode and validate token
      let inviteData;
      try {
        const decoded = JSON.parse(
          Buffer.from(decodeURIComponent(token), "base64").toString()
        );
        inviteData = decoded;
      } catch (error) {
        logger.error("Invalid invitation token", {
          error: error.message,
          token,
        });
        throw new Error("Invalid invitation token");
      }

      // Validate invitation data
      const isMultiChild = inviteData.childIds && inviteData.childNames;
      const isSingleChild = inviteData.childId && inviteData.childName;

      if (
        !inviteData.email ||
        !inviteData.role ||
        (!isMultiChild && !isSingleChild)
      ) {
        throw new Error("Invalid invitation data");
      }

      // Check if invitation is expired (30 days) - TEMPORARILY DISABLED
      // const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      // if (inviteData.timestamp && (Date.now() - inviteData.timestamp) > thirtyDaysMs) {
      //   throw new Error("This invitation has expired. Please request a new one.");
      // }

      // Verify user's email matches invitation email
      const userRecord = await admin.auth().getUser(request.auth.uid);
      if (userRecord.email !== inviteData.email) {
        throw new Error(
          `This invitation was sent to ${inviteData.email}. Please log in with that email address.`
        );
      }

      // Validate role
      if (!validateRole(inviteData.role)) {
        throw new Error(`Invalid role: ${inviteData.role}`);
      }

      // Get child IDs to process
      const childIds = isMultiChild
        ? inviteData.childIds
        : [inviteData.childId];
      const childNames = isMultiChild
        ? inviteData.childNames
        : [inviteData.childName];

      logger.info("Processing invitation acceptance", {
        userId: request.auth.uid,
        email: inviteData.email,
        role: inviteData.role,
        childIds,
        childNames,
      });

      // Process each child assignment using admin privileges
      const db = admin.firestore();
      const batch = db.batch();

      for (const childId of childIds) {
        const childRef = db.collection("children").doc(childId);

        // Get current child document
        const childDoc = await childRef.get();
        if (!childDoc.exists) {
          throw new Error(`Child ${childId} not found`);
        }

        const childData = childDoc.data();
        const currentUsers = childData.users || {};

        // Create updated users object
        const updatedUsers = { ...currentUsers };

        // Add user to appropriate role array
        switch (inviteData.role) {
          case "care_partner":
            updatedUsers.care_partners = [
              ...(currentUsers.care_partners || []),
              request.auth.uid,
            ];
            break;
          case "caregiver":
            updatedUsers.caregivers = [
              ...(currentUsers.caregivers || []),
              request.auth.uid,
            ];
            break;
          case "therapist":
            updatedUsers.therapists = [
              ...(currentUsers.therapists || []),
              request.auth.uid,
            ];
            break;
        }

        // Update members field for efficient queries
        updatedUsers.members = updateMembersField(updatedUsers);

        // Add to batch update
        batch.update(childRef, {
          users: updatedUsers,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: request.auth.uid,
        });

        logger.info("Added user to child", {
          childId,
          childName: childData.name,
          userId: request.auth.uid,
          role: inviteData.role,
        });
      }

      // Execute all updates atomically
      await batch.commit();

      // Create success message
      const successMessage =
        childNames.length === 1
          ? `Successfully joined ${childNames[0]}'s care team as ${inviteData.role}!`
          : `Successfully joined care team for ${childNames.join(", ")} as ${inviteData.role}!`;

      logger.info("Invitation acceptance completed successfully", {
        userId: request.auth.uid,
        email: inviteData.email,
        role: inviteData.role,
        childrenCount: childIds.length,
      });

      return {
        success: true,
        message: successMessage,
        childrenCount: childIds.length,
        role: inviteData.role,
      };
    } catch (error) {
      logger.error("Invitation acceptance failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid,
        data: request.data,
      });

      throw new Error(error.message);
    }
  }
);

module.exports = {
  acceptInvitation
};
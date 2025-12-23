const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { validateE164Phone } = require("../utils/validation");

/**
 * Link verified phone number to user account and set default child
 */
const linkPhoneAndDefaultChild = onCall(
  {
    enforceAppCheck: false,
    cors: true,
    region: "us-central1",
  },
  async (request) => {
    try {
      // Verify user is authenticated
      if (!request.auth || !request.auth.uid) {
        throw new Error("User must be authenticated to link phone number");
      }

      const { phoneE164, defaultChildId } = request.data;

      if (!phoneE164 || !defaultChildId) {
        throw new Error("phoneE164 and defaultChildId are required");
      }

      // Validate phone format (basic E.164 validation)
      if (!validateE164Phone(phoneE164)) {
        throw new Error("Invalid phone number format. Must be E.164 format (e.g., +1234567890)");
      }

      const db = admin.firestore();
      const uid = request.auth.uid;

      // Check if user document exists and phone is verified
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        throw new Error("User document not found");
      }

      const userData = userDoc.data();
      
      // Verify the phone number matches and is verified
      if (userData.phone !== phoneE164) {
        throw new Error("Phone number does not match user's verified phone");
      }
      
      if (!userData.phoneVerified) {
        throw new Error("Phone number must be verified before linking");
      }

      // Check if user has access to the specified child
      const childDoc = await db.collection("children").doc(defaultChildId).get();
      if (!childDoc.exists) {
        throw new Error("Child not found");
      }

      const childData = childDoc.data();
      const childMembers = childData.users?.members || [];
      
      if (!childMembers.includes(uid)) {
        throw new Error("User does not have access to this child");
      }

      // Check if phone number is already linked to another account
      const phoneIndexDoc = await db.collection("phone_index").doc(phoneE164).get();
      if (phoneIndexDoc.exists) {
        const existingData = phoneIndexDoc.data();
        if (existingData.uid !== uid) {
          throw new Error("This phone number is already linked to another account");
        }
        // Phone is already linked to this user, just update default child if needed
      }

      const phoneLinksRef = db.collection("phoneLinks").doc(phoneE164);
      const phoneLinksDoc = await phoneLinksRef.get();
      if (phoneLinksDoc.exists) {
        const existingLink = phoneLinksDoc.data();
        if (existingLink.ownerUserId && existingLink.ownerUserId !== uid) {
          throw new Error("This phone number is already linked to another account");
        }
      }

      const childrenSnapshot = await db
        .collection("children")
        .where("users.members", "array-contains", uid)
        .where("status", "==", "active")
        .get();

      const allowedChildIds = [];
      const existingAliasCodes = phoneLinksDoc.exists ? (phoneLinksDoc.data().aliasCodes || {}) : {};
      const mergedAliasCodes = { ...existingAliasCodes };

      childrenSnapshot.forEach((doc) => {
        const data = doc.data();
        allowedChildIds.push(doc.id);

        if (!mergedAliasCodes[doc.id]) {
          const base = (data.name || doc.id).slice(0, 3).toLowerCase();
          mergedAliasCodes[doc.id] = base;
        }
      });

      // Use a batch write to ensure atomicity
      const batch = db.batch();

      // Create or update phone index entry
      const phoneIndexRef = db.collection("phone_index").doc(phoneE164);
      batch.set(phoneIndexRef, {
        uid: uid,
        phone: phoneE164,
        defaultChildId: defaultChildId,
        linkedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      const phoneLinksData = {
        phoneE164: phoneE164,
        ownerUserId: uid,
        verified: true,
        allowedChildIds,
        aliasCodes: mergedAliasCodes,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      if (!phoneLinksDoc.exists) {
        phoneLinksData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }
      batch.set(phoneLinksRef, phoneLinksData, { merge: true });

      // Ensure the linking user can log for all allowed children
      allowedChildIds.forEach((childId) => {
        const memberRef = db
          .collection("childAuth")
          .doc(childId)
          .collection("members")
          .doc(uid);
        batch.set(
          memberRef,
          {
            canLog: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: uid
          },
          { merge: true }
        );
      });

      // Update user document with default child
      const userRef = db.collection("users").doc(uid);
      batch.update(userRef, {
        defaultChildId: defaultChildId,
        phoneLinked: true,
        phoneLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Commit the batch
      await batch.commit();

      logger.info("Phone linked successfully", {
        uid,
        phoneE164,
        defaultChildId,
        childName: childData.name
      });

      return {
        success: true,
        message: `Phone number ${phoneE164} successfully linked to ${childData.name}`,
        phoneE164,
        defaultChildId,
        childName: childData.name
      };

    } catch (error) {
      logger.error("Phone linking failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid,
        data: request.data
      });

      throw new Error(error.message);
    }
  }
);

/**
 * Delink phone number from user account
 */
const delinkPhone = onCall(
  {
    enforceAppCheck: false,
    cors: true,
    region: "us-central1",
  },
  async (request) => {
    try {
      // Verify user is authenticated
      if (!request.auth || !request.auth.uid) {
        throw new Error("User must be authenticated to delink phone number");
      }

      const db = admin.firestore();
      const uid = request.auth.uid;

      // Check if user document exists
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        throw new Error("User document not found");
      }

      const userData = userDoc.data();
      const phoneE164 = userData.phone;

      if (!phoneE164) {
        throw new Error("No phone number found to delink");
      }

      if (!userData.phoneLinked) {
        throw new Error("Phone number is not currently linked");
      }

      // Use a batch write to ensure atomicity
      const batch = db.batch();

      // Remove phone index entry
      const phoneIndexRef = db.collection("phone_index").doc(phoneE164);
      batch.delete(phoneIndexRef);

      // Remove phoneLinks entry (WhatsApp ingestion)
      const phoneLinksRef = db.collection("phoneLinks").doc(phoneE164);
      batch.delete(phoneLinksRef);

      // Update user document to remove linking info
      const userRef = db.collection("users").doc(uid);
      batch.update(userRef, {
        phoneLinked: false,
        defaultChildId: admin.firestore.FieldValue.delete(),
        phoneLinkedAt: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Commit the batch
      await batch.commit();

      logger.info("Phone delinked successfully", {
        uid,
        phoneE164
      });

      return {
        success: true,
        message: `Phone number ${phoneE164} successfully delinked from account`,
        phoneE164
      };

    } catch (error) {
      logger.error("Phone delinking failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid
      });

      throw new Error(error.message);
    }
  }
);

/**
 * Sync phoneLinks for the current user.
 * Ensures all active children are included in allowedChildIds.
 */
const syncPhoneLinksForUser = onCall(
  {
    enforceAppCheck: false,
    cors: true,
    region: "us-central1",
  },
  async (request) => {
    try {
      if (!request.auth || !request.auth.uid) {
        throw new Error("User must be authenticated to sync phone links");
      }

      const db = admin.firestore();
      const uid = request.auth.uid;

      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        throw new Error("User document not found");
      }

      const userData = userDoc.data();
      const phoneE164 = userData.phone;
      if (!phoneE164) {
        return {
          success: false,
          message: "No phone number on file",
        };
      }

      const phoneLinksRef = db.collection("phoneLinks").doc(phoneE164);
      const phoneLinksDoc = await phoneLinksRef.get();
      if (phoneLinksDoc.exists) {
        const existingLink = phoneLinksDoc.data();
        if (existingLink.ownerUserId && existingLink.ownerUserId !== uid) {
          throw new Error("This phone number is already linked to another account");
        }
      }

      const childrenSnapshot = await db
        .collection("children")
        .where("users.members", "array-contains", uid)
        .where("status", "==", "active")
        .get();

      const allowedChildIds = [];
      const existingAliasCodes = phoneLinksDoc.exists ? (phoneLinksDoc.data().aliasCodes || {}) : {};
      const mergedAliasCodes = { ...existingAliasCodes };

      childrenSnapshot.forEach((doc) => {
        const data = doc.data();
        allowedChildIds.push(doc.id);

        if (!mergedAliasCodes[doc.id]) {
          const base = (data.name || doc.id).slice(0, 3).toLowerCase();
          mergedAliasCodes[doc.id] = base;
        }
      });

      const phoneLinksData = {
        phoneE164,
        ownerUserId: uid,
        verified: userData.phoneVerified === true,
        allowedChildIds,
        aliasCodes: mergedAliasCodes,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      if (!phoneLinksDoc.exists) {
        phoneLinksData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }

      const batch = db.batch();
      batch.set(phoneLinksRef, phoneLinksData, { merge: true });

      allowedChildIds.forEach((childId) => {
        const memberRef = db
          .collection("childAuth")
          .doc(childId)
          .collection("members")
          .doc(uid);
        batch.set(
          memberRef,
          {
            canLog: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: uid
          },
          { merge: true }
        );
      });

      await batch.commit();

      return {
        success: true,
        message: "Phone links synced",
        phoneE164,
        verified: phoneLinksData.verified,
        allowedChildIdsCount: allowedChildIds.length,
      };
    } catch (error) {
      logger.error("Phone link sync failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid,
      });

      throw new Error(error.message);
    }
  }
);

module.exports = {
  linkPhoneAndDefaultChild,
  delinkPhone,
  syncPhoneLinksForUser
};

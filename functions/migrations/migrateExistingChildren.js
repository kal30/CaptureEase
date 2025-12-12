const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

/**
 * One-time migration function to enable SMS for existing children
 * Call this once from your admin panel or directly
 */
const migrateExistingChildren = onCall(
  {
    region: "us-central1",
    enforceAppCheck: false,
    cors: true,
  },
  async (request) => {
    try {
      // Optional: Add admin-only access check
      // if (!request.auth || request.auth.token.admin !== true) {
      //   throw new Error("Admin access required");
      // }

      const db = admin.firestore();
      const childrenRef = db.collection('children');

      // Get all children
      const snapshot = await childrenRef.get();
      logger.info(`Migration: Found ${snapshot.docs.length} children to process`);

      const batch = db.batch();
      let updateCount = 0;
      let alreadyEnabledCount = 0;
      const results = [];

      snapshot.docs.forEach(doc => {
        const childData = doc.data();
        const childId = doc.id;
        const childName = childData.name || 'Unknown';

        // Check current SMS status
        const currentSmsEnabled = childData.settings?.notifications?.smsEnabled;

        if (currentSmsEnabled === true) {
          logger.info(`Child ${childName} already has SMS enabled`);
          alreadyEnabledCount++;
          results.push({
            childId,
            childName,
            action: 'already_enabled',
            smsEnabled: true
          });
          return;
        }

        // Update child with SMS enabled (handle undefined settings)
        const updatedSettings = {
          ...(childData.settings || {}),
          notifications: {
            ...(childData.settings?.notifications || {}),
            smsEnabled: true
          }
        };

        batch.update(doc.ref, {
          settings: updatedSettings,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: 'migration_script'
        });

        updateCount++;
        results.push({
          childId,
          childName,
          action: 'updated',
          previousValue: currentSmsEnabled,
          newValue: true
        });

        logger.info(`Queued SMS enablement for child: ${childName}`);
      });

      // Execute batch update
      if (updateCount > 0) {
        await batch.commit();
        logger.info(`Migration completed: ${updateCount} children updated`);
      }

      const summary = {
        success: true,
        totalChildren: snapshot.docs.length,
        updated: updateCount,
        alreadyEnabled: alreadyEnabledCount,
        results
      };

      logger.info("Migration summary", summary);

      return summary;

    } catch (error) {
      logger.error("Migration failed", {
        error: error.message,
        stack: error.stack
      });

      throw new Error(`Migration failed: ${error.message}`);
    }
  }
);

module.exports = { migrateExistingChildren };
const admin = require("firebase-admin");

/**
 * Migration: Enable SMS for all existing children
 * This adds settings.notifications.smsEnabled: true to children that don't have it
 */
const enableSmsForExistingChildren = async () => {
  console.log('🚀 Starting SMS enablement migration...');

  const db = admin.firestore();
  const childrenRef = db.collection('children');

  try {
    // Get all children
    const snapshot = await childrenRef.get();
    console.log(`📊 Found ${snapshot.docs.length} children to check`);

    const batch = db.batch();
    let updateCount = 0;
    let alreadyEnabledCount = 0;

    snapshot.docs.forEach(doc => {
      const childData = doc.data();
      const childId = doc.id;
      const childName = childData.name || 'Unknown';

      // Check if SMS is already enabled
      const currentSmsEnabled = childData.settings?.notifications?.smsEnabled;

      if (currentSmsEnabled === true) {
        console.log(`✅ ${childName} (${childId}) - SMS already enabled`);
        alreadyEnabledCount++;
        return;
      }

      // Add SMS enabled field
      console.log(`🔧 ${childName} (${childId}) - Adding SMS enabled`);

      // Preserve existing settings and add notifications
      const updatedSettings = {
        ...childData.settings,
        notifications: {
          ...childData.settings?.notifications,
          smsEnabled: true
        }
      };

      batch.update(doc.ref, {
        settings: updatedSettings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      updateCount++;
    });

    // Execute batch update
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Migration completed successfully!`);
      console.log(`📈 Updated: ${updateCount} children`);
      console.log(`📊 Already enabled: ${alreadyEnabledCount} children`);
      console.log(`📱 Total: ${snapshot.docs.length} children processed`);
    } else {
      console.log(`🎉 All children already have SMS enabled! No updates needed.`);
    }

    return {
      success: true,
      totalChildren: snapshot.docs.length,
      updated: updateCount,
      alreadyEnabled: alreadyEnabledCount
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

module.exports = { enableSmsForExistingChildren };

// If running directly
if (require.main === module) {
  // Initialize Firebase Admin (only if not already initialized)
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  enableSmsForExistingChildren()
    .then(result => {
      console.log('🎉 Migration script completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}
/**
 * Script to manually set up phoneLinks for WhatsApp testing
 *
 * Usage:
 *   node scripts/setupPhoneForWhatsApp.js "+14155551234" "userId123" "childId456"
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupPhoneLink(phoneE164, userId, childId) {
  try {
    console.log('📱 Setting up phone link for WhatsApp...');
    console.log(`   Phone: ${phoneE164}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Child ID: ${childId}`);

    // Get child info
    const childDoc = await db.collection('children').doc(childId).get();
    if (!childDoc.exists) {
      console.error('❌ Child not found!');
      process.exit(1);
    }

    const childData = childDoc.data();
    const childName = childData.name || 'Unknown';

    // Create phoneLinks document (this is what smsWebhook expects)
    const phoneLinkData = {
      phoneE164: phoneE164,
      ownerUserId: userId,
      verified: true,
      allowedChildIds: [childId],
      aliasCodes: {
        [childId]: childName.substring(0, 3).toLowerCase() // e.g., "arj" for "Arjun"
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('phoneLinks').doc(phoneE164).set(phoneLinkData);

    console.log('✅ Phone link created!');
    console.log('\nYou can now send WhatsApp messages like:');
    console.log(`   "${childName}: had a great day!"`);
    console.log(`   or`);
    console.log(`   "${phoneLinkData.aliasCodes[childId]}: took a nap"`);
    console.log('\nTo see all children you can log for, send:');
    console.log('   "children?"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const phoneE164 = process.argv[2];
const userId = process.argv[3];
const childId = process.argv[4];

if (!phoneE164 || !userId || !childId) {
  console.error('Usage: node scripts/setupPhoneForWhatsApp.js <phone> <userId> <childId>');
  console.error('\nExample:');
  console.error('  node scripts/setupPhoneForWhatsApp.js "+14155551234" "abc123" "child456"');
  console.error('\nTo find your userId and childId:');
  console.error('  1. Log into your app');
  console.error('  2. Open browser console');
  console.error('  3. Run: firebase.auth().currentUser.uid  (this is userId)');
  console.error('  4. Check Firestore for your child document ID');
  process.exit(1);
}

// Validate phone format
if (!phoneE164.match(/^\+[1-9]\d{1,14}$/)) {
  console.error('❌ Phone number must be in E.164 format (e.g., +1234567890)');
  process.exit(1);
}

setupPhoneLink(phoneE164, userId, childId);

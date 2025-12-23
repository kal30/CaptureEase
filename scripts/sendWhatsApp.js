/**
 * Script to send WhatsApp messages via Twilio
 *
 * Usage:
 *   node scripts/sendWhatsApp.js "+1234567890" "Hello from CaptureEz!"
 *
 * Or set environment variables:
 *   TO_NUMBER="+1234567890" MESSAGE="Hello!" node scripts/sendWhatsApp.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendWhatsAppMessage(to, message) {
  try {
    console.log('📱 Sending WhatsApp message...');
    console.log(`   To: ${to}`);
    console.log(`   Message: ${message}`);

    // Call the sendMessage Cloud Function
    const sendMessage = require('../functions/messaging/sendMessage').sendMessage;

    // Note: This won't work directly because Cloud Functions need proper context
    // Instead, we'll use the Firebase Admin SDK to call the function
    console.log('\n⚠️  Note: To send messages, you need to:');
    console.log('1. Deploy the function: firebase deploy --only functions:sendMessage');
    console.log('2. Call it from your app using Firebase Functions SDK');
    console.log('\nExample code for your React app:');
    console.log('```javascript');
    console.log('import { getFunctions, httpsCallable } from "firebase/functions";');
    console.log('');
    console.log('const functions = getFunctions();');
    console.log('const sendMessage = httpsCallable(functions, "sendMessage");');
    console.log('');
    console.log('const result = await sendMessage({');
    console.log(`  to: "${to}",`);
    console.log(`  message: "${message}",`);
    console.log('  type: "whatsapp" // or "sms"');
    console.log('});');
    console.log('console.log(result.data);');
    console.log('```');
    console.log('\nOr use curl to test the HTTP endpoint:');
    console.log('```bash');
    console.log('curl -X POST \\');
    console.log('  https://us-central1-captureease-ef82f.cloudfunctions.net/sendMessageHttp \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"to":"' + to + '","message":"' + message + '","type":"whatsapp"}\'');
    console.log('```');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const to = process.argv[2] || process.env.TO_NUMBER;
const message = process.argv[3] || process.env.MESSAGE;

if (!to || !message) {
  console.error('Usage: node scripts/sendWhatsApp.js <phone-number> <message>');
  console.error('Example: node scripts/sendWhatsApp.js "+1234567890" "Hello from CaptureEz!"');
  console.error('\nOr set environment variables:');
  console.error('  TO_NUMBER="+1234567890" MESSAGE="Hello!" node scripts/sendWhatsApp.js');
  process.exit(1);
}

// Validate phone number format
if (!to.match(/^\+[1-9]\d{1,14}$/)) {
  console.error('❌ Error: Phone number must be in E.164 format (e.g., +1234567890)');
  process.exit(1);
}

sendWhatsAppMessage(to, message);

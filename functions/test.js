const admin = require("firebase-admin");
const functions = require("firebase-functions");

// Initialize the Admin SDK
admin.initializeApp();

const functionsTest = require("firebase-functions-test")({
  projectId: "captureease-ef82f",
});

// Import the functions to test
const myFunctions = require("./index.js");

// Test the sendInvitationEmail function
const testSendInvitationEmail = async () => {
  const wrapped = functionsTest.wrap(myFunctions.sendInvitationEmail);

  const data = {
    recipientEmail: "rkalyani@gmail.com", // Replace with a test email address
    senderName: "Test Sender",
    childName: "Test Child",
    role: "Test Role",
    personalMessage: "This is a test message.",
    invitationLink: "https://example.com",
  };

  try {
    const result = await wrapped(data, {
      auth: {
        uid: "test-uid",
      },
    });
    console.log("sendInvitationEmail result:", result);
  } catch (error) {
    console.error("sendInvitationEmail error:", error);
  }
};

// Test the sendSmsNotification function
const testSendSmsNotification = async () => {
  const wrapped = functionsTest.wrap(myFunctions.sendSmsNotification);

  const data = {
    recipientPhoneNumber: "+12082830595", // Replace with a test phone number
    messageBody: "This is a test SMS message.",
  };

  try {
    const result = await wrapped(data, {
      auth: {
        uid: "test-uid",
      },
    });
    console.log("sendSmsNotification result:", result);
  } catch (error) {
    console.error("sendSmsNotification error:", error);
  }
};

// Test the createWebEvent function
const testCreateWebEvent = async () => {
  const wrapped = functionsTest.wrap(myFunctions.createWebEvent);

  const data = {
    formData: {
      description: 'Emma had a great day at school today! She used her words instead of hitting when frustrated.',
      mood: 'happy',
      energy: 'high',
      location: 'school'
    },
    childId: 'test-child-123',
    source: 'web',
    uploadedMedia: [],
    metadata: {
      userAgent: 'Mozilla/5.0 Test Browser',
      ipAddress: '127.0.0.1'
    }
  };

  try {
    const result = await wrapped(data, {
      auth: {
        uid: 'test-uid',
      },
    });
    console.log('createWebEvent result:', result);
  } catch (error) {
    console.error('createWebEvent error:', error);
  }
};

// Test SMS webhook simulation
const testSMSWebhookSimulation = () => {
  console.log('\n=== SMS Webhook Test Simulation ===');

  const sampleSMSPayload = {
    MessageSid: 'SM1234567890abcdef1234567890abcdef',
    From: '+15551234567',
    To: '+15557654321',
    Body: 'Alex had a meltdown at therapy today. Duration: 20 minutes. Remedy: deep breathing exercises.',
    SmsStatus: 'received'
  };

  console.log('Sample SMS Payload:');
  console.log(JSON.stringify(sampleSMSPayload, null, 2));
  console.log('\nTo test SMS webhook:');
  console.log('POST to: https://your-region-your-project.cloudfunctions.net/smsWebhook?childId=test-child&userId=test-user');
  console.log('Content-Type: application/json');
  console.log('Body:', JSON.stringify(sampleSMSPayload));
};

// Test WhatsApp webhook simulation
const testWhatsAppWebhookSimulation = () => {
  console.log('\n=== WhatsApp Webhook Test Simulation ===');

  const sampleWhatsAppPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: '123456789012345',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          messages: [{
            from: '15559876543',
            id: 'wamid.test123',
            timestamp: '1640995200',
            text: { body: 'Emma did amazing in speech therapy! She said 5 new words today: apple, book, car, dog, eat.' },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  };

  console.log('Sample WhatsApp Payload:');
  console.log(JSON.stringify(sampleWhatsAppPayload, null, 2));
  console.log('\nTo test WhatsApp webhook:');
  console.log('POST to: https://your-region-your-project.cloudfunctions.net/whatsappWebhook?childId=test-child&userId=test-user');
  console.log('Content-Type: application/json');
  console.log('Body:', JSON.stringify(sampleWhatsAppPayload));
};

// Run the tests
console.log('Running Event Ingestion Tests...\n');

testSendInvitationEmail();
testSendSmsNotification();
testCreateWebEvent();
testSMSWebhookSimulation();
testWhatsAppWebhookSimulation();

functionsTest.cleanup();

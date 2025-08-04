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

// Run the tests
testSendInvitationEmail();
testSendSmsNotification();

functionsTest.cleanup();

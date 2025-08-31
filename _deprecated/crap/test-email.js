// Test script to verify email functionality
// Run with: node test-email.js

const { getFunctions, httpsCallable } = require('firebase/functions');
const { initializeApp } = require('firebase/app');

// Your Firebase config (you can get this from Firebase console)
const firebaseConfig = {
  // Add your config here if you want to run this test
  // For now, this is just a template
};

// Initialize Firebase (uncomment to use)
// const app = initializeApp(firebaseConfig);
// const functions = getFunctions(app);
// const sendInvitationEmail = httpsCallable(functions, 'sendInvitationEmail');

// Test data
const testEmailData = {
  recipientEmail: "test@example.com",
  childName: "Alex Smith",
  role: "therapist",
  senderName: "Jane Doe",
  invitationLink: "https://your-app.web.app/register?inviteEmail=test@example.com&childId=123&role=therapist",
  personalMessage: "Looking forward to working with you on Alex's care team!"
};

async function testEmail() {
  try {
    console.log('Testing email functionality...');
    console.log('Email data:', testEmailData);
    
    // Uncomment to actually send test email
    // const result = await sendInvitationEmail(testEmailData);
    // console.log('Email sent successfully:', result.data);
    
    console.log('Test data prepared. Update Firebase config and uncomment the actual call to test.');
  } catch (error) {
    console.error('Error testing email:', error);
  }
}

// Uncomment to run test
// testEmail();

module.exports = { testEmailData };
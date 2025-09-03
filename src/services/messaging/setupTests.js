// Messaging Test Setup
// Import this file in App.js or any component to enable console testing

import { attachTestFunctionsToWindow } from './testHelpers.js';

// Auto-attach test functions in development mode
if (process.env.NODE_ENV === 'development') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      attachTestFunctionsToWindow();
    });
  } else {
    attachTestFunctionsToWindow();
  }
  
  console.log('🔧 Messaging test functions will be available in browser console');
  console.log('Usage examples:');
  console.log('- await window.messagingTests.runCompleteTest()');
  console.log('- await window.messagingTests.testCreateConversation()');
  console.log('- await window.messagingTests.testGetConversations("userId")');
}

export default attachTestFunctionsToWindow;
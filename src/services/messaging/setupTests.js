// Messaging Real Data Setup
// Import this file in App.js or any component to enable real messaging testing

import { attachMessagingFunctionsToWindow } from './testHelpers.js';

// Auto-attach messaging functions in development mode
if (process.env.NODE_ENV === 'development') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      attachMessagingFunctionsToWindow();
    });
  } else {
    attachMessagingFunctionsToWindow();
  }
  
  console.log('💬 Real messaging functions available in browser console');
  console.log('Usage examples:');
  console.log('- await window.messaging.quickStart()');
  console.log('- await window.messaging.getUserConversations()');
  console.log('- await window.messaging.sendRealMessage(conversationId, "Hello!")');
}

export default attachMessagingFunctionsToWindow;
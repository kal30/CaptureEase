// Messaging Service Index
// Main entry point for all messaging-related services

// Core services
export { 
  createConversation, 
  getConversations, 
  updateConversation,
  deactivateConversation,
  getConversationById 
} from './conversationService.js';

export { 
  sendMessage, 
  getMessages,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  getUnreadMessages 
} from './messageService.js';

// Utility services
export { 
  subscribeToConversations,
  subscribeToMessages,
  unsubscribeFromConversation,
  unsubscribeFromMessages 
} from './realtimeService.js';

// Helper services
export {
  generateCareTeamConversation,
  addUserToConversation,
  removeUserFromConversation,
  transferConversationOwnership
} from './conversationHelpers.js';

export {
  shareIncidentToConversation,
  shareTimelineEntry,
  sendQuickMessage,
  sendSystemMessage
} from './messageHelpers.js';

// Test helpers for development
export {
  testCreateConversation,
  testGetConversations,
  testGetConversationById,
  testUpdateConversation,
  testSendMessage,
  testGetMessages,
  testMarkMessageAsRead,
  testGetUnreadMessages,
  runCompleteTest,
  attachTestFunctionsToWindow,
  createTestData
} from './testHelpers.js';
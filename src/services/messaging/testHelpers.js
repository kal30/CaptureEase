// Test Helpers for Messaging Service
// Functions to test messaging services in browser console

import { createConversation, getConversations, getConversationById, updateConversation } from './conversationService.js';
import { sendMessage, getMessages, markMessageAsRead, getUnreadMessages } from './messageService.js';

/**
 * Test conversation creation
 */
export const testCreateConversation = async () => {
  console.log('🧪 Testing conversation creation...');
  
  const testData = {
    participants: ['test_user_1', 'test_user_2', 'test_user_3'],
    childId: 'test_child_123',
    type: 'group',
    title: 'Test Care Team',
    createdBy: 'test_user_1'
  };
  
  try {
    const result = await createConversation(testData);
    console.log('✅ Create conversation result:', result);
    return result;
  } catch (error) {
    console.error('❌ Create conversation failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test getting conversations for a user
 */
export const testGetConversations = async (userId = 'test_user_1') => {
  console.log('🧪 Testing get conversations for user:', userId);
  
  try {
    const result = await getConversations(userId, { limit: 10 });
    console.log('✅ Get conversations result:', result);
    return result;
  } catch (error) {
    console.error('❌ Get conversations failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test getting a specific conversation
 */
export const testGetConversationById = async (conversationId, userId = 'test_user_1') => {
  console.log('🧪 Testing get conversation by ID:', conversationId);
  
  try {
    const result = await getConversationById(conversationId, userId);
    console.log('✅ Get conversation by ID result:', result);
    return result;
  } catch (error) {
    console.error('❌ Get conversation by ID failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test updating a conversation
 */
export const testUpdateConversation = async (conversationId, userId = 'test_user_1') => {
  console.log('🧪 Testing update conversation:', conversationId);
  
  const updates = {
    title: 'Updated Test Care Team',
    unreadCounts: { 'test_user_1': 0, 'test_user_2': 3 }
  };
  
  try {
    const result = await updateConversation(conversationId, updates, userId);
    console.log('✅ Update conversation result:', result);
    return result;
  } catch (error) {
    console.error('❌ Update conversation failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test sending a message
 */
export const testSendMessage = async (conversationId) => {
  console.log('🧪 Testing send message to conversation:', conversationId);
  
  const messageData = {
    conversationId,
    senderId: 'test_user_1',
    senderName: 'Test User 1',
    text: 'This is a test message from the console!',
    type: 'text'
  };
  
  try {
    const result = await sendMessage(messageData);
    console.log('✅ Send message result:', result);
    return result;
  } catch (error) {
    console.error('❌ Send message failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test getting messages for a conversation
 */
export const testGetMessages = async (conversationId, userId = 'test_user_1') => {
  console.log('🧪 Testing get messages for conversation:', conversationId);
  
  try {
    const result = await getMessages(conversationId, userId, { limit: 20 });
    console.log('✅ Get messages result:', result);
    return result;
  } catch (error) {
    console.error('❌ Get messages failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test marking a message as read
 */
export const testMarkMessageAsRead = async (messageId, userId = 'test_user_2') => {
  console.log('🧪 Testing mark message as read:', messageId);
  
  try {
    const result = await markMessageAsRead(messageId, userId);
    console.log('✅ Mark message as read result:', result);
    return result;
  } catch (error) {
    console.error('❌ Mark message as read failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test getting unread messages for a user
 */
export const testGetUnreadMessages = async (userId = 'test_user_1') => {
  console.log('🧪 Testing get unread messages for user:', userId);
  
  try {
    const result = await getUnreadMessages(userId);
    console.log('✅ Get unread messages result:', result);
    return result;
  } catch (error) {
    console.error('❌ Get unread messages failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run a complete end-to-end test
 */
export const runCompleteTest = async () => {
  console.log('🚀 Starting complete messaging test...');
  
  try {
    // 1. Create a conversation
    console.log('\n--- Step 1: Creating conversation ---');
    const createResult = await testCreateConversation();
    if (!createResult.success) {
      console.error('❌ Test failed at conversation creation');
      return false;
    }
    
    const conversationId = createResult.conversationId;
    console.log('✅ Created conversation:', conversationId);
    
    // 2. Get conversations for user
    console.log('\n--- Step 2: Getting conversations ---');
    const getResult = await testGetConversations('test_user_1');
    if (!getResult.success) {
      console.error('❌ Test failed at getting conversations');
      return false;
    }
    
    // 3. Get specific conversation
    console.log('\n--- Step 3: Getting specific conversation ---');
    const getByIdResult = await testGetConversationById(conversationId, 'test_user_1');
    if (!getByIdResult.success) {
      console.error('❌ Test failed at getting conversation by ID');
      return false;
    }
    
    // 4. Update conversation
    console.log('\n--- Step 4: Updating conversation ---');
    const updateResult = await testUpdateConversation(conversationId, 'test_user_1');
    if (!updateResult.success) {
      console.error('❌ Test failed at updating conversation');
      return false;
    }
    
    // 5. Send a message
    console.log('\n--- Step 5: Sending message ---');
    const sendResult = await testSendMessage(conversationId);
    if (!sendResult.success) {
      console.error('❌ Test failed at sending message');
      return false;
    }
    
    // 6. Get messages
    console.log('\n--- Step 6: Getting messages ---');
    const messagesResult = await testGetMessages(conversationId, 'test_user_1');
    if (!messagesResult.success || !messagesResult.messages || messagesResult.messages.length === 0) {
      console.error('❌ Test failed at getting messages');
      return false;
    }
    
    const messageId = messagesResult.messages[0].id;
    
    // 7. Mark message as read (as different user)
    console.log('\n--- Step 7: Marking message as read ---');
    const readResult = await testMarkMessageAsRead(messageId, 'test_user_2');
    if (!readResult.success) {
      console.error('❌ Test failed at marking message as read');
      return false;
    }
    
    // 8. Test unread messages
    console.log('\n--- Step 8: Getting unread messages ---');
    const unreadResult = await testGetUnreadMessages('test_user_1');
    if (!unreadResult.success) {
      console.error('❌ Test failed at getting unread messages');
      return false;
    }
    
    console.log('🎉 All tests passed successfully!');
    console.log('📊 Test Summary:');
    console.log(`- Conversation created: ${conversationId}`);
    console.log(`- Message sent: ${sendResult.messageId}`);
    console.log(`- Messages retrieved: ${messagesResult.messages.length}`);
    console.log(`- Unread messages: ${unreadResult.totalCount || 0}`);
    return true;
    
  } catch (error) {
    console.error('💥 Complete test failed with error:', error);
    return false;
  }
};

/**
 * Expose test functions to global scope for browser console testing
 */
export const attachTestFunctionsToWindow = () => {
  if (typeof window !== 'undefined') {
    window.messagingTests = {
      testCreateConversation,
      testGetConversations,
      testGetConversationById,
      testUpdateConversation,
      testSendMessage,
      testGetMessages,
      testMarkMessageAsRead,
      testGetUnreadMessages,
      runCompleteTest
    };
    
    console.log('🔧 Messaging test functions attached to window.messagingTests');
    console.log('Available functions:', Object.keys(window.messagingTests));
    console.log('Example usage: await window.messagingTests.runCompleteTest()');
  }
};

/**
 * Create test data for manual testing
 */
export const createTestData = () => {
  return {
    testUsers: [
      { id: 'test_user_1', name: 'Test Parent' },
      { id: 'test_user_2', name: 'Test Caregiver' },
      { id: 'test_user_3', name: 'Test Therapist' }
    ],
    testChild: {
      id: 'test_child_123',
      name: 'Test Child Emma'
    },
    testConversations: [
      {
        participants: ['test_user_1', 'test_user_2'],
        childId: 'test_child_123',
        type: 'direct',
        title: 'Parent & Caregiver',
        createdBy: 'test_user_1'
      },
      {
        participants: ['test_user_1', 'test_user_2', 'test_user_3'],
        childId: 'test_child_123',
        type: 'group',
        title: 'Emma Care Team',
        createdBy: 'test_user_1'
      }
    ]
  };
};
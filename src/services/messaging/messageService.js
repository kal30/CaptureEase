// Message Service
// Handles CRUD operations for messages

import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { COLLECTIONS, QUERY_LIMITS } from '../../constants/collections.js';
import { createMessageModel, MessageTypes } from '../../models/messaging.js';
import { validateMessage } from '../../models/validators/messaging.js';

/**
 * Sends a new message to a conversation
 * @param {Object} params
 * @param {string} params.conversationId - Target conversation ID
 * @param {string} params.senderId - Sender user ID
 * @param {string} params.senderName - Sender display name
 * @param {string} params.text - Message content
 * @param {'text'|'image'|'incident_share'|'system'} params.type - Message type
 * @param {Array} params.attachments - File attachments
 * @param {Object} params.metadata - Additional metadata
 * @param {'normal'|'urgent'} params.priority - Message priority
 * @param {string|null} params.replyTo - Message being replied to
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendMessage = async ({ 
  conversationId, 
  senderId, 
  senderName, 
  text, 
  type = MessageTypes.TEXT,
  attachments = [],
  metadata = {},
  priority = 'normal',
  replyTo = null
}) => {
  try {
    console.log('📤 Sending message:', { conversationId, senderId, senderName, text, type });
    
    // 1. Validate message data
    const messageData = createMessageModel({ 
      conversationId, 
      senderId, 
      senderName, 
      text, 
      type, 
      attachments, 
      metadata, 
      priority, 
      replyTo 
    });
    
    const validation = validateMessage(messageData);
    if (!validation.isValid) {
      console.error('Message validation failed:', validation.errors);
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }
    
    // 2. Check user permissions for conversation
    const hasPermission = await validateMessagePermissions(senderId, conversationId);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Permission denied - user cannot send messages to this conversation'
      };
    }
    
    // 3. Create message document using Firestore transaction for consistency
    const result = await runTransaction(db, async (transaction) => {
      // Get conversation to verify it exists and get participants
      const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
      const conversationDoc = await transaction.get(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }
      
      const conversationData = conversationDoc.data();
      
      // Create message document
      const messagesRef = collection(db, COLLECTIONS.MESSAGES);
      const messageRef = doc(messagesRef);
      
      const firestoreMessageData = {
        ...messageData,
        id: messageRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add message
      transaction.set(messageRef, firestoreMessageData);
      
      // 4. Update conversation's lastMessage
      const lastMessage = {
        id: messageRef.id,
        text: text,
        senderId: senderId,
        type: type,
        timestamp: serverTimestamp()
      };
      
      // 5. Update unread counts for other participants
      const updatedUnreadCounts = { ...conversationData.unreadCounts };
      conversationData.participants.forEach(participantId => {
        if (participantId !== senderId) {
          updatedUnreadCounts[participantId] = (updatedUnreadCounts[participantId] || 0) + 1;
        }
      });
      
      // Update conversation
      transaction.update(conversationRef, {
        lastMessage: lastMessage,
        unreadCounts: updatedUnreadCounts,
        updatedAt: serverTimestamp()
      });
      
      return messageRef.id;
    });
    
    
    return {
      success: true,
      messageId: result,
      message: 'Message sent successfully'
    };
    
  } catch (error) {
    console.error('Error in sendMessage:', error);
    
    if (error.message === 'Conversation not found') {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }
    
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied - check Firestore security rules'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to send message'
    };
  }
};

/**
 * Gets messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - Requesting user ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Max messages to fetch
 * @param {Date} options.before - Get messages before this timestamp (pagination)
 * @param {boolean} options.includeDeleted - Include soft-deleted messages
 * @returns {Promise<{success: boolean, messages?: Array, error?: string}>}
 */
export const getMessages = async (conversationId, userId, options = {}) => {
  try {
    console.log('📨 Getting messages for conversation:', { conversationId, userId, options });
    
    // 1. Validate user permissions for conversation
    const hasPermission = await validateMessagePermissions(userId, conversationId);
    if (!hasPermission) {
      return {
        success: false,
        error: 'Permission denied - user cannot access messages in this conversation'
      };
    }
    
    // 2. Build query with proper ordering and pagination
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    let q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc')
    );
    
    // Filter out deleted messages unless specifically requested
    if (!options.includeDeleted) {
      q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc')
      );
    }
    
    // Apply pagination if before timestamp provided
    if (options.before) {
      q = query(q, where('createdAt', '<', options.before));
    }
    
    // Apply limit
    const queryLimit = options.limit || QUERY_LIMITS.MESSAGES_PER_PAGE;
    q = query(q, limit(queryLimit));
    
    // 3. Execute query
    const querySnapshot = await getDocs(q);
    
    // 4. Transform data for UI
    const messages = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore timestamps to JavaScript dates
      const message = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        // Convert readBy timestamps
        readBy: {}
      };
      
      // Convert readBy timestamps
      if (data.readBy) {
        Object.entries(data.readBy).forEach(([userId, timestamp]) => {
          message.readBy[userId] = timestamp?.toDate() || timestamp;
        });
      }
      
      messages.push(message);
    });
    
    // Sort by createdAt ascending (oldest first) for display
    messages.sort((a, b) => a.createdAt - b.createdAt);
    
    
    // 5. Return formatted messages
    return {
      success: true,
      messages,
      totalCount: messages.length,
      hasMore: messages.length === queryLimit, // Might have more if we hit the limit
      message: `Retrieved ${messages.length} messages`
    };
    
  } catch (error) {
    console.error('Error in getMessages:', error);
    
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied - check Firestore security rules'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to get messages'
    };
  }
};

/**
 * Updates a message (for editing)
 * @param {string} messageId - Message ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - User making the update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateMessage = async (messageId, updates, userId) => {
  try {
    console.log('🚧 updateMessage - STUB IMPLEMENTATION');
    console.log('Params:', { messageId, updates, userId });
    
    // TODO: Step 3 - Implement message updates
    // 1. Validate user is message sender
    // 2. Check update permissions (text only, within time limit)
    // 3. Update message document
    // 4. Mark as edited
    
    return {
      success: true,
      message: 'Message updated (STUB)'
    };
    
  } catch (error) {
    console.error('Error in updateMessage:', error);
    return {
      success: false,
      error: error.message || 'Failed to update message'
    };
  }
};

/**
 * Soft deletes a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User requesting deletion
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteMessage = async (messageId, userId) => {
  try {
    console.log('🚧 deleteMessage - STUB IMPLEMENTATION');
    console.log('Params:', { messageId, userId });
    
    // TODO: Step 3 - Implement message deletion
    // 1. Validate user is message sender or conversation admin
    // 2. Set isDeleted flag
    // 3. Update lastMessage in conversation if needed
    
    return {
      success: true,
      message: 'Message deleted (STUB)'
    };
    
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete message'
    };
  }
};

/**
 * Marks a message as read by the user
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const markMessageAsRead = async (messageId, userId) => {
  try {
    
    // Use transaction to ensure consistency between message and conversation updates
    await runTransaction(db, async (transaction) => {
      // Get message document
      const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId);
      const messageDoc = await transaction.get(messageRef);
      
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }
      
      const messageData = messageDoc.data();
      
      // Check if user has permission to read this message
      const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, messageData.conversationId);
      const conversationDoc = await transaction.get(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }
      
      const conversationData = conversationDoc.data();
      
      if (!conversationData.participants || !conversationData.participants.includes(userId)) {
        throw new Error('Permission denied - user is not a participant in this conversation');
      }
      
      // Check if message is already marked as read by this user
      if (messageData.readBy && messageData.readBy[userId]) {
        console.log('Message already marked as read by this user');
        return; // Already read, no need to update
      }
      
      // 1. Update message's readBy field
      const updatedReadBy = {
        ...messageData.readBy,
        [userId]: serverTimestamp()
      };
      
      transaction.update(messageRef, {
        readBy: updatedReadBy,
        updatedAt: serverTimestamp()
      });
      
      // 2. Update conversation's unread count for this user
      const currentUnreadCount = conversationData.unreadCounts[userId] || 0;
      if (currentUnreadCount > 0) {
        const updatedUnreadCounts = {
          ...conversationData.unreadCounts,
          [userId]: Math.max(0, currentUnreadCount - 1) // Ensure it doesn't go below 0
        };
        
        transaction.update(conversationRef, {
          unreadCounts: updatedUnreadCounts,
          updatedAt: serverTimestamp()
        });
      }
    });
    
    
    return {
      success: true,
      message: 'Message marked as read successfully'
    };
    
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    
    if (error.message === 'Message not found') {
      return {
        success: false,
        error: 'Message not found'
      };
    }
    
    if (error.message === 'Conversation not found') {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }
    
    if (error.message.includes('Permission denied')) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to mark message as read'
    };
  }
};

/**
 * Gets unread messages for a user across all conversations
 * @param {string} userId - User ID
 * @param {string} childId - Optional: filter by child
 * @returns {Promise<{success: boolean, unreadMessages?: Array, totalCount?: number, error?: string}>}
 */
export const getUnreadMessages = async (userId, childId = null) => {
  try {
    console.log('🚧 getUnreadMessages - STUB IMPLEMENTATION');
    console.log('Params:', { userId, childId });
    
    // TODO: Step 3 - Implement unread message fetching
    // 1. Get user's conversations
    // 2. Query messages where user not in readBy
    // 3. Group by conversation
    // 4. Return counts and recent messages
    
    return {
      success: true,
      unreadMessages: [],
      totalCount: 0,
      message: 'Unread messages fetched (STUB)'
    };
    
  } catch (error) {
    console.error('Error in getUnreadMessages:', error);
    return {
      success: false,
      error: error.message || 'Failed to get unread messages'
    };
  }
};

// Helper functions for Step 3 implementation

/**
 * Validates user can send message to conversation
 * @param {string} userId 
 * @param {string} conversationId 
 * @returns {Promise<boolean>}
 */
const validateMessagePermissions = async (userId, conversationId) => {
  try {
    
    // Get conversation document
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      console.log('❌ Conversation not found');
      return false;
    }
    
    const conversationData = conversationDoc.data();
    
    // Check if user is a participant
    if (!conversationData.participants || !conversationData.participants.includes(userId)) {
      console.log('❌ User is not a participant in this conversation');
      return false;
    }
    
    // Check if conversation is active
    if (conversationData.isActive === false) {
      console.log('❌ Conversation is not active');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error validating message permissions:', error);
    return false;
  }
};

/**
 * Updates conversation's last message and metadata
 * @param {string} conversationId 
 * @param {Object} lastMessage 
 * @param {string[]} participants 
 * @param {string} senderId 
 * @returns {Promise<void>}
 */
const updateConversationLastMessage = async (conversationId, lastMessage, participants, senderId) => {
  // TODO: Step 3 - Implement conversation update
  console.log('🚧 updateConversationLastMessage - STUB');
};

/**
 * Increments unread counts for conversation participants
 * @param {string} conversationId 
 * @param {string[]} participants 
 * @param {string} senderId 
 * @returns {Promise<void>}
 */
const updateUnreadCounts = async (conversationId, participants, senderId) => {
  // TODO: Step 3 - Implement unread count updates
  console.log('🚧 updateUnreadCounts - STUB');
};
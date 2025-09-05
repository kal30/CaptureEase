// Conversation Service
// Handles CRUD operations for conversations

import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { COLLECTIONS, QUERY_LIMITS } from '../../constants/collections.js';
import { createConversationModel } from '../../models/messaging.js';
import { validateConversation } from '../../models/validators/messaging.js';

/**
 * Creates a new conversation
 * @param {Object} params
 * @param {string[]} params.participants - Array of user IDs
 * @param {string} params.childId - Child ID
 * @param {'group'|'direct'} params.type - Conversation type
 * @param {string} params.title - Conversation title
 * @param {string} params.createdBy - Creator user ID
 * @returns {Promise<{success: boolean, conversationId?: string, error?: string}>}
 */
export const createConversation = async ({ participants, childId, type, title, createdBy }) => {
  try {
    console.log('✨ Creating conversation:', { participants, childId, type, title, createdBy });
    
    // 1. Validate input data
    const conversationData = createConversationModel({ participants, childId, type, title, createdBy });
    const validation = validateConversation(conversationData);
    
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }
    
    // 2. Check user permissions for child access
    const hasAccess = await validateChildAccess(createdBy, childId);
    if (!hasAccess) {
      return {
        success: false,
        error: 'User does not have access to this child'
      };
    }
    
    // 3. Check for existing direct conversation
    if (type === 'direct' && participants.length === 2) {
      const existingConversation = await findExistingConversation(participants, childId);
      if (existingConversation) {
        console.log('Found existing direct conversation:', existingConversation);
        return {
          success: true,
          conversationId: existingConversation,
          isExisting: true,
          message: 'Found existing conversation'
        };
      }
    }
    
    // 4. Create conversation document
    const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
    
    // Prepare data for Firestore (convert dates to serverTimestamp)
    const firestoreData = {
      ...conversationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(conversationsRef, firestoreData);
    console.log('✅ Conversation created with ID:', docRef.id);
    
    return {
      success: true,
      conversationId: docRef.id,
      message: 'Conversation created successfully'
    };
    
  } catch (error) {
    console.error('Error in createConversation:', error);
    return {
      success: false,
      error: error.message || 'Failed to create conversation'
    };
  }
};

/**
 * Gets conversations for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Max conversations to fetch
 * @param {string} options.childId - Filter by specific child
 * @returns {Promise<{success: boolean, conversations?: Array, error?: string}>}
 */
export const getConversations = async (userId, options = {}) => {
  try {
    console.log('📋 Fetching conversations for user:', { userId, options });
    console.log('🔧 DEBUG: User should now have access with updated Firestore rules');
    
    // 1. Validate user ID
    if (!userId || typeof userId !== 'string') {
      return {
        success: false,
        error: 'Valid user ID is required'
      };
    }
    
    // 2. Build Firestore query with proper filters
    const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
    let q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    // Apply child filter if specified
    if (options.childId) {
      q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        where('childId', '==', options.childId),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc')
      );
    }
    
    // Apply limit
    const queryLimit = options.limit || QUERY_LIMITS.CONVERSATIONS_PER_PAGE;
    q = query(q, limit(queryLimit));
    
    // 3. Execute query
    const querySnapshot = await getDocs(q);
    
    // 4. Transform data for UI
    const conversations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert Firestore timestamps to JavaScript dates
      const conversation = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        // Convert lastMessage timestamp if it exists
        lastMessage: data.lastMessage ? {
          ...data.lastMessage,
          timestamp: data.lastMessage.timestamp?.toDate() || new Date()
        } : null
      };
      
      conversations.push(conversation);
    });
    
    console.log(`✅ Found ${conversations.length} conversations for user ${userId}`);
    
    // 5. Return formatted conversations
    return {
      success: true,
      conversations,
      totalCount: conversations.length,
      message: `Found ${conversations.length} conversations`
    };
    
  } catch (error) {
    console.error('Error in getConversations:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied - check Firestore security rules'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to get conversations'
    };
  }
};

/**
 * Gets a single conversation by ID
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - Requesting user ID (for permission check)
 * @returns {Promise<{success: boolean, conversation?: Object, error?: string}>}
 */
export const getConversationById = async (conversationId, userId) => {
  try {
    console.log('🔍 Getting conversation by ID:', { conversationId, userId });
    
    // 1. Validate IDs
    if (!conversationId || !userId) {
      return {
        success: false,
        error: 'Conversation ID and user ID are required'
      };
    }
    
    // 2. Fetch conversation document
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }
    
    const data = conversationDoc.data();
    
    // 3. Check user permissions
    if (!data.participants || !data.participants.includes(userId)) {
      return {
        success: false,
        error: 'Permission denied - user is not a participant in this conversation'
      };
    }
    
    if (data.isActive === false) {
      return {
        success: false,
        error: 'Conversation is not active'
      };
    }
    
    // 4. Return conversation data with proper timestamp conversion
    const conversation = {
      id: conversationDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastMessage: data.lastMessage ? {
        ...data.lastMessage,
        timestamp: data.lastMessage.timestamp?.toDate() || new Date()
      } : null
    };
    
    console.log('✅ Found conversation:', conversation.id);
    
    return {
      success: true,
      conversation,
      message: 'Conversation retrieved successfully'
    };
    
  } catch (error) {
    console.error('Error in getConversationById:', error);
    return {
      success: false,
      error: error.message || 'Failed to get conversation'
    };
  }
};

/**
 * Updates conversation metadata (title, unread counts, etc.)
 * @param {string} conversationId - Conversation ID
 * @param {Object} updates - Fields to update
 * @param {string} userId - User making the update
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateConversation = async (conversationId, updates, userId) => {
  try {
    console.log('✏️ Updating conversation:', { conversationId, updates, userId });
    
    // 1. Validate permissions - first get the conversation
    const conversationResult = await getConversationById(conversationId, userId);
    if (!conversationResult.success) {
      return conversationResult; // Return same error
    }
    
    // 2. Sanitize update fields - only allow certain fields to be updated
    const allowedFields = ['title', 'unreadCounts', 'lastMessage'];
    const sanitizedUpdates = {};
    
    Object.keys(updates).forEach(field => {
      if (allowedFields.includes(field)) {
        sanitizedUpdates[field] = updates[field];
      }
    });
    
    // Always update the updatedAt timestamp
    sanitizedUpdates.updatedAt = serverTimestamp();
    
    if (Object.keys(sanitizedUpdates).length === 1) {
      // Only updatedAt was added, no actual updates
      return {
        success: false,
        error: 'No valid fields to update'
      };
    }
    
    console.log('Sanitized updates:', sanitizedUpdates);
    
    // 3. Update document
    const conversationRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
    await updateDoc(conversationRef, sanitizedUpdates);
    
    console.log('✅ Conversation updated successfully');
    
    return {
      success: true,
      message: 'Conversation updated successfully'
    };
    
  } catch (error) {
    console.error('Error in updateConversation:', error);
    
    if (error.code === 'not-found') {
      return {
        success: false,
        error: 'Conversation not found'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to update conversation'
    };
  }
};

/**
 * Deactivates a conversation (soft delete)
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User requesting deactivation
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deactivateConversation = async (conversationId, userId) => {
  try {
    console.log('🚧 deactivateConversation - STUB IMPLEMENTATION');
    console.log('Params:', { conversationId, userId });
    
    // TODO: Step 2 - Implement conversation deactivation
    // 1. Check if user is conversation creator
    // 2. Set isActive to false
    // 3. Notify other participants
    
    return {
      success: true,
      message: 'Conversation deactivated (STUB)'
    };
    
  } catch (error) {
    console.error('Error in deactivateConversation:', error);
    return {
      success: false,
      error: error.message || 'Failed to deactivate conversation'
    };
  }
};

// Helper functions for Step 2 implementation

/**
 * Validates user has access to create conversation for child
 * @param {string} userId 
 * @param {string} childId 
 * @returns {Promise<boolean>}
 */
const validateChildAccess = async (userId, childId) => {
  try {
    console.log('🔍 Validating child access:', { userId, childId });
    
    // Check the child document directly for user access
    const childDocRef = doc(db, COLLECTIONS.CHILDREN, childId);
    const childDoc = await getDoc(childDocRef);
    
    if (!childDoc.exists()) {
      console.log('❌ Child document not found');
      return false;
    }
    
    const childData = childDoc.data();
    const users = childData.users || {};
    
    // Check if user is care owner
    if (users.care_owner === userId) {
      console.log('✅ User is care owner');
      return true;
    }
    
    // Check if user is in care_partners array
    if (users.care_partners && users.care_partners.includes(userId)) {
      console.log('✅ User is care partner');
      return true;
    }
    
    // Check if user is in caregivers array  
    if (users.caregivers && users.caregivers.includes(userId)) {
      console.log('✅ User is caregiver');
      return true;
    }
    
    // Check if user is in therapists array
    if (users.therapists && users.therapists.includes(userId)) {
      console.log('✅ User is therapist');
      return true;
    }
    
    console.log('❌ User does not have access to child - not in any care team roles');
    console.log('Child users:', users);
    return false;
    
  } catch (error) {
    console.error('Error validating child access:', error);
    return false;
  }
};

/**
 * Checks if conversation already exists for participants
 * @param {string[]} participants 
 * @param {string} childId 
 * @returns {Promise<string|null>}
 */
const findExistingConversation = async (participants, childId) => {
  try {
    console.log('🔍 Checking for existing conversation:', { participants, childId });
    
    const conversationsRef = collection(db, COLLECTIONS.CONVERSATIONS);
    
    // For direct conversations, check if exact participant match exists
    if (participants.length === 2) {
      const q = query(
        conversationsRef,
        where('childId', '==', childId),
        where('type', '==', 'direct'),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const existingParticipants = data.participants || [];
        
        // Check if participants arrays match (same users, any order)
        if (existingParticipants.length === participants.length &&
            participants.every(p => existingParticipants.includes(p))) {
          console.log('✅ Found existing direct conversation:', doc.id);
          return doc.id;
        }
      }
    }
    
    console.log('ℹ️ No existing conversation found');
    return null;
    
  } catch (error) {
    console.error('Error checking for existing conversation:', error);
    return null;
  }
};

/**
 * Initializes unread counts for all participants
 * @param {string[]} participants 
 * @returns {Object}
 */
const initializeUnreadCounts = (participants) => {
  const unreadCounts = {};
  participants.forEach(userId => {
    unreadCounts[userId] = 0;
  });
  return unreadCounts;
};
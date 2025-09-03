// Firestore Collections Constants
// Centralized collection names to avoid magic strings and typos

/**
 * Main Firestore collection names
 */
export const COLLECTIONS = {
  // Existing collections
  USERS: 'users',
  CHILDREN: 'children',
  CHILD_ACCESS: 'child_access',
  INCIDENTS: 'incidents',
  DAILY_LOGS: 'daily_logs',
  JOURNAL_ENTRIES: 'journal_entries',
  FOLLOW_UPS: 'follow_ups',
  CUSTOM_CATEGORIES: 'custom_categories',
  USER_PREFERENCES: 'user_preferences',
  
  // New messaging collections
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  MESSAGE_ATTACHMENTS: 'message_attachments', // For future file storage references
};

/**
 * Subcollection names (collections within documents)
 */
export const SUBCOLLECTIONS = {
  PARTICIPANTS: 'participants',    // For detailed conversation participant data
  THREAD_MESSAGES: 'thread_messages', // For message threading (future)
  MESSAGE_REACTIONS: 'reactions',  // For message reactions (future)
};

/**
 * Document structure examples and field constants
 */
export const DOCUMENT_FIELDS = {
  // Common fields across collections
  COMMON: {
    ID: 'id',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    CREATED_BY: 'createdBy',
    IS_DELETED: 'isDeleted',
  },
  
  // Conversation document fields
  CONVERSATION: {
    PARTICIPANTS: 'participants',
    CHILD_ID: 'childId',
    TYPE: 'type',
    TITLE: 'title',
    LAST_MESSAGE: 'lastMessage',
    UNREAD_COUNTS: 'unreadCounts',
    IS_ACTIVE: 'isActive',
  },
  
  // Message document fields
  MESSAGE: {
    CONVERSATION_ID: 'conversationId',
    SENDER_ID: 'senderId',
    SENDER_NAME: 'senderName',
    TYPE: 'type',
    TEXT: 'text',
    ATTACHMENTS: 'attachments',
    METADATA: 'metadata',
    PRIORITY: 'priority',
    READ_BY: 'readBy',
    REPLY_TO: 'replyTo',
    IS_EDITED: 'isEdited',
  },
};

/**
 * Index configurations for efficient queries
 * These correspond to Firestore composite indexes that need to be created
 */
export const REQUIRED_INDEXES = {
  CONVERSATIONS: [
    // For getting user's conversations ordered by last activity
    {
      collection: COLLECTIONS.CONVERSATIONS,
      fields: [
        { field: DOCUMENT_FIELDS.CONVERSATION.PARTICIPANTS, mode: 'ARRAY_CONTAINS' },
        { field: DOCUMENT_FIELDS.COMMON.UPDATED_AT, mode: 'DESCENDING' }
      ]
    },
    // For getting conversations by child
    {
      collection: COLLECTIONS.CONVERSATIONS,
      fields: [
        { field: DOCUMENT_FIELDS.CONVERSATION.CHILD_ID, mode: 'ASCENDING' },
        { field: DOCUMENT_FIELDS.CONVERSATION.IS_ACTIVE, mode: 'ASCENDING' },
        { field: DOCUMENT_FIELDS.COMMON.UPDATED_AT, mode: 'DESCENDING' }
      ]
    }
  ],
  
  MESSAGES: [
    // For getting messages in a conversation ordered by time
    {
      collection: COLLECTIONS.MESSAGES,
      fields: [
        { field: DOCUMENT_FIELDS.MESSAGE.CONVERSATION_ID, mode: 'ASCENDING' },
        { field: DOCUMENT_FIELDS.COMMON.CREATED_AT, mode: 'DESCENDING' }
      ]
    },
    // For getting unread messages
    {
      collection: COLLECTIONS.MESSAGES,
      fields: [
        { field: DOCUMENT_FIELDS.MESSAGE.CONVERSATION_ID, mode: 'ASCENDING' },
        { field: DOCUMENT_FIELDS.MESSAGE.READ_BY, mode: 'ASCENDING' },
        { field: DOCUMENT_FIELDS.COMMON.CREATED_AT, mode: 'DESCENDING' }
      ]
    }
  ]
};

/**
 * Security rule helpers - field paths used in Firestore rules
 */
export const SECURITY_PATHS = {
  USER_ID: 'request.auth.uid',
  RESOURCE_DATA: 'resource.data',
  REQUEST_DATA: 'request.resource.data',
  
  // Conversation access patterns
  CONVERSATION_PARTICIPANTS: `${DOCUMENT_FIELDS.CONVERSATION.PARTICIPANTS}`,
  CONVERSATION_CHILD_ID: `${DOCUMENT_FIELDS.CONVERSATION.CHILD_ID}`,
  
  // Message access patterns
  MESSAGE_CONVERSATION_ID: `${DOCUMENT_FIELDS.MESSAGE.CONVERSATION_ID}`,
  MESSAGE_SENDER_ID: `${DOCUMENT_FIELDS.MESSAGE.SENDER_ID}`,
  
  // Child access verification path
  CHILD_ACCESS_DOC: (userId, childId) => `/databases/$(database)/documents/${COLLECTIONS.CHILD_ACCESS}/${userId}_${childId}`,
  CONVERSATION_DOC: (conversationId) => `/databases/$(database)/documents/${COLLECTIONS.CONVERSATIONS}/${conversationId}`,
};

/**
 * Query limits and pagination constants
 */
export const QUERY_LIMITS = {
  CONVERSATIONS_PER_PAGE: 20,
  MESSAGES_PER_PAGE: 50,
  MESSAGES_INITIAL_LOAD: 25,
  MAX_PARTICIPANTS_PER_CONVERSATION: 20,
  MAX_ATTACHMENTS_PER_MESSAGE: 5,
};

/**
 * Helper function to generate conversation document ID
 * @param {string} childId 
 * @param {string[]} participantIds 
 * @returns {string}
 */
export const generateConversationId = (childId, participantIds) => {
  // For group conversations: child-based ID with timestamp
  if (participantIds.length > 2) {
    return `conv_${childId}_${Date.now()}`;
  }
  
  // For direct conversations: deterministic ID based on participants
  const sortedParticipants = [...participantIds].sort();
  return `direct_${childId}_${sortedParticipants.join('_')}`;
};

/**
 * Helper function to generate message document ID
 * @param {string} conversationId 
 * @returns {string}
 */
export const generateMessageId = (conversationId) => {
  return `msg_${conversationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Collection path builders for type safety
 */
export const getCollectionPath = {
  conversations: () => COLLECTIONS.CONVERSATIONS,
  messages: () => COLLECTIONS.MESSAGES,
  conversationMessages: (conversationId) => `${COLLECTIONS.CONVERSATIONS}/${conversationId}/${SUBCOLLECTIONS.THREAD_MESSAGES}`,
  userConversations: (userId) => `${COLLECTIONS.USERS}/${userId}/${SUBCOLLECTIONS.PARTICIPANTS}`,
};

/**
 * Document path builders for type safety
 */
export const getDocumentPath = {
  conversation: (conversationId) => `${COLLECTIONS.CONVERSATIONS}/${conversationId}`,
  message: (messageId) => `${COLLECTIONS.MESSAGES}/${messageId}`,
  user: (userId) => `${COLLECTIONS.USERS}/${userId}`,
  childAccess: (userId, childId) => `${COLLECTIONS.CHILD_ACCESS}/${userId}_${childId}`,
};

/**
 * Validation helpers for collection operations
 */
export const validateCollectionAccess = {
  /**
   * Check if user can access conversation collection
   * @param {string} userId 
   * @param {Object} conversation 
   * @returns {boolean}
   */
  conversation: (userId, conversation) => {
    return conversation && 
           conversation[DOCUMENT_FIELDS.CONVERSATION.PARTICIPANTS] &&
           conversation[DOCUMENT_FIELDS.CONVERSATION.PARTICIPANTS].includes(userId) &&
           conversation[DOCUMENT_FIELDS.CONVERSATION.IS_ACTIVE] !== false;
  },
  
  /**
   * Check if user can access message collection  
   * @param {string} userId 
   * @param {Object} message 
   * @param {Object} conversation 
   * @returns {boolean}
   */
  message: (userId, message, conversation) => {
    return validateCollectionAccess.conversation(userId, conversation) &&
           message &&
           message[DOCUMENT_FIELDS.MESSAGE.CONVERSATION_ID] === conversation.id;
  }
};

/**
 * Firestore batch operation helpers
 */
export const BATCH_LIMITS = {
  MAX_WRITES_PER_BATCH: 500,
  MAX_TRANSACTION_RETRIES: 3,
  TRANSACTION_TIMEOUT_MS: 30000,
};

/**
 * Real-time listener configurations
 */
export const LISTENER_CONFIG = {
  CONVERSATIONS: {
    includeMetadataChanges: true,
    source: 'default', // 'server', 'cache', or 'default'
  },
  MESSAGES: {
    includeMetadataChanges: false, // Don't need metadata changes for messages
    source: 'default',
  }
};
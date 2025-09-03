// Messaging Data Models and Types
// This file defines the core data structures for the messaging system

/**
 * Message types supported by the system
 */
export const MessageTypes = {
  TEXT: 'text',
  IMAGE: 'image', 
  INCIDENT_SHARE: 'incident_share',
  SYSTEM: 'system'
};

/**
 * Conversation types
 */
export const ConversationTypes = {
  GROUP: 'group',     // Multiple participants (care team)
  DIRECT: 'direct'    // One-on-one conversation
};

/**
 * Message priority levels
 */
export const MessagePriority = {
  NORMAL: 'normal',
  URGENT: 'urgent'
};

/**
 * @typedef {Object} Conversation
 * @property {string} id - Unique conversation identifier
 * @property {string[]} participants - Array of user IDs who can participate
 * @property {string} childId - ID of the child this conversation relates to
 * @property {'group'|'direct'} type - Type of conversation
 * @property {string} title - Display name for the conversation
 * @property {LastMessage} lastMessage - Most recent message preview
 * @property {Object.<string, number>} unreadCounts - Unread count per user {userId: count}
 * @property {boolean} isActive - Whether conversation is active
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {string} createdBy - User ID who created the conversation
 */

/**
 * @typedef {Object} LastMessage
 * @property {string} id - Message ID
 * @property {string} text - Message text (truncated for preview)
 * @property {string} senderId - ID of user who sent the message
 * @property {'text'|'image'|'incident_share'|'system'} type - Message type
 * @property {Date} timestamp - When message was sent
 */

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {string} conversationId - ID of conversation this belongs to
 * @property {string} senderId - ID of user who sent the message
 * @property {string} senderName - Name of sender (denormalized for display)
 * @property {'text'|'image'|'incident_share'|'system'} type - Message type
 * @property {string} text - Message content
 * @property {MessageAttachment[]} attachments - File/image attachments
 * @property {MessageMetadata} metadata - Additional context (incident refs, etc)
 * @property {'normal'|'urgent'} priority - Message priority level
 * @property {Object.<string, Date|null>} readBy - Read receipts {userId: timestamp}
 * @property {string|null} replyTo - ID of message this is replying to
 * @property {boolean} isEdited - Whether message was edited
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last edit timestamp
 * @property {boolean} isDeleted - Soft delete flag
 */

/**
 * @typedef {Object} MessageAttachment
 * @property {string} id - Attachment identifier
 * @property {'image'|'file'} type - Attachment type
 * @property {string} url - Download URL
 * @property {string} filename - Original filename
 * @property {number} size - File size in bytes
 * @property {string} mimeType - MIME type
 * @property {Object} metadata - Additional file metadata
 */

/**
 * @typedef {Object} MessageMetadata
 * @property {string|null} incidentId - Related incident ID (for shared incidents)
 * @property {string|null} entryId - Related timeline entry ID
 * @property {string|null} originalSenderId - Original sender for forwarded messages
 * @property {Object} sharedContent - Content being shared (incident data, etc)
 */

/**
 * Factory function to create a new conversation
 * @param {Object} params
 * @param {string[]} params.participants - Array of user IDs
 * @param {string} params.childId - Child ID
 * @param {'group'|'direct'} params.type - Conversation type
 * @param {string} params.title - Conversation title
 * @param {string} params.createdBy - Creator user ID
 * @returns {Conversation}
 */
export const createConversationModel = ({ participants, childId, type, title, createdBy }) => {
  const now = new Date();
  const id = `conv_${childId}_${Date.now()}`;
  
  // Initialize unread counts to 0 for all participants
  const unreadCounts = {};
  participants.forEach(userId => {
    unreadCounts[userId] = 0;
  });

  return {
    id,
    participants: [...participants], // Clone array
    childId,
    type,
    title,
    lastMessage: null,
    unreadCounts,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy
  };
};

/**
 * Factory function to create a new message
 * @param {Object} params
 * @param {string} params.conversationId - Conversation ID
 * @param {string} params.senderId - Sender user ID
 * @param {string} params.senderName - Sender display name
 * @param {string} params.text - Message text
 * @param {'text'|'image'|'incident_share'|'system'} params.type - Message type
 * @param {MessageAttachment[]} params.attachments - Attachments
 * @param {MessageMetadata} params.metadata - Additional metadata
 * @param {'normal'|'urgent'} params.priority - Priority level
 * @param {string|null} params.replyTo - Reply to message ID
 * @returns {Message}
 */
export const createMessageModel = ({ 
  conversationId, 
  senderId, 
  senderName, 
  text, 
  type = MessageTypes.TEXT,
  attachments = [],
  metadata = {},
  priority = MessagePriority.NORMAL,
  replyTo = null
}) => {
  const now = new Date();
  const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    conversationId,
    senderId,
    senderName,
    type,
    text: text || '',
    attachments: [...attachments], // Clone array
    metadata: { ...metadata }, // Clone object
    priority,
    readBy: { [senderId]: now }, // Sender has read their own message
    replyTo,
    isEdited: false,
    createdAt: now,
    updatedAt: now,
    isDeleted: false
  };
};

/**
 * Helper to generate conversation title from participants
 * @param {Object[]} participants - Array of user objects
 * @param {string} currentUserId - Current user ID to exclude from title
 * @returns {string}
 */
export const generateConversationTitle = (participants, currentUserId) => {
  const otherParticipants = participants.filter(p => p.id !== currentUserId);
  
  if (otherParticipants.length === 0) {
    return 'Me';
  }
  
  if (otherParticipants.length === 1) {
    return otherParticipants[0].name || 'Unknown User';
  }
  
  if (otherParticipants.length === 2) {
    return `${otherParticipants[0].name} & ${otherParticipants[1].name}`;
  }
  
  return `${otherParticipants[0].name} & ${otherParticipants.length - 1} others`;
};

/**
 * Helper to check if a user can access a conversation
 * @param {Conversation} conversation 
 * @param {string} userId 
 * @returns {boolean}
 */
export const canUserAccessConversation = (conversation, userId) => {
  return conversation.participants.includes(userId) && conversation.isActive;
};

/**
 * Helper to get unread count for a user
 * @param {Conversation} conversation 
 * @param {string} userId 
 * @returns {number}
 */
export const getUnreadCount = (conversation, userId) => {
  return conversation.unreadCounts[userId] || 0;
};

/**
 * Helper to format message preview text
 * @param {Message} message 
 * @param {number} maxLength 
 * @returns {string}
 */
export const formatMessagePreview = (message, maxLength = 50) => {
  if (!message) return '';
  
  let preview = '';
  
  switch (message.type) {
    case MessageTypes.TEXT:
      preview = message.text;
      break;
    case MessageTypes.IMAGE:
      preview = '📷 Photo';
      break;
    case MessageTypes.INCIDENT_SHARE:
      preview = '⚡ Shared important moment';
      break;
    case MessageTypes.SYSTEM:
      preview = message.text;
      break;
    default:
      preview = 'Message';
  }
  
  return preview.length > maxLength 
    ? preview.substring(0, maxLength) + '...' 
    : preview;
};
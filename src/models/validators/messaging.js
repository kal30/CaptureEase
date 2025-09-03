// Messaging Schema Validation Functions
// Validates data before saving to Firestore to prevent invalid data

import { MessageTypes, ConversationTypes, MessagePriority } from '../messaging.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the data is valid
 * @property {string[]} errors - Array of validation error messages
 * @property {string[]} warnings - Array of validation warnings (non-blocking)
 */

/**
 * Validates conversation data before creation/update
 * @param {Object} conversation - Conversation object to validate
 * @returns {ValidationResult}
 */
export const validateConversation = (conversation) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!conversation.participants) {
    errors.push('participants is required');
  } else if (!Array.isArray(conversation.participants)) {
    errors.push('participants must be an array');
  } else if (conversation.participants.length === 0) {
    errors.push('participants array cannot be empty');
  } else if (conversation.participants.length < 2) {
    warnings.push('conversations typically need at least 2 participants');
  }

  if (!conversation.childId) {
    errors.push('childId is required');
  } else if (typeof conversation.childId !== 'string') {
    errors.push('childId must be a string');
  }

  if (!conversation.type) {
    errors.push('type is required');
  } else if (!Object.values(ConversationTypes).includes(conversation.type)) {
    errors.push(`type must be one of: ${Object.values(ConversationTypes).join(', ')}`);
  }

  if (!conversation.title) {
    errors.push('title is required');
  } else if (typeof conversation.title !== 'string') {
    errors.push('title must be a string');
  } else if (conversation.title.trim().length === 0) {
    errors.push('title cannot be empty');
  } else if (conversation.title.length > 100) {
    errors.push('title cannot exceed 100 characters');
  }

  if (!conversation.createdBy) {
    errors.push('createdBy is required');
  } else if (typeof conversation.createdBy !== 'string') {
    errors.push('createdBy must be a string');
  }

  // Optional field validation
  if (conversation.participants && Array.isArray(conversation.participants)) {
    // Check for duplicate participants
    const uniqueParticipants = new Set(conversation.participants);
    if (uniqueParticipants.size !== conversation.participants.length) {
      errors.push('participants array contains duplicates');
    }

    // Validate participant IDs
    conversation.participants.forEach((participantId, index) => {
      if (typeof participantId !== 'string') {
        errors.push(`participant at index ${index} must be a string`);
      } else if (participantId.trim().length === 0) {
        errors.push(`participant at index ${index} cannot be empty`);
      }
    });
  }

  if (conversation.unreadCounts) {
    if (typeof conversation.unreadCounts !== 'object') {
      errors.push('unreadCounts must be an object');
    } else {
      Object.entries(conversation.unreadCounts).forEach(([userId, count]) => {
        if (typeof count !== 'number' || count < 0 || !Number.isInteger(count)) {
          errors.push(`unreadCounts.${userId} must be a non-negative integer`);
        }
      });
    }
  }

  if (conversation.isActive !== undefined && typeof conversation.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates message data before creation/update
 * @param {Object} message - Message object to validate
 * @returns {ValidationResult}
 */
export const validateMessage = (message) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!message.conversationId) {
    errors.push('conversationId is required');
  } else if (typeof message.conversationId !== 'string') {
    errors.push('conversationId must be a string');
  }

  if (!message.senderId) {
    errors.push('senderId is required');
  } else if (typeof message.senderId !== 'string') {
    errors.push('senderId must be a string');
  }

  if (!message.senderName) {
    errors.push('senderName is required');
  } else if (typeof message.senderName !== 'string') {
    errors.push('senderName must be a string');
  } else if (message.senderName.trim().length === 0) {
    errors.push('senderName cannot be empty');
  }

  if (!message.type) {
    errors.push('type is required');
  } else if (!Object.values(MessageTypes).includes(message.type)) {
    errors.push(`type must be one of: ${Object.values(MessageTypes).join(', ')}`);
  }

  // Text validation based on message type
  if (message.type === MessageTypes.TEXT) {
    if (!message.text || typeof message.text !== 'string') {
      errors.push('text is required for text messages');
    } else if (message.text.trim().length === 0) {
      errors.push('text cannot be empty for text messages');
    } else if (message.text.length > 2000) {
      errors.push('text cannot exceed 2000 characters');
    }
  }

  if (message.type === MessageTypes.SYSTEM) {
    if (!message.text || typeof message.text !== 'string') {
      errors.push('text is required for system messages');
    } else if (message.text.trim().length === 0) {
      errors.push('text cannot be empty for system messages');
    }
  }

  // Priority validation
  if (message.priority && !Object.values(MessagePriority).includes(message.priority)) {
    errors.push(`priority must be one of: ${Object.values(MessagePriority).join(', ')}`);
  }

  // Attachments validation
  if (message.attachments) {
    if (!Array.isArray(message.attachments)) {
      errors.push('attachments must be an array');
    } else {
      message.attachments.forEach((attachment, index) => {
        const attachmentErrors = validateAttachment(attachment);
        if (!attachmentErrors.isValid) {
          attachmentErrors.errors.forEach(error => {
            errors.push(`attachment[${index}]: ${error}`);
          });
        }
      });
    }
  }

  // Metadata validation
  if (message.metadata) {
    if (typeof message.metadata !== 'object') {
      errors.push('metadata must be an object');
    } else {
      // Validate incident sharing metadata
      if (message.type === MessageTypes.INCIDENT_SHARE) {
        if (!message.metadata.incidentId && !message.metadata.entryId) {
          errors.push('incidentId or entryId is required in metadata for incident_share messages');
        }
      }
    }
  }

  // Read receipts validation
  if (message.readBy) {
    if (typeof message.readBy !== 'object') {
      errors.push('readBy must be an object');
    } else {
      Object.entries(message.readBy).forEach(([userId, timestamp]) => {
        if (timestamp !== null && !(timestamp instanceof Date)) {
          errors.push(`readBy.${userId} must be a Date or null`);
        }
      });
    }
  }

  // Reply validation
  if (message.replyTo) {
    if (typeof message.replyTo !== 'string') {
      errors.push('replyTo must be a string');
    }
  }

  // Boolean field validation
  if (message.isEdited !== undefined && typeof message.isEdited !== 'boolean') {
    errors.push('isEdited must be a boolean');
  }

  if (message.isDeleted !== undefined && typeof message.isDeleted !== 'boolean') {
    errors.push('isDeleted must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates message attachment data
 * @param {Object} attachment - Attachment object to validate
 * @returns {ValidationResult}
 */
export const validateAttachment = (attachment) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!attachment.type) {
    errors.push('type is required');
  } else if (!['image', 'file'].includes(attachment.type)) {
    errors.push('type must be either "image" or "file"');
  }

  if (!attachment.url) {
    errors.push('url is required');
  } else if (typeof attachment.url !== 'string') {
    errors.push('url must be a string');
  }

  if (!attachment.filename) {
    errors.push('filename is required');
  } else if (typeof attachment.filename !== 'string') {
    errors.push('filename must be a string');
  } else if (attachment.filename.trim().length === 0) {
    errors.push('filename cannot be empty');
  }

  // Optional field validation
  if (attachment.size !== undefined) {
    if (typeof attachment.size !== 'number' || attachment.size < 0) {
      errors.push('size must be a non-negative number');
    } else if (attachment.size > 10 * 1024 * 1024) { // 10MB limit
      warnings.push('file size exceeds 10MB, consider compression');
    }
  }

  if (attachment.mimeType !== undefined && typeof attachment.mimeType !== 'string') {
    errors.push('mimeType must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates that a user can send a message to a conversation
 * @param {string} userId - User ID attempting to send
 * @param {Object} conversation - Target conversation
 * @returns {ValidationResult}
 */
export const validateMessagePermissions = (userId, conversation) => {
  const errors = [];

  if (!userId) {
    errors.push('userId is required');
    return { isValid: false, errors, warnings: [] };
  }

  if (!conversation) {
    errors.push('conversation is required');
    return { isValid: false, errors, warnings: [] };
  }

  if (!conversation.participants || !conversation.participants.includes(userId)) {
    errors.push('user is not a participant in this conversation');
  }

  if (!conversation.isActive) {
    errors.push('conversation is not active');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
};

/**
 * Sanitizes user input text to prevent XSS and other issues
 * @param {string} text - Raw text input
 * @returns {string} Sanitized text
 */
export const sanitizeMessageText = (text) => {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates conversation title and suggests improvements
 * @param {string} title - Proposed title
 * @param {string[]} participantNames - Names of participants for suggestions
 * @returns {ValidationResult & {suggestions: string[]}}
 */
export const validateConversationTitle = (title, participantNames = []) => {
  const errors = [];
  const warnings = [];
  const suggestions = [];

  if (!title || typeof title !== 'string') {
    errors.push('title is required and must be a string');
    
    // Suggest a title based on participants
    if (participantNames.length > 0) {
      if (participantNames.length === 2) {
        suggestions.push(`${participantNames[0]} & ${participantNames[1]}`);
      } else if (participantNames.length > 2) {
        suggestions.push(`${participantNames[0]} & ${participantNames.length - 1} others`);
        suggestions.push(`Care Team`);
      }
    }
    
    return { isValid: false, errors, warnings, suggestions };
  }

  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length === 0) {
    errors.push('title cannot be empty');
  }
  
  if (trimmedTitle.length > 100) {
    errors.push('title cannot exceed 100 characters');
    suggestions.push(trimmedTitle.substring(0, 100));
  }

  if (trimmedTitle.length < 3) {
    warnings.push('title is very short, consider a more descriptive name');
  }

  // Check for inappropriate content (basic check)
  const inappropriateWords = ['spam', 'test123', 'asdf'];
  if (inappropriateWords.some(word => trimmedTitle.toLowerCase().includes(word))) {
    warnings.push('title may not be descriptive enough');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
};
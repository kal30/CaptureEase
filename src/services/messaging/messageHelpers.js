// Message Helper Functions
// Higher-level utilities for specialized message operations

import { sendMessage } from './messageService.js';
import { MessageTypes, MessagePriority } from '../../models/messaging.js';

/**
 * Shares an incident to a conversation
 * @param {string} conversationId - Target conversation ID
 * @param {string} senderId - User sharing the incident
 * @param {string} senderName - Sender display name
 * @param {Object} incidentData - Incident data to share
 * @param {string} message - Optional message to accompany the share
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const shareIncidentToConversation = async (conversationId, senderId, senderName, incidentData, message = '') => {
  try {
    console.log('🚧 shareIncidentToConversation - STUB IMPLEMENTATION');
    console.log('Params:', { conversationId, senderId, incidentData, message });
    
    // TODO: Step 6 - Implement incident sharing
    // 1. Validate incident access permissions
    // 2. Format incident data for sharing
    // 3. Create message with incident_share type
    // 4. Include incident metadata
    // 5. Send to conversation
    
    const shareText = message || `Shared ${incidentData?.incidentType || 'incident'}: ${incidentData?.description || 'No description'}`;
    
    const result = await sendMessage({
      conversationId,
      senderId,
      senderName,
      text: shareText,
      type: MessageTypes.INCIDENT_SHARE,
      metadata: {
        incidentId: incidentData?.id,
        incidentType: incidentData?.incidentType,
        severity: incidentData?.severity,
        timestamp: incidentData?.timestamp,
        sharedContent: {
          type: 'incident',
          data: incidentData
        }
      },
      priority: incidentData?.severity === 'high' ? MessagePriority.URGENT : MessagePriority.NORMAL
    });
    
    return result;
    
  } catch (error) {
    console.error('Error in shareIncidentToConversation:', error);
    return {
      success: false,
      error: error.message || 'Failed to share incident to conversation'
    };
  }
};

/**
 * Shares a timeline entry to a conversation
 * @param {string} conversationId - Target conversation ID
 * @param {string} senderId - User sharing the entry
 * @param {string} senderName - Sender display name
 * @param {Object} entryData - Timeline entry data to share
 * @param {string} message - Optional message to accompany the share
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const shareTimelineEntry = async (conversationId, senderId, senderName, entryData, message = '') => {
  try {
    console.log('🚧 shareTimelineEntry - STUB IMPLEMENTATION');
    console.log('Params:', { conversationId, senderId, entryData, message });
    
    // TODO: Step 6 - Implement timeline entry sharing
    // 1. Format entry data for sharing
    // 2. Determine appropriate message type
    // 3. Include entry metadata
    // 4. Send to conversation
    
    const entryType = entryData?.type || 'entry';
    const shareText = message || `Shared ${entryType}: ${entryData?.title || entryData?.description || 'Timeline update'}`;
    
    const result = await sendMessage({
      conversationId,
      senderId,
      senderName,
      text: shareText,
      type: MessageTypes.INCIDENT_SHARE, // Reuse for all shared content
      metadata: {
        entryId: entryData?.id,
        entryType: entryData?.type,
        timestamp: entryData?.timestamp,
        sharedContent: {
          type: 'timeline_entry',
          data: entryData
        }
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('Error in shareTimelineEntry:', error);
    return {
      success: false,
      error: error.message || 'Failed to share timeline entry to conversation'
    };
  }
};

/**
 * Sends a quick pre-defined message
 * @param {string} conversationId - Target conversation ID
 * @param {string} senderId - User sending the message
 * @param {string} senderName - Sender display name
 * @param {string} templateKey - Quick message template key
 * @param {Object} variables - Variables to substitute in template
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendQuickMessage = async (conversationId, senderId, senderName, templateKey, variables = {}) => {
  try {
    console.log('🚧 sendQuickMessage - STUB IMPLEMENTATION');
    console.log('Params:', { conversationId, senderId, templateKey, variables });
    
    // TODO: Step 6 - Implement quick message templates
    // 1. Load message templates
    // 2. Substitute variables
    // 3. Send formatted message
    
    const templates = getQuickMessageTemplates();
    const template = templates[templateKey];
    
    if (!template) {
      return {
        success: false,
        error: `Unknown template key: ${templateKey}`
      };
    }
    
    const messageText = substituteBarcablesTemplate(template.text, variables);
    
    const result = await sendMessage({
      conversationId,
      senderId,
      senderName,
      text: messageText,
      type: MessageTypes.TEXT,
      priority: template.urgent ? MessagePriority.URGENT : MessagePriority.NORMAL
    });
    
    return result;
    
  } catch (error) {
    console.error('Error in sendQuickMessage:', error);
    return {
      success: false,
      error: error.message || 'Failed to send quick message'
    };
  }
};

/**
 * Sends a system message (automated notifications)
 * @param {string} conversationId - Target conversation ID
 * @param {string} text - System message text
 * @param {Object} metadata - Additional system message metadata
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendSystemMessage = async (conversationId, text, metadata = {}) => {
  try {
    console.log('🚧 sendSystemMessage - STUB IMPLEMENTATION');
    console.log('Params:', { conversationId, text, metadata });
    
    // TODO: Step 6 - Implement system messages
    // 1. Format system message
    // 2. Use system sender ID
    // 3. Include system metadata
    
    const result = await sendMessage({
      conversationId,
      senderId: 'system',
      senderName: 'CaptureEase',
      text,
      type: MessageTypes.SYSTEM,
      metadata: {
        systemType: metadata.type || 'notification',
        ...metadata
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('Error in sendSystemMessage:', error);
    return {
      success: false,
      error: error.message || 'Failed to send system message'
    };
  }
};

/**
 * Sends a photo message with attachment
 * @param {string} conversationId - Target conversation ID
 * @param {string} senderId - User sending the photo
 * @param {string} senderName - Sender display name
 * @param {File|Object} photoFile - Photo file or file data
 * @param {string} caption - Optional photo caption
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendPhotoMessage = async (conversationId, senderId, senderName, photoFile, caption = '') => {
  try {
    console.log('🚧 sendPhotoMessage - STUB IMPLEMENTATION');
    console.log('Params:', { conversationId, senderId, caption });
    
    // TODO: Step 6 - Implement photo messages
    // 1. Upload photo to Firebase Storage
    // 2. Generate secure download URL
    // 3. Create attachment metadata
    // 4. Send message with image type
    
    const stubAttachment = {
      id: `attachment_${Date.now()}`,
      type: 'image',
      url: 'https://example.com/photo.jpg',
      filename: photoFile?.name || 'photo.jpg',
      size: photoFile?.size || 0,
      mimeType: photoFile?.type || 'image/jpeg'
    };
    
    const result = await sendMessage({
      conversationId,
      senderId,
      senderName,
      text: caption || '📷 Photo',
      type: MessageTypes.IMAGE,
      attachments: [stubAttachment]
    });
    
    return result;
    
  } catch (error) {
    console.error('Error in sendPhotoMessage:', error);
    return {
      success: false,
      error: error.message || 'Failed to send photo message'
    };
  }
};

/**
 * Gets quick message templates
 * @returns {Object} Templates object
 */
const getQuickMessageTemplates = () => {
  return {
    'pickup_early': {
      text: 'I need to pick up {{childName}} early today at {{time}}.',
      urgent: false
    },
    'medication_given': {
      text: '💊 {{childName}} has been given {{medication}} at {{time}}.',
      urgent: false
    },
    'tough_morning': {
      text: '{{childName}} is having a challenging morning. May need extra support today.',
      urgent: true
    },
    'great_day': {
      text: '🌟 {{childName}} had a wonderful day today! {{details}}',
      urgent: false
    },
    'needs_attention': {
      text: '⚠️ {{childName}} needs immediate attention: {{reason}}',
      urgent: true
    },
    'meal_refused': {
      text: '🍽️ {{childName}} refused {{meal}}. Trying alternative options.',
      urgent: false
    },
    'sleep_update': {
      text: '😴 {{childName}} {{sleepStatus}} at {{time}}. Duration: {{duration}}',
      urgent: false
    },
    'therapy_complete': {
      text: '✅ {{childName}} completed {{therapyType}} session. {{notes}}',
      urgent: false
    }
  };
};

/**
 * Substitutes variables in message template
 * @param {string} template - Template with {{variable}} placeholders
 * @param {Object} variables - Variables to substitute
 * @returns {string} Processed message
 */
const substituteBarcablesTemplate = (template, variables) => {
  let message = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    message = message.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  // Clean up any remaining placeholders
  message = message.replace(/\{\{[^}]+\}\}/g, '[missing]');
  
  return message;
};

/**
 * Validates that a file is appropriate for sharing
 * @param {File} file - File to validate
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateFileForSharing = (file) => {
  const errors = [];
  
  // File size check (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }
  
  // File type check
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported');
  }
  
  // Filename check
  if (!file.name || file.name.length > 255) {
    errors.push('Invalid filename');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
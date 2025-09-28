import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Event Service - Normalized ingestion for all entry types
 *
 * This service implements the Event schema contract defined in docs/contracts/events.md
 * All ingestion handlers (SMS, WhatsApp, Web, Manual) should use this service.
 */

/**
 * Create a normalized Event record
 *
 * @param {Object} params - Event creation parameters
 * @param {Object} params.raw - Complete raw payload (preserve exactly as received)
 * @param {string} params.text - Normalized text content
 * @param {string} params.source - "sms", "whatsapp", "web", "manual"
 * @param {string} params.childId - Target child identifier
 * @param {string} [params.createdBy] - User ID (will use current user if not provided)
 * @param {Array} [params.media] - Array of media attachments
 * @returns {Promise<string>} - Created event document ID
 */
export const createEvent = async ({ raw, text, source, childId, createdBy, media = [] }) => {
  try {
    // Validate required parameters
    if (!raw || typeof raw !== 'object') {
      throw new Error('raw payload is required and must be an object');
    }
    if (typeof text !== 'string') {
      throw new Error('text must be a string');
    }
    if (!['sms', 'whatsapp', 'web', 'manual'].includes(source)) {
      throw new Error('source must be one of: sms, whatsapp, web, manual');
    }
    if (!childId) {
      throw new Error('childId is required');
    }

    // Get current user for audit metadata if not provided
    let userId = createdBy;
    if (!userId) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be authenticated or createdBy must be provided');
      }
      userId = currentUser.uid;
    }

    // Validate and normalize media array
    const normalizedMedia = Array.isArray(media) ? media.map(mediaItem => ({
      url: mediaItem.url || '',
      type: mediaItem.type || 'unknown',
      filename: mediaItem.filename || '',
      size: mediaItem.size || 0,
      metadata: mediaItem.metadata || {}
    })) : [];

    // Create Event document following the schema contract
    const eventDoc = {
      // Required Fields
      raw: { ...raw }, // Deep copy to prevent mutations
      text: text.trim(), // Normalize whitespace
      source,
      childId,
      createdBy: userId,
      createdAt: serverTimestamp(),

      // Optional Fields
      media: normalizedMedia,

      // Metadata Fields
      status: 'active',
      updatedAt: serverTimestamp(),
      updatedBy: userId,

      // Classification Fields (empty - to be populated by classifier)
      classification: {
        type: null,
        confidence: null,
        tags: [],
        processed: false,
        processedAt: null
      }
    };

    // Save to events collection
    const docRef = await addDoc(collection(db, "events"), eventDoc);

    console.log(`Event created successfully: ${docRef.id}`, {
      source,
      childId,
      textLength: text.length,
      mediaCount: normalizedMedia.length
    });

    return docRef.id;

  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * SMS Ingestion Handler
 *
 * @param {Object} smsPayload - Raw SMS webhook payload
 * @param {string} childId - Target child ID
 * @param {string} [userId] - User ID (optional)
 * @returns {Promise<string>} - Created event ID
 */
export const ingestSMS = async (smsPayload, childId, userId = null) => {
  try {
    // Extract text content from SMS payload
    const text = smsPayload.body || smsPayload.Body || '';

    // Normalize text content
    const normalizedText = text.trim();

    // Create Event record
    return await createEvent({
      raw: smsPayload,
      text: normalizedText,
      source: 'sms',
      childId,
      createdBy: userId,
      media: [] // SMS doesn't typically include media in basic implementations
    });

  } catch (error) {
    console.error('SMS ingestion failed:', error);
    throw new Error(`SMS ingestion failed: ${error.message}`);
  }
};

/**
 * WhatsApp Ingestion Handler
 *
 * @param {Object} whatsappPayload - Raw WhatsApp webhook payload
 * @param {string} childId - Target child ID
 * @param {string} [userId] - User ID (optional)
 * @returns {Promise<string>} - Created event ID
 */
export const ingestWhatsApp = async (whatsappPayload, childId, userId = null) => {
  try {
    // Extract text content from WhatsApp payload
    const text = whatsappPayload.body || whatsappPayload.text?.body || '';

    // Normalize text content
    const normalizedText = text.trim();

    // Handle media if present
    const media = [];
    if (whatsappPayload.media || whatsappPayload.image || whatsappPayload.document) {
      // Note: In a real implementation, you would process and upload media here
      // For now, we'll store the media reference in raw and handle upload elsewhere
      const mediaItem = whatsappPayload.media || whatsappPayload.image || whatsappPayload.document;
      if (mediaItem) {
        media.push({
          url: mediaItem.url || '',
          type: mediaItem.mime_type || 'unknown',
          filename: mediaItem.filename || 'whatsapp_media',
          size: mediaItem.file_size || 0,
          metadata: { original: mediaItem }
        });
      }
    }

    // Create Event record
    return await createEvent({
      raw: whatsappPayload,
      text: normalizedText,
      source: 'whatsapp',
      childId,
      createdBy: userId,
      media
    });

  } catch (error) {
    console.error('WhatsApp ingestion failed:', error);
    throw new Error(`WhatsApp ingestion failed: ${error.message}`);
  }
};

/**
 * Web/Manual Entry Ingestion Handler
 *
 * @param {Object} formData - Form submission data
 * @param {string} childId - Target child ID
 * @param {string} source - "web" or "manual"
 * @param {Array} [uploadedMedia] - Already uploaded media files
 * @param {Object} [metadata] - Additional metadata (userAgent, etc.)
 * @returns {Promise<string>} - Created event ID
 */
export const ingestWebEntry = async (formData, childId, source = 'web', uploadedMedia = [], metadata = {}) => {
  try {
    if (!['web', 'manual'].includes(source)) {
      throw new Error('source must be "web" or "manual" for web entries');
    }

    // Extract and normalize text from various form fields
    let text = '';

    // Common text fields to check
    const textFields = ['text', 'content', 'message', 'note', 'notes', 'description', 'body'];
    for (const field of textFields) {
      if (formData[field] && typeof formData[field] === 'string') {
        text = formData[field].trim();
        break;
      }
    }

    // If no text found, create a summary from form data
    if (!text) {
      const entries = Object.entries(formData)
        .filter(([key, value]) => value && typeof value === 'string' && value.trim())
        .map(([key, value]) => `${key}: ${value.trim()}`)
        .slice(0, 5); // Limit to first 5 fields

      text = entries.length > 0 ? entries.join(', ') : 'Form submission';
    }

    // Prepare raw payload with metadata
    const rawPayload = {
      formData: { ...formData },
      timestamp: new Date().toISOString(),
      source,
      ...metadata
    };

    // Create Event record
    return await createEvent({
      raw: rawPayload,
      text: text,
      source: source,
      childId,
      media: uploadedMedia || []
    });

  } catch (error) {
    console.error('Web entry ingestion failed:', error);
    throw new Error(`Web entry ingestion failed: ${error.message}`);
  }
};

/**
 * Utility: Convert existing data entries to Events
 * This can be used to migrate existing incidents, mood logs, etc. to the new Event schema
 *
 * @param {Object} existingData - Existing document data
 * @param {string} originalCollection - Original collection name ("incidents", "dailyCare", etc.)
 * @param {string} childId - Child ID
 * @returns {Promise<string>} - Created event ID
 */
export const convertToEvent = async (existingData, originalCollection, childId) => {
  try {
    // Create a synthetic raw payload preserving the original data
    const rawPayload = {
      originalCollection,
      originalData: { ...existingData },
      convertedAt: new Date().toISOString(),
      source: 'conversion'
    };

    // Extract text content based on data type
    let text = '';
    if (existingData.notes) text = existingData.notes;
    else if (existingData.customIncidentName) text = existingData.customIncidentName;
    else if (existingData.remedy) text = existingData.remedy;
    else if (existingData.actionType) text = `${existingData.actionType} entry`;
    else text = `${originalCollection} entry`;

    // Create Event record
    return await createEvent({
      raw: rawPayload,
      text: text,
      source: 'manual', // Treat conversions as manual entries
      childId,
      createdBy: existingData.createdBy || existingData.authorId
    });

  } catch (error) {
    console.error('Data conversion to event failed:', error);
    throw error;
  }
};
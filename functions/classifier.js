/**
 * classifier.js
 *
 * Handles event classification and ingestion:
 * - SMS and WhatsApp webhook handlers
 * - Web event creation
 * - Event classification logic and processing
 */

const { onCall, onRequest } = require("firebase-functions/v2/https");
const { admin, logger } = require('./init');

const createEventAdmin = async ({ raw, text, source, childId, createdBy, media = [] }) => {
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
    if (!createdBy) {
      throw new Error('createdBy is required for admin event creation');
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
      createdBy,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),

      // Optional Fields
      media: normalizedMedia,

      // Metadata Fields
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: createdBy,

      // Classification Fields (empty - to be populated by classifier)
      classification: {
        type: null,
        confidence: null,
        tags: [],
        processed: false,
        processedAt: null
      }
    };

    // Save to events collection using admin SDK
    const docRef = await admin.firestore().collection('events').add(eventDoc);

    logger.info(`Event created successfully: ${docRef.id}`, {
      source,
      childId,
      textLength: text.length,
      mediaCount: normalizedMedia.length
    });

    return docRef.id;

  } catch (error) {
    logger.error('Error creating event:', error);
    throw error;
  }
};

const smsWebhook = onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
      }

      const smsPayload = req.body;

      // Log the incoming SMS for debugging
      logger.info('SMS webhook received:', smsPayload);

      // Extract basic info
      const fromNumber = smsPayload.From || smsPayload.from;
      const messageBody = smsPayload.Body || smsPayload.body || '';

      if (!fromNumber || !messageBody) {
        logger.warn('SMS webhook missing required fields:', { fromNumber, hasBody: !!messageBody });
        return res.status(400).json({
          error: 'Missing required fields: From and Body'
        });
      }

      // TODO: Implement phone number to user/child mapping
      // For now, we'll need to look up which child this SMS should be associated with
      // This could be done via a phone_mapping collection or user preferences

      // PLACEHOLDER: In a real implementation, you would:
      // 1. Look up the phone number in a mapping table
      // 2. Determine which child(ren) this should be logged for
      // 3. Get the appropriate user ID for createdBy

      // For demo purposes, we'll require childId and userId to be passed in the SMS body
      // or use query parameters, or implement a more sophisticated mapping system

      const demoChildId = req.query.childId || 'demo-child-id';
      const demoUserId = req.query.userId || 'demo-user-id';

      // Create Event record
      const eventId = await createEventAdmin({
        raw: smsPayload,
        text: messageBody.trim(),
        source: 'sms',
        childId: demoChildId,
        createdBy: demoUserId
      });

      logger.info('SMS ingested successfully', { eventId, fromNumber });

      // Respond to webhook (Twilio expects 200 OK)
      return res.status(200).json({
        success: true,
        eventId,
        message: 'SMS ingested successfully'
      });

    } catch (error) {
      logger.error('SMS webhook error:', error);
      return res.status(500).json({
        error: 'Failed to process SMS',
        details: error.message
      });
    }
  }
);

const whatsappWebhook = onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
      }

      const whatsappPayload = req.body;

      // Log the incoming WhatsApp message for debugging
      logger.info('WhatsApp webhook received:', whatsappPayload);

      // WhatsApp Business API has a nested structure
      const entry = whatsappPayload.entry?.[0];
      const changes = entry?.changes?.[0];
      const messages = changes?.value?.messages;

      if (!messages || messages.length === 0) {
        // This might be a status update or other non-message webhook
        logger.info('WhatsApp webhook with no messages, acknowledging');
        return res.status(200).json({ success: true, message: 'No messages to process' });
      }

      // Process each message
      const eventIds = [];
      for (const message of messages) {
        const messageText = message.text?.body || '';
        const fromNumber = message.from;

        if (!fromNumber) {
          logger.warn('WhatsApp message missing from number:', message);
          continue;
        }

        // Handle media if present
        const media = [];
        if (message.image || message.document || message.audio || message.video) {
          const mediaItem = message.image || message.document || message.audio || message.video;
          media.push({
            url: mediaItem.link || '',
            type: message.type || 'unknown',
            filename: mediaItem.filename || 'whatsapp_media',
            size: mediaItem.file_size || 0,
            metadata: {
              id: mediaItem.id,
              mime_type: mediaItem.mime_type,
              sha256: mediaItem.sha256
            }
          });
        }

        // TODO: Implement phone number to user/child mapping (same as SMS)
        const demoChildId = req.query.childId || 'demo-child-id';
        const demoUserId = req.query.userId || 'demo-user-id';

        // Create Event record
        const eventId = await createEventAdmin({
          raw: whatsappPayload,
          text: messageText,
          source: 'whatsapp',
          childId: demoChildId,
          createdBy: demoUserId,
          media
        });

        eventIds.push(eventId);

        logger.info('WhatsApp message ingested successfully', {
          eventId,
          fromNumber,
          hasMedia: media.length > 0
        });
      }

      // Respond to webhook
      return res.status(200).json({
        success: true,
        eventIds,
        processedMessages: eventIds.length,
        message: 'WhatsApp messages ingested successfully'
      });

    } catch (error) {
      logger.error('WhatsApp webhook error:', error);
      return res.status(500).json({
        error: 'Failed to process WhatsApp message',
        details: error.message
      });
    }
  }
);

const createWebEvent = onCall(
  {
    enforceAppCheck: false
  },
  async (request) => {
    try {
      // Verify user is authenticated
      if (!request.auth || !request.auth.uid) {
        throw new Error('User must be authenticated to create web events');
      }

      const { formData, childId, source = 'web', uploadedMedia = [], metadata = {} } = request.data;

      if (!formData || !childId) {
        throw new Error('formData and childId are required');
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
        userAgent: metadata.userAgent || request.headers?.['user-agent'],
        ipAddress: metadata.ipAddress || request.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown',
        ...metadata
      };

      // Create Event record
      const eventId = await createEventAdmin({
        raw: rawPayload,
        text: text,
        source: source,
        childId,
        createdBy: request.auth.uid,
        media: uploadedMedia || []
      });

      logger.info('Web event created successfully', {
        eventId,
        childId,
        userId: request.auth.uid,
        source
      });

      return {
        success: true,
        eventId,
        message: 'Web event created successfully'
      };

    } catch (error) {
      logger.error('Web event creation failed:', error);
      throw new Error(error.message);
    }
  }
);

// Placeholder functions for future classification logic
// --- Rule-Based Classification Logic ---

const CLASSIFICATION_RULES = {
  emotional_positive: {
    keywords: ['happy', 'excited', 'joyful', 'calm', 'pleased', 'content', 'smiling', 'laughing', 'giggling'],
    contextPatterns: ['good mood', 'positive', 'cheerful', 'delighted'],
    buckets: ['emotional_positive'],
    targetCollection: 'moodLogs',
    type: 'mood_log',
    confidence: 0.8
  },
  emotional_negative: {
    keywords: ['sad', 'angry', 'frustrated', 'upset', 'crying', 'tears', 'anxious', 'worried', 'scared', 'cranky'],
    contextPatterns: ['bad mood', 'difficult', 'challenging', 'distressed'],
    buckets: ['emotional_negative'],
    targetCollection: 'moodLogs',
    type: 'mood_log',
    confidence: 0.8
  },
  behavioral_challenging: {
    keywords: ['meltdown', 'tantrum', 'screaming', 'hitting', 'throwing', 'kicking', 'biting', 'aggressive'],
    contextPatterns: ['difficult behavior', 'challenging', 'acting out', 'defiant'],
    buckets: ['behavioral_challenging'],
    targetCollection: 'behaviors',
    type: 'behavior',
    confidence: 0.9
  },
  sleep_related: {
    keywords: ['sleep', 'nap', 'bedtime', 'tired', 'sleepy', 'woke up', 'nightmare'],
    contextPatterns: ['going to bed', 'sleep time', 'rest'],
    buckets: ['sleep_related'],
    targetCollection: 'sleepLogs',
    type: 'sleep_log',
    confidence: 0.8
  },
  nutrition_feeding: {
    keywords: ['eating', 'food', 'hungry', 'thirsty', 'appetite', 'refused food', 'lunch', 'dinner', 'breakfast'],
    contextPatterns: ['meal', 'feeding', 'nutrition'],
    buckets: ['nutrition_feeding'],
    targetCollection: 'foodLogs',
    type: 'food_log',
    confidence: 0.7
  },
  medical_incident: {
    keywords: ['fever', 'sick', 'pain', 'injury', 'hurt', 'emergency', 'hospital', 'vomit'],
    contextPatterns: ['medical emergency', 'urgent', 'symptoms'],
    buckets: ['medical_incident'],
    targetCollection: 'medicalEvents',
    type: 'medical_event',
    confidence: 0.9
  }
};

/**
 * Classify a text string using rule-based logic
 * @param {string} text 
 * @returns {Object} classification result
 */
const classifyText = (text) => {
  if (!text) return { type: 'unclassified', confidence: 0 };
  
  const normalize = t => t.toLowerCase();
  const normalizedText = normalize(text);
  
  let bestMatch = null;
  let maxConfidence = 0;

  for (const [ruleKey, rule] of Object.entries(CLASSIFICATION_RULES)) {
    let matches = 0;
    
    // Check keywords
    rule.keywords.forEach(kw => {
      if (normalizedText.includes(normalize(kw))) matches++;
    });

    // Check context
    if (rule.contextPatterns) {
      rule.contextPatterns.forEach(cp => {
        if (normalizedText.includes(normalize(cp))) matches++;
      });
    }

    if (matches > 0) {
      // Simple confidence calculator
      const confidence = Math.min(rule.confidence + (matches * 0.05), 1.0);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        bestMatch = { ...rule, ruleKey };
      }
    }
  }

  // Default to General Log (dailyLogs) if no match
  if (!bestMatch) {
    return {
      type: 'journal',
      collection: 'dailyLogs',
      buckets: ['general'],
      confidence: 0.1
    };
  }

  return {
    type: bestMatch.type,
    collection: bestMatch.targetCollection,
    buckets: bestMatch.buckets,
    confidence: maxConfidence
  };
};

/**
 * Classify an event object
 * @param {Object} eventData 
 * @returns {Object} classification result
 */
const classifyEvent = (eventData) => {
  // Use text field if available, or extract from other fields
  const text = eventData.text || eventData.note || eventData.content || '';
  const result = classifyText(text);
  
  logger.info(`Classified event: ${result.type} (${result.confidence})`, { text: text.substring(0, 50) });
  
  return result;
};

const classifyUnprocessed = async () => {
  // TODO: Implement batch processing of unclassified events
  logger.info('classifyUnprocessed called - placeholder implementation');
  return { processed: 0 };
};

module.exports = {
  smsWebhook,
  whatsappWebhook,
  createWebEvent,
  classifyEvent,
  classifyText, // Export helper for direct use
  classifyUnprocessed,
  createEventAdmin
};
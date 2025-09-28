const { onCall, onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
// Make SendGrid optional in this codebase so missing module won't block deploys
let sgMail = null;
try {
  // eslint-disable-next-line global-require
  sgMail = require("@sendgrid/mail");
} catch (e) {
  // Module not installed in this branch; email features will be disabled
}
const admin = require("firebase-admin");

// Initialize Firebase Admin (for server-side operations)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Declare secrets
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");
const SENDER_NAME = defineSecret("SENDER_NAME");

// Helper function to generate email templates
const generateInvitationEmailTemplate = (
  childName,
  role,
  senderName,
  invitationLink,
  personalMessage
) => {
  const roleDisplay = role === "therapist" ? "Therapist" : "Caregiver";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CaptureEz Care Team Invitation</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #FFF8ED; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #F27F45 0%, #E85D2F 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .content h2 { color: #F27F45; margin: 0 0 20px 0; font-size: 24px; }
        .content p { margin: 0 0 15px 0; }
        .child-name { color: #5B8C51; font-weight: 600; }
        .role-badge { display: inline-block; background-color: #5B8C51; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 0 0 20px 0; }
        .personal-message { background-color: #FFF8ED; padding: 20px; border-radius: 12px; border-left: 4px solid #FFC857; margin: 20px 0; }
        .cta-link { color: #F27F45; text-decoration: underline; font-weight: 600; font-size: 18px; margin: 20px 0; }
        .cta-link:hover { color: #E85D2F; text-decoration: none; }
        .footer { background-color: #FFF8ED; padding: 30px; text-align: center; border-top: 1px solid #E8E2D9; }
        .footer p { margin: 0; color: #666; font-size: 14px; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .feature { text-align: center; padding: 20px; background-color: #FFF8ED; border-radius: 12px; }
        .feature-icon { font-size: 24px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 CaptureEz Invitation</h1>
          <p>You've been invited to join a care team</p>
        </div>
        
        <div class="content">
          <h2>Hello! 👋</h2>
          <p><strong>${senderName}</strong> has invited you to join <span class="child-name">${childName}'s</span> care team as a:</p>
          <div class="role-badge">${roleDisplay}</div>
          
          ${
            personalMessage
              ? `
          <div class="personal-message">
            <strong>Personal Message:</strong><br>
            "${personalMessage}"
          </div>
          `
              : ""
          }
          
          <p>CaptureEz helps care teams stay organized with:</p>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">📋</div>
              <strong>Progress Tracking</strong><br>
              <small>Daily logs and notes</small>
            </div>
            <div class="feature">
              <div class="feature-icon">💬</div>
              <strong>Team Communication</strong><br>
              <small>Secure messaging</small>
            </div>
          </div>
          
          <p>Ready to get started? <a href="${invitationLink}" class="cta-link">Click here to join the care team</a></p>
          
          <p><small>If the link doesn't work, copy and paste this URL into your browser:<br>
          <a href="${invitationLink}" style="color: #F27F45; word-break: break-all;">${invitationLink}</a></small></p>
        </div>
        
        <div class="footer">
          <p>This invitation was sent by ${senderName} through CaptureEz</p>
          <p style="margin-top: 10px;"><small>If you didn't expect this invitation, you can safely ignore this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    CaptureEz Care Team Invitation
    
    Hello!
    
    ${senderName} has invited you to join ${childName}'s care team as a ${roleDisplay}.
    
    ${personalMessage ? `Personal Message: "${personalMessage}"` : ""}
    
    CaptureEz helps care teams stay organized with progress tracking, team communication, and more.
    
    To accept your invitation, visit: ${invitationLink}
    
    If you didn't expect this invitation, you can safely ignore this email.
    
    Best regards,
    CaptureEz Team
  `;

  return { html, text };
};

if (sgMail) {
  exports.sendInvitationEmail = onCall(
    {
      secrets: [SENDGRID_API_KEY, FROM_EMAIL, SENDER_NAME],
    },
    async (request) => {
      try {
        const {
          recipientEmail,
          childName,
          role,
          senderName,
          invitationLink,
          personalMessage,
        } = request.data;

        // Validate required fields
        if (
          !recipientEmail ||
          !childName ||
          !role ||
          !senderName ||
          !invitationLink
        ) {
          logger.error("Missing required fields", request.data);
          throw new Error("Missing required fields");
        }

        // Set SendGrid API key
        sgMail.setApiKey(SENDGRID_API_KEY.value());

        const { html, text } = generateInvitationEmailTemplate(
          childName,
          role,
          senderName,
          invitationLink,
          personalMessage
        );

        const emailData = {
          to: recipientEmail,
          from: {
            email: FROM_EMAIL.value(),
            name: SENDER_NAME.value(),
          },
          subject: `🎯 You're invited to join ${childName}'s care team on CaptureEz`,
          html,
          text,
          customArgs: {
            category: "care-team-invitation",
            role: role,
            childName: childName,
          },
          // Temporarily disable click tracking until Link Branding (CNAMEs) is verified
          trackingSettings: {
            clickTracking: {
              enable: false,
              enableText: false,
            },
            openTracking: {
              enable: true,
            },
          },
        };

        const response = await sgMail.send(emailData);

        logger.info("Email sent successfully", {
          messageId: response[0]?.headers?.["x-message-id"],
          to: recipientEmail,
          childName,
          role,
          statusCode: response[0]?.statusCode,
        });

        return {
          success: true,
          messageId: response[0]?.headers?.["x-message-id"],
          message: "Invitation email sent successfully via SendGrid",
        };
      } catch (error) {
        logger.error("SendGrid email send failed", {
          error: error.message,
          stack: error.stack,
          data: request.data,
          response: error.response?.body,
        });

        throw new Error(`Failed to send email via SendGrid: ${error.message}`);
      }
    }
  );
} else {
  // In this branch, SendGrid isn't installed; skip exporting the email function
  logger.warn("SendGrid not installed; sendInvitationEmail function not exported in this codebase.");
}

// Helper function to update members field
const updateMembersField = (users) => {
  const members = new Set();
  
  // Add care owner
  if (users.care_owner) {
    members.add(users.care_owner);
  }
  
  // Add all role arrays
  if (users.care_partners) {
    users.care_partners.forEach(id => members.add(id));
  }
  if (users.caregivers) {
    users.caregivers.forEach(id => members.add(id));
  }
  if (users.therapists) {
    users.therapists.forEach(id => members.add(id));
  }
  
  return Array.from(members);
};

// Accept invitation Cloud Function
exports.acceptInvitation = onCall(
  {
    enforceAppCheck: false, // Set to true if you use App Check
  },
  async (request) => {
    try {
      // Verify user is authenticated
      if (!request.auth || !request.auth.uid) {
        throw new Error("User must be authenticated to accept invitations");
      }

      const { token } = request.data;

      if (!token) {
        throw new Error("Invitation token is required");
      }

      // Decode and validate token
      let inviteData;
      try {
        const decoded = JSON.parse(Buffer.from(decodeURIComponent(token), 'base64').toString());
        inviteData = decoded;
      } catch (error) {
        logger.error("Invalid invitation token", { error: error.message, token });
        throw new Error("Invalid invitation token");
      }

      // Validate invitation data
      const isMultiChild = inviteData.childIds && inviteData.childNames;
      const isSingleChild = inviteData.childId && inviteData.childName;
      
      if (!inviteData.email || !inviteData.role || (!isMultiChild && !isSingleChild)) {
        throw new Error("Invalid invitation data");
      }

      // Check if invitation is expired (30 days) - TEMPORARILY DISABLED
      // const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      // if (inviteData.timestamp && (Date.now() - inviteData.timestamp) > thirtyDaysMs) {
      //   throw new Error("This invitation has expired. Please request a new one.");
      // }

      // Verify user's email matches invitation email
      const userRecord = await admin.auth().getUser(request.auth.uid);
      if (userRecord.email !== inviteData.email) {
        throw new Error(`This invitation was sent to ${inviteData.email}. Please log in with that email address.`);
      }

      // Validate role
      const validRoles = ['care_partner', 'caregiver', 'therapist'];
      if (!validRoles.includes(inviteData.role)) {
        throw new Error(`Invalid role: ${inviteData.role}`);
      }

      // Get child IDs to process
      const childIds = isMultiChild ? inviteData.childIds : [inviteData.childId];
      const childNames = isMultiChild ? inviteData.childNames : [inviteData.childName];

      logger.info("Processing invitation acceptance", {
        userId: request.auth.uid,
        email: inviteData.email,
        role: inviteData.role,
        childIds,
        childNames
      });

      // Process each child assignment using admin privileges
      const db = admin.firestore();
      const batch = db.batch();

      for (const childId of childIds) {
        const childRef = db.collection('children').doc(childId);
        
        // Get current child document
        const childDoc = await childRef.get();
        if (!childDoc.exists) {
          throw new Error(`Child ${childId} not found`);
        }

        const childData = childDoc.data();
        const currentUsers = childData.users || {};

        // Create updated users object
        const updatedUsers = { ...currentUsers };
        
        // Add user to appropriate role array
        switch (inviteData.role) {
          case 'care_partner':
            updatedUsers.care_partners = [...(currentUsers.care_partners || []), request.auth.uid];
            break;
          case 'caregiver':
            updatedUsers.caregivers = [...(currentUsers.caregivers || []), request.auth.uid];
            break;
          case 'therapist':
            updatedUsers.therapists = [...(currentUsers.therapists || []), request.auth.uid];
            break;
        }

        // Update members field for efficient queries
        updatedUsers.members = updateMembersField(updatedUsers);

        // Add to batch update
        batch.update(childRef, {
          users: updatedUsers,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: request.auth.uid
        });

        logger.info("Added user to child", {
          childId,
          childName: childData.name,
          userId: request.auth.uid,
          role: inviteData.role
        });
      }

      // Execute all updates atomically
      await batch.commit();

      // Create success message
      const successMessage = childNames.length === 1 
        ? `Successfully joined ${childNames[0]}'s care team as ${inviteData.role}!`
        : `Successfully joined care team for ${childNames.join(', ')} as ${inviteData.role}!`;

      logger.info("Invitation acceptance completed successfully", {
        userId: request.auth.uid,
        email: inviteData.email,
        role: inviteData.role,
        childrenCount: childIds.length
      });

      return {
        success: true,
        message: successMessage,
        childrenCount: childIds.length,
        role: inviteData.role
      };

    } catch (error) {
      logger.error("Invitation acceptance failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid,
        data: request.data
      });

      throw new Error(error.message);
    }
  }
);

// Classification rules and patterns
const CLASSIFICATION_RULES = {
  // Emotional & Behavioral patterns
  emotional_positive: {
    keywords: ['happy', 'excited', 'joyful', 'calm', 'pleased', 'content', 'smiling', 'laughing', 'giggling'],
    contextPatterns: ['good mood', 'positive', 'cheerful', 'delighted'],
    buckets: ['emotional_positive'],
    confidence: 0.8
  },
  emotional_negative: {
    keywords: ['sad', 'angry', 'frustrated', 'upset', 'crying', 'tears', 'anxious', 'worried', 'scared'],
    contextPatterns: ['bad mood', 'difficult', 'challenging', 'distressed'],
    buckets: ['emotional_negative'],
    confidence: 0.8
  },
  behavioral_challenging: {
    keywords: ['meltdown', 'tantrum', 'screaming', 'hitting', 'throwing', 'kicking', 'biting', 'aggressive'],
    contextPatterns: ['difficult behavior', 'challenging', 'acting out', 'defiant'],
    buckets: ['behavioral_challenging'],
    confidence: 0.9
  },
  behavioral_positive: {
    keywords: ['cooperating', 'helping', 'sharing', 'listening', 'following directions', 'polite'],
    contextPatterns: ['good behavior', 'well-behaved', 'compliance'],
    buckets: ['behavioral_positive'],
    confidence: 0.8
  },

  // Sensory patterns
  sensory_seeking: {
    keywords: ['spinning', 'jumping', 'climbing', 'loud sounds', 'tight hugs', 'pressure'],
    contextPatterns: ['seeking input', 'sensory seeking', 'needs stimulation'],
    buckets: ['sensory_seeking'],
    confidence: 0.7
  },
  sensory_avoiding: {
    keywords: ['covering ears', 'avoiding touch', 'too loud', 'too bright', 'overwhelmed'],
    contextPatterns: ['sensory overload', 'overstimulated', 'avoiding'],
    buckets: ['sensory_avoiding'],
    confidence: 0.7
  },

  // Daily living patterns
  daily_routine: {
    keywords: ['breakfast', 'lunch', 'dinner', 'snack', 'bath', 'shower', 'brushing teeth'],
    contextPatterns: ['daily care', 'routine', 'meal time'],
    buckets: ['daily_routine'],
    confidence: 0.6
  },
  sleep_related: {
    keywords: ['sleep', 'nap', 'bedtime', 'tired', 'sleepy', 'woke up', 'nightmare'],
    contextPatterns: ['going to bed', 'sleep time', 'rest'],
    buckets: ['sleep_related'],
    confidence: 0.8
  },
  nutrition_feeding: {
    keywords: ['eating', 'food', 'hungry', 'thirsty', 'appetite', 'refused food'],
    contextPatterns: ['meal', 'feeding', 'nutrition'],
    buckets: ['nutrition_feeding'],
    confidence: 0.7
  },

  // Medical patterns
  medical_routine: {
    keywords: ['medication', 'pills', 'dose', 'therapy', 'treatment', 'checkup'],
    contextPatterns: ['medical care', 'routine medical', 'prescribed'],
    buckets: ['medical_routine'],
    confidence: 0.8
  },
  medical_incident: {
    keywords: ['fever', 'sick', 'pain', 'injury', 'hurt', 'emergency', 'hospital'],
    contextPatterns: ['medical emergency', 'urgent', 'symptoms'],
    buckets: ['medical_incident'],
    confidence: 0.9
  },

  // Development patterns
  developmental_milestone: {
    keywords: ['first time', 'new skill', 'milestone', 'breakthrough', 'progress'],
    contextPatterns: ['achievement', 'development', 'learned'],
    buckets: ['developmental_milestone'],
    confidence: 0.8
  },
  communication: {
    keywords: ['talking', 'words', 'speaking', 'language', 'sign language', 'gestures'],
    contextPatterns: ['communication', 'verbal', 'nonverbal'],
    buckets: ['communication'],
    confidence: 0.7
  },

  // Social patterns
  social_interaction: {
    keywords: ['playing', 'friends', 'family', 'social', 'interaction', 'together'],
    contextPatterns: ['with others', 'social time', 'group activity'],
    buckets: ['social_interaction'],
    confidence: 0.6
  },

  // Contextual patterns
  transition_difficulty: {
    keywords: ['transition', 'change', 'switching', 'leaving', 'stopping'],
    contextPatterns: ['difficulty with change', 'transition time'],
    buckets: ['environmental_change'],
    tags: ['transition'],
    confidence: 0.7
  }
};

// Tag mapping for more specific categorization
const TAG_PATTERNS = {
  // Emotional tags
  'happy': ['happy', 'joy', 'excited', 'pleased'],
  'sad': ['sad', 'crying', 'tears', 'upset'],
  'angry': ['angry', 'mad', 'furious', 'rage'],
  'anxious': ['anxious', 'worried', 'nervous', 'scared'],
  'frustrated': ['frustrated', 'annoyed', 'irritated'],
  'calm': ['calm', 'peaceful', 'relaxed', 'content'],

  // Behavioral tags
  'meltdown': ['meltdown', 'complete breakdown'],
  'tantrum': ['tantrum', 'fit', 'outburst'],
  'cooperation': ['cooperating', 'helpful', 'compliant'],
  'aggression': ['hitting', 'kicking', 'biting', 'aggressive'],

  // Medical tags
  'fever': ['fever', 'temperature', 'hot', '°F', '°C'],
  'pain': ['pain', 'hurt', 'ache', 'sore'],
  'medication_given': ['gave', 'administered', 'took medication'],

  // Developmental tags
  'new_skill': ['first time', 'learned', 'can now', 'new ability'],
  'milestone': ['milestone', 'breakthrough', 'achievement'],

  // Contextual tags
  'transition': ['transition', 'change', 'switching', 'leaving'],
  'duration_long': ['long time', 'extended', '20 minutes', '30 minutes', 'hour']
};

/**
 * Extract text content from an event for classification
 */
const extractTextForClassification = (event) => {
  const textParts = [];

  // Add type context
  if (event.type) {
    textParts.push(`Type: ${event.type}`);
  }

  // Add title/content
  if (event.title) textParts.push(event.title);
  if (event.content) textParts.push(event.content);
  if (event.notes) textParts.push(event.notes);
  if (event.description) textParts.push(event.description);

  // Add structured data based on event type
  if (event.originalData) {
    const data = event.originalData;

    switch (event.type) {
      case 'behavior':
        if (data.behaviorType) textParts.push(`Behavior type: ${data.behaviorType}`);
        if (data.triggers) textParts.push(`Triggers: ${data.triggers.join(', ')}`);
        if (data.intensity) textParts.push(`Intensity: ${data.intensity}`);
        break;

      case 'mood_log':
        if (data.mood) textParts.push(`Mood: ${data.mood}`);
        if (data.intensity) textParts.push(`Intensity: ${data.intensity}`);
        break;

      case 'sensory_log':
        if (data.sensoryType) textParts.push(`Sensory type: ${data.sensoryType}`);
        if (data.intensity) textParts.push(`Intensity: ${data.intensity}`);
        break;

      case 'medical_event':
        if (data.severity) textParts.push(`Severity: ${data.severity}`);
        if (data.symptoms) textParts.push(`Symptoms: ${data.symptoms.join(', ')}`);
        break;

      case 'daily_care':
        if (data.actionType) textParts.push(`Action: ${data.actionType}`);
        if (data.data) {
          const careData = data.data;
          if (careData.mood) textParts.push(`Mood: ${careData.mood}`);
          if (careData.rating) textParts.push(`Rating: ${careData.rating}`);
        }
        break;
    }
  }

  return textParts.join('. ').toLowerCase();
};

/**
 * Apply classification rules to extracted text
 */
const applyClassificationRules = (text, eventType) => {
  const results = {
    buckets: [],
    tags: [],
    confidence: 0.3 // Default low confidence
  };

  let maxConfidence = 0;
  const matchedRules = [];

  // Check each classification rule
  Object.entries(CLASSIFICATION_RULES).forEach(([ruleKey, rule]) => {
    let ruleMatches = 0;
    let ruleConfidence = 0;

    // Check keywords
    rule.keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        ruleMatches++;
        ruleConfidence += 0.1;
      }
    });

    // Check context patterns
    if (rule.contextPatterns) {
      rule.contextPatterns.forEach(pattern => {
        if (text.includes(pattern.toLowerCase())) {
          ruleMatches++;
          ruleConfidence += 0.15;
        }
      });
    }

    // If we have matches, add to results
    if (ruleMatches > 0) {
      const finalConfidence = Math.min(rule.confidence * (ruleMatches * 0.2), 1.0);
      matchedRules.push({
        rule: ruleKey,
        buckets: rule.buckets,
        tags: rule.tags || [],
        confidence: finalConfidence
      });

      if (finalConfidence > maxConfidence) {
        maxConfidence = finalConfidence;
      }
    }
  });

  // Aggregate buckets and tags from matched rules
  const bucketSet = new Set();
  const tagSet = new Set();

  matchedRules.forEach(match => {
    match.buckets.forEach(bucket => bucketSet.add(bucket));
    match.tags.forEach(tag => tagSet.add(tag));
  });

  // Add tags based on text patterns
  Object.entries(TAG_PATTERNS).forEach(([tag, patterns]) => {
    patterns.forEach(pattern => {
      if (text.includes(pattern.toLowerCase())) {
        tagSet.add(tag);
      }
    });
  });

  // Apply event type-specific defaults if no strong matches
  if (bucketSet.size === 0) {
    switch (eventType) {
      case 'behavior':
        bucketSet.add('behavioral_challenging');
        break;
      case 'mood_log':
        bucketSet.add('emotional_positive');
        break;
      case 'sensory_log':
        bucketSet.add('sensory_seeking');
        break;
      case 'medical_event':
        bucketSet.add('medical_incident');
        break;
      case 'sleep_log':
        bucketSet.add('sleep_related');
        break;
      case 'food_log':
        bucketSet.add('nutrition_feeding');
        break;
      case 'medication_log':
        bucketSet.add('medical_routine');
        break;
      case 'daily_care':
        bucketSet.add('daily_routine');
        break;
      default:
        bucketSet.add('daily_routine');
    }
    maxConfidence = Math.max(maxConfidence, 0.4); // Boost confidence for defaults
  }

  results.buckets = Array.from(bucketSet);
  results.tags = Array.from(tagSet);
  results.confidence = Math.round(maxConfidence * 100) / 100; // Round to 2 decimals

  return results;
};

/**
 * Classify a single event
 */
const classifyEventData = (event) => {
  try {
    // Extract text for classification
    const text = extractTextForClassification(event);

    // Apply classification rules
    const classification = applyClassificationRules(text, event.type);

    // Add classification metadata
    classification.processed = true;
    classification.processedAt = admin.firestore.FieldValue.serverTimestamp();

    return classification;
  } catch (error) {
    logger.error('Error classifying event:', error);

    // Return event with minimal classification on error
    return {
      buckets: ['daily_routine'],
      tags: [],
      confidence: 0.1,
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      error: error.message
    };
  }
};

// HTTP function to classify a single event by ID
exports.classifyEvent = onRequest(async (req, res) => {
  try {
    const eventId = req.query.id || req.body?.id;

    if (!eventId) {
      res.status(400).json({ error: 'Missing required parameter: id' });
      return;
    }

    logger.info('Classifying event', { eventId });

    const db = admin.firestore();
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      res.status(404).json({ error: `Event ${eventId} not found` });
      return;
    }

    const eventData = eventDoc.data();

    // Check if already processed and decide on re-processing
    if (eventData.classification?.processed) {
      logger.info('Event already processed, re-classifying', { eventId });
    }

    // Classify the event
    const classification = classifyEventData({
      id: eventId,
      ...eventData,
      originalData: eventData
    });

    // Update the document with classification
    await eventRef.update({ classification });

    logger.info('Event classified successfully', {
      eventId,
      buckets: classification.buckets,
      tags: classification.tags,
      confidence: classification.confidence
    });

    res.status(200).json({
      success: true,
      eventId,
      classification: {
        ...classification,
        processedAt: new Date().toISOString() // Return timestamp as string for JSON
      }
    });

  } catch (error) {
    logger.error('Error in classifyEvent function:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// HTTP function to classify all unprocessed events
exports.classifyUnprocessed = onRequest(async (req, res) => {
  try {
    logger.info('Starting batch classification of unprocessed events');

    const db = admin.firestore();

    // Query for events where classification.processed is false or doesn't exist
    const eventsQuery = db.collection('events')
      .where('classification.processed', '!=', true);

    const querySnapshot = await eventsQuery.get();

    if (querySnapshot.empty) {
      logger.info('No unprocessed events found');
      res.status(200).json({
        success: true,
        message: 'No unprocessed events found',
        processed: 0
      });
      return;
    }

    logger.info(`Found ${querySnapshot.size} unprocessed events`);

    let processed = 0;
    let errors = 0;
    const batch = db.batch();
    const results = [];

    // Process events in batches to avoid timeout
    for (const doc of querySnapshot.docs) {
      try {
        const eventData = doc.data();

        // Classify the event
        const classification = classifyEventData({
          id: doc.id,
          ...eventData,
          originalData: eventData
        });

        // Add to batch update
        batch.update(doc.ref, { classification });

        results.push({
          eventId: doc.id,
          classification: {
            ...classification,
            processedAt: new Date().toISOString()
          }
        });

        processed++;

        // Commit batch every 500 operations (Firestore limit)
        if (processed % 500 === 0) {
          await batch.commit();
          logger.info(`Batch committed: ${processed} events processed`);
        }

      } catch (error) {
        logger.error(`Error processing event ${doc.id}:`, error);
        errors++;
      }
    }

    // Commit remaining operations
    if (processed % 500 !== 0) {
      await batch.commit();
    }

    logger.info('Batch classification completed', { processed, errors });

    res.status(200).json({
      success: true,
      message: `Processed ${processed} events`,
      processed,
      errors,
      results: results.slice(0, 10) // Return first 10 results as sample
    });

  } catch (error) {
    logger.error('Error in classifyUnprocessed function:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

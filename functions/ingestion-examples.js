/**
 * Ingestion Examples and Tests
 *
 * This file demonstrates how SMS, WhatsApp, and Web entries are normalized
 * into the unified Event schema. Run with: node ingestion-examples.js
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin for testing
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "captureease-ef82f" // Replace with your project ID
  });
}

// Import the createEventAdmin function
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

    console.log('Event document created:', JSON.stringify(eventDoc, null, 2));

    // In a test environment, we'll just return the document instead of saving it
    return {
      id: 'test-event-' + Date.now(),
      document: eventDoc
    };

  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// ===== EXAMPLE 1: SMS INGESTION =====

async function testSMSIngestion() {
  console.log('\n=== SMS Ingestion Example ===');

  // Example Twilio SMS webhook payload
  const smsPayload = {
    MessageSid: 'SM1234567890abcdef1234567890abcdef',
    AccountSid: 'AC1234567890abcdef1234567890abcdef',
    MessagingServiceSid: null,
    From: '+15551234567',
    To: '+15557654321',
    Body: 'Emma had a meltdown at the grocery store. She was overwhelmed by the noise and started screaming. Took her outside and she calmed down after 10 minutes.',
    NumMedia: '0',
    NumSegments: '1',
    MediaContentType: '',
    MediaUrl: '',
    FromCity: 'ANYTOWN',
    FromState: 'NY',
    FromZip: '12345',
    FromCountry: 'US',
    ToCity: 'ANYTOWN',
    ToState: 'NY',
    ToZip: '12345',
    ToCountry: 'US',
    SmsSid: 'SM1234567890abcdef1234567890abcdef',
    SmsStatus: 'received',
    SmsMessageSid: 'SM1234567890abcdef1234567890abcdef',
    ApiVersion: '2010-04-01'
  };

  const smsEvent = await createEventAdmin({
    raw: smsPayload,
    text: smsPayload.Body,
    source: 'sms',
    childId: 'child-emma-123',
    createdBy: 'user-parent-456'
  });

  console.log('SMS Event Created:', smsEvent.id);
  console.log('Normalized text:', smsEvent.document.text);
  console.log('Raw payload preserved:', !!smsEvent.document.raw.MessageSid);
}

// ===== EXAMPLE 2: WHATSAPP INGESTION =====

async function testWhatsAppIngestion() {
  console.log('\n=== WhatsApp Ingestion Example ===');

  // Example WhatsApp Business API webhook payload
  const whatsappPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: '123456789012345',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15551234567',
            phone_number_id: '123456789012345'
          },
          contacts: [{
            profile: { name: 'Parent User' },
            wa_id: '15559876543'
          }],
          messages: [{
            from: '15559876543',
            id: 'wamid.HBgLMTU1NTk4NzY1NDMVAgARGBI5QTJDMUI4NjRDOTRDNzk2RTI=',
            timestamp: '1640995200',
            text: { body: 'Alex did great in therapy today! He used his communication device to ask for a break when he felt overwhelmed. Progress! 🎉' },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  };

  const message = whatsappPayload.entry[0].changes[0].value.messages[0];

  const whatsappEvent = await createEventAdmin({
    raw: whatsappPayload,
    text: message.text.body,
    source: 'whatsapp',
    childId: 'child-alex-789',
    createdBy: 'user-parent-456'
  });

  console.log('WhatsApp Event Created:', whatsappEvent.id);
  console.log('Normalized text:', whatsappEvent.document.text);
  console.log('Raw payload preserved:', !!whatsappEvent.document.raw.object);
}

// ===== EXAMPLE 3: WHATSAPP WITH MEDIA =====

async function testWhatsAppWithMedia() {
  console.log('\n=== WhatsApp with Media Example ===');

  const whatsappWithMediaPayload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: '123456789012345',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15551234567',
            phone_number_id: '123456789012345'
          },
          messages: [{
            from: '15559876543',
            id: 'wamid.HBgLMTU1NTk4NzY1NDMVAgARGBI5QTJDMUI4NjRDOTRDNzk2RTI=',
            timestamp: '1640995200',
            text: { body: 'Look at this beautiful art Emma made today!' },
            type: 'image',
            image: {
              id: 'media123456',
              link: 'https://example.com/media/image.jpg',
              mime_type: 'image/jpeg',
              sha256: 'abc123def456',
              file_size: 245760,
              filename: 'emma-artwork.jpg'
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  const message = whatsappWithMediaPayload.entry[0].changes[0].value.messages[0];

  const media = [{
    url: message.image.link,
    type: 'image',
    filename: message.image.filename,
    size: message.image.file_size,
    metadata: {
      id: message.image.id,
      mime_type: message.image.mime_type,
      sha256: message.image.sha256
    }
  }];

  const whatsappMediaEvent = await createEventAdmin({
    raw: whatsappWithMediaPayload,
    text: message.text.body,
    source: 'whatsapp',
    childId: 'child-emma-123',
    createdBy: 'user-parent-456',
    media
  });

  console.log('WhatsApp Media Event Created:', whatsappMediaEvent.id);
  console.log('Media attachments:', whatsappMediaEvent.document.media.length);
  console.log('Media details:', whatsappMediaEvent.document.media[0]);
}

// ===== EXAMPLE 4: WEB FORM SUBMISSION =====

async function testWebFormIngestion() {
  console.log('\n=== Web Form Ingestion Example ===');

  const formData = {
    incidentType: 'meltdown',
    childName: 'Emma',
    severity: '3',
    description: 'Emma had difficulty transitioning from playtime to dinner. She threw herself on the floor and cried for about 15 minutes.',
    remedy: 'Used visual timer and gave 5-minute warning. Offered choice of two dinner options.',
    location: 'Home - Living Room',
    timestamp: '2024-01-15T18:30:00Z',
    notes: 'She responded well to the visual timer once she calmed down. Consider using it more consistently.'
  };

  const metadata = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    ipAddress: '192.168.1.100',
    sessionId: 'sess_abc123def456'
  };

  const rawPayload = {
    formData,
    timestamp: new Date().toISOString(),
    source: 'web',
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    sessionId: metadata.sessionId
  };

  // Extract text from description field
  const text = formData.description;

  const webEvent = await createEventAdmin({
    raw: rawPayload,
    text: text,
    source: 'web',
    childId: 'child-emma-123',
    createdBy: 'user-parent-456'
  });

  console.log('Web Form Event Created:', webEvent.id);
  console.log('Extracted text:', webEvent.document.text);
  console.log('Original form data preserved in raw:', !!webEvent.document.raw.formData);
}

// ===== EXAMPLE 5: MANUAL ENTRY =====

async function testManualEntry() {
  console.log('\n=== Manual Entry Example ===');

  const manualData = {
    entryType: 'quick_note',
    note: 'Alex slept through the night! First time in weeks. Used the weighted blanket.',
    mood: 'happy',
    energy: 'high',
    tags: ['sleep', 'success'],
    timestamp: new Date().toISOString()
  };

  const rawPayload = {
    formData: manualData,
    source: 'manual',
    timestamp: new Date().toISOString(),
    entryMethod: 'mobile_app'
  };

  const manualEvent = await createEventAdmin({
    raw: rawPayload,
    text: manualData.note,
    source: 'manual',
    childId: 'child-alex-789',
    createdBy: 'user-parent-456'
  });

  console.log('Manual Entry Event Created:', manualEvent.id);
  console.log('Note text:', manualEvent.document.text);
  console.log('Entry method preserved:', manualEvent.document.raw.entryMethod);
}

// ===== EXAMPLE 6: DATA CONVERSION =====

async function testDataConversion() {
  console.log('\n=== Existing Data Conversion Example ===');

  // Example: Converting an existing incident record to Event format
  const existingIncident = {
    id: 'incident_abc123',
    childId: 'child-emma-123',
    type: 'meltdown',
    severity: 3,
    customIncidentName: 'Grocery Store Meltdown',
    remedy: 'Removed from environment, deep breathing',
    notes: 'Triggered by loud music in store',
    timestamp: new Date('2024-01-10T14:30:00Z'),
    createdBy: 'user-parent-456',
    followUpScheduled: true,
    mediaUrls: ['https://storage.com/incident_audio.mp3']
  };

  const conversionRaw = {
    originalCollection: 'incidents',
    originalData: existingIncident,
    convertedAt: new Date().toISOString(),
    source: 'conversion'
  };

  // Extract meaningful text
  let text = existingIncident.customIncidentName;
  if (existingIncident.notes) {
    text += ' - ' + existingIncident.notes;
  }
  if (existingIncident.remedy) {
    text += ' | Remedy: ' + existingIncident.remedy;
  }

  const convertedEvent = await createEventAdmin({
    raw: conversionRaw,
    text: text,
    source: 'manual', // Treat conversions as manual entries
    childId: existingIncident.childId,
    createdBy: existingIncident.createdBy
  });

  console.log('Converted Event Created:', convertedEvent.id);
  console.log('Extracted text:', convertedEvent.document.text);
  console.log('Original data preserved:', !!convertedEvent.document.raw.originalData);
}

// ===== RUN ALL EXAMPLES =====

async function runAllExamples() {
  console.log('🚀 Running Event Ingestion Examples');
  console.log('====================================');

  try {
    await testSMSIngestion();
    await testWhatsAppIngestion();
    await testWhatsAppWithMedia();
    await testWebFormIngestion();
    await testManualEntry();
    await testDataConversion();

    console.log('\n✅ All examples completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- SMS messages normalized to Event schema');
    console.log('- WhatsApp messages (with and without media) processed');
    console.log('- Web form submissions converted to Events');
    console.log('- Manual entries stored as Events');
    console.log('- Existing data conversion demonstrated');
    console.log('\n🎯 All entries follow the same Event contract defined in docs/contracts/events.md');

  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples()
    .then(() => {
      console.log('\n🏁 Exiting...');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  testSMSIngestion,
  testWhatsAppIngestion,
  testWhatsAppWithMedia,
  testWebFormIngestion,
  testManualEntry,
  testDataConversion
};
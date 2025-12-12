# Event Schema Contract

This document defines the unified Event schema that all ingestion handlers must implement to normalize SMS, WhatsApp, and Web/manual entries.

## Event Structure

```javascript
{
  // Required Fields
  id: string,              // Auto-generated unique identifier
  raw: object,             // Complete raw payload - preserve exactly as received
  text: string,            // Normalized text content
  source: string,          // "sms", "whatsapp", "web", "manual"
  childId: string,         // Target child identifier
  createdBy: string,       // User ID who created the entry
  createdAt: timestamp,    // Server timestamp when event was created

  // Optional Fields
  media: [                 // Array of media attachments
    {
      url: string,         // Storage URL
      type: string,        // "image", "video", "audio", "document"
      filename: string,    // Original filename
      size: number,        // File size in bytes
      metadata: object     // Additional media metadata
    }
  ],

  // Metadata Fields
  status: string,          // "active", "deleted" (soft delete system)
  updatedAt: timestamp,    // Last update timestamp
  updatedBy: string,       // User ID who last updated

  // Classification Fields (populated by classifier - DO NOT SET IN INGESTION)
  classification: {
    type: string,          // e.g., "mood", "incident", "note", "medication"
    confidence: number,    // 0.0 - 1.0
    tags: [string],        // Auto-generated tags
    processed: boolean,    // Whether classifier has processed this event
    processedAt: timestamp // When classification occurred
  }
}
```

## Raw Payload Preservation

The `raw` field must contain the complete, unmodified payload from the source:

### SMS Raw Format
```javascript
{
  from: "+1234567890",
  to: "+0987654321",
  body: "Original message text",
  timestamp: "2024-01-01T12:00:00Z",
  messageId: "SMS123456",
  provider: "twilio" | "aws_sns" | "other"
}
```

### WhatsApp Raw Format
```javascript
{
  from: "+1234567890",
  to: "business_number",
  body: "Message content",
  timestamp: "2024-01-01T12:00:00Z",
  messageId: "WA123456",
  messageType: "text" | "image" | "document",
  media: { /* media objects if present */ },
  provider: "whatsapp_business" | "twilio_whatsapp"
}
```

### Web/Manual Raw Format
```javascript
{
  formData: { /* complete form submission */ },
  userAgent: "Mozilla/5.0...",
  ipAddress: "192.168.1.1",  // if available
  timestamp: "2024-01-01T12:00:00Z",
  source: "web_form" | "manual_entry",
  sessionId: "session123"    // if available
}
```

## Text Normalization Rules

1. **Strip formatting**: Remove HTML tags, markdown, etc.
2. **Preserve intent**: Keep original meaning intact
3. **Handle encoding**: Ensure proper UTF-8 encoding
4. **Truncate safely**: If needed, truncate at word boundaries
5. **Empty handling**: Use empty string if no text content

## Source Values

- `"sms"` - Text messages via SMS providers
- `"whatsapp"` - WhatsApp Business API messages
- `"web"` - Web form submissions
- `"manual"` - Manual entries through the app UI

## Media Handling

1. **Upload to storage** before creating Event
2. **Generate secure URLs** for media access
3. **Store metadata** including original filename and size
4. **Preserve media order** as received
5. **Validate file types** according to app security policies

## Validation Requirements

All Events must pass these validations:

```javascript
const eventSchema = {
  id: { required: true, type: 'string' },
  raw: { required: true, type: 'object' },
  text: { required: true, type: 'string' },
  source: { required: true, enum: ['sms', 'whatsapp', 'web', 'manual'] },
  childId: { required: true, type: 'string' },
  createdBy: { required: true, type: 'string' },
  createdAt: { required: true, type: 'timestamp' },
  status: { required: true, enum: ['active', 'deleted'], default: 'active' }
};
```

## Firestore Collection

Events are stored in the `events` collection with:
- Document ID: Auto-generated
- Indexes on: `childId`, `source`, `createdAt`, `status`, `createdBy`
- Security rules: Users can only access events for children they have permission to view

## Error Handling

If any required field cannot be determined:
1. Log the error with full context
2. Store as much data as possible in the `raw` field
3. Use fallback values where appropriate:
   - `text`: Empty string if no content
   - `source`: Best guess based on ingestion method
   - `childId`: Must be provided or derivable, otherwise reject
   - `createdBy`: Use system user ID if user context unavailable

## Notes

- **DO NOT** populate `classification` fields during ingestion
- Classification is handled by a separate agent/service
- The `raw` field is the source of truth for debugging and reprocessing
- All timestamps should use Firestore `serverTimestamp()`
# Agent A (Ingestion) - Implementation Notes

## Overview

This document outlines the implementation of the unified Event ingestion system for CaptureEase, normalizing SMS, WhatsApp, and Web/manual entries into a single schema.

## Implementation Summary

### ✅ Completed Deliverables

1. **Event Schema Contract** (`docs/contracts/events.md`)
   - Unified Event structure with required fields: `raw`, `text`, `source`, `childId`, `createdBy`
   - Schema supports all entry types with proper validation
   - Classification fields reserved for future classifier agent

2. **Event Service** (`src/services/eventService.js`)
   - Client-side service with ingestion handlers for all three types
   - Functions: `createEvent()`, `ingestSMS()`, `ingestWhatsApp()`, `ingestWebEntry()`
   - Includes utility for converting existing data to Events

3. **Firebase Functions Handlers** (`functions/index.js`)
   - SMS webhook (`smsWebhook`) for Twilio/provider integration
   - WhatsApp webhook (`whatsappWebhook`) for Business API
   - Web entry handler (`createWebEvent`) as callable function
   - Server-side admin privileges for webhook authentication

4. **Tests & Examples**
   - Comprehensive examples in `functions/ingestion-examples.js`
   - Updated test file `functions/test.js` with webhook simulations
   - Examples cover all entry types including media handling

## Key Assumptions Made

### Data Flow Architecture
- **Events Collection**: New top-level Firestore collection `events` stores all normalized entries
- **Preservation Strategy**: Complete raw payloads preserved in `raw` field for debugging/reprocessing
- **Classification Separation**: Ingestion ONLY creates events; separate agent handles classification

### SMS Integration
- **Provider Agnostic**: Designed to work with Twilio, AWS SNS, or other SMS providers
- **Phone Mapping**: Currently uses demo IDs; production requires phone→user/child mapping table
- **Media Handling**: Basic SMS assumed text-only; MMS media would need separate processing

### WhatsApp Integration
- **Business API**: Designed for WhatsApp Business API webhook format
- **Media Processing**: Media URLs stored in Event but actual file download/storage needs implementation
- **Message Types**: Handles text, image, document, audio, video message types

### Web/Manual Entry Integration
- **Form Flexibility**: Text extraction handles various form field names (`notes`, `description`, `content`, etc.)
- **Authentication**: Web entries require authenticated user context
- **Media Upload**: Assumes media is pre-uploaded; URLs passed to Event creation

### Security & Permissions
- **Firestore Rules**: Assumes existing security rules control access by `childId` and user permissions
- **Webhook Security**: Production webhooks need signature validation (Twilio, WhatsApp verification)
- **User Context**: SMS/WhatsApp webhooks bypass auth; mapping system needed for user association

## Technical Decisions

### Storage Strategy
- **Single Collection**: All Events in one `events` collection for unified queries
- **Indexed Fields**: `childId`, `source`, `createdAt`, `status`, `createdBy` for efficient filtering
- **Soft Deletes**: `status: 'active'|'deleted'` prevents data loss

### Text Normalization
- **Preserve Intent**: Minimal text processing to maintain original meaning
- **UTF-8 Safe**: Proper encoding handling for international characters
- **Fallback Summaries**: Auto-generate text from form data when no primary text field

### Media Handling
- **Metadata Rich**: Store filename, size, type, and provider-specific metadata
- **URL Based**: Assumes media URLs are accessible and properly secured
- **Array Structure**: Supports multiple media attachments per Event

## Production Readiness TODOs

### 1. Phone Number Mapping System
```javascript
// Implement phone_mappings collection
{
  phone: '+15551234567',
  userId: 'user123',
  childIds: ['child1', 'child2'],
  verified: true,
  createdAt: timestamp
}
```

### 2. Webhook Security
- Add Twilio signature verification
- Add WhatsApp webhook token validation
- Implement rate limiting and request validation

### 3. Media Processing Pipeline
- Download and store media files securely
- Generate thumbnails for images
- Virus scanning for uploaded files
- CDN distribution for media access

### 4. Error Handling & Monitoring
- Dead letter queues for failed ingestion
- Metrics tracking (events/minute, error rates)
- Alert system for ingestion failures

### 5. Testing Infrastructure
- Unit tests for all ingestion handlers
- Integration tests with real webhook payloads
- Load testing for high-volume ingestion

## Integration with Existing System

### Backwards Compatibility
- Existing `incidents`, `dailyCare`, `moodService` continue to work
- Optional: Migrate existing data using `convertToEvent()` utility
- Timeline and dashboard can read from both old and new collections during transition

### Classifier Integration
- Events created with `classification.processed = false`
- Classifier agent watches Events collection for unprocessed entries
- Classification updates populate type, confidence, tags, processedAt fields

### UI Integration Examples

#### React Hook for Events
```javascript
// Example: useEvents hook for reading Events
const useEvents = (childId, source = null) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let q = query(
      collection(db, 'events'),
      where('childId', '==', childId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    if (source) {
      q = query(q, where('source', '==', source));
    }

    // Real-time subscription
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventData);
    });

    return unsubscribe;
  }, [childId, source]);

  return events;
};
```

#### Web Form Integration
```javascript
// Example: Submit incident form as Event
const handleIncidentSubmit = async (formData) => {
  const createWebEvent = httpsCallable(functions, 'createWebEvent');

  try {
    const result = await createWebEvent({
      formData,
      childId: selectedChild.id,
      source: 'web',
      uploadedMedia: uploadedFiles // Pre-uploaded media URLs
    });

    console.log('Event created:', result.data.eventId);
  } catch (error) {
    console.error('Failed to create event:', error);
  }
};
```

## Performance Considerations

### Expected Volume
- **SMS/WhatsApp**: ~10-50 messages/day per family
- **Web Entries**: ~5-20 entries/day per family
- **Total**: ~1000 Events/day across all families (estimated)

### Scaling Strategy
- Events collection can handle millions of documents
- Consider partitioning by date if volume exceeds expectations
- Use composite indexes for common query patterns

### Cost Optimization
- Firestore reads optimized by proper indexing
- Functions cold starts minimized by keeping simple handlers
- Media storage in Cloud Storage with appropriate lifecycle rules

## Future Enhancements

### Voice Messages
- Add support for voice message transcription
- Store both audio file and transcribed text in Event

### Email Integration
- Email webhook for email-to-log functionality
- Parse email content and attachments into Events

### Batch Processing
- Bulk import functionality for migrating data from other systems
- CSV/Excel import with Event validation

### Analytics Integration
- Export Events to BigQuery for advanced analytics
- Real-time dashboards showing ingestion metrics

---

**Deliverable Status**: ✅ Complete
**Ready for Testing**: Yes
**Production Dependencies**: Phone mapping system, webhook security
**Next Agent**: Classification system can now process Events from the `events` collection
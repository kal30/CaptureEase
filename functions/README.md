# Firebase Cloud Functions - CaptureEase

This document describes the Cloud Functions for the CaptureEase application, including event classification, SMS/WhatsApp messaging, and more.

## Table of Contents

1. [Messaging Functions](#messaging-functions)
   - [sendMessage](#sendmessage) - Send WhatsApp/SMS messages
   - [sendMessageHttp](#sendmessagehttp) - HTTP endpoint for sending messages
   - [smsWebhook](#smswebhook) - Receive incoming SMS/WhatsApp
2. [Classification Functions](#classification-functions)
   - [classifyEvent](#classifyevent) - Classify a single event
   - [classifyUnprocessed](#classifyunprocessed) - Batch classify events
3. [LLM Functions](#llm-functions)
   - [askQuestion](#askquestion) - Ask a question about logs
4. [Settings & Phone Linking](#settings--phone-linking)
5. [Deployment](#deployment)
6. [Testing](#testing)

---

## Messaging Functions

### sendMessage

Send WhatsApp or SMS messages to users.

**Type:** Callable Cloud Function

**Authentication:** Required

**Parameters:**
- `to` (required): Phone number in E.164 format (e.g., "+1234567890")
- `message` (required): Text message to send
- `type` (optional): "whatsapp" (default) or "sms"

**Response:**
```json
{
  "success": true,
  "messageSid": "SM...",
  "status": "queued",
  "message": "Message sent successfully"
}
```

**Usage in React:**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendMessage = httpsCallable(functions, 'sendMessage');

const result = await sendMessage({
  to: "+14155551234",
  message: "Hello from CaptureEz!",
  type: "whatsapp"
});
```

**Setup Required:**
```bash
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_WHATSAPP_FROM
firebase functions:secrets:set TWILIO_SMS_FROM
```

**Documentation:** See [docs/whatsapp-setup.md](../docs/whatsapp-setup.md)

---

### sendMessageHttp

HTTP endpoint for sending messages (useful for testing or external integrations).

**Endpoint:** `POST /sendMessageHttp`

**Parameters:** Same as `sendMessage`

**Example curl:**
```bash
curl -X POST \
  https://us-central1-captureease-ef82f.cloudfunctions.net/sendMessageHttp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+14155551234",
    "message": "Hello from CaptureEz!",
    "type": "whatsapp"
  }'
```

---

### smsWebhook

Webhook to receive incoming SMS and WhatsApp messages from Twilio.

**Endpoint:** `POST /smsWebhook`

**Configured in:** Twilio Console → Messaging → Settings → Webhook URL

**Features:**
- Child prefix requirement (e.g., "Arjun: had lunch")
- Multi-child support with semicolons
- Fuzzy name matching with confirmation
- Phone number authorization
- Media attachment support

**Example incoming message:**
```
Arjun: had a great day at school; Maya: took a nap
```

---

## Classification Functions

### classifyEvent

Classifies a single event by its ID.

**Endpoint:** `POST/GET /classifyEvent`

**Parameters:**
- `id` (required): The event ID to classify

**Response:**
- Sets `classification.buckets`: Array of classification buckets
- Sets `classification.tags`: Array of specific tags
- Sets `classification.confidence`: Confidence score (0-1)
- Sets `classification.processed`: true
- Sets `classification.processedAt`: Server timestamp

**Behavior:**
- Idempotent: Re-running overwrites existing classification cleanly
- Loads event from `/events/{id}` collection
- Applies rule-based classification logic
- Updates document with classification results

**Example curl commands:**

```bash
# Classify event via GET
curl -X GET "https://us-central1-your-project.cloudfunctions.net/classifyEvent?id=event123"

# Classify event via POST
curl -X POST "https://us-central1-your-project.cloudfunctions.net/classifyEvent" \
  -H "Content-Type: application/json" \
  -d '{"id": "event123"}'
```

**Example Response:**
```json
{
  "success": true,
  "eventId": "event123",
  "classification": {
    "buckets": ["emotional_positive", "social_interaction"],
    "tags": ["happy", "cooperation"],
    "confidence": 0.85,
    "processed": true,
    "processedAt": "2023-12-01T10:30:00.000Z"
  }
}
```

### 2. classifyUnprocessed

Scans and classifies all events where `classification.processed == false` or doesn't exist.

**Endpoint:** `POST/GET /classifyUnprocessed`

**Parameters:** None

**Response:**
- Processes all unprocessed events in batches
- Sets the same classification fields as `classifyEvent`
- Returns processing summary

**Behavior:**
- Queries `/events` collection for unprocessed events
- Processes events in batches of 500 (Firestore limit)
- Updates each event with classification results
- Provides processing statistics

**Example curl commands:**

```bash
# Classify all unprocessed events
curl -X POST "https://us-central1-your-project.cloudfunctions.net/classifyUnprocessed"

# Or via GET
curl -X GET "https://us-central1-your-project.cloudfunctions.net/classifyUnprocessed"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Processed 150 events",
  "processed": 150,
  "errors": 0,
  "results": [
    {
      "eventId": "event1",
      "classification": {
        "buckets": ["daily_routine"],
        "tags": ["meal"],
        "confidence": 0.6,
        "processed": true,
        "processedAt": "2023-12-01T10:30:00.000Z"
      }
    }
  ]
}
```

## Classification Logic

The classification system uses rule-based pattern matching:

### Buckets
- `emotional_positive`: Happy, excited, calm emotions
- `emotional_negative`: Sad, angry, frustrated emotions
- `behavioral_challenging`: Tantrums, meltdowns, aggressive behavior
- `behavioral_positive`: Cooperation, helping, good behavior
- `sensory_seeking`: Seeking sensory input
- `sensory_avoiding`: Avoiding sensory overload
- `daily_routine`: Daily care activities
- `sleep_related`: Sleep and rest activities
- `nutrition_feeding`: Eating and feeding
- `medical_routine`: Regular medical care
- `medical_incident`: Medical emergencies or symptoms
- `developmental_milestone`: New skills and progress
- `communication`: Language and communication
- `social_interaction`: Playing and social activities
- `environmental_change`: Transitions and changes

### Tags
More specific classifications like `happy`, `sad`, `meltdown`, `fever`, `new_skill`, etc.

### Confidence Scores
- 0.8-1.0: High confidence
- 0.5-0.79: Medium confidence
- 0.0-0.49: Low confidence

## LLM Functions

### askQuestion

Ask a question about a child’s logs using an LLM.

**Type:** Callable Cloud Function

**Authentication:** Required

**Parameters:**
- `childId` (required): Child document ID
- `question` (required): User question
- `startDate` (optional): ISO string
- `endDate` (optional): ISO string
- `limit` (optional): Max logs to include

**Setup Required:**
```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

## Deployment

```bash
cd functions
npm run deploy
```

## Testing

```bash
cd functions
npm run serve  # Start emulator
```

Run the lightweight parsing tests:

```bash
node tests/ingestion-utils.test.js
```

## Environment

- **Platform**: Firebase Cloud Functions (Node.js 20)
- **Runtime**: firebase-functions v6.4.0
- **Database**: Firestore
- **Authentication**: Firebase Admin SDK

## Error Handling

Both functions include comprehensive error handling:
- Missing parameters return 400 status
- Not found events return 404 status
- Processing errors are logged and return 500 status
- Failed individual events in batch processing are counted but don't stop the overall process

## Logs

Functions use Firebase Logger for structured logging:
- Info level for normal operations
- Error level for exceptions
- Include contextual data (eventId, processing counts, etc.)

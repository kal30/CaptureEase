# Firebase Cloud Functions - Event Classification

This document describes the HTTP Cloud Functions for event classification in the CaptureEase application.

## Functions

### 1. classifyEvent

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
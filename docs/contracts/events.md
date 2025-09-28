# Events Input Contract

## Overview
This contract defines the structure of Event documents that the Classification Service reads from various Firestore collections. Events represent activities and logs recorded by caregivers for children in the CaptureEase system.

## Event Structure

### Core Fields (Common to all event types)
```javascript
{
  id: string,                    // Document ID
  timestamp: Timestamp | Date,   // When the event occurred
  childId: string,              // Child this event belongs to
  author: string,               // User ID who created the event
  createdBy: string,            // Alternative author field
  userId: string,               // Alternative author field
  type: string,                 // Event type (see Event Types below)

  // Content fields (varies by type)
  title?: string,               // Event title/summary
  content?: string,             // Main content/description
  note?: string,                // Alternative content field
  notes?: string,               // Alternative content field
  description?: string,         // Alternative content field
  text?: string,                // Alternative content field

  // Additional metadata
  tags?: string[],              // User-defined tags
  originalData?: object         // Full original document data
}
```

## Event Types and Collections

### Daily Habit Events
These represent recurring daily activities and logs:

#### `sensory_log` (Collection: `children/{childId}/sensoryLogs`)
```javascript
{
  sensoryType: string,          // Type of sensory input
  description: string,          // Details about the sensory experience
  intensity?: number,           // Sensory intensity level
  duration?: number             // How long it lasted
}
```

#### `behavior` (Collection: `children/{childId}/behaviors`)
```javascript
{
  behaviorType: string,         // Type of behavior observed
  description: string,          // Detailed description
  triggers?: string[],          // What triggered the behavior
  interventions?: string[],     // What was done to help
  intensity?: number,           // Behavior intensity (1-5)
  duration?: number             // Duration in minutes
}
```

#### `mood_log` (Collection: `children/{childId}/moodLogs`)
```javascript
{
  mood: string,                 // Primary mood (happy, sad, anxious, etc.)
  intensity?: number,           // Mood intensity (1-5)
  notes: string,                // Additional context
  triggers?: string[]           // Mood triggers if identified
}
```

#### `sleep_log` (Collection: `children/{childId}/sleepLogs`)
```javascript
{
  sleepType: string,            // "nap" | "bedtime" | "wakeup"
  quality?: number,             // Sleep quality (1-5)
  duration?: number,            // Duration in hours
  notes?: string,               // Sleep notes
  bedtime?: Timestamp,          // Time went to bed
  wakeTime?: Timestamp          // Time woke up
}
```

#### `food_log` (Collection: `children/{childId}/foodLogs`)
```javascript
{
  foodType: string,             // Type of food/meal
  mealType?: string,            // "breakfast" | "lunch" | "dinner" | "snack"
  amount?: string,              // Amount consumed
  reaction?: string,            // Any reactions observed
  notes?: string                // Additional food notes
}
```

#### `medication_log` (Collection: `children/{childId}/medicationLogs`)
```javascript
{
  medication: string,           // Medication name
  dosage?: string,              // Dosage given
  time: Timestamp,              // When administered
  notes?: string,               // Additional notes
  administered: boolean         // Whether medication was given
}
```

#### `daily_care` (Collection: `dailyCare` with `childId` filter)
```javascript
{
  actionType: string,           // "mood" | "sleep" | "food" | "safety" | etc.
  data: {
    value?: string,             // Primary value
    mood?: string,              // For mood actions
    rating?: number,            // Numeric rating (1-5)
    notes?: string              // Additional notes
  }
}
```

### Incident Events
These represent significant events or medical situations:

#### `medical_event` (Collection: `children/{childId}/medicalEvents`)
```javascript
{
  eventType: string,            // Type of medical event
  severity?: string,            // "low" | "medium" | "high"
  symptoms?: string[],          // List of symptoms
  treatment?: string,           // Treatment provided
  followUp?: string,            // Follow-up actions needed
  resolved?: boolean            // Whether issue is resolved
}
```

### Timeline Events
Generic timeline entries:

#### `child_timeline` (Collection: `children/{childId}/timeline`)
```javascript
{
  actionType: string,           // Type of timeline entry
  title?: string,               // Entry title
  notes?: string,               // Entry content
  category?: string             // Optional categorization
}
```

## Raw vs Text Content
- **Raw**: The original document data structure as stored in Firestore
- **Text**: Extracted and normalized text content from the document for classification

Example:
```javascript
// Raw
{
  id: "abc123",
  behaviorType: "meltdown",
  description: "Had difficulty transitioning from play to dinner time",
  triggers: ["transition", "hunger"],
  intensity: 4,
  timestamp: "2024-01-15T18:30:00Z"
}

// Text (extracted for classification)
"Behavior: meltdown. Had difficulty transitioning from play to dinner time. Triggers: transition, hunger. Intensity: 4"
```
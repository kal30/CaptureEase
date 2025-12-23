# Classifier Output Contract

## Overview
This contract defines the structure of classified Event documents that the Classification Service outputs. The classifier adds categorization metadata to help with analysis, insights, and automated processing.

## Classification Output Structure

### Enhanced Event with Classification
```javascript
{
  // Original event fields (unchanged)
  id: string,
  timestamp: Timestamp | Date,
  childId: string,
  author: string,
  type: string,
  title: string,
  content: string,
  originalData: object,

  // Classification results (added by classifier)
  classification: {
    buckets: string[],          // Primary classification categories
    tags: string[],             // Specific descriptive tags
    confidence: number,         // Classification confidence (0.0 - 1.0)
    classifiedAt: Timestamp,    // When classification was performed
    classifierVersion: string   // Version of classification rules used
  }
}
```

## Classification Categories

### Buckets
Primary high-level categories that events fall into:

#### Emotional & Behavioral
- `emotional_positive` - Happy, calm, excited, joyful events
- `emotional_negative` - Sad, angry, frustrated, anxious events
- `behavioral_challenging` - Difficult behaviors, meltdowns, aggression
- `behavioral_positive` - Good behaviors, achievements, cooperation
- `sensory_seeking` - Seeking sensory input or stimulation
- `sensory_avoiding` - Avoiding or overwhelmed by sensory input

#### Daily Living & Care
- `daily_routine` - Regular daily activities (meals, hygiene, etc.)
- `sleep_related` - All sleep, nap, and rest activities
- `nutrition_feeding` - Food, eating, drinking activities
- `medical_routine` - Medication, treatments, routine medical care
- `medical_incident` - Urgent medical events, symptoms, emergencies

#### Development & Learning
- `developmental_milestone` - New skills, achievements, progress
- `learning_activity` - Educational activities, therapy sessions
- `communication` - Speech, language, social communication events
- `motor_skills` - Physical activities, gross/fine motor development

#### Social & Environmental
- `social_interaction` - Playing with others, family time, social events
- `environmental_change` - New places, schedule changes, transitions
- `therapeutic` - Formal therapy sessions, interventions

### Tags
More specific descriptors that provide detailed context:

#### Emotional Tags
- `happy`, `sad`, `angry`, `anxious`, `excited`, `calm`, `frustrated`, `overwhelmed`

#### Behavioral Tags
- `meltdown`, `tantrum`, `self_regulation`, `cooperation`, `defiance`, `aggression`, `self_harm`

#### Sensory Tags
- `auditory_sensitivity`, `visual_overstimulation`, `tactile_seeking`, `proprioceptive_input`

#### Medical Tags
- `medication_compliance`, `side_effects`, `symptoms`, `pain`, `illness`, `injury`

#### Developmental Tags
- `new_skill`, `regression`, `milestone`, `progress`, `communication_breakthrough`

#### Contextual Tags
- `transition`, `schedule_change`, `new_environment`, `family_stress`, `school_related`

## Confidence Levels

The confidence score (0.0 - 1.0) indicates how certain the classifier is about its categorization:

- `0.9 - 1.0` - High confidence: Clear pattern matches, explicit keywords
- `0.7 - 0.89` - Good confidence: Strong indicators present
- `0.5 - 0.69` - Medium confidence: Some indicators, may need review
- `0.3 - 0.49` - Low confidence: Ambiguous content, multiple possibilities
- `0.0 - 0.29` - Very low confidence: Unclear content, default categorization

## Classification Rules Priority

1. **Explicit Keywords** - Direct mentions of emotions, behaviors, medical terms
2. **Context Clues** - Surrounding circumstances, timing, environmental factors
3. **Intensity Indicators** - Severity words, duration, impact descriptions
4. **Historical Patterns** - Similar events for the same child
5. **Default Fallbacks** - When content is ambiguous or minimal

## Example Classifications

### Example 1: Behavioral Event
```javascript
{
  id: "behavior_001",
  type: "behavior",
  title: "Behavior: meltdown",
  content: "Had major meltdown during transition from playground to car. Screaming and hitting for 20 minutes.",

  classification: {
    buckets: ["behavioral_challenging", "emotional_negative"],
    tags: ["meltdown", "transition", "overwhelmed", "duration_long"],
    confidence: 0.95,
    classifiedAt: "2024-01-15T19:00:00Z",
    classifierVersion: "1.0.0"
  }
}
```

### Example 2: Positive Development
```javascript
{
  id: "timeline_001",
  type: "child_timeline",
  title: "Said first two-word phrase",
  content: "Clearly said 'more cookie' during snack time, first time combining words!",

  classification: {
    buckets: ["developmental_milestone", "communication", "emotional_positive"],
    tags: ["new_skill", "speech_development", "two_word_phrase", "milestone"],
    confidence: 0.92,
    classifiedAt: "2024-01-15T19:00:00Z",
    classifierVersion: "1.0.0"
  }
}
```

### Example 3: Medical Event
```javascript
{
  id: "medical_001",
  type: "medical_event",
  title: "Fever and lethargy",
  content: "Temperature 101.3°F, very tired, not eating well. Gave Tylenol.",

  classification: {
    buckets: ["medical_incident", "nutrition_feeding"],
    tags: ["fever", "illness", "medication_given", "appetite_loss"],
    confidence: 0.88,
    classifiedAt: "2024-01-15T19:00:00Z",
    classifierVersion: "1.0.0"
  }
}
```

## Classification Storage

Classified events should be updated in their original Firestore collections with the additional `classification` field. The classifier service should:

1. Read events from their source collections
2. Apply classification rules
3. Update the same documents with classification metadata
4. Maintain audit trail of when classification was performed
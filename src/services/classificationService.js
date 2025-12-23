import { collection, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

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
 * @param {Object} event - The event object
 * @returns {string} - Normalized text for classification
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
 * @param {string} text - Text content to classify
 * @param {string} eventType - Type of the event
 * @returns {Object} - Classification results
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
 * @param {Object} event - Event object to classify
 * @returns {Object} - Event with classification added
 */
export const classifyEvent = (event) => {
  try {
    // Extract text for classification
    const text = extractTextForClassification(event);

    // Apply classification rules
    const classification = applyClassificationRules(text, event.type);

    // Add classification metadata
    classification.classifiedAt = new Date();
    classification.classifierVersion = '1.0.0';

    return {
      ...event,
      classification
    };
  } catch (error) {
    console.error('Error classifying event:', error);

    // Return event with minimal classification on error
    return {
      ...event,
      classification: {
        buckets: ['daily_routine'],
        tags: [],
        confidence: 0.1,
        classifiedAt: new Date(),
        classifierVersion: '1.0.0',
        error: error.message
      }
    };
  }
};

/**
 * Update an event document in Firestore with classification
 * @param {string} collection - Collection path
 * @param {string} docId - Document ID
 * @param {Object} classification - Classification data
 */
export const updateEventWithClassification = async (collectionPath, docId, classification) => {
  try {
    const docRef = doc(db, collectionPath, docId);
    await updateDoc(docRef, {
      classification: classification
    });

    console.log(`Successfully updated classification for ${collectionPath}/${docId}`);
    return true;
  } catch (error) {
    console.error(`Error updating classification for ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

/**
 * Process events from a specific collection
 * @param {string} collectionPath - Path to the collection
 * @param {string} childId - Child ID to filter by (optional)
 * @returns {Array} - Processed events with classifications
 */
export const processEventsFromCollection = async (collectionPath, childId = null) => {
  try {
    let q;

    if (childId) {
      // For collections that filter by childId
      q = query(collection(db, collectionPath), where('childId', '==', childId));
    } else {
      // For subcollections or collections without childId filter
      q = collection(db, collectionPath);
    }

    const querySnapshot = await getDocs(q);
    const processedEvents = [];

    for (const docSnap of querySnapshot.docs) {
      const eventData = {
        id: docSnap.id,
        ...docSnap.data(),
        originalData: docSnap.data()
      };

      // Skip if already classified (unless we want to reclassify)
      if (eventData.classification) {
        console.log(`Skipping already classified event: ${docSnap.id}`);
        processedEvents.push(eventData);
        continue;
      }

      // Classify the event
      const classifiedEvent = classifyEvent(eventData);

      // Update in Firestore
      await updateEventWithClassification(
        collectionPath,
        docSnap.id,
        classifiedEvent.classification
      );

      processedEvents.push(classifiedEvent);
    }

    return processedEvents;
  } catch (error) {
    console.error(`Error processing events from ${collectionPath}:`, error);
    throw error;
  }
};

/**
 * Process all events for a specific child
 * @param {string} childId - Child ID
 * @returns {Object} - Summary of processed events
 */
export const processAllEventsForChild = async (childId) => {
  const summary = {
    childId,
    totalProcessed: 0,
    byCollection: {},
    errors: []
  };

  // Collection mappings from timelineService
  const collections = [
    { path: `children/${childId}/behaviors`, name: 'behaviors' },
    { path: `children/${childId}/moodLogs`, name: 'moodLogs' },
    { path: `children/${childId}/sensoryLogs`, name: 'sensoryLogs' },
    { path: `children/${childId}/sleepLogs`, name: 'sleepLogs' },
    { path: `children/${childId}/foodLogs`, name: 'foodLogs' },
    { path: `children/${childId}/medicationLogs`, name: 'medicationLogs' },
    { path: `children/${childId}/medicalEvents`, name: 'medicalEvents' },
    { path: `children/${childId}/timeline`, name: 'timeline' },
    { path: 'dailyCare', name: 'dailyCare', useChildFilter: true }
  ];

  for (const collectionInfo of collections) {
    try {
      console.log(`Processing ${collectionInfo.name} for child ${childId}...`);

      const events = await processEventsFromCollection(
        collectionInfo.path,
        collectionInfo.useChildFilter ? childId : null
      );

      summary.byCollection[collectionInfo.name] = events.length;
      summary.totalProcessed += events.length;

      console.log(`Processed ${events.length} events from ${collectionInfo.name}`);
    } catch (error) {
      console.error(`Error processing ${collectionInfo.name}:`, error);
      summary.errors.push({
        collection: collectionInfo.name,
        error: error.message
      });
    }
  }

  return summary;
};

/**
 * Get classification statistics for a child
 * @param {string} childId - Child ID
 * @returns {Object} - Classification statistics
 */
export const getClassificationStats = (events) => {
  const stats = {
    totalEvents: events.length,
    classified: 0,
    unclassified: 0,
    buckets: {},
    tags: {},
    confidenceLevels: {
      high: 0,    // 0.8+
      medium: 0,  // 0.5-0.79
      low: 0      // <0.5
    }
  };

  events.forEach(event => {
    if (event.classification) {
      stats.classified++;

      // Count buckets
      event.classification.buckets?.forEach(bucket => {
        stats.buckets[bucket] = (stats.buckets[bucket] || 0) + 1;
      });

      // Count tags
      event.classification.tags?.forEach(tag => {
        stats.tags[tag] = (stats.tags[tag] || 0) + 1;
      });

      // Count confidence levels
      const confidence = event.classification.confidence || 0;
      if (confidence >= 0.8) {
        stats.confidenceLevels.high++;
      } else if (confidence >= 0.5) {
        stats.confidenceLevels.medium++;
      } else {
        stats.confidenceLevels.low++;
      }
    } else {
      stats.unclassified++;
    }
  });

  return stats;
};
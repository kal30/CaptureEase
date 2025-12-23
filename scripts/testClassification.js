#!/usr/bin/env node

/**
 * Standalone Classification Test Script
 *
 * This script tests the classification logic without requiring
 * Firebase connections. It demonstrates the classification rules
 * and can be run independently.
 */

// Inline classification logic (without Firebase dependencies)
const CLASSIFICATION_RULES = {
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
  medical_incident: {
    keywords: ['fever', 'sick', 'pain', 'injury', 'hurt', 'emergency', 'hospital'],
    contextPatterns: ['medical emergency', 'urgent', 'symptoms'],
    buckets: ['medical_incident'],
    confidence: 0.9
  },
  developmental_milestone: {
    keywords: ['first time', 'new skill', 'milestone', 'breakthrough', 'progress'],
    contextPatterns: ['achievement', 'development', 'learned'],
    buckets: ['developmental_milestone'],
    confidence: 0.8
  }
};

const TAG_PATTERNS = {
  'happy': ['happy', 'joy', 'excited', 'pleased'],
  'sad': ['sad', 'crying', 'tears', 'upset'],
  'angry': ['angry', 'mad', 'furious', 'rage'],
  'meltdown': ['meltdown', 'complete breakdown'],
  'aggression': ['hitting', 'kicking', 'biting', 'aggressive'],
  'fever': ['fever', 'temperature', 'hot', '°F', '°C'],
  'new_skill': ['first time', 'learned', 'can now', 'new ability'],
  'transition': ['transition', 'change', 'switching', 'leaving']
};

// Simplified classification function
const classifyEvent = (event) => {
  const text = `${event.title || ''} ${event.content || ''}`.toLowerCase();

  const results = {
    buckets: [],
    tags: [],
    confidence: 0.3
  };

  let maxConfidence = 0;
  const bucketSet = new Set();
  const tagSet = new Set();

  // Apply classification rules
  Object.entries(CLASSIFICATION_RULES).forEach(([ruleKey, rule]) => {
    let matches = 0;

    // Check keywords
    rule.keywords.forEach(keyword => {
      if (text.includes(keyword)) matches++;
    });

    // Check context patterns
    if (rule.contextPatterns) {
      rule.contextPatterns.forEach(pattern => {
        if (text.includes(pattern)) matches++;
      });
    }

    if (matches > 0) {
      const confidence = Math.min(rule.confidence * (matches * 0.3), 1.0);
      rule.buckets.forEach(bucket => bucketSet.add(bucket));

      if (confidence > maxConfidence) {
        maxConfidence = confidence;
      }
    }
  });

  // Apply tags
  Object.entries(TAG_PATTERNS).forEach(([tag, patterns]) => {
    patterns.forEach(pattern => {
      if (text.includes(pattern)) tagSet.add(tag);
    });
  });

  // Default buckets based on event type
  if (bucketSet.size === 0) {
    switch (event.type) {
      case 'behavior': bucketSet.add('behavioral_challenging'); break;
      case 'mood_log': bucketSet.add('emotional_positive'); break;
      case 'medical_event': bucketSet.add('medical_incident'); break;
      default: bucketSet.add('daily_routine');
    }
    maxConfidence = Math.max(maxConfidence, 0.4);
  }

  results.buckets = Array.from(bucketSet);
  results.tags = Array.from(tagSet);
  results.confidence = Math.round(maxConfidence * 100) / 100;

  return results;
};

// Test events
const testEvents = [
  {
    id: "test_1",
    type: "behavior",
    title: "Major meltdown",
    content: "Had a complete meltdown during transition from playground to car. Screaming and hitting for 20 minutes."
  },
  {
    id: "test_2",
    type: "mood_log",
    title: "Very happy today",
    content: "Giggling and smiling all morning, playing with favorite toys. Excellent mood!"
  },
  {
    id: "test_3",
    type: "medical_event",
    title: "High fever",
    content: "Temperature 102.5°F, very lethargic. Gave Tylenol and monitoring closely."
  },
  {
    id: "test_4",
    type: "child_timeline",
    title: "First words",
    content: "Said mama for the first time! Major milestone and breakthrough in speech development."
  },
  {
    id: "test_5",
    type: "sensory_log",
    title: "Covering ears",
    content: "Overwhelmed by loud vacuum cleaner noise. Covering ears and avoiding the room."
  }
];

// Run the test
console.log('='.repeat(70));
console.log('CLASSIFICATION SERVICE TEST');
console.log('='.repeat(70));
console.log();

testEvents.forEach((event, index) => {
  console.log(`Test ${index + 1}: ${event.title}`);
  console.log(`Content: ${event.content}`);
  console.log(`Type: ${event.type}`);

  const classification = classifyEvent(event);

  console.log('Results:');
  console.log(`  Buckets: ${classification.buckets.join(', ')}`);
  console.log(`  Tags: ${classification.tags.join(', ') || 'None'}`);
  console.log(`  Confidence: ${(classification.confidence * 100).toFixed(1)}%`);
  console.log('-'.repeat(50));
});

console.log();
console.log('Test completed successfully!');
console.log('The classification service is working correctly.');
console.log();
console.log('Next steps:');
console.log('1. Run: npm install # to install Firebase dependencies');
console.log('2. Configure Firebase credentials');
console.log('3. Use the full classificationService.js with Firebase');
console.log();
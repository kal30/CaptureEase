/**
 * Classification Service Example
 *
 * This script demonstrates how to use the classification service
 * to process and classify events. It includes sample events and
 * shows the classification results.
 */

import {
  classifyEvent,
  processAllEventsForChild,
  getClassificationStats
} from '../services/classificationService.js';

// Sample events for testing classification
const sampleEvents = [
  {
    id: "behavior_001",
    type: "behavior",
    title: "Behavior: meltdown",
    content: "Had major meltdown during transition from playground to car. Screaming and hitting for 20 minutes. Very difficult to calm down.",
    timestamp: new Date("2024-01-15T15:30:00Z"),
    childId: "child123",
    author: "caregiver456",
    originalData: {
      behaviorType: "meltdown",
      description: "Had major meltdown during transition from playground to car. Screaming and hitting for 20 minutes. Very difficult to calm down.",
      triggers: ["transition", "overstimulation"],
      intensity: 5,
      duration: 20
    }
  },
  {
    id: "mood_002",
    type: "mood_log",
    title: "Mood: happy",
    content: "Very excited and happy today. Laughing and playing with favorite toys. Great mood all morning!",
    timestamp: new Date("2024-01-15T10:00:00Z"),
    childId: "child123",
    author: "caregiver456",
    originalData: {
      mood: "happy",
      intensity: 4,
      notes: "Very excited and happy today. Laughing and playing with favorite toys. Great mood all morning!",
      triggers: ["favorite_activity"]
    }
  },
  {
    id: "medical_003",
    type: "medical_event",
    title: "Fever and lethargy",
    content: "Temperature 101.3°F, very tired and not eating well. Gave Tylenol at 2pm. Watching closely.",
    timestamp: new Date("2024-01-15T14:00:00Z"),
    childId: "child123",
    author: "caregiver456",
    originalData: {
      eventType: "illness",
      severity: "medium",
      symptoms: ["fever", "lethargy", "poor appetite"],
      treatment: "Tylenol 160mg",
      temperature: "101.3°F"
    }
  },
  {
    id: "development_004",
    type: "child_timeline",
    title: "First two-word phrase",
    content: "Said 'more cookie' clearly for the first time! This is a big milestone - first time combining two words together.",
    timestamp: new Date("2024-01-15T16:30:00Z"),
    childId: "child123",
    author: "caregiver456",
    originalData: {
      actionType: "communication_milestone",
      notes: "Said 'more cookie' clearly for the first time! This is a big milestone - first time combining two words together.",
      category: "speech_development"
    }
  },
  {
    id: "sensory_005",
    type: "sensory_log",
    title: "Sensory: auditory sensitivity",
    content: "Covered ears when vacuum cleaner started. Seemed overwhelmed by loud noise, moved to quiet room.",
    timestamp: new Date("2024-01-15T11:15:00Z"),
    childId: "child123",
    author: "caregiver456",
    originalData: {
      sensoryType: "auditory",
      description: "Covered ears when vacuum cleaner started. Seemed overwhelmed by loud noise, moved to quiet room.",
      intensity: 3,
      response: "avoidance"
    }
  },
  {
    id: "daily_care_006",
    type: "daily_care",
    title: "Sleep: good night",
    content: "Went to bed easily tonight. Slept through the night without waking. Rating: 4/5",
    timestamp: new Date("2024-01-14T20:00:00Z"),
    childId: "child123",
    author: "caregiver456",
    originalData: {
      actionType: "sleep",
      data: {
        value: "good",
        rating: 4,
        notes: "Went to bed easily tonight. Slept through the night without waking."
      }
    }
  }
];

/**
 * Classify all sample events and display results
 */
const demonstrateClassification = () => {
  console.log('='.repeat(60));
  console.log('CLASSIFICATION SERVICE DEMONSTRATION');
  console.log('='.repeat(60));
  console.log();

  const classifiedEvents = [];

  sampleEvents.forEach((event, index) => {
    console.log(`--- Event ${index + 1}: ${event.title} ---`);
    console.log(`Type: ${event.type}`);
    console.log(`Content: ${event.content}`);
    console.log();

    // Classify the event
    const classifiedEvent = classifyEvent(event);
    classifiedEvents.push(classifiedEvent);

    // Display classification results
    const { classification } = classifiedEvent;
    console.log('CLASSIFICATION RESULTS:');
    console.log(`  Buckets: ${classification.buckets.join(', ')}`);
    console.log(`  Tags: ${classification.tags.join(', ') || 'None'}`);
    console.log(`  Confidence: ${(classification.confidence * 100).toFixed(1)}%`);
    console.log(`  Classified at: ${classification.classifiedAt.toISOString()}`);
    console.log();
  });

  // Display overall statistics
  console.log('='.repeat(60));
  console.log('CLASSIFICATION STATISTICS');
  console.log('='.repeat(60));

  const stats = getClassificationStats(classifiedEvents);
  console.log(`Total Events: ${stats.totalEvents}`);
  console.log(`Classified: ${stats.classified}`);
  console.log(`Unclassified: ${stats.unclassified}`);
  console.log();

  console.log('BUCKET DISTRIBUTION:');
  Object.entries(stats.buckets)
    .sort((a, b) => b[1] - a[1])
    .forEach(([bucket, count]) => {
      console.log(`  ${bucket}: ${count}`);
    });
  console.log();

  console.log('TAG DISTRIBUTION:');
  Object.entries(stats.tags)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      console.log(`  ${tag}: ${count}`);
    });
  console.log();

  console.log('CONFIDENCE LEVELS:');
  console.log(`  High (≥80%): ${stats.confidenceLevels.high}`);
  console.log(`  Medium (50-79%): ${stats.confidenceLevels.medium}`);
  console.log(`  Low (<50%): ${stats.confidenceLevels.low}`);
  console.log();

  return classifiedEvents;
};

/**
 * Demonstrate classification of different event types
 */
const demonstrateEventTypeClassification = () => {
  console.log('='.repeat(60));
  console.log('EVENT TYPE SPECIFIC CLASSIFICATION');
  console.log('='.repeat(60));
  console.log();

  const specificEvents = [
    {
      id: "test_aggressive_behavior",
      type: "behavior",
      content: "hitting and kicking during timeout, very aggressive behavior",
      originalData: { behaviorType: "aggression", intensity: 5 }
    },
    {
      id: "test_positive_mood",
      type: "mood_log",
      content: "giggling and smiling all day, very cheerful and content",
      originalData: { mood: "happy", intensity: 5 }
    },
    {
      id: "test_sensory_seeking",
      type: "sensory_log",
      content: "jumping and spinning, seeking deep pressure input",
      originalData: { sensoryType: "proprioceptive", response: "seeking" }
    },
    {
      id: "test_medical_emergency",
      type: "medical_event",
      content: "high fever 103°F, emergency room visit required",
      originalData: { severity: "high", symptoms: ["fever"], eventType: "emergency" }
    }
  ];

  specificEvents.forEach(event => {
    console.log(`Testing: ${event.content}`);
    const classified = classifyEvent(event);
    console.log(`  → Buckets: ${classified.classification.buckets.join(', ')}`);
    console.log(`  → Tags: ${classified.classification.tags.join(', ') || 'None'}`);
    console.log(`  → Confidence: ${(classified.classification.confidence * 100).toFixed(1)}%`);
    console.log();
  });
};

/**
 * Example usage of processing events for a child (mock version)
 */
const demonstrateChildEventProcessing = async () => {
  console.log('='.repeat(60));
  console.log('CHILD EVENT PROCESSING SIMULATION');
  console.log('='.repeat(60));
  console.log();

  console.log('This would typically process all events for a child from Firestore.');
  console.log('For demonstration purposes, using sample events...');
  console.log();

  // Simulate the processing summary that would be returned
  const mockSummary = {
    childId: 'child123',
    totalProcessed: sampleEvents.length,
    byCollection: {
      behaviors: 1,
      moodLogs: 1,
      medicalEvents: 1,
      timeline: 1,
      sensoryLogs: 1,
      dailyCare: 1
    },
    errors: []
  };

  console.log('PROCESSING SUMMARY:');
  console.log(`Child ID: ${mockSummary.childId}`);
  console.log(`Total Processed: ${mockSummary.totalProcessed}`);
  console.log();
  console.log('By Collection:');
  Object.entries(mockSummary.byCollection).forEach(([collection, count]) => {
    console.log(`  ${collection}: ${count} events`);
  });
  console.log();
  console.log(`Errors: ${mockSummary.errors.length}`);

  return mockSummary;
};

// Main execution function
const runExamples = async () => {
  try {
    console.log('Starting Classification Service Examples...');
    console.log();

    // Run demonstrations
    const classifiedEvents = demonstrateClassification();
    demonstrateEventTypeClassification();
    await demonstrateChildEventProcessing();

    console.log('='.repeat(60));
    console.log('EXAMPLES COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));

    return {
      success: true,
      classifiedEvents,
      totalProcessed: classifiedEvents.length
    };

  } catch (error) {
    console.error('Error running classification examples:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export for use as a module
export {
  sampleEvents,
  demonstrateClassification,
  demonstrateEventTypeClassification,
  demonstrateChildEventProcessing,
  runExamples
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().then(result => {
    if (result.success) {
      console.log(`\nSuccessfully processed ${result.totalProcessed} events.`);
    } else {
      console.error(`\nFailed to run examples: ${result.error}`);
    }
  });
}
const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Check if we are running locally with emulators or need real credentials
  // For this script, we assume we might be running with 'firebase functions:shell' environment or need default credentials
  // Simple initialization often works if GOOGLE_APPLICATION_CREDENTIALS is set or finding it automatically
  admin.initializeApp(); 
}

const db = admin.firestore();

// --- Ported Classification Logic (from src/services/classificationService.js) ---

const CLASSIFICATION_RULES = {
  emotional_positive: {
    keywords: ['happy', 'excited', 'joyful', 'calm', 'pleased', 'content', 'smiling', 'laughing', 'giggling'],
    contextPatterns: ['good mood', 'positive', 'cheerful', 'delighted'],
    buckets: ['emotional_positive'],
    targetCollection: 'moodLogs',
    type: 'mood_log',
    confidence: 0.8
  },
  emotional_negative: {
    keywords: ['sad', 'angry', 'frustrated', 'upset', 'crying', 'tears', 'anxious', 'worried', 'scared', 'cranky'],
    contextPatterns: ['bad mood', 'difficult', 'challenging', 'distressed'],
    buckets: ['emotional_negative'],
    targetCollection: 'moodLogs',
    type: 'mood_log',
    confidence: 0.8
  },
  behavioral_challenging: {
    keywords: ['meltdown', 'tantrum', 'screaming', 'hitting', 'throwing', 'kicking', 'biting', 'aggressive'],
    contextPatterns: ['difficult behavior', 'challenging', 'acting out', 'defiant'],
    buckets: ['behavioral_challenging'],
    targetCollection: 'behaviors',
    type: 'behavior',
    confidence: 0.9
  },
  sleep_related: {
    keywords: ['sleep', 'nap', 'bedtime', 'tired', 'sleepy', 'woke up', 'nightmare'],
    contextPatterns: ['going to bed', 'sleep time', 'rest'],
    buckets: ['sleep_related'],
    targetCollection: 'sleepLogs',
    type: 'sleep_log',
    confidence: 0.8
  },
  nutrition_feeding: {
    keywords: ['eating', 'food', 'hungry', 'thirsty', 'appetite', 'refused food', 'lunch', 'dinner', 'breakfast'],
    contextPatterns: ['meal', 'feeding', 'nutrition'],
    buckets: ['nutrition_feeding'],
    targetCollection: 'foodLogs',
    type: 'food_log',
    confidence: 0.7
  },
  medical_incident: {
    keywords: ['fever', 'sick', 'pain', 'injury', 'hurt', 'emergency', 'hospital', 'vomit'],
    contextPatterns: ['medical emergency', 'urgent', 'symptoms'],
    buckets: ['medical_incident'],
    targetCollection: 'medicalEvents',
    type: 'medical_event',
    confidence: 0.9
  }
};

const classifyText = (text) => {
  const normalize = t => t.toLowerCase();
  const normalizedText = normalize(text);
  
  let bestMatch = null;
  let maxConfidence = 0;

  for (const [ruleKey, rule] of Object.entries(CLASSIFICATION_RULES)) {
    let matches = 0;
    
    // Check keywords
    rule.keywords.forEach(kw => {
      if (normalizedText.includes(normalize(kw))) matches++;
    });

    // Check context
    if (rule.contextPatterns) {
      rule.contextPatterns.forEach(cp => {
        if (normalizedText.includes(normalize(cp))) matches++;
      });
    }

    if (matches > 0) {
      // Simple confidence calculator
      const confidence = Math.min(rule.confidence + (matches * 0.05), 1.0);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        bestMatch = { ...rule, ruleKey };
      }
    }
  }

  // Default to General Log (dailyLogs) if no match
  if (!bestMatch) {
    return {
      type: 'journal',
      collection: 'dailyLogs',
      buckets: ['general'],
      confidence: 0.1
    };
  }

  return {
    type: bestMatch.type,
    collection: bestMatch.targetCollection,
    buckets: bestMatch.buckets,
    confidence: maxConfidence
  };
};

// --- Main Execution ---

async function run() {
  try {
    console.log("🚀 Starting Classification Demo...");

    // 1. Get a Child ID
    const childrenSnap = await db.collection('children').limit(1).get();
    let childId;
    
    if (childrenSnap.empty) {
      console.log("⚠️ No children found. Creating a demo child...");
      const newChild = await db.collection('children').add({
        name: "Demo Child",
        age: 5,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      childId = newChild.id;
    } else {
      childId = childrenSnap.docs[0].id;
      console.log(`✅ Using existing child: ${childId}`);
    }

    // 2. Define Sample Logs
    const samples = [
      "He had a huge meltdown and was screaming for 20 minutes.",
      "Ate a really good lunch today, finished all his carrots.",
      "Woke up from nap crying and cranky.",
      "Had a fever of 101.5 and was vomiting.",
      "Played happily with his blocks in the morning."
    ];

    // 3. Process each sample
    for (const text of samples) {
      console.log(`\n📄 Processing: "${text}"`);
      
      // A. Create Ingestion Event (simulating SMS/Web hook)
      const eventRef = await db.collection('events').add({
        childId,
        text,
        source: 'demo_script',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`   -> Created Event: ${eventRef.id}`);

      // B. Classify
      const classification = classifyText(text);
      console.log(`   -> Classified as: ${classification.type} (${classification.confidence.toFixed(2)})`);

      // C. Write to Target Collection (The "Business Logic" currently missing in backend)
      // Note: In a real app, data structure differs by collection, but we'll use a generic one for demo
      const targetData = {
        childId,
        sourceEventId: eventRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        description: text, // Common field
        notes: text,       // Common fallback
        details: text,     // Common fallback
        type: classification.type,
        classification: {
            buckets: classification.buckets,
            confidence: classification.confidence
        }
      };

      // Add specific fields based on type to make it look good in UI
      if (classification.type === 'behavior') {
          targetData.behaviorType = 'Challenging'; // Default
          targetData.intensity = 'High';
      } else if (classification.type === 'mood_log') {
          targetData.mood = classification.buckets[0].includes('positive') ? 'Happy' : 'Sad'; 
          targetData.intensity = 3;
      }

      await db.collection(`children/${childId}/${classification.collection}`).add(targetData);
      console.log(`   -> Written to Collection: children/${childId}/${classification.collection}`);

      // D. Update Event with Classification
      await eventRef.update({
        status: 'processed',
        classification: classification,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log("\n✨ Demo Completed! Check the Timeline in the App.");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

run();

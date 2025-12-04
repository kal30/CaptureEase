const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

/**
 * Determine importance level of a note
 * @param {string} noteText - The note text to analyze
 * @param {string} type - The classified type
 * @param {string} subType - The classified subType
 * @returns {string} 'important' for Important Moments, 'routine' for Daily Log
 */
const determineImportance = (noteText, type, subType) => {
  const note = noteText.toLowerCase();

  // IMPORTANT MOMENTS - significant events that should be highlighted
  const importantKeywords = [
    // Milestones & Achievements
    'first time', 'milestone', 'first', 'achieved', 'new skill',
    // Medical & Health Issues
    'fever', 'sick', 'vomit', 'emergency', 'doctor', 'hospital', 'urgent',
    'allergic', 'reaction', 'rash', 'infection',
    // Incidents & Safety
    'fell', 'fall', 'injury', 'accident', 'hurt', 'bleeding', 'cut', 'bump',
    'emergency', 'urgent care',
    // Behavioral Concerns
    'tantrum', 'meltdown', 'aggressive', 'hitting', 'biting', 'concern',
    // Special Achievements
    'proud', 'amazing', 'wonderful', 'special', 'breakthrough',
    // Important Medical
    'medication change', 'new medication', 'stopped medication',
    'diagnosis', 'treatment',
    // Therapy Progress
    'therapy breakthrough', 'therapy progress', 'made progress'
  ];

  // ROUTINE DAILY LOG - everyday activities
  const routineKeywords = [
    // Meals (unless there's a problem)
    'breakfast', 'lunch', 'dinner', 'snack', 'ate', 'had',
    // Sleep (unless there's a problem)
    'nap', 'sleep', 'bedtime', 'woke up', 'rest',
    // Regular Activities
    'played', 'playing', 'watched', 'reading', 'went to park',
    'took a walk', 'bath time',
    // Routine Behavior
    'happy', 'smiling', 'good day', 'normal', 'usual'
  ];

  // Check for important keywords first
  for (const keyword of importantKeywords) {
    if (note.includes(keyword)) {
      return 'important';
    }
  }

  // Type-based importance rules
  if (type === 'incident' || type === 'medication' || type === 'milestone') {
    return 'important'; // These are always important
  }

  if (type === 'therapy') {
    return 'important'; // Therapy sessions are significant
  }

  if (type === 'behavior') {
    // Negative behavior is important, positive is routine
    if (subType === 'tantrum' || subType === 'aggressive') {
      return 'important';
    }
  }

  // Check if note mentions problems with routine activities
  const problemKeywords = ['refused', 'wouldn\'t', 'didn\'t', 'problem', 'issue',
                           'difficult', 'struggle', 'crying', 'upset'];
  for (const keyword of problemKeywords) {
    if (note.includes(keyword)) {
      return 'important';
    }
  }

  // Check for routine keywords
  for (const keyword of routineKeywords) {
    if (note.includes(keyword)) {
      return 'routine';
    }
  }

  // Check note length and detail - longer, detailed notes are often more important
  if (noteText.length > 150) {
    return 'important';
  }

  // Default to routine for feeding and sleep if no problems detected
  if (type === 'feeding' || type === 'sleep') {
    return 'routine';
  }

  // Default to important if we can't determine (better to highlight than miss)
  return 'important';
};

/**
 * Classify log content based on note text
 * @param {string} noteText - The note text to classify
 * @returns {Object|null} Classification result with type, subType, and noteType, or null if no classification found
 */
const classifyLogFromNote = (noteText) => {
  const note = noteText.toLowerCase();

  let classification = null;

  // Feeding keywords and patterns
  if (
    note.includes("lunch") ||
    note.includes("breakfast") ||
    note.includes("dinner") ||
    note.includes("meal")
  ) {
    classification = { type: "feeding", subType: "meal" };
  } else if (
    note.includes("snack") ||
    note.includes("crackers") ||
    note.includes("fruit") ||
    note.includes("juice")
  ) {
    classification = { type: "feeding", subType: "snack" };
  } else if (
    note.includes("bottle") ||
    note.includes("milk") ||
    note.includes("formula")
  ) {
    classification = { type: "feeding", subType: "bottle" };
  }
  // Sleep keywords
  else if (
    note.includes("nap") ||
    note.includes("sleep") ||
    note.includes("bedtime") ||
    note.includes("rest")
  ) {
    if (note.includes("nap")) {
      classification = { type: "sleep", subType: "nap" };
    } else {
      classification = { type: "sleep", subType: "sleep" };
    }
  }
  // Medication keywords
  else if (note.includes("tylenol") || note.includes("acetaminophen")) {
    classification = { type: "medication", subType: "Tylenol" };
  } else if (
    note.includes("ibuprofen") ||
    note.includes("advil") ||
    note.includes("motrin")
  ) {
    classification = { type: "medication", subType: "Ibuprofen" };
  } else if (
    note.includes("medicine") ||
    note.includes("medication") ||
    note.includes("dose") ||
    note.includes("pill")
  ) {
    classification = { type: "medication", subType: "medication" };
  }
  // Incident keywords
  else if (
    note.includes("fall") ||
    note.includes("fell") ||
    note.includes("dropped")
  ) {
    classification = { type: "incident", subType: "fall" };
  } else if (
    note.includes("bump") ||
    note.includes("hit") ||
    note.includes("bruise")
  ) {
    classification = { type: "incident", subType: "bump" };
  } else if (
    note.includes("cut") ||
    note.includes("scrape") ||
    note.includes("bleeding")
  ) {
    classification = { type: "incident", subType: "injury" };
  } else if (
    note.includes("accident") ||
    note.includes("hurt") ||
    note.includes("injury")
  ) {
    classification = { type: "incident", subType: "accident" };
  }
  // Therapy keywords
  else if (
    note.includes("therapy") ||
    note.includes("session") ||
    note.includes("exercises")
  ) {
    if (note.includes("speech")) {
      classification = { type: "therapy", subType: "speech" };
    } else if (note.includes("physical") || note.includes("pt")) {
      classification = { type: "therapy", subType: "physical" };
    } else if (note.includes("occupational") || note.includes("ot")) {
      classification = { type: "therapy", subType: "occupational" };
    } else {
      classification = { type: "therapy", subType: "therapy" };
    }
  }
  // Behavior keywords
  else if (
    note.includes("tantrum") ||
    note.includes("meltdown") ||
    note.includes("crying")
  ) {
    classification = { type: "behavior", subType: "tantrum" };
  } else if (
    note.includes("happy") ||
    note.includes("smiling") ||
    note.includes("laughing")
  ) {
    classification = { type: "behavior", subType: "positive" };
  } else if (
    note.includes("aggressive") ||
    note.includes("hitting") ||
    note.includes("biting")
  ) {
    classification = { type: "behavior", subType: "aggressive" };
  }
  // Milestone keywords
  else if (
    note.includes("first time") ||
    note.includes("milestone") ||
    note.includes("new")
  ) {
    if (note.includes("walk") || note.includes("walking")) {
      classification = { type: "milestone", subType: "walking" };
    } else if (
      note.includes("talk") ||
      note.includes("word") ||
      note.includes("said")
    ) {
      classification = { type: "milestone", subType: "speech" };
    } else {
      classification = { type: "milestone", subType: "milestone" };
    }
  }

  // If we found a classification, determine importance
  if (classification) {
    const noteType = determineImportance(noteText, classification.type, classification.subType);
    classification.noteType = noteType;
    return classification;
  }

  // Default: keep as note if no classification found
  return null;
};

/**
 * Cloud Function trigger to classify note logs automatically
 */
const classifyNoteLog = onDocumentCreated("logs/{logId}", async (event) => {
  try {
    const logData = event.data.data();
    const logId = event.params.logId;

    // Only process if type is "note" and hasn't been classified yet
    if (logData.type !== "note" || logData.classified === true) {
      return;
    }

    // Skip if no note text
    if (!logData.note) {
      logger.warn("Log document has no note text", { logId });
      return;
    }

    // Attempt to classify the note
    const classification = classifyLogFromNote(logData.note);

    if (!classification) {
      // Mark as processed but keep as note type
      await event.data.ref.update({
        classified: true,
        classifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("Note could not be classified, marked as processed", {
        logId,
      });
      return;
    }

    // Update the document with classification
    const updateData = {
      type: classification.type,
      subType: classification.subType,
      noteType: classification.noteType, // 'important' or 'routine'
      originalType: "note", // preserve original type
      classified: true,
      classifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Set timeStart to server time if missing
    if (!logData.timeStart) {
      updateData.timeStart = admin.firestore.FieldValue.serverTimestamp();
    }

    await event.data.ref.update(updateData);

    logger.info("Log classified successfully", {
      logId,
      originalType: "note",
      newType: classification.type,
      subType: classification.subType,
      noteType: classification.noteType,
      notePreview: logData.note.substring(0, 50),
    });
  } catch (error) {
    logger.error("Log classification failed", {
      error: error.message,
      stack: error.stack,
      logId: event.params.logId,
    });
  }
});

module.exports = {
  classifyNoteLog,
  classifyLogFromNote
};
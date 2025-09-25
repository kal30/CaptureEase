const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

/**
 * Classify log content based on note text
 * @param {string} noteText - The note text to classify
 * @returns {Object|null} Classification result with type and subType, or null if no classification found
 */
const classifyLogFromNote = (noteText) => {
  const note = noteText.toLowerCase();

  // Feeding keywords and patterns
  if (
    note.includes("lunch") ||
    note.includes("breakfast") ||
    note.includes("dinner") ||
    note.includes("meal")
  ) {
    return { type: "feeding", subType: "meal" };
  }
  if (
    note.includes("snack") ||
    note.includes("crackers") ||
    note.includes("fruit") ||
    note.includes("juice")
  ) {
    return { type: "feeding", subType: "snack" };
  }
  if (
    note.includes("bottle") ||
    note.includes("milk") ||
    note.includes("formula")
  ) {
    return { type: "feeding", subType: "bottle" };
  }

  // Sleep keywords
  if (
    note.includes("nap") ||
    note.includes("sleep") ||
    note.includes("bedtime") ||
    note.includes("rest")
  ) {
    if (note.includes("nap")) {
      return { type: "sleep", subType: "nap" };
    }
    return { type: "sleep", subType: "sleep" };
  }

  // Medication keywords
  if (note.includes("tylenol") || note.includes("acetaminophen")) {
    return { type: "medication", subType: "Tylenol" };
  }
  if (
    note.includes("ibuprofen") ||
    note.includes("advil") ||
    note.includes("motrin")
  ) {
    return { type: "medication", subType: "Ibuprofen" };
  }
  if (
    note.includes("medicine") ||
    note.includes("medication") ||
    note.includes("dose") ||
    note.includes("pill")
  ) {
    return { type: "medication", subType: "medication" };
  }

  // Incident keywords
  if (
    note.includes("fall") ||
    note.includes("fell") ||
    note.includes("dropped")
  ) {
    return { type: "incident", subType: "fall" };
  }
  if (
    note.includes("bump") ||
    note.includes("hit") ||
    note.includes("bruise")
  ) {
    return { type: "incident", subType: "bump" };
  }
  if (
    note.includes("cut") ||
    note.includes("scrape") ||
    note.includes("bleeding")
  ) {
    return { type: "incident", subType: "injury" };
  }
  if (
    note.includes("accident") ||
    note.includes("hurt") ||
    note.includes("injury")
  ) {
    return { type: "incident", subType: "accident" };
  }

  // Therapy keywords
  if (
    note.includes("therapy") ||
    note.includes("session") ||
    note.includes("exercises")
  ) {
    if (note.includes("speech")) {
      return { type: "therapy", subType: "speech" };
    }
    if (note.includes("physical") || note.includes("pt")) {
      return { type: "therapy", subType: "physical" };
    }
    if (note.includes("occupational") || note.includes("ot")) {
      return { type: "therapy", subType: "occupational" };
    }
    return { type: "therapy", subType: "therapy" };
  }

  // Behavior keywords
  if (
    note.includes("tantrum") ||
    note.includes("meltdown") ||
    note.includes("crying")
  ) {
    return { type: "behavior", subType: "tantrum" };
  }
  if (
    note.includes("happy") ||
    note.includes("smiling") ||
    note.includes("laughing")
  ) {
    return { type: "behavior", subType: "positive" };
  }
  if (
    note.includes("aggressive") ||
    note.includes("hitting") ||
    note.includes("biting")
  ) {
    return { type: "behavior", subType: "aggressive" };
  }

  // Milestone keywords
  if (
    note.includes("first time") ||
    note.includes("milestone") ||
    note.includes("new")
  ) {
    if (note.includes("walk") || note.includes("walking")) {
      return { type: "milestone", subType: "walking" };
    }
    if (
      note.includes("talk") ||
      note.includes("word") ||
      note.includes("said")
    ) {
      return { type: "milestone", subType: "speech" };
    }
    return { type: "milestone", subType: "milestone" };
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
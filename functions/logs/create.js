const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { validateLogType, validateLogSource, validateSeverity } = require("../utils/validation");

/**
 * Create a new log entry
 */
const createLog = onCall(
  {
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      if (!request.auth || !request.auth.uid) {
        throw new Error("User must be authenticated to create logs");
      }

      const {
        childId,
        type,
        subType,
        note,
        timeStart,
        timeEnd,
        source = "app",
        attachments = [],
        severity,
        tags,
        meta,
      } = request.data;

      if (!childId || !type || !note) {
        throw new Error(
          "Missing required fields: childId, type, and note are required"
        );
      }

      if (!validateLogType(type)) {
        throw new Error(
          `Invalid log type. Must be one of: incident, medication, sleep, feeding, behavior, milestone, note`
        );
      }

      if (!validateLogSource(source)) {
        throw new Error(
          `Invalid source. Must be one of: app, sms, whatsapp, alexa, ivr`
        );
      }

      if (type === "feeding" && !subType) {
        throw new Error(
          "subType is required for feeding logs (e.g., 'meal' or 'snack')"
        );
      }

      if (type === "medication" && !subType) {
        throw new Error(
          "subType is required for medication logs (medicine name)"
        );
      }

      // Note: 'note' type doesn't require subType as it will be classified automatically

      if (severity && !validateSeverity(severity)) {
        throw new Error("severity must be one of: low, medium, high, critical");
      }

      const db = admin.firestore();

      const childRef = db.collection("children").doc(childId);
      const childDoc = await childRef.get();

      if (!childDoc.exists) {
        throw new Error("Child not found");
      }

      const childData = childDoc.data();
      const childMembers = childData.users?.members || [];

      if (!childMembers.includes(request.auth.uid)) {
        throw new Error("User is not authorized to create logs for this child");
      }

      const logData = {
        childId,
        type,
        note,
        source,
        attachments,
        createdBy: request.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (subType) {
        logData.subType = subType;
      }

      if (timeStart) {
        logData.timeStart = admin.firestore.Timestamp.fromDate(
          new Date(timeStart)
        );
      } else {
        logData.timeStart = admin.firestore.FieldValue.serverTimestamp();
      }

      if (timeEnd) {
        logData.timeEnd = admin.firestore.Timestamp.fromDate(new Date(timeEnd));
      }

      if (severity) {
        logData.severity = severity;
      }

      if (tags && Array.isArray(tags)) {
        logData.tags = tags;
      }

      if (meta) {
        logData.meta = meta;
      }

      const logRef = await db.collection("logs").add(logData);

      logger.info("Log created successfully", {
        logId: logRef.id,
        childId,
        type,
        createdBy: request.auth.uid,
      });

      return {
        success: true,
        logId: logRef.id,
        message: "Log created successfully",
      };
    } catch (error) {
      logger.error("Log creation failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid,
        data: request.data,
      });

      throw new Error(error.message);
    }
  }
);

module.exports = {
  createLog
};
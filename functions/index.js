/**
 * index.js
 *
 * Main entry point for Firebase Cloud Functions.
 * This file acts ONLY as a registry that wires together
 * individual function modules. No business logic should live here.
 */

const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Messaging – Settings & Phone Linking
 */
exports.updateChildSmsSettings =
  require("./messaging/settings").updateChildSmsSettings;
exports.updateChildSmsSettingsHttp =
  require("./messaging/settings").updateChildSmsSettingsHttp;

exports.linkPhoneAndDefaultChild =
  require("./messaging/phone-link").linkPhoneAndDefaultChild;
exports.delinkPhone =
  require("./messaging/phone-link").delinkPhone;
exports.syncPhoneLinksForUser =
  require("./messaging/phone-link").syncPhoneLinksForUser;

/**
 * Messaging – Send Messages (WhatsApp/SMS)
 */
exports.sendMessage =
  require("./messaging/sendMessage").sendMessage;
exports.sendMessageHttp =
  require("./messaging/sendMessage").sendMessageHttp;

/**
 * Ingestion – SMS / WhatsApp
 */
exports.smsWebhook =
  require("./ingestion/smsWebhook").smsWebhook;

/**
 * LLM – Ask a question about logs
 */
exports.askQuestion =
  require("./llm/askQuestion").askQuestion;

/**
 * Classification (delegated to classifier module)
 */
exports.classifyEvent =
  require("./classifier").classifyEvent;
exports.classifyUnprocessed =
  require("./classifier").classifyUnprocessed;

/**
 * Logs / Events
 */
exports.createLog =
  require("./logs/create").createLog;
exports.classifyNoteLog =
  require("./logs/classify").classifyNoteLog;
exports.tagLogOnCreate =
  require("./logs/tagLogOnCreate").tagLogOnCreate;

/**
 * Admin Migrations (admin-only)
 */
exports.migrateExistingChildren =
  require("./migrations/migrateExistingChildren")
    .migrateExistingChildren;

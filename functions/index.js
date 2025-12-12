/**
 * index.js
 *
 * Main entry point for Firebase Cloud Functions.
 * Acts as a central registry that imports and exports all deployed functions.
 */

// Initialize Firebase Admin once
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Invitations / Email
 */
const { sendInvitationEmail } = require("./email");
const { acceptInvitation } = require("./invitations");

/**
 * Messaging Settings & Phone Linking
 */
const {
  updateChildSmsSettings,
  updateChildSmsSettingsHttp,
} = require("./messaging/settings");
const {
  linkPhoneAndDefaultChild,
  delinkPhone,
} = require("./messaging/phone-link");

/**
 * Ingestion (SMS / WhatsApp / Web)
 */
const { smsWebhook } = require("./ingestion/smsWebhook");

/**
 * Classification
 */
const {
  classifyEvent,
  classifyUnprocessed,
  createWebEvent,
} = require("./classifier");

/**
 * Logs / Events
 */
const { createLog } = require("./logs/create");
const { classifyNoteLog } = require("./logs/classify");

/**
 * Migrations (admin-only)
 */
const {
  migrateExistingChildren,
} = require("./migrations/migrateExistingChildren");

/**
 * Exports
 */
exports.sendInvitationEmail = sendInvitationEmail;
exports.acceptInvitation = acceptInvitation;

exports.updateChildSmsSettings = updateChildSmsSettings;
exports.updateChildSmsSettingsHttp = updateChildSmsSettingsHttp;
exports.linkPhoneAndDefaultChild = linkPhoneAndDefaultChild;
exports.delinkPhone = delinkPhone;

exports.smsWebhook = smsWebhook;

exports.createWebEvent = createWebEvent;
exports.classifyEvent = classifyEvent;
exports.classifyUnprocessed = classifyUnprocessed;

exports.createLog = createLog;
exports.classifyNoteLog = classifyNoteLog;

exports.migrateExistingChildren = migrateExistingChildren;

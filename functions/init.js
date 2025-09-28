/**
 * init.js
 *
 * Firebase Admin initialization and shared setup:
 * - Initializes Firebase Admin SDK for server-side operations
 * - Defines secrets (SendGrid, email config)
 * - Provides shared logger and admin instances
 */

const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin (for server-side operations)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Declare secrets
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");
const SENDER_NAME = defineSecret("SENDER_NAME");

module.exports = {
  admin,
  logger,
  SENDGRID_API_KEY,
  FROM_EMAIL,
  SENDER_NAME
};
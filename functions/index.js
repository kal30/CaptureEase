const admin = require("firebase-admin");

// Initialize Firebase Admin (for server-side operations)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import and export functions from modular files
const { sendInvitationEmail } = require("./email/invitation");
const { acceptInvitation } = require("./invitations/accept");
const { createLog } = require("./logs/create");
const { classifyNoteLog } = require("./logs/classify");
const { updateChildSmsSettings, updateChildSmsSettingsHttp } = require("./messaging/settings");
const { linkPhoneAndDefaultChild, delinkPhone } = require("./messaging/phone-link");
const { ingestMessage } = require("./messaging/ingest");
const { migrateExistingChildren } = require("./migrations/migrateExistingChildren");

// Export all Cloud Functions
exports.sendInvitationEmail = sendInvitationEmail;
exports.acceptInvitation = acceptInvitation;
exports.createLog = createLog;
exports.classifyNoteLog = classifyNoteLog;
exports.updateChildSmsSettings = updateChildSmsSettings;
exports.updateChildSmsSettingsHttp = updateChildSmsSettingsHttp;
exports.linkPhoneAndDefaultChild = linkPhoneAndDefaultChild;
exports.delinkPhone = delinkPhone;
exports.ingestMessage = ingestMessage;
exports.migrateExistingChildren = migrateExistingChildren;

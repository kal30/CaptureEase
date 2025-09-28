/**
 * index.js
 *
 * Main entry point for Firebase Cloud Functions:
 * - Imports and exports modular functions
 * - Keeps clean separation of concerns
 * - Central export configuration
 */

const { sendInvitationEmail } = require('./email');
const { acceptInvitation } = require('./invitations');
const { smsWebhook, whatsappWebhook, createWebEvent, classifyEvent, classifyUnprocessed } = require('./classifier');

exports.sendInvitationEmail = sendInvitationEmail;
exports.acceptInvitation = acceptInvitation;
exports.smsWebhook = smsWebhook;
exports.whatsappWebhook = whatsappWebhook;
exports.createWebEvent = createWebEvent;
exports.classifyEvent = classifyEvent;
exports.classifyUnprocessed = classifyUnprocessed;
/**
 * SMS/WhatsApp Ingestion Webhook for CaptureEz
 *
 * Handles Twilio SMS and WhatsApp messages with:
 * - Child prefix requirement (ChildName: message)
 * - Multi-child support (semicolon-separated)
 * - Fuzzy matching with confirmation flow
 * - Phone number authorization
 * - Event creation in Firestore
 */

const { onRequest } = require("firebase-functions/v2/https");
const { admin, logger } = require('../init');
const { replyText } = require('../utils/replyText');

// Utilities
const {
  normalizeE164,
  parseChildSegments
} = require('./utils');

const { twimlMessage } = require('./twiml');
const { handleDirectoryCommand } = require('./handlers/directoryCommand');
const { handleConfirmation } = require('./handlers/confirmations');
const { processChildSegment } = require('./handlers/segmentProcessor');
const { tryParseImplicitChild } = require('./parsers');

// In-memory cache for pending confirmations (use Redis in production)
const pendingConfirms = new Map();

/**
 * Main SMS/WhatsApp webhook handler
 */
const smsWebhook = onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.set('Content-Type', 'text/xml');
        return res.status(405).send(twimlMessage('Method not allowed. Use POST.'));
      }

      const payload = req.body;
      logger.info('Webhook received:', payload);

      // Extract and normalize fields
      const raw = req.body?.Body ?? "";
      const norm = raw.trim().toLowerCase();
      const from = String(req.body?.From || "");
      const fromE164 = from.startsWith("whatsapp:") ? from.slice("whatsapp:".length) : from;
      const body = raw.trim();
      const numMedia = parseInt(payload.NumMedia || '0', 10);

      if (!from || !body) {
        logger.warn('Missing required fields:', { from, hasBody: !!body });
        res.set('Content-Type', 'text/xml');
        return res.status(400).send(twimlMessage(replyText.missingFromOrBody));
      }

      // Detect directory command BEFORE child-prefix parsing
      const isDirectory = /^children\??$/.test(norm) || /^child\??$/.test(norm) || /^kids\??$/.test(norm);
      if (isDirectory) {
        const response = await handleDirectoryCommand(from, fromE164);
        res.set('Content-Type', 'text/xml');
        return res.status(200).send(twimlMessage(response));
      }

      // Normalize phone number and detect source (for non-directory commands)
      const { e164, source } = normalizeE164(from);

      // Handle confirmation flow
      if (body.toUpperCase() === 'YES') {
        const response = await handleConfirmation(fromE164, payload, pendingConfirms);
        res.set('Content-Type', 'text/xml');
        return res.status(200).send(twimlMessage(response));
      }

      // Parse child segments from message
      let segments = parseChildSegments(body);

      if (segments.length === 0) {
        const implicitSegment = await tryParseImplicitChild(body, fromE164);
        if (implicitSegment) {
          segments = [implicitSegment];
        }
      }

      if (segments.length === 0) {
        res.set('Content-Type', 'text/xml');
        return res.status(200).send(twimlMessage(replyText.missingChildName));
      }

      // Process each segment
      const responses = [];
      for (let i = 0; i < segments.length; i++) {
        const response = await processChildSegment(
          segments[i],
          fromE164,
          source,
          payload,
          i,
          segments.length,
          pendingConfirms
        );
        responses.push(response);
      }

      // Format response for user
      let finalResponse;
      if (responses.length <= 3) {
        finalResponse = responses.join('\n');
      } else {
        finalResponse = responses.slice(0, 3).join('\n') +
          `\n…and ${responses.length - 3} more.`;
      }

      res.set('Content-Type', 'text/xml');
      return res.status(200).send(twimlMessage(finalResponse));

    } catch (error) {
      logger.error('Webhook error:', error);
      res.set('Content-Type', 'text/xml');
      return res.status(500).send(twimlMessage('Failed to process message'));
    }
  }
);


module.exports = {
  smsWebhook
};

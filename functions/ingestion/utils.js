/**
 * Utility functions for SMS/WhatsApp ingestion
 */

/**
 * Normalize phone number to E.164 format and detect source
 */
function normalizeE164(from) {
  if (!from) return { e164: null, source: null };

  let source, phone;

  if (from.startsWith('whatsapp:')) {
    source = 'whatsapp';
    phone = from.replace('whatsapp:', '');
  } else {
    source = 'sms';
    phone = from;
  }

  // Ensure E.164 format (starts with +)
  let e164 = phone;
  if (!e164.startsWith('+')) {
    e164 = '+' + e164;
  }

  return { e164, source };
}

/**
 * Parse child segments from message
 * Format: "ChildName: message; OtherChild: other message"
 */
function parseChildSegments(text) {
  if (!text || typeof text !== 'string') return [];

  const segments = [];

  // Split by semicolon for multi-child messages
  const parts = text.split(';');

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;

    // Look for pattern "ChildToken: message"
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) continue;

    const childToken = part.substring(0, colonIndex).trim();
    const message = part.substring(colonIndex + 1).trim();

    if (childToken && message) {
      segments.push({
        childToken,
        text: message
      });
    }
  }

  return segments;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Validate E.164 phone number format
 */
function isValidE164(phone) {
  if (!phone || typeof phone !== 'string') return false;
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

/**
 * Sanitize text for Firestore storage
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/\0/g, ''); // Remove null bytes
}

/**
 * Extract media info from Twilio payload
 */
function extractMediaInfo(payload) {
  const numMedia = parseInt(payload.NumMedia || '0', 10);
  const media = [];

  for (let i = 0; i < numMedia; i++) {
    const mediaUrl = payload[`MediaUrl${i}`];
    const contentType = payload[`MediaContentType${i}`];

    if (mediaUrl) {
      media.push({
        url: mediaUrl,
        contentType: contentType || 'unknown',
        index: i
      });
    }
  }

  return media;
}

/**
 * Generate cache key for pending confirmations
 */
function generateCacheKey(e164, type = 'confirm') {
  return `${type}:${e164}`;
}

/**
 * Validate child token format
 */
function isValidChildToken(token) {
  if (!token || typeof token !== 'string') return false;

  // Allow letters, numbers, spaces, hyphens, apostrophes
  // Must start with letter or number
  return /^[a-zA-Z0-9][a-zA-Z0-9\s\-']*$/.test(token.trim());
}

/**
 * Clean and normalize child token
 */
function normalizeChildToken(token) {
  if (!token || typeof token !== 'string') return '';

  return token
    .trim()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .toLowerCase();
}

/**
 * Parse Twilio webhook payload
 */
function parseTwilioPayload(body) {
  return {
    messageId: body.MessageSid || body.SmsSid,
    accountSid: body.AccountSid,
    from: body.From,
    to: body.To,
    body: body.Body,
    numMedia: parseInt(body.NumMedia || '0', 10),
    status: body.SmsStatus,
    apiVersion: body.ApiVersion
  };
}

/**
 * Format success response with emoji
 */
function formatSuccessResponse(childName, classification = null, mediaCount = 0) {
  let response = `Logged for ${childName} ✅ ${classification || 'Not classified yet'}`;

  if (mediaCount === 1) {
    response += ' (photo saved)';
  } else if (mediaCount > 1) {
    response += ` (media x${mediaCount})`;
  }

  return response;
}

/**
 * Check if message is a special command
 */
function isSpecialCommand(text) {
  if (!text || typeof text !== 'string') return null;

  const cleaned = text.trim().toLowerCase();

  if (cleaned === 'children?') return 'children';
  if (cleaned === 'yes') return 'confirm';
  if (cleaned === 'no') return 'cancel';
  if (cleaned === 'help') return 'help';

  return null;
}

module.exports = {
  normalizeE164,
  parseChildSegments,
  levenshteinDistance,
  isValidE164,
  sanitizeText,
  extractMediaInfo,
  generateCacheKey,
  isValidChildToken,
  normalizeChildToken,
  parseTwilioPayload,
  formatSuccessResponse,
  isSpecialCommand
};
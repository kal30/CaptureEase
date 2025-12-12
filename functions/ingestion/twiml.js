/**
 * TwiML utility functions for Twilio Messaging responses
 */

/**
 * Escape XML characters for TwiML safety
 * @param {string} text - Text to escape
 * @returns {string} XML-escaped text
 */
function escapeXml(text) {
  if (typeof text !== 'string') return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Create a TwiML Message response
 * @param {string|string[]} content - Message content (string or array of lines)
 * @returns {string} Complete TwiML response
 */
function twimlMessage(content) {
  // Handle array input by joining with newlines
  let messageText = Array.isArray(content) ? content.join('\n') : content;

  // Ensure it's a string
  if (typeof messageText !== 'string') {
    messageText = String(messageText || '');
  }

  // Trim whitespace
  messageText = messageText.trim();

  // Limit to 1600 characters to stay within Twilio limits
  if (messageText.length > 1600) {
    messageText = messageText.substring(0, 1597) + '...';
  }

  // Escape XML characters
  const escapedMessage = escapeXml(messageText);

  // Build TwiML response
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapedMessage}</Message>
</Response>`;
}

module.exports = {
  escapeXml,
  twimlMessage
};
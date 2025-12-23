/**
 * Send WhatsApp/SMS Messages via Twilio
 *
 * Handles sending messages to caregivers/parents from the CaptureEz system
 * using Twilio's WhatsApp or SMS services.
 */

const { onCall, onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const twilio = require("twilio");

// Define secrets for Twilio credentials
const TWILIO_ACCOUNT_SID = defineSecret("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = defineSecret("TWILIO_WHATSAPP_FROM");
const TWILIO_SMS_FROM = defineSecret("TWILIO_SMS_FROM");

/**
 * Send a WhatsApp message
 *
 * @param {Object} request - Contains data with:
 *   - to: Phone number in E.164 format (e.g., "+1234567890")
 *   - message: Text message to send
 *   - type: "whatsapp" or "sms" (defaults to "whatsapp")
 * @returns {Object} Success status and message SID
 */
const sendMessage = onCall(
  {
    secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_SMS_FROM],
    enforceAppCheck: false
  },
  async (request) => {
    try {
      // Check authentication
      if (!request.auth) {
        throw new Error("Authentication required");
      }

      const { to, message, type = "whatsapp" } = request.data;

      // Validate inputs
      if (!to || !message) {
        throw new Error("Missing required fields: 'to' and 'message'");
      }

      // Validate phone number format (basic E.164 check)
      if (!to.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error("Phone number must be in E.164 format (e.g., +1234567890)");
      }

      // Initialize Twilio client
      const client = twilio(
        TWILIO_ACCOUNT_SID.value(),
        TWILIO_AUTH_TOKEN.value()
      );

      // Prepare message parameters
      let fromNumber;
      let toNumber;

      if (type === "whatsapp") {
        fromNumber = `whatsapp:${TWILIO_WHATSAPP_FROM.value()}`;
        toNumber = `whatsapp:${to}`;
      } else if (type === "sms") {
        fromNumber = TWILIO_SMS_FROM.value();
        toNumber = to;
      } else {
        throw new Error("Invalid type. Must be 'whatsapp' or 'sms'");
      }

      // Send message
      const response = await client.messages.create({
        body: message,
        from: fromNumber,
        to: toNumber
      });

      logger.info("Message sent successfully", {
        messageSid: response.sid,
        to: toNumber,
        type,
        userId: request.auth.uid
      });

      return {
        success: true,
        messageSid: response.sid,
        status: response.status,
        message: "Message sent successfully"
      };

    } catch (error) {
      logger.error("Failed to send message", {
        error: error.message,
        stack: error.stack,
        data: request.data
      });

      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
);

/**
 * HTTP endpoint for sending messages (useful for testing or web hooks)
 */
const sendMessageHttp = onRequest(
  {
    secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_SMS_FROM],
    cors: true
  },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed. Use POST." });
        return;
      }

      const { to, message, type = "whatsapp" } = req.body;

      // Validate inputs
      if (!to || !message) {
        res.status(400).json({ error: "Missing required fields: 'to' and 'message'" });
        return;
      }

      // Validate phone number format
      if (!to.match(/^\+[1-9]\d{1,14}$/)) {
        res.status(400).json({
          error: "Phone number must be in E.164 format (e.g., +1234567890)"
        });
        return;
      }

      // Initialize Twilio client
      const client = twilio(
        TWILIO_ACCOUNT_SID.value(),
        TWILIO_AUTH_TOKEN.value()
      );

      // Prepare message parameters
      let fromNumber;
      let toNumber;

      if (type === "whatsapp") {
        fromNumber = `whatsapp:${TWILIO_WHATSAPP_FROM.value()}`;
        toNumber = `whatsapp:${to}`;
      } else if (type === "sms") {
        fromNumber = TWILIO_SMS_FROM.value();
        toNumber = to;
      } else {
        res.status(400).json({ error: "Invalid type. Must be 'whatsapp' or 'sms'" });
        return;
      }

      // Send message
      const response = await client.messages.create({
        body: message,
        from: fromNumber,
        to: toNumber
      });

      logger.info("Message sent successfully via HTTP", {
        messageSid: response.sid,
        to: toNumber,
        type
      });

      res.status(200).json({
        success: true,
        messageSid: response.sid,
        status: response.status,
        message: "Message sent successfully"
      });

    } catch (error) {
      logger.error("Failed to send message via HTTP", {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        error: "Failed to send message",
        message: error.message
      });
    }
  }
);

module.exports = {
  sendMessage,
  sendMessageHttp
};

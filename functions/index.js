const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const { Resend } = require("resend");

// Declare secrets
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");
const SENDER_NAME = defineSecret("SENDER_NAME");

exports.sendInvitationEmail = onRequest(
  {
    secrets: [RESEND_API_KEY, FROM_EMAIL, SENDER_NAME],
  },
  async (req, res) => {
    try {
      const { to, subject, text } = req.body;

      const resendClient = new Resend(RESEND_API_KEY.value());

      const response = await resendClient.emails.send({
        from: `${SENDER_NAME.value()} <${FROM_EMAIL.value()}>`,
        to,
        subject,
        text,
      });

      logger.info("Email sent", response);
      res.status(200).send("Email sent");
    } catch (error) {
      logger.error("Email send failed", error);
      res.status(500).send("Failed to send email");
    }
  }
);

const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");
const { generateInvitationEmailTemplate } = require("./templates");

// Declare secrets
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");
const SENDER_NAME = defineSecret("SENDER_NAME");

/**
 * Send invitation email to new care team members
 */
const sendInvitationEmail = onCall(
  {
    secrets: [SENDGRID_API_KEY, FROM_EMAIL, SENDER_NAME],
  },
  async (request) => {
    try {
      const {
        recipientEmail,
        childName,
        role,
        senderName,
        invitationLink,
        personalMessage,
      } = request.data;

      // Validate required fields
      if (
        !recipientEmail ||
        !childName ||
        !role ||
        !senderName ||
        !invitationLink
      ) {
        logger.error("Missing required fields", request.data);
        throw new Error("Missing required fields");
      }

      // Set SendGrid API key
      sgMail.setApiKey(SENDGRID_API_KEY.value());

      const { html, text } = generateInvitationEmailTemplate(
        childName,
        role,
        senderName,
        invitationLink,
        personalMessage
      );

      const emailData = {
        to: recipientEmail,
        from: {
          email: FROM_EMAIL.value(),
          name: SENDER_NAME.value(),
        },
        subject: `🎯 You're invited to join ${childName}'s care team on CaptureEz`,
        html,
        text,
        customArgs: {
          category: "care-team-invitation",
          role: role,
          childName: childName,
        },
        // Temporarily disable click tracking until Link Branding (CNAMEs) is verified
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false,
          },
          openTracking: {
            enable: true,
          },
        },
      };

      const response = await sgMail.send(emailData);

      logger.info("Email sent successfully", {
        messageId: response[0]?.headers?.["x-message-id"],
        to: recipientEmail,
        childName,
        role,
        statusCode: response[0]?.statusCode,
      });

      return {
        success: true,
        messageId: response[0]?.headers?.["x-message-id"],
        message: "Invitation email sent successfully via SendGrid",
      };
    } catch (error) {
      logger.error("SendGrid email send failed", {
        error: error.message,
        stack: error.stack,
        data: request.data,
        response: error.response?.body,
      });

      throw new Error(`Failed to send email via SendGrid: ${error.message}`);
    }
  }
);

module.exports = {
  sendInvitationEmail
};
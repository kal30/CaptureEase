const { onCall, onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const { Resend } = require("resend");
const { Webhook } = require("svix");
const admin = require("firebase-admin");
const { parseImportedLogsCore } = require("./importedLogsParser");

// Initialize Firebase Admin (for server-side operations)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Declare secrets
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");
const SENDER_NAME = defineSecret("SENDER_NAME");
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const CONTACT_RECIPIENT_EMAIL = "carelogjournal@gmail.com";
const RESEND_WEBHOOK_SECRET = defineSecret("RESEND_WEBHOOK_SECRET");
const DEFAULT_APP_BASE_URL = "https://lifelog.care";

const INVITE_STATUSES = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
  RESENT: "resent",
  ACCEPTED: "accepted",
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Helper function to generate email templates
const generateInvitationEmailTemplate = (
  childName,
  role,
  senderName,
  invitationLink,
  personalMessage
) => {
  const roleLabelMap = {
    care_partner: "Care Partner",
    caregiver: "Caregiver",
    therapist: "Therapist",
  };
  const roleDisplay = roleLabelMap[role] || "Team Member";

  const safeChildName = escapeHtml(childName);
  const safeSenderName = escapeHtml(senderName);
  const safeInvitationLink = escapeHtml(invitationLink);
  const safeRoleDisplay = escapeHtml(roleDisplay);
  const safePersonalMessage = personalMessage ? escapeHtml(personalMessage).replace(/\n/g, "<br>") : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lifelog Care Team Invitation</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #0F172A; background-color: #F8FAFC; margin: 0; padding: 24px 12px; }
        .container { max-width: 640px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 18px rgba(15,23,42,0.08); }
        .header { background: linear-gradient(135deg, #7C6AAE 0%, #8FC9C0 100%); color: white; padding: 40px 32px 34px; text-align: left; }
        .brand { font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.92; font-weight: 700; margin-bottom: 12px; }
        .header h1 { margin: 0; font-size: 30px; font-weight: 800; line-height: 1.1; }
        .header p { margin: 12px 0 0 0; opacity: 0.95; font-size: 16px; max-width: 42ch; }
        .content { padding: 32px; }
        .eyebrow { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #64748B; font-weight: 700; margin-bottom: 10px; }
        .title { color: #0F172A; margin: 0 0 12px 0; font-size: 22px; font-weight: 800; line-height: 1.2; }
        .content p { margin: 0 0 15px 0; color: #334155; }
        .child-name { color: #0F172A; font-weight: 800; }
        .role-badge { display: inline-flex; align-items: center; gap: 8px; background-color: #F4F1F8; color: #5B4E8C; padding: 8px 14px; border-radius: 999px; font-size: 14px; font-weight: 700; margin: 4px 0 22px 0; border: 1px solid #D9D1EE; }
        .personal-message { background-color: #F7FBF9; padding: 18px 18px 16px; border-radius: 16px; border: 1px solid #D7EADC; margin: 22px 0; color: #183B2B; }
        .personal-message strong { display: block; margin-bottom: 6px; color: #0F172A; }
        .cta-wrap { margin: 26px 0 18px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #7C6AAE 0%, #5BAFA7 100%); color: white; text-decoration: none; font-weight: 800; font-size: 16px; padding: 14px 22px; border-radius: 999px; box-shadow: 0 10px 20px rgba(124,106,174,0.18); }
        .cta-button:hover { opacity: 0.95; }
        .link-copy { margin-top: 12px; font-size: 13px; color: #64748B; word-break: break-all; }
        .link-copy a { color: #5BAFA7; text-decoration: none; font-weight: 700; }
        .footer { background-color: #F8FAFC; padding: 24px 32px 30px; text-align: center; border-top: 1px solid #E2E8F0; }
        .footer p { margin: 0; color: #64748B; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">Lifelog</div>
          <h1>You're invited to join a care team</h1>
          <p>A simple invite to bring the right people into ${safeChildName}'s care workflow.</p>
        </div>
        
        <div class="content">
          <div class="eyebrow">Care team invite</div>
          <div class="title">${safeSenderName} invited you to join <span class="child-name">${safeChildName}</span></div>
          <p>You have been invited to join the care team as a <strong>${safeRoleDisplay}</strong>.</p>
          <div class="role-badge">Role: ${safeRoleDisplay}</div>
          
          ${safePersonalMessage ? `
          <div class="personal-message">
            <strong>Personal message</strong>
            <div>"${safePersonalMessage}"</div>
          </div>
          ` : ""}
          
          <p>Lifelog helps care teams stay organized, share context, and keep everyone aligned.</p>

          <div class="cta-wrap">
            <a href="${safeInvitationLink}" class="cta-button">Join the care team</a>
          </div>

          <div class="link-copy">
            If the button doesn't work, copy this link into your browser:<br>
            <a href="${safeInvitationLink}">${safeInvitationLink}</a>
          </div>
        </div>
        
        <div class="footer">
          <p>This invitation was sent by ${safeSenderName} through Lifelog</p>
          <p style="margin-top: 8px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Lifelog Care Team Invitation
    
    Hello!
    
    ${senderName} has invited you to join ${childName}'s care team as a ${roleDisplay}.
    
    ${personalMessage ? `Personal Message: "${personalMessage}"` : ""}
    
    Lifelog helps care teams stay organized with progress tracking, team communication, and more.
    
    To accept your invitation, visit: ${invitationLink}
    
    If you didn't expect this invitation, you can safely ignore this email.
    
    Best regards,
    Lifelog Team
  `;

  return { html, text };
};

const generateContactEmailTemplate = ({
  senderName,
  senderEmail,
  subject,
  message,
}) => {
  const safeSenderName = escapeHtml(senderName);
  const safeSenderEmail = escapeHtml(senderEmail);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CaptureEz Contact Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #243126; background-color: #F5FBF7; margin: 0; padding: 24px 0; }
        .container { max-width: 640px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #D7EADC; }
        .header { background: linear-gradient(135deg, #2A7A56 0%, #3E9470 100%); color: #FFFFFF; padding: 32px 28px; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 28px; }
        .label { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #678074; font-weight: 700; margin-bottom: 6px; }
        .value { font-size: 16px; color: #183B2B; margin-bottom: 18px; word-break: break-word; }
        .message-box { background-color: #F5FBF7; border: 1px solid #D7EADC; border-radius: 14px; padding: 18px; color: #183B2B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Request</h1>
        </div>
        <div class="content">
          <div class="label">From</div>
          <div class="value">${safeSenderName}</div>
          <div class="label">Reply To</div>
          <div class="value">${safeSenderEmail}</div>
          <div class="label">Subject</div>
          <div class="value">${safeSubject}</div>
          <div class="label">Message</div>
          <div class="message-box">${safeMessage}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Request

From: ${senderName}
Reply To: ${senderEmail}
Subject: ${subject}

Message:
${message}
  `.trim();

  return { html, text };
};

const generateGenericEmailTemplate = ({ subject, message }) => {
  const safeSubject = escapeHtml(subject || "Message from Lifelog");
  const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br>");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${safeSubject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #0F172A; background-color: #F8FAFC; margin: 0; padding: 24px 12px; }
        .container { max-width: 640px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 18px rgba(15,23,42,0.08); }
        .header { background: linear-gradient(135deg, #7C6AAE 0%, #5BAFA7 100%); color: white; padding: 32px 28px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
        .content { padding: 28px; }
        .message-box { background-color: #F7FBF9; border: 1px solid #D7EADC; border-radius: 16px; padding: 18px; color: #183B2B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${safeSubject}</h1>
        </div>
        <div class="content">
          <div class="message-box">${safeMessage}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `${subject || "Message from Lifelog"}\n\n${message || ""}`.trim();

  return { html, text };
};

const buildInviteRecord = ({
  invitationId,
  recipientEmail,
  childId,
  childIds,
  childName,
  childNames,
  role,
  senderName,
  senderUid = null,
  invitationLink,
  personalMessage = null,
  specialization = null,
  multiChild = false,
}) => ({
  invitationId,
  recipientEmail: recipientEmail?.toLowerCase() || null,
  childId: childId || null,
  childIds: Array.isArray(childIds) ? childIds : [],
  childName: childName || null,
  childNames: Array.isArray(childNames) ? childNames : [],
  role,
  senderName,
  senderUid,
  invitationLink,
  personalMessage: personalMessage || null,
  specialization: specialization || null,
  multiChild: Boolean(multiChild),
  status: INVITE_STATUSES.PENDING,
  emailStatus: "pending",
  emailError: null,
  resendCount: 0,
  messageId: null,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});

const getInviteDisplayName = (inviteData) => {
  if (inviteData.multiChild) {
    return inviteData.childNames?.length ? inviteData.childNames.join(", ") : "multiple children";
  }
  return inviteData.childName || "a child";
};

const getInviteRoleLabel = (role) => {
  const roleLabelMap = {
    care_partner: "Care Partner",
    caregiver: "Caregiver",
    therapist: "Therapist",
  };

  return roleLabelMap[role] || "Team Member";
};

const getInviteBaseUrl = (invitationLink = "") => {
  if (!invitationLink) {
    return DEFAULT_APP_BASE_URL;
  }

  try {
    return new URL(invitationLink).origin;
  } catch (error) {
    return DEFAULT_APP_BASE_URL;
  }
};

const getWebhookHeaders = (req = {}) => ({
  "svix-id": req.headers["svix-id"] || req.headers["webhook-id"] || req.headers["Webhook-Id"],
  "svix-timestamp": req.headers["svix-timestamp"] || req.headers["webhook-timestamp"] || req.headers["Webhook-Timestamp"],
  "svix-signature": req.headers["svix-signature"] || req.headers["webhook-signature"] || req.headers["Webhook-Signature"],
});

const getWebhookPayload = (req = {}) => {
  if (typeof req.rawBody === "string") {
    return req.rawBody;
  }

  if (Buffer.isBuffer(req.rawBody)) {
    return req.rawBody.toString("utf8");
  }

  if (typeof req.body === "string") {
    return req.body;
  }

  return JSON.stringify(req.body || {});
};

exports.parseImportedLogs = onCall(
  {
    region: "us-central1",
    secrets: [ANTHROPIC_API_KEY],
  },
  async (request) => {
    try {
      const { text } = request.data || {};
      return await parseImportedLogsCore({
        text,
        fetchImpl: fetch,
        apiKey: ANTHROPIC_API_KEY.value(),
        logger,
      });
    } catch (error) {
      logger.error("parseImportedLogs failed", error);
      return { error: "We couldn't read that file. Try a simpler format." };
    }
  }
);

exports.sendInvitationEmail = onCall(
  {
    secrets: [RESEND_API_KEY, FROM_EMAIL, SENDER_NAME],
  },
  async (request) => {
    try {
      const db = admin.firestore();
      const {
        recipientEmail,
        childId,
        childIds,
        childName,
        childNames,
        role,
        senderName,
        senderUid,
        invitationLink,
        personalMessage,
        specialization,
        invitationId: providedInvitationId,
        multiChild = false,
        to,
        subject,
        message,
      } = request.data || {};

      const resend = new Resend(RESEND_API_KEY.value());

      // Generic email support for existing callers that send a plain message.
      if (to && subject && message && !recipientEmail && !childName && !childName?.length && !childNames) {
        const { html, text } = generateGenericEmailTemplate({ subject, message });
        const response = await resend.emails.send({
          to,
          from: `${SENDER_NAME.value()} <${FROM_EMAIL.value()}>`,
          subject,
          html,
          text,
        });

        if (response.error) {
          throw new Error(response.error.message || "Resend send failed");
        }

        logger.info("Generic email sent successfully", {
          messageId: response.data?.id,
          to,
          subject,
        });

        return {
          success: true,
          messageId: response.data?.id,
          message: "Email sent successfully via Resend",
        };
      }

      if (!recipientEmail || !role || !senderName || !invitationLink) {
        logger.error("Missing required fields", request.data);
        throw new Error("Missing required fields");
      }

      const effectiveInvitationId = providedInvitationId || db.collection("invitations").doc().id;
      const inviteTargetName = multiChild
        ? (Array.isArray(childNames) && childNames.length ? childNames.join(", ") : "multiple children")
        : childName;
      const inviteLinkWithId = invitationLink.includes("invitationId=")
        ? invitationLink
        : `${invitationLink}${invitationLink.includes("?") ? "&" : "?"}invitationId=${encodeURIComponent(effectiveInvitationId)}`;

      const invitationRecord = buildInviteRecord({
        invitationId: effectiveInvitationId,
        recipientEmail,
        childId,
        childIds,
        childName,
        childNames,
        role,
        senderName,
        senderUid,
        invitationLink: inviteLinkWithId,
        personalMessage,
        specialization,
        multiChild,
      });

      await db.collection("invitations").doc(effectiveInvitationId).set(invitationRecord, { merge: true });

      const { html, text } = generateInvitationEmailTemplate(
        inviteTargetName,
        role,
        senderName,
        inviteLinkWithId,
        personalMessage
      );

      const emailData = {
        to: recipientEmail,
        from: `${SENDER_NAME.value()} <${FROM_EMAIL.value()}>`,
        subject: `You're invited to join ${inviteTargetName}'s care team on Lifelog`,
        html,
        text,
      };

      const response = await resend.emails.send(emailData);

      if (response.error) {
        await db.collection("invitations").doc(effectiveInvitationId).set(
          {
            status: INVITE_STATUSES.FAILED,
            emailStatus: "failed",
            emailError: response.error.message || "Resend invitation send failed",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        throw new Error(response.error.message || "Resend invitation send failed");
      }

      await db.collection("invitations").doc(effectiveInvitationId).set(
        {
          status: INVITE_STATUSES.SENT,
          emailStatus: "sent",
          emailError: null,
          messageId: response.data?.id || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info("Invite email sent successfully", {
        invitationId: effectiveInvitationId,
        messageId: response.data?.id,
        to: recipientEmail,
        childId,
        childIds,
        role,
      });

      return {
        success: true,
        invitationId: effectiveInvitationId,
        messageId: response.data?.id,
        status: INVITE_STATUSES.SENT,
        message: "Invitation email sent successfully via Resend",
      };
    } catch (error) {
      logger.error("Resend invitation send failed", {
        error: error.message,
        stack: error.stack,
        data: request.data,
        response: error.response,
      });

      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }
  }
);

exports.resendInvitationEmail = onCall(
  {
    secrets: [RESEND_API_KEY, FROM_EMAIL, SENDER_NAME],
  },
  async (request) => {
    try {
      const db = admin.firestore();
      const { invitationId } = request.data || {};

      if (!request.auth?.uid) {
        throw new Error("User must be authenticated to resend invitations");
      }

      if (!invitationId) {
        throw new Error("invitationId is required");
      }

      const inviteRef = db.collection("invitations").doc(invitationId);
      const inviteSnap = await inviteRef.get();
      if (!inviteSnap.exists) {
        throw new Error("Invitation not found");
      }

      const inviteData = inviteSnap.data();
      if (!inviteData) {
        throw new Error("Invitation data missing");
      }

      const resend = new Resend(RESEND_API_KEY.value());
      const inviteTargetName = getInviteDisplayName(inviteData);
      const { html, text } = generateInvitationEmailTemplate(
        inviteTargetName,
        inviteData.role,
        inviteData.senderName,
        inviteData.invitationLink,
        inviteData.personalMessage
      );

      const response = await resend.emails.send({
        to: inviteData.recipientEmail,
        from: `${SENDER_NAME.value()} <${FROM_EMAIL.value()}>`,
        subject: `You're invited to join ${inviteTargetName}'s care team on Lifelog`,
        html,
        text,
      });

      if (response.error) {
        throw new Error(response.error.message || "Resend resend failed");
      }

      await inviteRef.set(
        {
          status: INVITE_STATUSES.RESENT,
          emailStatus: "sent",
          emailError: null,
          messageId: response.data?.id || null,
          resendCount: admin.firestore.FieldValue.increment(1),
          lastResentAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info("Invitation resent successfully", {
        invitationId,
        messageId: response.data?.id,
        to: inviteData.recipientEmail,
      });

      return {
        success: true,
        invitationId,
        messageId: response.data?.id,
        status: INVITE_STATUSES.RESENT,
        message: "Invitation resent successfully",
      };
    } catch (error) {
      logger.error("Invitation resend failed", {
        error: error.message,
        stack: error.stack,
        data: request.data,
      });

      throw new Error(`Failed to resend invitation: ${error.message}`);
    }
  }
);

exports.editInvitationEmail = onCall(
  {
    secrets: [RESEND_API_KEY, FROM_EMAIL, SENDER_NAME],
  },
  async (request) => {
    try {
      const db = admin.firestore();
      if (!request.auth?.uid) {
        throw new Error("User must be authenticated to edit invitations");
      }

      const {
        invitationId,
        recipientEmail,
        role,
        personalMessage,
      } = request.data || {};

      if (!invitationId || !recipientEmail) {
        throw new Error("invitationId and recipientEmail are required");
      }

      const inviteRef = db.collection("invitations").doc(invitationId);
      const inviteSnap = await inviteRef.get();
      if (!inviteSnap.exists) {
        throw new Error("Invitation not found");
      }

      const inviteData = inviteSnap.data() || {};
      const updatedRecipientEmail = String(recipientEmail).trim().toLowerCase();
      const updatedRole = role || inviteData.role;
      const updatedPersonalMessage = personalMessage ?? inviteData.personalMessage ?? null;
      const inviteTargetName = getInviteDisplayName(inviteData);
      const regeneratedTokenData = inviteData.multiChild
        ? {
            email: updatedRecipientEmail,
            childIds: inviteData.childIds || [],
            childNames: inviteData.childNames || [],
            role: updatedRole,
            timestamp: Date.now(),
            invitationId,
          }
        : {
            email: updatedRecipientEmail,
            childId: inviteData.childId,
            childName: inviteData.childName,
            role: updatedRole,
            timestamp: Date.now(),
            invitationId,
          };
      const regeneratedToken = encodeURIComponent(btoa(JSON.stringify(regeneratedTokenData)));
      const regeneratedLink = `${getInviteBaseUrl(inviteData.invitationLink)}/accept-invite?token=${regeneratedToken}&invitationId=${encodeURIComponent(invitationId)}`;

      await inviteRef.set(
        {
          recipientEmail: updatedRecipientEmail,
          role: updatedRole,
          personalMessage: updatedPersonalMessage,
          invitationLink: regeneratedLink,
          status: INVITE_STATUSES.PENDING,
          emailStatus: "pending",
          emailError: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          editedBy: request.auth.uid,
          editedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      try {
        const resend = new Resend(RESEND_API_KEY.value());
        const { html, text } = generateInvitationEmailTemplate(
          inviteTargetName,
          updatedRole,
          inviteData.senderName,
          regeneratedLink,
          updatedPersonalMessage
        );

        const response = await resend.emails.send({
          to: updatedRecipientEmail,
          from: `${SENDER_NAME.value()} <${FROM_EMAIL.value()}>`,
          subject: `You're invited to join ${inviteTargetName}'s care team on Lifelog`,
          html,
          text,
        });

        if (response.error) {
          throw new Error(response.error.message || "Resend invitation send failed");
        }

        await inviteRef.set(
          {
            status: INVITE_STATUSES.SENT,
            emailStatus: "sent",
            emailError: null,
            messageId: response.data?.id || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        logger.info("Invitation re-sent after edit", {
          invitationId,
          messageId: response.data?.id,
          recipientEmail: updatedRecipientEmail,
        });
      } catch (sendError) {
        await inviteRef.set(
          {
            status: INVITE_STATUSES.FAILED,
            emailStatus: "failed",
            emailError: sendError.message || "Resend invitation send failed",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        throw sendError;
      }

      logger.info("Invitation edited", {
        invitationId,
        recipientEmail: updatedRecipientEmail,
        role: updatedRole,
      });

      return {
        success: true,
        invitationId,
        message: "Invitation updated successfully",
      };
    } catch (error) {
      logger.error("Invitation edit failed", {
        error: error.message,
        stack: error.stack,
        data: request.data,
      });

      throw new Error(`Failed to edit invitation: ${error.message}`);
    }
  }
);

exports.cancelInvitationEmail = onCall(
  {
    secrets: [RESEND_API_KEY, FROM_EMAIL, SENDER_NAME],
  },
  async (request) => {
    try {
      const db = admin.firestore();
      if (!request.auth?.uid) {
        throw new Error("User must be authenticated to cancel invitations");
      }

      const { invitationId, reason = "canceled" } = request.data || {};
      if (!invitationId) {
        throw new Error("invitationId is required");
      }

      const inviteRef = db.collection("invitations").doc(invitationId);
      const inviteSnap = await inviteRef.get();
      if (!inviteSnap.exists) {
        throw new Error("Invitation not found");
      }

      await inviteRef.set(
        {
          status: "canceled",
          emailStatus: "canceled",
          canceledAt: admin.firestore.FieldValue.serverTimestamp(),
          canceledBy: request.auth.uid,
          cancelReason: reason,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info("Invitation canceled", { invitationId, reason });

      return {
        success: true,
        invitationId,
        message: "Invitation canceled",
      };
    } catch (error) {
      logger.error("Invitation cancel failed", {
        error: error.message,
        stack: error.stack,
        data: request.data,
      });

      throw new Error(`Failed to cancel invitation: ${error.message}`);
    }
  }
);

exports.resendWebhook = onRequest(
  {
    secrets: [RESEND_WEBHOOK_SECRET],
  },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      const expectedSecret = RESEND_WEBHOOK_SECRET.value();
      if (!expectedSecret) {
        logger.error("Resend webhook secret is not configured");
        res.status(500).json({ error: "Webhook secret is not configured" });
        return;
      }

      const rawPayload = getWebhookPayload(req);
      const headers = getWebhookHeaders(req);
      let payload;

      try {
        const webhook = new Webhook(expectedSecret);
        payload = webhook.verify(rawPayload, headers);
      } catch (verifyError) {
        logger.warn("Resend webhook verification failed", {
          error: verifyError.message,
          headers,
        });
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const eventType = payload.type || payload.event || payload.status;
      const data = payload.data || payload;
      const messageId = data.email_id || data.messageId || data.id || data.message_id;
      const invitationId = data.invitationId || data.invitation_id || data.metadata?.invitationId;

      if (!messageId && !invitationId) {
        res.status(400).json({ error: "Missing invitation/message identifier" });
        return;
      }

      const db = admin.firestore();
      let inviteRef = null;

      if (invitationId) {
        inviteRef = db.collection("invitations").doc(String(invitationId));
      } else {
        const querySnap = await db.collection("invitations")
          .where("messageId", "==", String(messageId))
          .limit(1)
          .get();
        if (!querySnap.empty) {
          inviteRef = querySnap.docs[0].ref;
        }
      }

      if (!inviteRef) {
        res.status(404).json({ error: "Invitation not found" });
        return;
      }

      const update = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (eventType) {
        update.webhookStatus = String(eventType);
      }

      if (data.status) {
        update.emailStatus = String(data.status);
      }

      if (messageId) {
        update.messageId = String(messageId);
      }

      if (data.email) {
        update.recipientEmail = String(data.email).toLowerCase();
      }

      const normalizedStatus = String(data.status || eventType || "").toLowerCase();

      if (normalizedStatus.includes("bounce")) {
        update.status = "bounced";
      } else if (normalizedStatus.includes("complain")) {
        update.status = "complained";
      } else if (normalizedStatus.includes("delivered")) {
        update.status = "delivered";
      } else if (normalizedStatus.includes("sent")) {
        update.status = "sent";
      }

      update.emailStatus = data.status ? String(data.status) : update.emailStatus;
      update.lastWebhookEventAt = admin.firestore.FieldValue.serverTimestamp();

      await inviteRef.set(update, { merge: true });

      logger.info("Resend webhook processed", {
        invitationId: invitationId || inviteRef.id,
        messageId,
        eventType,
        status: update.status || null,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error("Resend webhook failed", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: error.message });
    }
  }
);

exports.listChildInvitations = onCall(
  {
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      const db = admin.firestore();
      const { childId, childIds } = request.data || {};
      const authUid = request.auth?.uid;

      if (!authUid) {
        throw new Error("Authentication required");
      }

      const requestedChildIds = Array.isArray(childIds) && childIds.length
        ? childIds
        : childId
          ? [childId]
          : [];

      if (!requestedChildIds.length) {
        throw new Error("childId or childIds is required");
      }

      const results = [];

      for (const requestedId of requestedChildIds) {
        const childSnap = await db.collection("children").doc(requestedId).get();
        if (!childSnap.exists) {
          continue;
        }

        const childData = childSnap.data() || {};
        const users = childData.users || {};
        const isOwner = users.care_owner === authUid;
        const isMember =
          (Array.isArray(users.members) && users.members.includes(authUid)) ||
          (Array.isArray(users.care_partners) && users.care_partners.includes(authUid)) ||
          (Array.isArray(users.caregivers) && users.caregivers.includes(authUid)) ||
          (Array.isArray(users.therapists) && users.therapists.includes(authUid));

        if (!isOwner && !isMember) {
          continue;
        }

        const [singleQuery, multiQuery] = await Promise.all([
          db.collection("invitations")
            .where("childId", "==", requestedId)
            .get(),
          db.collection("invitations")
            .where("childIds", "array-contains", requestedId)
            .get(),
        ]);

        const seenIds = new Set();
        [singleQuery, multiQuery].forEach((querySnap) => {
          querySnap.forEach((docSnap) => {
            if (seenIds.has(docSnap.id)) {
              return;
            }

            seenIds.add(docSnap.id);
            results.push({
              id: docSnap.id,
              ...docSnap.data(),
            });
          });
        });
      }

      return {
        success: true,
        invitations: results.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        }),
      };
    } catch (error) {
      logger.error("List child invitations failed", {
        error: error.message,
        stack: error.stack,
        data: request.data,
        userId: request.auth?.uid,
      });

      throw new Error(`Failed to list invitations: ${error.message}`);
    }
  }
);

exports.sendContactEmail = onCall(
  {
    secrets: [RESEND_API_KEY, FROM_EMAIL, SENDER_NAME],
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      const db = admin.firestore();
      const senderName = request.data?.senderName?.trim();
      const senderEmail = request.data?.senderEmail?.trim().toLowerCase();
      const subject = request.data?.subject?.trim();
      const message = request.data?.message?.trim();

      if (!senderName || !senderEmail || !subject || !message) {
        throw new Error("All contact form fields are required.");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
        throw new Error("A valid email address is required.");
      }

      if (subject.length > 120) {
        throw new Error("Subject must be 120 characters or fewer.");
      }

      if (message.length > 5000) {
        throw new Error("Message must be 5000 characters or fewer.");
      }

      const contactSubmissionRef = db.collection("contactSubmissions").doc();
      const contactSubmission = {
        senderName,
        senderEmail,
        subject,
        message,
        source: "contact_us",
        status: "new",
        emailStatus: "pending",
        emailError: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (request.auth?.uid) {
        contactSubmission.userId = request.auth.uid;
      }

      await contactSubmissionRef.set(contactSubmission);

      const { html, text } = generateContactEmailTemplate({
        senderName,
        senderEmail,
        subject,
        message,
      });

      let emailSent = false;

      try {
        const resend = new Resend(RESEND_API_KEY.value());
        const emailData = {
          to: CONTACT_RECIPIENT_EMAIL,
          from: `${SENDER_NAME.value()} <${FROM_EMAIL.value()}>`,
          replyTo: senderEmail,
          subject: `CaptureEz Contact: ${subject}`,
          html,
          text,
        };

        const response = await resend.emails.send(emailData);

        if (response.error) {
          throw new Error(response.error.message || "Resend contact send failed");
        }

        emailSent = true;

        await contactSubmissionRef.update({
          emailStatus: "sent",
          emailError: null,
          messageId: response.data?.id || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info("Contact email sent successfully", {
          submissionId: contactSubmissionRef.id,
          messageId: response.data?.id,
          senderEmail,
          to: CONTACT_RECIPIENT_EMAIL,
        });
      } catch (emailError) {
        await contactSubmissionRef.update({
          emailStatus: "failed",
          emailError: emailError.message || "Unknown email send failure",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.error("Contact email send failed after save", {
          submissionId: contactSubmissionRef.id,
          error: emailError.message,
          stack: emailError.stack,
          senderEmail,
          to: CONTACT_RECIPIENT_EMAIL,
          response: emailError.response,
        });
      }

      return {
        success: true,
        saved: true,
        emailSent,
        submissionId: contactSubmissionRef.id,
        message: emailSent
          ? "Contact request saved and email sent successfully."
          : "Contact request saved successfully. Email delivery is currently delayed.",
      };
    } catch (error) {
      logger.error("Contact email send failed", {
        error: error.message,
        stack: error.stack,
        data: request.data,
        response: error.response,
      });

      throw new Error(`Failed to send contact email: ${error.message}`);
    }
  }
);

// Helper function to update members field
const updateMembersField = (users) => {
  const members = new Set();
  
  // Add care owner
  if (users.care_owner) {
    members.add(users.care_owner);
  }
  
  // Add all role arrays
  if (users.care_partners) {
    users.care_partners.forEach(id => members.add(id));
  }
  if (users.caregivers) {
    users.caregivers.forEach(id => members.add(id));
  }
  if (users.therapists) {
    users.therapists.forEach(id => members.add(id));
  }
  
  return Array.from(members);
};

// Accept invitation Cloud Function
exports.acceptInvitation = onCall(
  {
    enforceAppCheck: false, // Set to true if you use App Check
  },
  async (request) => {
    try {
      // Verify user is authenticated
      if (!request.auth || !request.auth.uid) {
        throw new Error("User must be authenticated to accept invitations");
      }

      const { token } = request.data;

      if (!token) {
        throw new Error("Invitation token is required");
      }

      // Decode and validate token
      let inviteData;
      try {
        const decoded = JSON.parse(Buffer.from(decodeURIComponent(token), 'base64').toString());
        inviteData = decoded;
      } catch (error) {
        logger.error("Invalid invitation token", { error: error.message, token });
        throw new Error("Invalid invitation token");
      }

      // Validate invitation data
      const isMultiChild = inviteData.childIds && inviteData.childNames;
      const isSingleChild = inviteData.childId && inviteData.childName;
      
      if (!inviteData.email || !inviteData.role || (!isMultiChild && !isSingleChild)) {
        throw new Error("Invalid invitation data");
      }

      // Check if invitation is expired (30 days) - TEMPORARILY DISABLED
      // const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      // if (inviteData.timestamp && (Date.now() - inviteData.timestamp) > thirtyDaysMs) {
      //   throw new Error("This invitation has expired. Please request a new one.");
      // }

      // Verify user's email matches invitation email
      const userRecord = await admin.auth().getUser(request.auth.uid);
      if (userRecord.email !== inviteData.email) {
        throw new Error(`This invitation was sent to ${inviteData.email}. Please log in with that email address.`);
      }

      // Validate role
      const validRoles = ['care_partner', 'caregiver', 'therapist'];
      if (!validRoles.includes(inviteData.role)) {
        throw new Error(`Invalid role: ${inviteData.role}`);
      }

      // Get child IDs to process
      const childIds = isMultiChild ? inviteData.childIds : [inviteData.childId];
      const childNames = isMultiChild ? inviteData.childNames : [inviteData.childName];

      logger.info("Processing invitation acceptance", {
        userId: request.auth.uid,
        email: inviteData.email,
        role: inviteData.role,
        childIds,
        childNames
      });

      // Process each child assignment using admin privileges
      const db = admin.firestore();
      const batch = db.batch();

      for (const childId of childIds) {
        const childRef = db.collection('children').doc(childId);
        
        // Get current child document
        const childDoc = await childRef.get();
        if (!childDoc.exists) {
          throw new Error(`Child ${childId} not found`);
        }

        const childData = childDoc.data();
        const currentUsers = childData.users || {};

        // Create updated users object
        const updatedUsers = { ...currentUsers };
        
        // Add user to appropriate role array
        switch (inviteData.role) {
          case 'care_partner':
            updatedUsers.care_partners = [...(currentUsers.care_partners || []), request.auth.uid];
            break;
          case 'caregiver':
            updatedUsers.caregivers = [...(currentUsers.caregivers || []), request.auth.uid];
            break;
          case 'therapist':
            updatedUsers.therapists = [...(currentUsers.therapists || []), request.auth.uid];
            break;
        }

        // Update members field for efficient queries
        updatedUsers.members = updateMembersField(updatedUsers);

        // Add to batch update
        batch.update(childRef, {
          users: updatedUsers,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: request.auth.uid
        });

        logger.info("Added user to child", {
          childId,
          childName: childData.name,
          userId: request.auth.uid,
          role: inviteData.role
        });
      }

      // Execute all updates atomically
      await batch.commit();

      if (inviteData.invitationId) {
        try {
          await db.collection("invitations").doc(inviteData.invitationId).set({
            status: INVITE_STATUSES.ACCEPTED,
            acceptedBy: request.auth.uid,
            acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        } catch (inviteUpdateError) {
          logger.warn("Failed to mark invitation accepted", {
            error: inviteUpdateError.message,
            invitationId: inviteData.invitationId,
          });
        }
      }

      // Create success message
      const successMessage = childNames.length === 1 
        ? `Successfully joined ${childNames[0]}'s care team as ${inviteData.role}!`
        : `Successfully joined care team for ${childNames.join(', ')} as ${inviteData.role}!`;

      logger.info("Invitation acceptance completed successfully", {
        userId: request.auth.uid,
        email: inviteData.email,
        role: inviteData.role,
        childrenCount: childIds.length
      });

      return {
        success: true,
        message: successMessage,
        childrenCount: childIds.length,
        role: inviteData.role
      };

    } catch (error) {
      logger.error("Invitation acceptance failed", {
        error: error.message,
        stack: error.stack,
        userId: request.auth?.uid,
        data: request.data
      });

      throw new Error(error.message);
    }
  }
);

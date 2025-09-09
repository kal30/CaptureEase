const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");
const admin = require("firebase-admin");

// Initialize Firebase Admin (for server-side operations)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Declare secrets
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");
const SENDER_NAME = defineSecret("SENDER_NAME");

// Helper function to generate email templates
const generateInvitationEmailTemplate = (
  childName,
  role,
  senderName,
  invitationLink,
  personalMessage
) => {
  const roleDisplay = role === "therapist" ? "Therapist" : "Caregiver";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CaptureEz Care Team Invitation</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #FFF8ED; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #F27F45 0%, #E85D2F 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .content h2 { color: #F27F45; margin: 0 0 20px 0; font-size: 24px; }
        .content p { margin: 0 0 15px 0; }
        .child-name { color: #5B8C51; font-weight: 600; }
        .role-badge { display: inline-block; background-color: #5B8C51; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 0 0 20px 0; }
        .personal-message { background-color: #FFF8ED; padding: 20px; border-radius: 12px; border-left: 4px solid #FFC857; margin: 20px 0; }
        .cta-link { color: #F27F45; text-decoration: underline; font-weight: 600; font-size: 18px; margin: 20px 0; }
        .cta-link:hover { color: #E85D2F; text-decoration: none; }
        .footer { background-color: #FFF8ED; padding: 30px; text-align: center; border-top: 1px solid #E8E2D9; }
        .footer p { margin: 0; color: #666; font-size: 14px; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .feature { text-align: center; padding: 20px; background-color: #FFF8ED; border-radius: 12px; }
        .feature-icon { font-size: 24px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 CaptureEz Invitation</h1>
          <p>You've been invited to join a care team</p>
        </div>
        
        <div class="content">
          <h2>Hello! 👋</h2>
          <p><strong>${senderName}</strong> has invited you to join <span class="child-name">${childName}'s</span> care team as a:</p>
          <div class="role-badge">${roleDisplay}</div>
          
          ${
            personalMessage
              ? `
          <div class="personal-message">
            <strong>Personal Message:</strong><br>
            "${personalMessage}"
          </div>
          `
              : ""
          }
          
          <p>CaptureEz helps care teams stay organized with:</p>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">📋</div>
              <strong>Progress Tracking</strong><br>
              <small>Daily logs and notes</small>
            </div>
            <div class="feature">
              <div class="feature-icon">💬</div>
              <strong>Team Communication</strong><br>
              <small>Secure messaging</small>
            </div>
          </div>
          
          <p>Ready to get started? <a href="${invitationLink}" class="cta-link">Click here to join the care team</a></p>
          
          <p><small>If the link doesn't work, copy and paste this URL into your browser:<br>
          <a href="${invitationLink}" style="color: #F27F45; word-break: break-all;">${invitationLink}</a></small></p>
        </div>
        
        <div class="footer">
          <p>This invitation was sent by ${senderName} through CaptureEz</p>
          <p style="margin-top: 10px;"><small>If you didn't expect this invitation, you can safely ignore this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    CaptureEz Care Team Invitation
    
    Hello!
    
    ${senderName} has invited you to join ${childName}'s care team as a ${roleDisplay}.
    
    ${personalMessage ? `Personal Message: "${personalMessage}"` : ""}
    
    CaptureEz helps care teams stay organized with progress tracking, team communication, and more.
    
    To accept your invitation, visit: ${invitationLink}
    
    If you didn't expect this invitation, you can safely ignore this email.
    
    Best regards,
    CaptureEz Team
  `;

  return { html, text };
};

exports.sendInvitationEmail = onCall(
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

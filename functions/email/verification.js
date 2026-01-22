const { onCall, HttpsError } = require("firebase-functions/v2/https");
const sgMail = require("@sendgrid/mail");
const { admin, logger, SENDGRID_API_KEY, FROM_EMAIL, SENDER_NAME } = require("../init");

const APP_NAME = "CaptureEz";

const allowedOrigins = new Set([
  "https://carelog.web.app",
  "https://captureease-ef82f.web.app",
  "https://carelogjournal.com",
  "https://www.carelogjournal.com",
  "https://captureez.com",
  "https://www.captureez.com",
  "http://localhost:3000",
]);

const normalizeOrigin = (origin) =>
  String(origin || "").trim().replace(/\/$/, "").toLowerCase();

const isAllowedOrigin = (origin) => {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  if (allowedOrigins.has(normalized)) return true;
  if (normalized.endsWith(".captureez.com")) return true;
  if (normalized.endsWith(".carelogjournal.com")) return true;
  return false;
};

const parseUrl = (value) => {
  try {
    return new URL(value);
  } catch (error) {
    return null;
  }
};

const resolveContinueUrl = (request) => {
  const requested = request?.data?.continueUrl;
  if (requested) {
    const url = parseUrl(requested);
    if (!url || !isAllowedOrigin(url.origin)) {
      throw new HttpsError("invalid-argument", "Invalid continue URL");
    }
    return url.toString();
  }

  const originHeader = request?.rawRequest?.headers?.origin;
  const originUrl = parseUrl(originHeader);
  if (originUrl && isAllowedOrigin(originUrl.origin)) {
    return `${originUrl.origin}/profile`;
  }

  return "https://captureez.com/profile";
};

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const generateVerificationEmailTemplate = ({ displayName, verificationLink }) => {
  const safeName = escapeHtml(displayName || "there");
  const safeLink = escapeHtml(verificationLink);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verify your email</title>
      </head>
      <body style="margin:0;padding:0;background:#f7f3ee;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f7f3ee;padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#f27f45,#e85d2f);padding:28px 32px;text-align:center;color:#ffffff;">
                    <div style="font-size:20px;font-weight:700;">${APP_NAME}</div>
                    <div style="opacity:0.9;margin-top:6px;">Verify your email</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 12px 0;font-size:16px;">Hi ${safeName},</p>
                    <p style="margin:0 0 18px 0;font-size:16px;line-height:1.5;">
                      Thanks for creating your account. Please confirm your email address to finish setting up your profile.
                    </p>
                    <p style="margin:22px 0;text-align:center;">
                      <a href="${safeLink}" style="background:#f27f45;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;display:inline-block;">
                        Verify email
                      </a>
                    </p>
                    <p style="margin:0 0 8px 0;font-size:14px;color:#555;line-height:1.5;">
                      If the button does not work, copy and paste this link into your browser:
                    </p>
                    <p style="margin:0 0 18px 0;font-size:12px;word-break:break-all;color:#777;">
                      ${safeLink}
                    </p>
                    <p style="margin:0;font-size:14px;color:#555;">
                      If you did not request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f7f3ee;padding:18px 24px;text-align:center;font-size:12px;color:#777;">
                    © ${APP_NAME}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `Verify your email for ${APP_NAME}

Hi ${displayName || "there"},

Thanks for creating your account. Please confirm your email address:
${verificationLink}

If you did not request this, you can safely ignore this email.
`;

  return { html, text };
};

const sendVerificationEmail = onCall(
  {
    secrets: [SENDGRID_API_KEY, FROM_EMAIL, SENDER_NAME],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const userRecord = await admin.auth().getUser(request.auth.uid);
    if (!userRecord?.email) {
      throw new HttpsError("failed-precondition", "User has no email address");
    }

    if (userRecord.emailVerified) {
      return { success: false, message: "Email already verified" };
    }

    const continueUrl = resolveContinueUrl(request);
    const verificationLink = await admin.auth().generateEmailVerificationLink(
      userRecord.email,
      { url: continueUrl }
    );

    const { html, text } = generateVerificationEmailTemplate({
      displayName: userRecord.displayName || userRecord.email,
      verificationLink,
    });

    sgMail.setApiKey(SENDGRID_API_KEY.value());

    const emailData = {
      to: userRecord.email,
      from: {
        email: FROM_EMAIL.value(),
        name: SENDER_NAME.value(),
      },
      subject: `Verify your email for ${APP_NAME}`,
      html,
      text,
      customArgs: {
        category: "email-verification",
        userId: userRecord.uid,
      },
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

    logger.info("Verification email sent", {
      messageId: response[0]?.headers?.["x-message-id"],
      to: userRecord.email,
      statusCode: response[0]?.statusCode,
    });

    return {
      success: true,
      messageId: response[0]?.headers?.["x-message-id"],
    };
  }
);

module.exports = {
  sendVerificationEmail,
};

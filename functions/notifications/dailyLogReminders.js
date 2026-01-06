const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");

const TWILIO_ACCOUNT_SID = defineSecret("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");
const TWILIO_SMS_FROM = defineSecret("TWILIO_SMS_FROM");
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const FROM_EMAIL = defineSecret("FROM_EMAIL");
const SENDER_NAME = defineSecret("SENDER_NAME");

const getLocalTimeParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const year = get("year");
  const month = get("month");
  const day = get("day");
  return {
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    dateKey: `${year}-${month}-${day}`
  };
};

const shouldSendNow = ({ timeString, nowParts, lastSentKey }) => {
  const [hourStr] = String(timeString || "19:00").split(":");
  const targetHour = Number(hourStr);
  if (Number.isNaN(targetHour)) return false;
  if (nowParts.hour !== targetHour) return false;
  if (lastSentKey && lastSentKey === nowParts.dateKey) return false;
  return true;
};

const sendSms = async ({ to, message }) => {
  const client = twilio(
    TWILIO_ACCOUNT_SID.value(),
    TWILIO_AUTH_TOKEN.value()
  );
  return client.messages.create({
    from: TWILIO_SMS_FROM.value(),
    to,
    body: message
  });
};

const sendEmail = async ({ to, childName, subject }) => {
  sgMail.setApiKey(SENDGRID_API_KEY.value());
  const fromEmail = FROM_EMAIL.value();
  const senderName = SENDER_NAME.value();
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2 style="margin-bottom: 8px;">Daily Log Reminder</h2>
      <p>No log yet for <strong>${childName}</strong> in the last 24 hours.</p>
      <p>Open CaptureEase to add a quick note.</p>
    </div>
  `;
  const text = `Daily Log Reminder\n\nNo log yet for ${childName} in the last 24 hours.\nOpen CaptureEase to add a quick note.`;

  return sgMail.send({
    to,
    from: { email: fromEmail, name: senderName },
    subject,
    text,
    html
  });
};

const buildReminderMessage = (childName) =>
  `Quick reminder: no log yet for ${childName} today. Reply with a quick note to keep the timeline up to date.`;

const dailyLogReminders = onSchedule(
  {
    schedule: "every 60 minutes",
    timeZone: "UTC",
    secrets: [
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_SMS_FROM,
      SENDGRID_API_KEY,
      FROM_EMAIL,
      SENDER_NAME
    ]
  },
  async () => {
    const db = admin.firestore();
    const now = new Date();

    const childrenSnap = await db
      .collection("children")
      .where("settings.notifications.dailyLogReminderEnabled", "==", true)
      .get();

    if (childrenSnap.empty) {
      logger.info("No children with daily log reminders enabled.");
      return;
    }

    const since = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const tasks = childrenSnap.docs.map(async (childDoc) => {
      const childData = childDoc.data();
      const notifications = childData.settings?.notifications || {};
      const timeZone = notifications.dailyLogReminderTimezone || "UTC";
      const timeString = notifications.dailyLogReminderTime || "19:00";
      const lastSentKey = notifications.dailyLogReminderLastSent || null;
      const channel = notifications.dailyLogReminderChannel || "sms";
      const nowParts = getLocalTimeParts(now, timeZone);

      if (!shouldSendNow({ timeString, nowParts, lastSentKey })) {
        return null;
      }

      const recentLogsSnap = await db
        .collection("logs")
        .where("childId", "==", childDoc.id)
        .where("createdAt", ">=", since)
        .limit(1)
        .get();

      if (!recentLogsSnap.empty) {
        return null;
      }

      const ownerId = childData.users?.care_owner;
      if (!ownerId) {
        logger.warn("Daily reminder skipped: missing care owner", {
          childId: childDoc.id
        });
        return null;
      }

      const ownerDoc = await db.collection("users").doc(ownerId).get();
      const ownerData = ownerDoc.data() || {};

      const shouldSendSms = channel.includes("sms");
      const shouldSendEmail = channel.includes("email");

      if (shouldSendSms) {
        if (!ownerData.phone || ownerData.phoneVerified !== true) {
          logger.warn("Daily reminder SMS skipped: phone not verified", {
            childId: childDoc.id,
            ownerId
          });
        } else if (notifications.smsEnabled === false) {
          logger.info("Daily reminder SMS skipped: SMS disabled for child", {
            childId: childDoc.id
          });
        } else {
          await sendSms({
            to: ownerData.phone,
            message: buildReminderMessage(childData.name || "your child")
          });
        }
      }

      if (shouldSendEmail) {
        if (!ownerData.email) {
          logger.warn("Daily reminder email skipped: missing email", {
            childId: childDoc.id,
            ownerId
          });
        } else {
          await sendEmail({
            to: ownerData.email,
            childName: childData.name || "your child",
            subject: "CaptureEase daily log reminder"
          });
        }
      }

      await childDoc.ref.update({
        "settings.notifications.dailyLogReminderLastSent": nowParts.dateKey,
        "settings.notifications.dailyLogReminderLastSentAt":
          admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info("Daily reminder sent", {
        childId: childDoc.id,
        ownerId,
        channels: channel,
        dateKey: nowParts.dateKey
      });

      return true;
    });

    await Promise.all(tasks);
  }
);

module.exports = {
  dailyLogReminders
};

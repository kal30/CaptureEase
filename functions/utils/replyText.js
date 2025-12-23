/**
 * Shared reply text helpers for SMS/WhatsApp flows.
 */

const replyText = {
  missingFromOrBody: "Missing From or Body",
  missingChildName:
    `I couldn't find a child name at the start. Try "Arjun: …" or send "children?" to see options.`,
  childNotFound: "Child not found. Please contact support.",
  errorProcessing: "Error processing message. Please try again.",
  confirmChildName: (childName) =>
    `Did you mean ${childName}? Reply YES to confirm or resend with the correct name.`,
  cannotLogFromNumber: (childName) =>
    `I can't log for ${childName} from this number. Reply children? to see who you can log for.`,
  loggedFor: (childName, mediaInfo = "") =>
    `Logged for ${childName} ✅${mediaInfo}`,
  smsDisabled: (childName) =>
    `SMS is disabled for ${childName}. Enable it in Settings.`,
  noAccess: (childName) =>
    `You don't have access to ${childName}. Ask the care owner.`
};

module.exports = {
  replyText
};

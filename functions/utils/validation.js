/**
 * Validate E.164 phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid E.164 format
 */
const validateE164Phone = (phone) => {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
};

/**
 * Validate log type
 * @param {string} type - Log type to validate
 * @returns {boolean} True if valid log type
 */
const validateLogType = (type) => {
  const validTypes = [
    "incident",
    "medication",
    "sleep",
    "feeding",
    "behavior",
    "milestone",
    "note",
  ];
  return validTypes.includes(type);
};

/**
 * Validate log source
 * @param {string} source - Log source to validate
 * @returns {boolean} True if valid source
 */
const validateLogSource = (source) => {
  const validSources = ["app", "sms", "whatsapp", "alexa", "ivr"];
  return validSources.includes(source);
};

/**
 * Validate severity level
 * @param {string} severity - Severity level to validate
 * @returns {boolean} True if valid severity
 */
const validateSeverity = (severity) => {
  const validSeverities = ["low", "medium", "high", "critical"];
  return validSeverities.includes(severity);
};

/**
 * Validate role type
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid role
 */
const validateRole = (role) => {
  const validRoles = ["care_partner", "caregiver", "therapist"];
  return validRoles.includes(role);
};

module.exports = {
  validateE164Phone,
  validateLogType,
  validateLogSource,
  validateSeverity,
  validateRole
};
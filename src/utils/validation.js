// Email validation utility functions

/**
 * Validates an email address using RFC 5322 compliant regex
 * @param {string} email - The email address to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  // Comprehensive email regex based on RFC 5322
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email address is required' };
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long (max 254 characters)' };
  }
  
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  // Additional checks
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Email must contain exactly one @ symbol' };
  }
  
  const [localPart, domain] = parts;
  
  if (localPart.length > 64) {
    return { isValid: false, error: 'Email local part is too long (max 64 characters)' };
  }
  
  if (domain.length > 253) {
    return { isValid: false, error: 'Email domain is too long (max 253 characters)' };
  }
  
  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return { isValid: false, error: 'Email cannot contain consecutive dots' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates multiple email addresses
 * @param {string[]} emails - Array of email addresses to validate
 * @returns {object} - { allValid: boolean, errors: object }
 */
export const validateEmails = (emails) => {
  const errors = {};
  let allValid = true;
  
  emails.forEach((email, index) => {
    const validation = validateEmail(email);
    if (!validation.isValid) {
      errors[index] = validation.error;
      allValid = false;
    }
  });
  
  return { allValid, errors };
};

/**
 * Normalizes an email address (trims whitespace and converts to lowercase)
 * @param {string} email - The email address to normalize
 * @returns {string} - The normalized email address
 */
export const normalizeEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Checks if an email domain is from a common disposable email provider
 * @param {string} email - The email address to check
 * @returns {boolean} - True if it's likely a disposable email
 */
export const isDisposableEmail = (email) => {
  const disposableDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'throwaway.email'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
};
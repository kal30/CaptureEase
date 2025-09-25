// Date Utilities
// Helper functions for date formatting and manipulation

/**
 * Formats a timestamp as "time ago" text
 * @param {Date|string|number} timestamp - The timestamp to format
 * @returns {string} Human-readable time ago string
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return '';
  }

  // Less than a minute ago
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than an hour ago
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  // Less than a day ago
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  // Less than a week ago
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  // More than a week ago - show actual date
  const options = {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
  };
  
  return date.toLocaleDateString(undefined, options);
};

/**
 * Formats a timestamp for message display
 * @param {Date|string|number} timestamp - The timestamp to format
 * @param {boolean} includeDate - Whether to include the date
 * @returns {string} Formatted time string
 */
export const formatMessageTime = (timestamp, includeDate = false) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === new Date(now.getTime() - 86400000).toDateString();
  
  const timeString = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (!includeDate || isToday) {
    return timeString;
  }

  if (isYesterday) {
    return `Yesterday ${timeString}`;
  }

  const dateString = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
  });

  return `${dateString} ${timeString}`;
};

/**
 * Checks if two dates are on the same day
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {boolean} True if dates are on the same day
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.toDateString() === d2.toDateString();
};

/**
 * Gets a human-readable date group label for message threading
 * @param {Date|string|number} timestamp - The timestamp
 * @returns {string} Date group label (e.g., "Today", "Yesterday", "March 15")
 */
export const getDateGroupLabel = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === new Date(now.getTime() - 86400000).toDateString();
  
  if (isToday) {
    return 'Today';
  }
  
  if (isYesterday) {
    return 'Yesterday';
  }

  // Within the last week
  const diffInDays = Math.floor((now - date) / 86400000);
  if (diffInDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }

  // Older than a week
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
  });
};

/**
 * Checks if a timestamp needs a new date separator
 * @param {Date|string|number} currentTimestamp - Current message timestamp
 * @param {Date|string|number} previousTimestamp - Previous message timestamp
 * @returns {boolean} True if a date separator should be shown
 */
export const needsDateSeparator = (currentTimestamp, previousTimestamp) => {
  if (!currentTimestamp) return false;
  if (!previousTimestamp) return true;

  return !isSameDay(currentTimestamp, previousTimestamp);
};

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date as string (YYYY-MM-DD) or Date object
 * @returns {number|null} Age in years, or null if birthDate is invalid
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;

  try {
    const birth = new Date(birthDate);
    const today = new Date();

    // Check if birth date is valid
    if (isNaN(birth.getTime())) return null;

    // Calculate age
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch (error) {
    console.warn('Error calculating age:', error);
    return null;
  }
};

/**
 * Get display age for a child
 * Prioritizes calculated age from birthDate, falls back to stored age
 * @param {Object} child - Child object with age and/or birthDate
 * @returns {number|null} Age to display, or null if no valid age found
 */
export const getChildAge = (child) => {
  // First try to calculate from birthDate
  if (child.birthDate) {
    const calculatedAge = calculateAge(child.birthDate);
    if (calculatedAge !== null) {
      return calculatedAge;
    }
  }

  // Fall back to stored age field
  if (child.age !== undefined && child.age !== null) {
    const numericAge = typeof child.age === 'string' ? parseInt(child.age, 10) : child.age;
    return !isNaN(numericAge) && numericAge >= 0 ? numericAge : null;
  }

  return null;
};

/**
 * Format age for display
 * @param {number|null} age - Age in years
 * @returns {string} Formatted age string
 */
export const formatAge = (age) => {
  if (age === null || age === undefined) {
    return 'Unknown';
  }

  return `${age}`;
};
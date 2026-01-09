/**
 * Medication Frequency Utilities
 * Smart management of frequency based on scheduled times
 */

// Frequency presets with default times
export const FREQUENCY_PRESETS = {
  'as needed': [],
  'once daily': ['08:00'],
  'twice daily': ['08:00', '20:00'],
  'three times daily': ['08:00', '13:00', '20:00'],
  'four times daily': ['08:00', '12:00', '16:00', '20:00'],
  'every 12 hours': ['08:00', '20:00'],
  'every 8 hours': ['08:00', '16:00', '00:00'],
  'every 6 hours': ['06:00', '12:00', '18:00', '00:00'],
};

/**
 * Get frequency string based on number of scheduled times
 * @param {number} timeCount - Number of scheduled times
 * @returns {string} - Frequency string
 */
export const getFrequencyFromTimeCount = (timeCount) => {
  switch (timeCount) {
    case 0:
      return 'as needed';
    case 1:
      return 'once daily';
    case 2:
      return 'twice daily';
    case 3:
      return 'three times daily';
    case 4:
      return 'four times daily';
    default:
      return `${timeCount} times daily`;
  }
};

/**
 * Get default times for a frequency preset
 * @param {string} frequency - Frequency preset
 * @returns {Array<string>} - Array of time strings
 */
export const getDefaultTimesForFrequency = (frequency) => {
  return FREQUENCY_PRESETS[frequency] || ['08:00'];
};

/**
 * Get all available frequency options
 * @returns {Array<string>} - Array of frequency strings
 */
export const getFrequencyOptions = () => {
  return Object.keys(FREQUENCY_PRESETS);
};

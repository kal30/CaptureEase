// Configuration for Daily Care actions
export const getDailyCareConfig = (actionType, child) => {
  const configs = {
    mood: {
      title: 'Detailed Mood Check',
      icon: '😊',
      description: `Comprehensive mood tracking for ${child?.name}`,
      fields: [
        {
          key: 'moodLevel',
          label: 'Current Mood',
          description: 'Rate their overall emotional state',
          type: 'scale',
          min: 1,
          max: 5,
          labels: ['😢 Very upset', '😕 Upset', '😐 Neutral', '🙂 Happy', '😊 Very happy'],
          required: true,
          defaultValue: 3,
        },
        {
          key: 'moodTags',
          label: 'What describes their mood?',
          description: 'Select all that apply',
          type: 'chips',
          multiple: true,
          options: [
            { label: 'Calm', value: 'calm', emoji: '😌' },
            { label: 'Excited', value: 'excited', emoji: '🤩' },
            { label: 'Frustrated', value: 'frustrated', emoji: '😤' },
            { label: 'Anxious', value: 'anxious', emoji: '😰' },
            { label: 'Content', value: 'content', emoji: '😊' },
            { label: 'Irritable', value: 'irritable', emoji: '😠' },
          ],
          required: false,
        },
        {
          key: 'notes',
          label: 'Additional Notes',
          description: 'Any specific observations or context?',
          type: 'text',
          multiline: true,
          rows: 3,
          placeholder: 'e.g., Had a great morning, seems tired after lunch...',
          required: false,
        }
      ]
    },

    energy: {
      title: 'Detailed Energy Level',
      icon: '⚡',
      description: `Comprehensive energy tracking for ${child?.name}`,
      fields: [
        {
          key: 'energyLevel',
          label: 'Overall Energy Level',
          description: 'How energetic are they today?',
          type: 'scale',
          min: 1,
          max: 5,
          labels: ['😴 Very low', '😑 Low', '😐 Normal', '😊 High', '⚡ Very high'],
          required: true,
          defaultValue: 3,
        },
        {
          key: 'energyPattern',
          label: 'Energy Pattern',
          description: 'How has their energy changed throughout the day?',
          type: 'chips',
          options: [
            { label: 'Steady all day', value: 'steady', emoji: '📈' },
            { label: 'High in morning', value: 'morning_high', emoji: '🌅' },
            { label: 'Crash after lunch', value: 'afternoon_crash', emoji: '😴' },
            { label: 'Second wind evening', value: 'evening_boost', emoji: '🌙' },
            { label: 'Up and down', value: 'fluctuating', emoji: '📊' },
          ],
          required: false,
        },
        {
          key: 'activities',
          label: 'Main Activities Today',
          description: 'What did they spend most time doing?',
          type: 'chips',
          multiple: true,
          options: [
            { label: 'Physical play', value: 'physical_play', emoji: '🏃' },
            { label: 'Screen time', value: 'screen_time', emoji: '📱' },
            { label: 'Creative activities', value: 'creative', emoji: '🎨' },
            { label: 'Outdoor activities', value: 'outdoor', emoji: '🌳' },
            { label: 'Quiet activities', value: 'quiet', emoji: '📚' },
            { label: 'Social interaction', value: 'social', emoji: '👥' },
          ],
          required: false,
        }
      ]
    },

    food_health: {
      title: 'Food & Medicine',
      icon: '🍎',
      description: `Track ${child?.name}'s nutrition and health`,
      fields: [
        {
          key: 'mealsEaten',
          label: 'Meals & Snacks Today',
          description: 'What did they eat?',
          type: 'chips',
          multiple: true,
          options: [
            { label: 'Breakfast', value: 'breakfast', emoji: '🥞' },
            { label: 'Lunch', value: 'lunch', emoji: '🍽️' },
            { label: 'Dinner', value: 'dinner', emoji: '🍝' },
            { label: 'Morning snack', value: 'morning_snack', emoji: '🍎' },
            { label: 'Afternoon snack', value: 'afternoon_snack', emoji: '🥨' },
            { label: 'Evening snack', value: 'evening_snack', emoji: '🍪' },
          ],
          required: true,
        },
        {
          key: 'appetite',
          label: 'Appetite Level',
          description: 'How was their appetite today?',
          type: 'scale',
          min: 1,
          max: 5,
          labels: ['🚫 No appetite', '😕 Poor', '😐 Normal', '🙂 Good', '😋 Excellent'],
          required: true,
          defaultValue: 3,
        },
        {
          key: 'foodChallenges',
          label: 'Any eating challenges?',
          type: 'chips',
          multiple: true,
          options: [
            { label: 'Refused meals', value: 'meal_refusal', emoji: '🙅' },
            { label: 'Picky eating', value: 'picky_eating', emoji: '🤨' },
            { label: 'Sensory issues', value: 'sensory_issues', emoji: '👂' },
            { label: 'Digestive issues', value: 'digestive_issues', emoji: '🤢' },
            { label: 'No issues', value: 'none', emoji: '✅' },
          ],
          required: false,
        },
        {
          key: 'medicationsTaken',
          label: 'Medications Today',
          description: 'Were medications taken as scheduled?',
          type: 'chips',
          multiple: true,
          options: [
            { label: 'Morning meds', value: 'morning_meds', emoji: '🌅' },
            { label: 'Afternoon meds', value: 'afternoon_meds', emoji: '☀️' },
            { label: 'Evening meds', value: 'evening_meds', emoji: '🌙' },
            { label: 'As needed meds', value: 'prn_meds', emoji: '💊' },
            { label: 'No medications', value: 'none', emoji: '➖' },
          ],
          required: false,
        }
      ]
    },

    safety: {
      title: 'Safety Check',
      icon: '🛡️',
      description: `Safety check for ${child?.name}`,
      fields: [
        {
          key: 'safetyStatus',
          label: 'Overall Safety Status',
          description: 'Any safety concerns today?',
          type: 'chips',
          options: [
            { label: 'All good', value: 'all_good', emoji: '✅' },
            { label: 'Minor incident', value: 'minor_incident', emoji: '⚠️' },
            { label: 'Needs attention', value: 'needs_attention', emoji: '🔴' },
          ],
          required: true,
        },
        {
          key: 'incidentType',
          label: 'Type of Incident (if any)',
          type: 'chips',
          multiple: true,
          options: [
            { label: 'Minor injury', value: 'minor_injury', emoji: '🩹' },
            { label: 'Behavioral concern', value: 'behavioral_concern', emoji: '⚠️' },
            { label: 'Environmental hazard', value: 'environmental_hazard', emoji: '🚧' },
            { label: 'Medication error', value: 'medication_error', emoji: '💊' },
            { label: 'Other', value: 'other', emoji: '❓' },
          ],
          required: false,
        },
        {
          key: 'incidentDetails',
          label: 'Incident Details',
          description: 'Describe what happened and actions taken',
          type: 'text',
          multiline: true,
          rows: 4,
          placeholder: 'Describe the incident, response taken, and any follow-up needed...',
          required: false,
        },
        {
          key: 'followUpNeeded',
          label: 'Follow-up Required?',
          type: 'chips',
          options: [
            { label: 'No follow-up needed', value: 'none', emoji: '✅' },
            { label: 'Monitor closely', value: 'monitor', emoji: '👁️' },
            { label: 'Contact healthcare provider', value: 'contact_healthcare', emoji: '🏥' },
            { label: 'Update safety plan', value: 'update_safety_plan', emoji: '📋' },
          ],
          required: false,
        }
      ]
    }
  };

  return configs[actionType] || null;
};

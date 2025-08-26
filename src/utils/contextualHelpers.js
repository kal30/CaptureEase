// Smart context-aware suggestions for parents

export const getContextualActions = (child, timeOfDay, userRole, recentEntries) => {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const hasEntryToday = recentEntries.some(entry => 
    new Date(entry.timestamp).toDateString() === new Date().toDateString()
  );

  // Parent daily flow
  if (userRole === 'parent') {
    // Morning routine (6am - 11am)
    if (hour >= 6 && hour < 11) {
      return {
        primary: {
          action: 'dailyCheckIn',
          label: 'Morning Check-in',
          subtitle: 'How did they sleep? Mood?',
          icon: '🌅',
          urgent: !hasEntryToday
        },
        secondary: [
          { action: 'medicationReminder', label: 'Medication Log', condition: child.hasMedications },
          { action: 'breakfastLog', label: 'Breakfast Notes', condition: true }
        ]
      };
    }

    // Afternoon (11am - 5pm)
    if (hour >= 11 && hour < 17) {
      return {
        primary: {
          action: 'quickNote',
          label: 'Quick Update',
          subtitle: 'Anything noteworthy happening?',
          icon: '📝',
          urgent: false
        },
        secondary: [
          { action: 'behaviorLog', label: 'Behavior Note', condition: true },
          { action: 'therapySession', label: 'Therapy Session', condition: dayOfWeek >= 1 && dayOfWeek <= 5 }
        ]
      };
    }

    // Evening (5pm - 10pm)
    if (hour >= 17 && hour < 22) {
      return {
        primary: {
          action: 'endOfDayReview',
          label: 'End of Day Review',
          subtitle: 'How was today overall?',
          icon: '🌙',
          urgent: !hasEntryToday
        },
        secondary: [
          { action: 'dinnerLog', label: 'Dinner & Evening', condition: true },
          { action: 'bedtimeRoutine', label: 'Bedtime Routine', condition: true }
        ]
      };
    }

    // Default
    return {
      primary: {
        action: 'dailyCheckIn',
        label: 'Daily Check-in',
        subtitle: `Quick update for ${child.name}`,
        icon: '📋',
        urgent: !hasEntryToday
      },
      secondary: [
        { action: 'viewTimeline', label: 'View Timeline', condition: true },
        { action: 'detailedEntry', label: 'Detailed Entry', condition: true }
      ]
    };
  }

  // Therapist flow
  if (userRole === 'therapist') {
    return {
      primary: {
        action: 'sessionNotes',
        label: 'Session Notes',
        subtitle: 'Document today\'s session',
        icon: '👩‍⚕️',
        urgent: true
      },
      secondary: [
        { action: 'progressUpdate', label: 'Progress Update', condition: true },
        { action: 'parentCommunication', label: 'Message Parent', condition: true }
      ]
    };
  }

  // Default parent flow
  return {
    primary: {
      action: 'dailyCheckIn',
      label: 'Daily Check-in',
      subtitle: 'Quick daily update',
      icon: '📝',
      urgent: !hasEntryToday
    },
    secondary: []
  };
};

export const getSmartSuggestions = (child, recentPatterns) => {
  const suggestions = [];

  // If child usually has mood dips on certain days
  if (recentPatterns.moodDips?.includes(new Date().getDay())) {
    suggestions.push({
      type: 'mood',
      message: `${child.name} sometimes has mood challenges on ${new Date().toLocaleDateString('en', { weekday: 'long' })}s. Extra attention today?`,
      action: 'moodCheck'
    });
  }

  // If therapy day
  if (recentPatterns.therapyDays?.includes(new Date().getDay())) {
    suggestions.push({
      type: 'therapy',
      message: 'Therapy day! Document any specific goals or observations.',
      action: 'preTherapyNote'
    });
  }

  // If medication time
  const hour = new Date().getHours();
  if (recentPatterns.medicationTimes?.includes(hour)) {
    suggestions.push({
      type: 'medication',
      message: 'Medication reminder time',
      action: 'medicationLog'
    });
  }

  return suggestions;
};

export const getQuickEntryTemplate = (timeOfDay, child) => {
  const templates = {
    morning: {
      mood: null,
      prompts: [
        'How did they sleep?',
        'Morning mood?',
        'Any challenges getting ready?'
      ],
      quickTags: ['Great sleep', 'Rough night', 'Happy morning', 'Difficult start']
    },
    afternoon: {
      mood: null,
      prompts: [
        'How\'s the day going?',
        'Any notable behaviors?',
        'Energy level?'
      ],
      quickTags: ['Active', 'Tired', 'Focused', 'Restless', 'Happy', 'Frustrated']
    },
    evening: {
      mood: null,
      prompts: [
        'How was today overall?',
        'Any highlights?',
        'How was dinner/bedtime?'
      ],
      quickTags: ['Great day', 'Challenging day', 'Mixed day', 'Proud moments', 'Concerns']
    }
  };

  const hour = new Date().getHours();
  if (hour < 11) return templates.morning;
  if (hour < 17) return templates.afternoon;
  return templates.evening;
};
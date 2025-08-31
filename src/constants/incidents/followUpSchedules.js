// Smart Follow-up Timing Configuration (pure data)
export const FOLLOW_UP_SCHEDULES = {
  pain_medical: {
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [30, 120, 360];
      if (severity >= 5) return [60, 240];
      return [120];
    },
    getDescription: (severity) =>
      severity >= 8 ? 'severe pain' : severity >= 5 ? 'moderate pain' : 'mild pain',
  },

  mood: {
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [45, 180];
      if (severity >= 5) return [90, 360];
      return [180];
    },
    getDescription: (severity) =>
      severity >= 8 ? 'emotional crisis' : severity >= 5 ? 'distress' : 'mood dip',
  },

  behavioral: {
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [30, 120, 480];
      if (severity >= 5) return [60, 240];
      return [120];
    },
    getDescription: (severity) =>
      severity >= 8 ? 'dangerous behavior' : severity >= 5 ? 'disruptive behavior' : 'minor behavior issue',
  },

  sleep: {
    getSchedule: (severity, remedy) => {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= 19 || currentHour <= 6) {
        return [480, 1200];
      }
      return [240];
    },
    getDescription: () => 'sleep difficulty',
  },

  eating_nutrition: {
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [60, 180, 360];
      if (severity >= 5) return [120, 360];
      return [240];
    },
    getDescription: (severity) =>
      severity >= 8 ? 'severe eating difficulty' : severity >= 5 ? 'eating resistance' : 'mild pickiness',
  },

  sensory: {
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [30, 90, 240];
      if (severity >= 5) return [60, 180];
      return [120];
    },
    getDescription: (severity) =>
      severity >= 8 ? 'sensory crisis' : severity >= 5 ? 'sensory overload' : 'sensory sensitivity',
  },

  other: {
    getSchedule: (severity, remedy) => {
      if (severity >= 8) return [60, 180, 480];
      if (severity >= 5) return [120, 360];
      return [180];
    },
    getDescription: (severity) =>
      severity >= 8 ? 'severe incident' : severity >= 5 ? 'moderate incident' : 'mild incident',
  },
};


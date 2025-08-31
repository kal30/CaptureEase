// Incident types with their configurations
// Kept here to reduce size of incidentService and enable reuse

export const INCIDENT_TYPES = {
  EATING_NUTRITION: {
    id: "eating_nutrition",
    label: "Eating & Nutrition",
    color: "#10B981", // Emerald
    emoji: "🍎",
    remedies: [
      "Offered preferred food",
      "Changed texture/temperature",
      "Used different utensil",
      "Made mealtime fun",
      "Reduced distractions",
      "Offered smaller portions",
      "Tried new presentation",
      "Consulted nutritionist",
      "Other",
    ],
  },
  MOOD: {
    id: "mood",
    label: "Mood",
    color: "#F59E0B", // Amber
    emoji: "🙂",
    remedies: [
      "Provided comfort",
      "Changed environment",
      "Offered favorite activity",
      "Used calming music",
      "Applied breathing techniques",
      "Gave physical affection",
      "Talked through feelings",
      "Used distraction",
      "Other",
    ],
  },
  SLEEP: {
    id: "sleep",
    label: "Sleep",
    color: "#8B5CF6", // Violet
    emoji: "😴",
    remedies: [
      "Adjusted room temperature",
      "Used white noise",
      "Changed bedding",
      "Applied bedtime routine",
      "Reduced screen time",
      "Used weighted blanket",
      "Darkened room",
      "Offered comfort item",
      "Other",
    ],
  },
  BEHAVIORAL: {
    id: "behavioral",
    label: "Behavioral",
    color: "#EF4444", // Red
    emoji: "⚡",
    remedies: [
      "Redirect to preferred activity",
      "Provide sensory break",
      "Use visual schedule",
      "Offer choices",
      "Deep breathing exercises",
      "Remove triggers",
      "One-on-one attention",
      "Calm down area",
      "Other",
    ],
  },
  SENSORY: {
    id: "sensory",
    label: "Sensory",
    color: "#3B82F6", // Blue
    emoji: "🧩",
    remedies: [
      "Noise-canceling headphones",
      "Weighted blanket",
      "Fidget toy",
      "Dim lighting",
      "Quiet space",
      "Sensory bin activity",
      "Deep pressure input",
      "Movement break",
      "Other",
    ],
  },
  PAIN_MEDICAL: {
    id: "pain_medical",
    label: "Pain & Medical",
    color: "#EC4899", // Pink
    emoji: "🏥",
    remedies: [
      "Applied ice pack",
      "Applied heat pad",
      "Gave pain medication",
      "Contacted doctor",
      "Rest and comfort",
      "Gentle massage",
      "Changed position",
      "Distraction activity",
      "Other",
    ],
  },
  OTHER: {
    id: "other",
    label: "Other",
    color: "#6B7280", // Gray
    emoji: "📝",
    remedies: [], // Dynamic remedies based on custom incident name
  },
};


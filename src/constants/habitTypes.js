// Daily Habit Types and their scale configurations
import MoodIcon from "@mui/icons-material/Mood";
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EditIcon from "@mui/icons-material/Edit";
import BookIcon from "@mui/icons-material/Book";

export const HABIT_TYPES = {
  MOOD: {
    id: "mood",
    label: "Mood",
    description: "How are they feeling?",
    color: "#E91E63",
    icon: MoodIcon, // changed
    sliderLabel: "Mood Level",
  },
  SLEEP: {
    id: "sleep",
    label: "Sleep",
    description: "How long and well did they sleep?",
    color: "#673AB7",
    icon: HotelIcon,
    sliderLabel: "Sleep Quality",
  },
  NUTRITION: {
    id: "nutrition",
    label: "Nutrition",
    description: "What and how much did they eat?",
    color: "#4CAF50",
    icon: RestaurantIcon,
    sliderLabel: "Nutrition Level",
  },
  PROGRESS: {
    id: "progress",
    label: "Progress Notes",
    description: "A positive or developmental note",
    color: "#2196F3",
    icon: TrendingUpIcon,
    sliderLabel: "Progress/Development",
  },
  QUICK_NOTES: {
    id: "quick_notes",
    label: "Quick Notes",
    description: "Brief daily observations and thoughts",
    color: "#2ff3e0",
    icon: BookIcon,
    isTextInput: true // Special flag to show text input instead of slider
  },
  OTHER: {
    id: "other",
    label: "Other",
    description: "Custom habit tracking",
    color: "#FF9800",
    icon: EditIcon,
    sliderLabel: "Custom Level",
  },
};

// Mood scale (1-10)
export const MOOD_SCALE = {
  1: {
    label: "Very Upset",
    color: "#D32F2F",
    description: "Extremely distressed, inconsolable",
  },
  2: {
    label: "Upset",
    color: "#F44336",
    description: "Very sad, crying frequently",
  },
  3: {
    label: "Down",
    color: "#FF5722",
    description: "Noticeably sad or withdrawn",
  },
  4: {
    label: "Below Average",
    color: "#FF9800",
    description: "Slightly low mood, less engaged",
  },
  5: {
    label: "Neutral",
    color: "#FFC107",
    description: "Balanced mood, neither happy nor sad",
  },
  6: {
    label: "Content",
    color: "#CDDC39",
    description: "Generally positive, peaceful",
  },
  7: {
    label: "Good",
    color: "#8BC34A",
    description: "Happy and engaged",
  },
  8: {
    label: "Very Good",
    color: "#4CAF50",
    description: "Very happy, active participation",
  },
  9: {
    label: "Excellent",
    color: "#2E7D32",
    description: "Joyful, enthusiastic, laughing",
  },
  10: {
    label: "Amazing",
    color: "#1B5E20",
    description: "Exceptionally happy, radiant mood",
  },
};

// Sleep Quality scale (1-10)
export const SLEEP_SCALE = {
  1: {
    label: "Terrible",
    color: "#D32F2F",
    description: "No sleep, night terrors, constant waking",
  },
  2: {
    label: "Very Poor",
    color: "#F44336",
    description: "1-3 hours, very restless, multiple wake-ups",
  },
  3: {
    label: "Poor",
    color: "#FF5722",
    description: "3-4 hours, frequent interruptions",
  },
  4: {
    label: "Below Average",
    color: "#FF9800",
    description: "4-5 hours, some restlessness",
  },
  5: {
    label: "Fair",
    color: "#FFC107",
    description: "5-6 hours, moderate quality",
  },
  6: {
    label: "Decent",
    color: "#CDDC39",
    description: "6-7 hours, mostly uninterrupted",
  },
  7: {
    label: "Good",
    color: "#8BC34A",
    description: "7-8 hours, good quality sleep",
  },
  8: {
    label: "Very Good",
    color: "#4CAF50",
    description: "8-9 hours, deep restful sleep",
  },
  9: {
    label: "Excellent",
    color: "#2E7D32",
    description: "9+ hours, perfect sleep, woke refreshed",
  },
  10: {
    label: "Perfect",
    color: "#1B5E20",
    description: "Full night, deep sleep, energized wake-up",
  },
};

// Nutrition scale (1-10)
export const NUTRITION_SCALE = {
  1: {
    label: "Refused All",
    color: "#D32F2F",
    description: "Refused all food and drink",
  },
  2: {
    label: "Almost Nothing",
    color: "#F44336",
    description: "Few sips/bites only",
  },
  3: {
    label: "Very Little",
    color: "#FF5722",
    description: "Minimal intake, concerning",
  },
  4: {
    label: "Below Needs",
    color: "#FF9800",
    description: "Less than nutritional needs",
  },
  5: {
    label: "Some Food",
    color: "#FFC107",
    description: "Some nutrition but incomplete",
  },
  6: {
    label: "Adequate",
    color: "#CDDC39",
    description: "Met basic nutritional needs",
  },
  7: {
    label: "Good Intake",
    color: "#8BC34A",
    description: "Good variety and quantity",
  },
  8: {
    label: "Very Good",
    color: "#4CAF50",
    description: "Excellent nutrition, tried new foods",
  },
  9: {
    label: "Excellent",
    color: "#2E7D32",
    description: "Perfect intake, enjoyed meals",
  },
  10: {
    label: "Outstanding",
    color: "#1B5E20",
    description: "Exceptional nutrition, adventurous eating",
  },
};

// Progress/Development scale (1-10)
export const PROGRESS_SCALE = {
  1: {
    label: "Regression",
    color: "#D32F2F",
    description: "Noticeable step backward in skills",
  },
  2: {
    label: "Struggling",
    color: "#F44336",
    description: "Having difficulty with usual tasks",
  },
  3: {
    label: "Slow Progress",
    color: "#FF5722",
    description: "Very gradual improvement",
  },
  4: {
    label: "Minimal Progress",
    color: "#FF9800",
    description: "Small steps forward",
  },
  5: {
    label: "Steady",
    color: "#FFC107",
    description: "Consistent, expected progress",
  },
  6: {
    label: "Good Progress",
    color: "#CDDC39",
    description: "Notable improvement in skills",
  },
  7: {
    label: "Great Progress",
    color: "#8BC34A",
    description: "Significant development milestone",
  },
  8: {
    label: "Excellent",
    color: "#4CAF50",
    description: "Major breakthrough or achievement",
  },
  9: {
    label: "Outstanding",
    color: "#2E7D32",
    description: "Exceptional developmental leap",
  },
  10: {
    label: "Breakthrough",
    color: "#1B5E20",
    description: "Remarkable milestone, exceeded expectations",
  },
};


// Quick Notes Quality scale (1-10)
export const QUICK_NOTES_SCALE = {
  1: {
    label: "Brief Note",
    color: "#D32F2F",
    description: "Very short, minimal detail",
  },
  2: {
    label: "Short Entry",
    color: "#F44336", 
    description: "Basic observations, few details",
  },
  3: {
    label: "Basic Details",
    color: "#FF5722",
    description: "Some important events noted",
  },
  4: {
    label: "Good Detail",
    color: "#FF9800",
    description: "Several key moments captured",
  },
  5: {
    label: "Informative",
    color: "#FFC107",
    description: "Solid overview of the day",
  },
  6: {
    label: "Detailed",
    color: "#CDDC39",
    description: "Good insights and observations",
  },
  7: {
    label: "Comprehensive",
    color: "#8BC34A",
    description: "Rich detail, meaningful reflections",
  },
  8: {
    label: "Very Detailed",
    color: "#4CAF50",
    description: "Thorough notes, patterns noted",
  },
  9: {
    label: "Exceptional",
    color: "#2E7D32",
    description: "Deep insights, breakthrough observations",
  },
  10: {
    label: "Outstanding",
    color: "#1B5E20",
    description: "Profound reflections, exceptional detail",
  },
};

// Helper function to get scale for habit type
export const getHabitScale = (habitType) => {
  switch (habitType) {
    case "mood":
      return MOOD_SCALE;
    case "sleep":
      return SLEEP_SCALE;
    case "nutrition":
      return NUTRITION_SCALE;
    case "progress":
      return PROGRESS_SCALE;
    case "quick_notes":
      return QUICK_NOTES_SCALE;
    case "other":
    default:
      // For 'other', return a generic 1-10 scale that can be customized
      return {
        1: {
          label: "Very Low",
          color: "#D32F2F",
          description: "Minimal level",
        },
        2: { label: "Low", color: "#F44336", description: "Below average" },
        3: {
          label: "Below Average",
          color: "#FF5722",
          description: "Somewhat low",
        },
        4: { label: "Fair", color: "#FF9800", description: "Fair level" },
        5: { label: "Average", color: "#FFC107", description: "Average level" },
        6: { label: "Good", color: "#CDDC39", description: "Above average" },
        7: { label: "Very Good", color: "#8BC34A", description: "Good level" },
        8: { label: "Great", color: "#4CAF50", description: "Great level" },
        9: {
          label: "Excellent",
          color: "#2E7D32",
          description: "Excellent level",
        },
        10: {
          label: "Outstanding",
          color: "#1B5E20",
          description: "Outstanding level",
        },
      };
  }
};

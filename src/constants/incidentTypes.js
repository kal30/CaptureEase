import {
  Restaurant as RestaurantIcon,
  Mood as MoodIcon,
  Hotel as HotelIcon,
  Psychology as PsychologyIcon,
  Sensors as SensorsIcon,
  LocalHospital as LocalHospitalIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

export const INCIDENT_BASE_TYPES = {
  EATING_NUTRITION: {
    id: "eating_nutrition",
    label: "Eating & Nutrition",
    color: "#22c55e",
    icon: RestaurantIcon,
  },
  MOOD: {
    id: "mood",
    label: "Mood",
    color: "#f59e0b",
    icon: MoodIcon,
  },
  SLEEP: {
    id: "sleep",
    label: "Sleep",
    color: "#3b82f6",
    icon: HotelIcon,
  },
  BEHAVIORAL: {
    id: "behavioral",
    label: "Behavioral",
    color: "#ef4444",
    icon: PsychologyIcon,
  },
  SENSORY: {
    id: "sensory",
    label: "Sensory",
    color: "#8b5cf6",
    icon: SensorsIcon,
  },
  PAIN_MEDICAL: {
    id: "pain_medical",
    label: "Pain/Medical",
    color: "#dc2626",
    icon: LocalHospitalIcon,
  },
  OTHER: {
    id: "other",
    label: "Other",
    color: "#6b7280",
    icon: EditIcon,
  },
};

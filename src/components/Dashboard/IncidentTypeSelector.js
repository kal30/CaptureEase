import { Box, Button, Typography, Grid, Card } from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  Mood as MoodIcon,
  Hotel as HotelIcon,
  Psychology as PsychologyIcon,
  Sensors as SensorsIcon,
  LocalHospital as LocalHospitalIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { INCIDENT_TYPES } from "../../services/incidentService";

// Single source of truth for icons (kept local to avoid changing INCIDENT_TYPES for now)
const ICONS = {
  eating_nutrition: RestaurantIcon,
  mood: MoodIcon,
  sleep: HotelIcon,
  behavioral: PsychologyIcon, // if you later want a bolt icon, swap here
  sensory: SensorsIcon,
  pain_medical: LocalHospitalIcon,
  other: EditIcon,
};

// Fix the key mapping - use the object keys directly
const getIconForType = (key) => {
  const keyMap = {
    EATING_NUTRITION: "eating_nutrition",
    MOOD: "mood",
    SLEEP: "sleep",
    BEHAVIORAL: "behavioral",
    SENSORY: "sensory",
    PAIN_MEDICAL: "pain_medical",
    OTHER: "other",
  };
  const mappedKey = keyMap[key] || key.toLowerCase();
  return ICONS[mappedKey] || EditIcon;
};

const IncidentTypeSelector = ({ onTypeSelect, onClose }) => {
  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#fafbfc",
        minHeight: "100%",
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          textAlign: "center",
          mb: 4,
          color: "#1f2937",
          fontWeight: 600,
          letterSpacing: "-0.5px",
        }}
      >
        What type of incident occurred?
      </Typography>

      <Box
        sx={{
          maxWidth: 720,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr", // two cards per row
          gap: 2, // space between cards
          alignItems: "stretch",
        }}
      >
        {Object.entries(INCIDENT_TYPES).map(([key, incident]) => {
          const IconComponent = getIconForType(key);

          return (
            <Card
              key={key}
              elevation={0}
              sx={{
                width: "100%",
                height: 100,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                border: "1px solid #ccc",
                borderRadius: "12px",
                backgroundColor: "#fff",
                cursor: "pointer",
                px: 2,
                boxSizing: "border-box",
              }}
              onClick={() => onTypeSelect(key)}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  width: "100%",
                }}
              >
                <IconComponent sx={{ fontSize: "1.5rem" }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1f2937",
                  }}
                >
                  {incident.label}
                </Typography>
              </Box>
            </Card>
          );
        })}
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button
          variant="text"
          onClick={onClose}
          sx={{
            color: "#6b7280",
            px: 4,
            py: 1.5,
            fontSize: "0.9rem",
            fontWeight: 500,
            "&:hover": {
              bgcolor: "#f3f4f6",
              color: "#374151",
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default IncidentTypeSelector;

import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Card, Chip } from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  Mood as MoodIcon,
  Hotel as HotelIcon,
  Psychology as PsychologyIcon,
  Sensors as SensorsIcon,
  LocalHospital as LocalHospitalIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { INCIDENT_TYPES, getCustomCategories } from "../../services/incidentService";

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

const ICON_COLORS = {
  eating_nutrition: "#22c55e", // green
  mood: "#f59e0b", // amber
  sleep: "#3b82f6", // blue
  behavioral: "#ef4444", // red
  sensory: "#8b5cf6", // purple
  pain_medical: "#dc2626", // darker red
  other: "#6b7280", // gray
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

const IncidentTypeSelector = ({ onTypeSelect, onClose, childId }) => {
  const [customCategories, setCustomCategories] = useState({});

  useEffect(() => {
    const loadCustomCategories = async () => {
      if (!childId) {
        return;
      }
      
      try {
        console.log('📥 Loading custom categories for child:', childId);
        const categories = await getCustomCategories(childId);
        console.log('📋 Loaded categories:', categories);
        setCustomCategories(categories);
      } catch (error) {
        console.error('Error loading custom categories:', error);
      }
    };

    loadCustomCategories();
  }, [childId]);

  // Combine default and custom incident types
  const allIncidentTypes = {
    ...INCIDENT_TYPES,
    ...Object.fromEntries(
      Object.entries(customCategories).map(([key, category]) => [
        key,
        {
          id: category.id,
          label: category.label,
          color: category.color,
          emoji: category.emoji,
          remedies: category.remedies,
          isCustom: true
        }
      ])
    )
  };

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#fafbfc",
        minHeight: "100%",
      }}
    >
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
        {Object.entries(allIncidentTypes).map(([key, incident]) => {
          const IconComponent = incident.isCustom ? null : getIconForType(key);
          const mappedKey = key.toLowerCase();
          const iconColor = incident.isCustom ? incident.color : (ICON_COLORS[mappedKey] || "#6b7280");

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
                position: "relative",
              }}
              onClick={() => onTypeSelect(key)}
            >
              {incident.isCustom && (
                <Chip
                  label="Custom"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: incident.color,
                    color: "white",
                    fontSize: "0.6rem",
                    height: 18,
                  }}
                />
              )}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  width: "100%",
                }}
              >
                {incident.isCustom ? (
                  <Typography sx={{ fontSize: "1.5rem" }}>{incident.emoji}</Typography>
                ) : (
                  <IconComponent sx={{ fontSize: "1.5rem", color: iconColor }} />
                )}
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

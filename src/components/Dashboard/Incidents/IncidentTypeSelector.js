import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { INCIDENT_BASE_TYPES } from "../../../constants/incidentTypes";
import PillOptionCard from "../../UI/PillOptionCard";
import TwoColumnGrid from "../../UI/TwoColumnGrid";
import {
  INCIDENT_TYPES,
  getCustomCategories,
} from "../../../services/incidentService";

// Keys to hide from the selector (support both enum and lowercase keys)
const HIDDEN_TYPES = new Set([
  "EATING_NUTRITION",
  "MOOD",
  "SLEEP",
  "eating_nutrition",
  "mood",
  "sleep",
]);

const IncidentTypeSelector = ({ onTypeSelect, onClose, childId }) => {
  const [customCategories, setCustomCategories] = useState({});

  useEffect(() => {
    const loadCustomCategories = async () => {
      if (!childId) {
        return;
      }

      try {
        console.log("📥 Loading custom categories for child:", childId);
        const categories = await getCustomCategories(childId);
        console.log("📋 Loaded categories:", categories);
        setCustomCategories(categories);
      } catch (error) {
        console.error("Error loading custom categories:", error);
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
          isCustom: true,
        },
      ])
    ),
  };

  // Get base type info for icons and colors
  const getBaseTypeInfo = (key) => {
    return Object.values(INCIDENT_BASE_TYPES).find(
      (type) => type.id === key.toLowerCase()
    );
  };

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#fafbfc",
        minHeight: "100%",
      }}
    >
      <TwoColumnGrid sx={{ maxWidth: 720, mx: "auto" }}>
        {Object.entries(allIncidentTypes)
          .filter(
            ([key]) =>
              !HIDDEN_TYPES.has(key) && !HIDDEN_TYPES.has(key.toLowerCase())
          )
          .map(([key, incident]) => {
            const baseType = getBaseTypeInfo(key);
            const IconComponent = baseType?.icon;
            const color = incident.isCustom ? incident.color : baseType?.color;

            return (
              <PillOptionCard
                key={key}
                onClick={() => onTypeSelect(key)}
                icon={
                  incident.isCustom ? (
                    incident.emoji
                  ) : IconComponent ? (
                    <IconComponent />
                  ) : (
                    "📝"
                  )
                }
                label={incident.label}
                color={color}
                isCustom={incident.isCustom}
              />
            );
          })}
      </TwoColumnGrid>
    </Box>
  );
};

export default IncidentTypeSelector;

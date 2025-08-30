import React from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Button,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { HABIT_TYPES } from "../../constants/habitTypes";
import TwoColumnGrid from "../UI/TwoColumnGrid";
import PillOptionCard from "../UI/PillOptionCard";

const HabitCategorySelector = ({
  onCategorySelect,
  customHabits = [],
  childName = "child",
  onCancel,
}) => {
  const theme = useTheme();
  
  const handleCategoryClick = (habitType, customHabit = null) => {
    // All habits now use sliders - no special navigation behavior
    onCategorySelect({ ...habitType, customHabit });
  };
  const standardHabits = Object.values(HABIT_TYPES).filter(
    (h) => h.id !== "other"
  );

  return (
    <Box
      sx={{
        width: "100%",
        mx: 0,
        px: { xs: 2, sm: 3 },
        mt: 3,
        boxSizing: "border-box",
        overflowX: "hidden",
        pb: 3,
      }}
    >
      <TwoColumnGrid sx={{ mb: 4 }}>
        {standardHabits.map((habit) => (
          <PillOptionCard
            key={habit.id}
            onClick={() => handleCategoryClick(habit)}
            icon={<habit.icon sx={{ fontSize: 22, color: habit.color }} />}
            label={habit.label}
            color={habit.color}
          />
        ))}
        {/* Add Custom Habit option in the same grid */}
        <PillOptionCard
          onClick={() => handleCategoryClick(HABIT_TYPES.OTHER)}
          icon={
            <HABIT_TYPES.OTHER.icon
              sx={{ fontSize: 22, color: theme.palette.action.disabled }}
            />
          }
          label={"Custom Habit"}
          color={theme.palette.action.disabled}
        />
      </TwoColumnGrid>

      {customHabits.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Custom Habits for {childName}
          </Typography>
          <TwoColumnGrid sx={{ mb: 4 }}>
            {customHabits.map((ch) => (
              <PillOptionCard
                key={ch.id}
                onClick={() => handleCategoryClick(HABIT_TYPES.OTHER, ch)}
                icon={
                  ch.icon ? (
                    <ch.icon
                      sx={{ fontSize: 22, color: HABIT_TYPES.OTHER.color }}
                    />
                  ) : (
                    <HABIT_TYPES.OTHER.icon
                      sx={{ fontSize: 22, color: HABIT_TYPES.OTHER.color }}
                    />
                  )
                }
                label={ch.name}
                color={HABIT_TYPES.OTHER.color}
                chip={{ label: "Custom" }}
              />
            ))}
          </TwoColumnGrid>
        </>
      )}
    </Box>
  );
};

export default HabitCategorySelector;

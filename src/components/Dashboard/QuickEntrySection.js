import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import StatusIndicator from '../UI/StatusIndicator';

/**
 * Quick Entry Section Component
 * Handles the quick entry circles for mood, sleep, energy
 */
const QuickEntrySection = ({ 
  child, 
  status, 
  onQuickEntry, 
  userRole, 
  canAddData = true 
}) => {
  const theme = useTheme();

  // Quick entry items configuration
  const quickEntryItems = [
    { 
      key: "mood", 
      emoji: "😊", 
      label: "Mood", 
      description: "Quick mood check - Click for quick entry"
    }, 
    { 
      key: "sleep", 
      emoji: "😴", 
      label: "Sleep", 
      description: "Last night's sleep - Click for quick entry"
    }, 
    {
      key: "energy",
      emoji: "⚡",
      label: "Energy",
      description: "Current energy level - Click for quick entry",
    },
  ];

  // Read-only display for therapists
  if (userRole === 'THERAPIST') {
    return (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.75rem",
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          Today's Status:
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {quickEntryItems.map((item) => (
            <StatusIndicator
              key={item.key}
              emoji={item.emoji}
              label={item.label}
              isCompleted={status[item.key]}
              size={24}
              disabled={true}
              description={`${item.label}: ${status[item.key] ? 'Completed' : 'Not completed'}`}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // Interactive quick entry for other roles
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {quickEntryItems.map((item) => (
        <StatusIndicator
          key={item.key}
          emoji={item.emoji}
          label={item.label}
          isCompleted={status[item.key]}
          onClick={(e) => {
            if (canAddData) {
              onQuickEntry(child, item.key, e);
            }
          }}
          disabled={!canAddData}
          description={item.description}
          size={36}
        />
      ))}
    </Box>
  );
};

export default QuickEntrySection;
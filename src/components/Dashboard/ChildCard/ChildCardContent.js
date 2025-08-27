import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { CompletionIndicator } from '../../UI';

/**
 * ChildCardContent - Status indicators and quick actions section
 * Theme-driven styling with completion status and daily care tracking
 */
const ChildCardContent = ({
  child,
  status = {},
  completedToday,
  canAddData = true,
  onQuickEntry,
  onDailyReport,
}) => {
  const theme = useTheme();

  // Quick action items with theme-driven colors
  const getQuickActions = () => [
    { 
      key: 'mood', 
      emoji: '😊', 
      color: theme.palette.dailyCare.primary, 
      label: 'Mood', 
      description: 'Quick mood check',
    }, 
    { 
      key: 'sleep', 
      emoji: '😴', 
      color: theme.palette.dailyCare.primary, 
      label: 'Sleep', 
      description: "Last night's sleep",
    }, 
    { 
      key: 'energy', 
      emoji: '⚡', 
      color: theme.palette.dailyCare.primary, 
      label: 'Energy', 
      description: 'Current energy level',
    },
  ];

  const quickActions = getQuickActions();

  return (
    <Box sx={{ p: 2.5, bgcolor: 'background.paper' }}>
      {/* Daily Status Overview */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Daily Status
          </Typography>
          
          <CompletionIndicator
            variant="dots"
            status={completedToday ? 'completed' : 'pending'}
            color="dailyCare"
            showLabel
          />
        </Box>

        {/* Quick Status Grid */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {quickActions.map((action) => (
            <Box
              key={action.key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: 1,
                borderRadius: 1.5,
                bgcolor: status[action.key] 
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.grey[500], 0.1),
                border: 1,
                borderColor: status[action.key]
                  ? alpha(theme.palette.success.main, 0.3)
                  : alpha(theme.palette.grey[500], 0.2),
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography sx={{ fontSize: '1.1em' }}>
                {action.emoji}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: status[action.key] 
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                  truncate: true,
                }}
              >
                {action.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Action Buttons */}
        {canAddData && (
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onQuickEntry?.(child);
              }}
              size="small"
              variant="outlined"
              sx={{
                borderColor: theme.palette.dailyCare.primary,
                color: theme.palette.dailyCare.primary,
                fontSize: '0.8rem',
                py: 0.5,
                px: 1.5,
                '&:hover': {
                  borderColor: theme.palette.dailyCare.dark,
                  bgcolor: alpha(theme.palette.dailyCare.primary, 0.05),
                },
              }}
            >
              Quick Entry
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDailyReport?.(child);
              }}
              size="small"
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.dailyCare.primary} 0%, ${theme.palette.dailyCare.dark} 100%)`,
                color: 'white',
                fontSize: '0.8rem',
                py: 0.5,
                px: 1.5,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.dailyCare.dark} 0%, ${theme.palette.dailyCare.primary} 100%)`,
                },
              }}
            >
              Daily Report
            </Button>
          </Stack>
        )}
      </Box>

      {/* Medical Profile Summary */}
      {child.medicalProfile && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1.5 }}>
            Care Profile
          </Typography>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {/* Food Allergies */}
            {child.medicalProfile.foodAllergies?.length > 0 && (
              <Chip
                label={`${child.medicalProfile.foodAllergies.length} food allergies`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.dark,
                  fontSize: '0.7rem',
                }}
              />
            )}

            {/* Sensory Issues */}
            {child.medicalProfile.sensoryIssues?.length > 0 && (
              <Chip
                label={`${child.medicalProfile.sensoryIssues.length} sensory needs`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.dark,
                  fontSize: '0.7rem',
                }}
              />
            )}

            {/* Behavioral Triggers */}
            {child.medicalProfile.behavioralTriggers?.length > 0 && (
              <Chip
                label={`${child.medicalProfile.behavioralTriggers.length} triggers`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.dark,
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ChildCardContent;
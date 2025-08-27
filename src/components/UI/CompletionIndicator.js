import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * CompletionIndicator - Reusable component for displaying completion status
 * Handles status dots, progress circles, and completion badges
 * 
 * Usage:
 * <CompletionIndicator items={['mood', 'sleep', 'energy']} completedItems={['mood']} />
 * <CompletionIndicator variant="circle" isCompleted={true} label="Daily Care" />
 * <CompletionIndicator variant="dots" status={{mood: true, sleep: false, energy: true}} />
 */
const CompletionIndicator = ({
  variant = 'dots', // 'dots', 'circle', 'badge', 'progress'
  items = [],
  completedItems = [],
  status = {},
  isCompleted = false,
  label = '',
  color = 'dailyCare', // theme color key
  size = 'small', // 'small', 'medium', 'large'
  showCount = false,
  onClick,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  // Get color from theme
  const getColor = (colorKey) => {
    if (colorKey === 'dailyCare') {
      return theme.palette.dailyCare?.primary || '#6D28D9';
    }
    return theme.palette[colorKey]?.main || theme.palette.primary.main;
  };

  // Size configurations
  const getSizeConfig = (sizeType) => {
    const sizeConfigs = {
      small: {
        dotSize: 6,
        circleSize: 24,
        fontSize: '0.75rem',
        gap: 0.25
      },
      medium: {
        dotSize: 8,
        circleSize: 32,
        fontSize: '0.875rem',
        gap: 0.5
      },
      large: {
        dotSize: 10,
        circleSize: 40,
        fontSize: '1rem',
        gap: 0.75
      }
    };
    return sizeConfigs[sizeType] || sizeConfigs.small;
  };

  const sizeConfig = getSizeConfig(size);
  const themeColor = getColor(color);

  // Dots variant (small status indicators)
  if (variant === 'dots') {
    // Use status object or derive from items/completedItems
    const statusToShow = Object.keys(status).length > 0 
      ? status 
      : items.reduce((acc, item) => ({
          ...acc,
          [item]: completedItems.includes(item)
        }), {});

    const completedCount = Object.values(statusToShow).filter(Boolean).length;
    const totalCount = Object.keys(statusToShow).length;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: sizeConfig.gap,
          ...sx
        }}
        {...props}
      >
        <Box
          sx={{
            display: 'flex',
            gap: sizeConfig.gap,
          }}
        >
          {Object.entries(statusToShow).map(([key, completed], index) => (
            <Box
              key={key}
              sx={{
                width: sizeConfig.dotSize,
                height: sizeConfig.dotSize,
                borderRadius: '50%',
                bgcolor: completed ? themeColor : alpha(themeColor, 0.2),
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </Box>
        {showCount && (
          <Typography
            variant="caption"
            sx={{
              fontSize: sizeConfig.fontSize,
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            {completedCount}/{totalCount}
          </Typography>
        )}
      </Box>
    );
  }

  // Circle variant (clickable completion button)
  if (variant === 'circle') {
    return (
      <Box
        onClick={onClick}
        sx={{
          width: sizeConfig.circleSize,
          height: sizeConfig.circleSize,
          borderRadius: '50%',
          border: `2px solid ${themeColor}`,
          bgcolor: isCompleted ? alpha(themeColor, 0.1) : 'background.paper',
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          '&:hover': onClick ? {
            borderColor: themeColor,
            bgcolor: alpha(themeColor, 0.1),
            transform: 'scale(1.05)'
          } : {},
          ...sx
        }}
        title={label}
        {...props}
      >
        <Typography sx={{ fontSize: sizeConfig.fontSize }}>
          {isCompleted ? '✓' : ''}
        </Typography>
      </Box>
    );
  }

  // Badge variant (completion status badge)
  if (variant === 'badge') {
    const completedCount = completedItems.length;
    const totalCount = items.length;
    const allCompleted = completedCount === totalCount && totalCount > 0;

    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: allCompleted 
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(themeColor, 0.1),
          color: allCompleted 
            ? theme.palette.success.main 
            : themeColor,
          fontSize: sizeConfig.fontSize,
          fontWeight: 600,
          ...sx
        }}
        {...props}
      >
        {label && (
          <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
            {label}
          </Typography>
        )}
        <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
          {completedCount}/{totalCount}
        </Typography>
        {allCompleted && <span>✨</span>}
      </Box>
    );
  }

  // Progress variant (progress bar style)
  if (variant === 'progress') {
    const completedCount = completedItems.length;
    const totalCount = items.length;
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <Box sx={{ width: '100%', ...sx }} {...props}>
        {label && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: sizeConfig.fontSize }}>
              {label}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: sizeConfig.fontSize }}>
              {completedCount}/{totalCount}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            width: '100%',
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(themeColor, 0.2),
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: '100%',
              bgcolor: themeColor,
              borderRadius: 2,
              transition: 'width 0.3s ease'
            }}
          />
        </Box>
      </Box>
    );
  }

  return null;
};

export default CompletionIndicator;
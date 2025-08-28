import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

/**
 * TimelineProgressRing - Displays daily care completion as a segmented ring
 * Mobile-friendly with themed colors
 * 
 * @param {Object} props
 * @param {Object} props.status - Daily care completion status {mood: true, sleep: false, ...}
 * @param {number} props.completionRate - Overall completion percentage (0-100)
 * @param {string} props.size - Size variant: 'small', 'medium', 'large'
 * @param {boolean} props.showPercentage - Show percentage text in center
 * @param {function} props.onClick - Click handler for the ring
 */
const TimelineProgressRing = ({
  status = {},
  completionRate = 0,
  size = 'medium',
  showPercentage = true,
  onClick,
  className = ''
}) => {
  const theme = useTheme();

  // Size configurations
  const sizeConfigs = {
    small: { diameter: 48, strokeWidth: 4, fontSize: '0.75rem' },
    medium: { diameter: 64, strokeWidth: 5, fontSize: '0.875rem' },
    large: { diameter: 80, strokeWidth: 6, fontSize: '1rem' }
  };

  const config = sizeConfigs[size];
  const radius = (config.diameter - config.strokeWidth) / 2;

  // Daily care items with theme colors
  const dailyCareItems = [
    { key: 'mood', color: theme.palette.dailyCare.primary, icon: '😊' },
    { key: 'sleep', color: theme.palette.dailyCare.light, icon: '😴' },
    { key: 'energy', color: theme.palette.performance.primary, icon: '⚡' },
    { key: 'food_health', color: theme.palette.behavior.primary, icon: '🍎' },
    { key: 'safety', color: theme.palette.safety.allergy, icon: '🛡️' }
  ];

  // Calculate segment paths for each item
  const segmentAngle = 360 / dailyCareItems.length; // 72 degrees each
  const segments = dailyCareItems.map((item, index) => {
    const isCompleted = status[item.key] || false;
    const startAngle = index * segmentAngle - 90; // Start from top
    const endAngle = startAngle + segmentAngle;
    
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;
    
    const centerX = config.diameter / 2;
    const centerY = config.diameter / 2;
    const outerRadius = radius + config.strokeWidth / 2;
    const innerRadius = radius - config.strokeWidth / 2;
    
    const x1 = centerX + innerRadius * Math.cos(startRadians);
    const y1 = centerY + innerRadius * Math.sin(startRadians);
    const x2 = centerX + outerRadius * Math.cos(startRadians);
    const y2 = centerY + outerRadius * Math.sin(startRadians);
    const x3 = centerX + outerRadius * Math.cos(endRadians);
    const y3 = centerY + outerRadius * Math.sin(endRadians);
    const x4 = centerX + innerRadius * Math.cos(endRadians);
    const y4 = centerY + innerRadius * Math.sin(endRadians);
    
    const pathData = [
      `M ${x1} ${y1}`,
      `L ${x2} ${y2}`,
      `A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`,
      'Z'
    ].join(' ');
    
    return {
      ...item,
      pathData,
      isCompleted,
      opacity: isCompleted ? 1 : 0.2
    };
  });

  const containerStyles = {
    position: 'relative',
    width: config.diameter,
    height: config.diameter,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease',
    '&:hover': onClick ? {
      transform: 'scale(1.02)'
    } : {}
  };

  const centerTextStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  };

  return (
    <Box
      className={`timeline-progress-ring timeline-progress-ring--${size} ${className}`}
      sx={containerStyles}
      onClick={onClick}
    >
      <svg width={config.diameter} height={config.diameter}>
        {/* Background ring */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke={theme.palette.timeline.border}
          strokeWidth={config.strokeWidth}
        />
        
        {/* Completion segments */}
        {segments.map((segment, index) => (
          <path
            key={segment.key}
            d={segment.pathData}
            fill={segment.color}
            opacity={segment.opacity}
            className={`timeline-progress-ring__segment timeline-progress-ring__segment--${segment.key}`}
          />
        ))}
      </svg>
      
      {/* Center content */}
      {showPercentage && (
        <Box sx={centerTextStyles}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontSize: config.fontSize,
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1
            }}
          >
            {completionRate}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: `calc(${config.fontSize} * 0.7)`,
              color: 'text.secondary',
              lineHeight: 1,
              textAlign: 'center'
            }}
          >
            Complete
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TimelineProgressRing;
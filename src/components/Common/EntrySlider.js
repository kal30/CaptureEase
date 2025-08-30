import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * EntrySlider - Reusable slider component for both incidents and habits
 * Supports custom scales with labels, colors, and descriptions
 * 
 * @param {Object} props
 * @param {string} props.label - Slider label (e.g., "Severity Level", "Mood Level")
 * @param {number} props.value - Current slider value
 * @param {function} props.onChange - Value change handler
 * @param {number} props.min - Minimum value (default: 1)
 * @param {number} props.max - Maximum value (default: 10)
 * @param {Object} props.scale - Scale configuration object with level info
 * @param {string} props.color - Theme color for the slider
 * @param {boolean} props.showDescription - Whether to show level description
 */
const EntrySlider = ({
  label = "Level",
  value = 1,
  onChange,
  min = 1,
  max = 10,
  scale = {},
  color = "primary",
  showDescription = true
}) => {
  const theme = useTheme();
  
  // Get the current level info from scale
  const currentLevel = scale[value] || { 
    label: `Level ${value}`, 
    color: theme.palette.primary.main,
    description: `Level ${value} selected`
  };
  
  // Generate marks for the slider
  const marks = Object.entries(scale).map(([level, info]) => ({
    value: parseInt(level),
    label: level
  }));


  return (
    <Box>
      {/* Slider Label */}
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: '#1f2937',
          mb: 2
        }}
      >
        {label}: {value}/10
      </Typography>
      
      {/* Slider */}
      <Box sx={{ px: 2, py: 2 }}>
        <Slider
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          marks={marks.length > 0 ? marks : true}
          step={1}
          valueLabelDisplay="on"
          sx={{
            '& .MuiSlider-thumb': {
              backgroundColor: currentLevel.color,
              width: 24,
              height: 24,
            },
            '& .MuiSlider-track': {
              backgroundColor: currentLevel.color,
            },
            '& .MuiSlider-rail': {
              backgroundColor: theme.palette.grey[300],
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: currentLevel.color,
            },
          }}
        />
        
        {/* Current Level Description */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            label={`${currentLevel.label}${showDescription && currentLevel.description ? ` - ${currentLevel.description}` : ''}`}
            sx={{
              bgcolor: currentLevel.color,
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EntrySlider;
import React from 'react';
import { Box, Typography, Slider, Paper, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { incidentTheme, incidentSectionSx } from '../incidentTheme';

const SeveritySection = ({ 
  severity, 
  onChange, 
  severityConfig 
}) => {
  const theme = useTheme();

  const getSeverityMarks = () => {
    const marks = [];
    for (let i = 1; i <= 10; i++) {
      marks.push({
        value: i,
        label: i.toString()
      });
    }
    return marks;
  };

  return (
    <Paper 
      elevation={0}
      sx={{ p: 3, mb: 3, ...incidentSectionSx('#FFFFFF') }}
    >
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: theme.palette.text.primary
        }}
      >
        📊 Severity Level: {severity}/10
      </Typography>
      
      <Box sx={{ px: 2, py: 2 }}>
        <Slider
          value={severity}
          onChange={(event, newValue) => onChange(newValue)}
          min={1}
          max={10}
          step={1}
          marks={getSeverityMarks()}
          valueLabelDisplay="on"
          sx={{
            '& .MuiSlider-thumb': {
              backgroundColor: severityConfig?.color || incidentTheme.severityHigh,
              width: 24,
              height: 24,
            },
            '& .MuiSlider-track': {
              backgroundColor: severityConfig?.color || incidentTheme.severityHigh,
            },
            '& .MuiSlider-rail': {
              backgroundColor: incidentTheme.border,
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: severityConfig?.color || incidentTheme.severityHigh,
            },
          }}
        />
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            label={`${severityConfig?.label} - ${severityConfig?.description}`}
            sx={{
              bgcolor: severityConfig?.color || incidentTheme.severityHigh,
              color: severityConfig?.color === incidentTheme.severityHigh ? incidentTheme.severityText : 'white',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default SeveritySection;

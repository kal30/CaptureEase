import React from 'react';
import { Box, Typography, Slider, Paper, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import colors from '../../../../assets/theme/colors';

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
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '16px',
        border: `1px solid ${colors.app.cards.border}`,
        backgroundColor: colors.app.cards.background
      }}
    >
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: colors.app.text.strong
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
              backgroundColor: severityConfig?.color,
              width: 24,
              height: 24,
            },
            '& .MuiSlider-track': {
              backgroundColor: severityConfig?.color,
            },
            '& .MuiSlider-rail': {
              backgroundColor: colors.app.cards.border,
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: severityConfig?.color,
            },
          }}
        />
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Chip
            label={`${severityConfig?.label} - ${severityConfig?.description}`}
            sx={{
              bgcolor: severityConfig?.color,
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default SeveritySection;

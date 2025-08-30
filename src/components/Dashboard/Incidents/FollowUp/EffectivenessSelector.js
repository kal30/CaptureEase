import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { EFFECTIVENESS_LEVELS } from '../../../../services/incidentService';

const EffectivenessSelector = ({ 
  effectiveness, 
  onEffectivenessSelect 
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        How effective was the remedy?
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {Object.entries(EFFECTIVENESS_LEVELS).map(([key, level]) => (
          <Button
            key={key}
            variant={effectiveness === level.value ? 'contained' : 'outlined'}
            onClick={() => onEffectivenessSelect(level.value)}
            startIcon={effectiveness === level.value ? <CheckCircleIcon /> : null}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              px: 2,
              bgcolor: effectiveness === level.value ? level.color : 'transparent',
              borderColor: level.color,
              color: effectiveness === level.value ? 'white' : level.color,
              '&:hover': {
                bgcolor: effectiveness === level.value ? level.color : `${level.color}20`,
                borderColor: level.color,
              },
            }}
          >
            {level.label}
          </Button>
        ))}
      </Box>
    </>
  );
};

export default EffectivenessSelector;
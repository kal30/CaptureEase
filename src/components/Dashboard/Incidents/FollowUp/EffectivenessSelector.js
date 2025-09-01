import React from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
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

      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mb: 3,
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        {Object.entries(EFFECTIVENESS_LEVELS).map(([key, level]) => (
          <ButtonBase
            key={key}
            onClick={() => onEffectivenessSelect(level.value)}
            sx={{
              flex: 1,
              minWidth: '120px',
              py: 1.5,
              px: 1,
              borderRadius: 3,
              border: '2px solid',
              borderColor: effectiveness === level.value ? level.color : 'rgba(0,0,0,0.12)',
              bgcolor: effectiveness === level.value ? level.color : 'transparent',
              color: effectiveness === level.value ? 'white' : level.color,
              fontWeight: effectiveness === level.value ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: level.color,
                bgcolor: effectiveness === level.value ? level.color : `${level.color}15`,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${level.color}30`,
              },
              '&:active': {
                transform: 'translateY(0px)',
              }
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                fontSize: '1.5rem', 
                mb: 0.5,
                filter: effectiveness === level.value ? 'brightness(1.2)' : 'none'
              }}>
                {key === 'COMPLETELY' && '😊'}
                {key === 'SOMEWHAT' && '😐'}
                {key === 'NOT_EFFECTIVE' && '😔'}
              </Box>
              <Box>
                {level.label.replace(' Effective', '')}
              </Box>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </>
  );
};

export default EffectivenessSelector;
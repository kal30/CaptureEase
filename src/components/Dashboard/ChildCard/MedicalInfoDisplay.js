import React, { useState } from 'react';
import { Box, IconButton, Collapse, Chip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import AllergyChip, { sortAllergiesByPriority } from '../../UI/Allergies';

/**
 * MedicalInfoDisplay - Compact display of diagnosis and medical info with expandable list
 * Shows diagnosis and allergies
 * 
 * @param {Object} props
 * @param {string} props.diagnosis - Child's diagnosis
 * @param {Array} props.allergies - Array of food allergies
 */
const MedicalInfoDisplay = ({ 
  diagnosis, 
  allergies = []
}) => {
  const [showAllAllergies, setShowAllAllergies] = useState(false);
  
  // Sort allergies by priority (life-threatening first)
  const sortedAllergies = sortAllergiesByPriority(allergies);
  
  const maxVisible = 2;
  const hasMoreAllergies = sortedAllergies.length > maxVisible;
  const visibleAllergies = sortedAllergies.slice(0, maxVisible);
  const allergyRemainingCount = sortedAllergies.length - maxVisible;

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {/* Diagnosis */}
        {diagnosis && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              bgcolor: 'primary.main' 
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500, 
                color: 'primary.dark',
                fontSize: '0.75rem'
              }}
            >
              {diagnosis}
            </Typography>
          </Box>
        )}
        
        {/* Visible Allergies */}
        {visibleAllergies.map((allergy, index) => (
          <AllergyChip
            key={index}
            allergy={allergy}
            variant="compact"
          />
        ))}
        
        {/* Expand/Collapse Button for Allergies */}
        {hasMoreAllergies && (
          <IconButton
            size="small"
            onClick={() => setShowAllAllergies(!showAllAllergies)}
            sx={{
              width: 24,
              height: 20,
              bgcolor: 'warning.main',
              color: 'white',
              border: '1px solid',
              borderColor: 'warning.dark',
              borderRadius: 1,
              minWidth: 24,
              '&:hover': {
                bgcolor: 'warning.dark',
                transform: 'scale(1.1)'
              }
            }}
          >
            {showAllAllergies ? (
              <RemoveIcon sx={{ fontSize: 14 }} />
            ) : (
              <AddIcon sx={{ fontSize: 14 }} />
            )}
          </IconButton>
        )}
        
        {/* Count indicator when collapsed */}
        {hasMoreAllergies && !showAllAllergies && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'warning.dark',
              fontSize: '0.65rem',
              fontWeight: 500
            }}
          >
            +{allergyRemainingCount} more
          </Typography>
        )}
        
      </Box>

      {/* Additional allergies when expanded */}
      <Collapse in={showAllAllergies}>
        <Box sx={{ 
          display: 'flex', 
          gap: 0.5, 
          flexWrap: 'wrap', 
          mt: 0.5,
          pl: 2
        }}>
          {sortedAllergies.slice(maxVisible).map((allergy, index) => (
            <AllergyChip
              key={`additional-${index}`}
              allergy={allergy}
              variant="compact"
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default MedicalInfoDisplay;

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
  const getAllergyLabel = (allergy) => {
    if (typeof allergy === 'string') return allergy;
    if (allergy?.name) return allergy.name;
    if (allergy?.label) return allergy.label;
    return '';
  };

  const maxVisible = 2;
  const hasMoreAllergies = sortedAllergies.length > maxVisible;
  const visibleAllergies = sortedAllergies.slice(0, maxVisible);
  const allergyRemainingCount = sortedAllergies.length - maxVisible;

  return (
    <Box sx={{ mb: 1, mt: 0.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.875rem',
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'wrap'
        }}
      >
        {diagnosis && (
          <>
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Issues:</Box>
            {diagnosis?.label || diagnosis}
          </>
        )}

        {diagnosis && (
          <Box component="span" sx={{ mx: 0.5, color: 'divider' }}>|</Box>
        )}

        <>
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>Allergies:</Box>
          {sortedAllergies.length > 0 ? visibleAllergies.map(getAllergyLabel).filter(Boolean).join(', ') || 'N/A' : 'N/A'}
          {hasMoreAllergies && (
            <Box
              component="span"
              onClick={() => setShowAllAllergies(!showAllAllergies)}
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                fontWeight: 600,
                ml: 0.5,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              +{allergyRemainingCount} more
            </Box>
          )}
        </>
      </Typography>

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

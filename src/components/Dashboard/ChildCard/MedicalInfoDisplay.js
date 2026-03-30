import React, { useState } from 'react';
import { Box, Collapse } from '@mui/material';
import Typography from '@mui/material/Typography';
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
  allergies = [],
  compact = false,
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
  const diagnosisLabel = diagnosis?.label || diagnosis || 'N/A';
  const allergyLabel = sortedAllergies.length > 0
    ? visibleAllergies.map(getAllergyLabel).filter(Boolean).join(', ') || 'N/A'
    : 'N/A';

  if (compact) {
    return (
      <Box sx={{ mb: 0.5, mt: 0.1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
          }}
        >
          {diagnosisLabel}
          <Box component="span" sx={{ mx: 0.65, color: 'text.disabled' }}>
            •
          </Box>
          {allergyLabel}
          {hasMoreAllergies && (
            <Box
              component="span"
              onClick={() => setShowAllAllergies(!showAllAllergies)}
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.75rem',
                ml: 0.35,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              +{allergyRemainingCount}
            </Box>
          )}
        </Typography>

        <Collapse in={showAllAllergies}>
          <Box sx={{
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            mt: 0.5,
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
  }

  return (
    <Box sx={{ mb: 1, mt: 0.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'wrap',
        }}
      >
        {diagnosis && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.45,
              px: 0.75,
              py: 0.35,
              borderRadius: 999,
              bgcolor: '#ffffffb8',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography component="span" sx={{ fontSize: compact ? '0.75rem' : '0.82rem', fontWeight: 700, color: 'text.primary' }}>
              Issues
            </Typography>
            <Typography component="span" sx={{ fontSize: compact ? '0.75rem' : '0.82rem', color: 'text.secondary' }}>
              {diagnosis?.label || diagnosis}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.45,
            px: 0.75,
            py: 0.35,
            borderRadius: 999,
            bgcolor: '#ffffffb8',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography component="span" sx={{ fontSize: compact ? '0.75rem' : '0.82rem', fontWeight: 700, color: 'text.primary' }}>
            Allergies
          </Typography>
          <Typography component="span" sx={{ fontSize: compact ? '0.75rem' : '0.82rem', color: 'text.secondary' }}>
            {allergyLabel}
          </Typography>
          {hasMoreAllergies && (
            <Box
              component="span"
              onClick={() => setShowAllAllergies(!showAllAllergies)}
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: compact ? '0.75rem' : '0.82rem',
                ml: 0.15,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              +{allergyRemainingCount} more
            </Box>
          )}
        </Box>
      </Box>

      <Collapse in={showAllAllergies}>
        <Box sx={{
          display: 'flex',
          gap: 0.5,
          flexWrap: 'wrap',
          mt: 0.5,
          pl: compact ? 0.5 : 2
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

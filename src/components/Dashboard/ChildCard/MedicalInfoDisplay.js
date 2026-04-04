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
    const compactChipSx = {
      display: 'inline-flex',
      alignItems: 'center',
      px: 0.75,
      py: 0.28,
      borderRadius: 999,
      fontSize: '0.72rem',
      fontWeight: 700,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      border: '1px solid',
    };

    return (
      <Box sx={{ mb: 0.45, mt: 0.1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.65,
          }}
        >
          <Box
            component="span"
            sx={{
              ...compactChipSx,
              color: '#B45309',
              borderColor: 'rgba(245, 158, 11, 0.18)',
              backgroundColor: 'rgba(255, 244, 229, 0.88)',
            }}
          >
            Allergies
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              lineHeight: 1.2,
            }}
          >
            {allergyLabel}
          </Typography>

          <Box
            component="span"
            sx={{
              ...compactChipSx,
              color: '#92400E',
              borderColor: 'rgba(245, 158, 11, 0.16)',
              backgroundColor: 'rgba(255, 247, 237, 0.88)',
            }}
          >
            Issues
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              lineHeight: 1.2,
            }}
          >
            {diagnosisLabel}
          </Typography>

          {hasMoreAllergies && (
            <Typography
              component="button"
              type="button"
              onClick={() => setShowAllAllergies(!showAllAllergies)}
              sx={{
                p: 0,
                border: 0,
                background: 'transparent',
                color: 'primary.main',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.75rem',
                ml: 0.1,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              +{allergyRemainingCount}
            </Typography>
          )}
        </Box>

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
                bgcolor: 'rgba(255, 247, 237, 0.9)',
                border: '1px solid',
                borderColor: 'rgba(245, 158, 11, 0.16)',
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
                bgcolor: 'rgba(255, 244, 229, 0.9)',
                border: '1px solid',
                borderColor: 'rgba(245, 158, 11, 0.16)',
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

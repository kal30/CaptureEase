import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { getAllergyMeta } from '../../../constants/allergies';

/**
 * AllergyChip - Reusable component for displaying allergies with smart prioritization
 *
 * Colors now come from the MUI theme palette to centralize styling
 * and avoid hardcoded hex values. Severity maps to:
 * - High   -> theme.palette.error.main
 * - Medium -> theme.palette.warning.main
 * - Low    -> theme.palette.info.main
 * - Unknown-> theme.palette.grey[700]
 */


// Map severity to theme colors (centralized styling)
const getSeverityColor = (theme, severity) => {
  const map = {
    High: theme.palette.error.main,
    Medium: theme.palette.warning.main,
    Low: theme.palette.info.main,
    Unknown: theme.palette.grey[700],
  };
  return map[severity] || theme.palette.text.secondary;
};

export const CompactAllergyChip = ({ allergy, onClick, inForm = false, ...chipProps }) => {
  const theme = useTheme();
  const allergyMeta = getAllergyMeta(allergy);
  const color = getSeverityColor(theme, allergyMeta.severity);

  const isUnknown = allergyMeta.severity === 'Unknown';
  const backgroundAlpha = isUnknown ? 0.25 : 0.15;
  const hoverAlpha = isUnknown ? 0.35 : 0.25;

  return (
    <Chip
      {...chipProps}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
          <Typography sx={{ fontSize: '0.8rem' }}>{allergyMeta.emoji}</Typography>
          <Typography sx={{ fontSize: '0.7rem' }}>{allergy}</Typography>
        </Box>
      }
      size="small"
      onClick={inForm ? undefined : onClick}
      sx={{
        height: 20,
        fontSize: '0.65rem',
        bgcolor: alpha(color, backgroundAlpha),
        color,
        fontWeight: 500,
        borderRadius: 0.5,
        cursor: inForm || !onClick ? 'default' : 'pointer',
        border: isUnknown ? `1px solid ${alpha(color, 0.3)}` : 'none',
        '&:hover': inForm || !onClick ? {} : { bgcolor: alpha(color, hoverAlpha) },
        ...chipProps?.sx,
      }}
    />
  );
};

export const DetailedAllergyChip = ({ allergy, showSeverity = true, onClick, ...boxProps }) => {
  const theme = useTheme();
  const allergyMeta = getAllergyMeta(allergy);
  const color = getSeverityColor(theme, allergyMeta.severity);

  return (
    <Box
      {...boxProps}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': { bgcolor: alpha(color, 0.05) },
        ...boxProps?.sx,
      }}
      onClick={onClick}
    >
      <Typography sx={{ fontSize: '1.4rem' }}>{allergyMeta.emoji}</Typography>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {allergy}
        </Typography>
        {showSeverity && (
          <Typography variant="caption" sx={{ color, fontSize: '0.75rem' }}>
            {allergyMeta.severity} Risk
          </Typography>
        )}
      </Box>
    </Box>
  );
};
const AllergyChip = ({ variant = 'compact', ...props }) => {
  if (variant === 'compact') {
    return <CompactAllergyChip {...props} />;
  }
  return <DetailedAllergyChip {...props} />;
};

export default AllergyChip;

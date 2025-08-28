import React from 'react';
import {
  Box,
  Typography,
  Grid,
} from '@mui/material';
import {
  MedicalInformationOutlined as DiagnosisIcon,
  WarningAmberOutlined as AllergyIcon,
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

/**
 * A dedicated row to display key medical information with icons.
 */
const MedicalInfoRow = ({ diagnosis, allergies, groupType }) => {
  const theme = useTheme();

  // Logic to determine styling based on the groupType prop,
  // matching the main card's header.
  const getGroupStyling = () => {
    switch (groupType) {
      case "own":
        return {
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
        };
      case "family":
        return {
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.calendar.accent, 0.12)} 0%, ${alpha(theme.palette.calendar.accent, 0.06)} 100%)`,
        };
      case "professional":
        return {
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.tertiary.dark, 0.08)} 0%, ${alpha(theme.palette.tertiary.dark, 0.04)} 100%)`,
        };
      default:
        return {
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        };
    }
  };

  const groupStyle = getGroupStyling();

  if (!diagnosis && (!allergies || allergies.length === 0)) {
    return null;
  }

  const allergyText = allergies?.join(', ') || '';

  return (
    <Box
      sx={{
        background: groupStyle.headerGradient, // Apply the gradient background
      }}
    >
      <Grid container spacing={2} alignItems="center" sx={{ py: 1, px: 2 }}>
        {/* Diagnosis Info */}
        {diagnosis && (
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DiagnosisIcon sx={{ color: theme.palette.primary.dark }} />
              <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.primary.dark }}>
                {diagnosis}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Allergies Info */}
        {allergies && allergies.length > 0 && (
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AllergyIcon sx={{ color: 'error.main' }} />
              <Typography 
                variant="body2" 
                sx={{ fontWeight: 500, color: 'text.secondary' }}
                noWrap
              >
                {allergyText}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MedicalInfoRow;
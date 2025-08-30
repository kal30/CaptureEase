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
import { useTheme } from '@mui/material/styles';
import { AllergiesDisplay } from '../../UI';

/**
 * A dedicated row to display key medical information with icons.
 */
const MedicalInfoRow = ({ diagnosis, allergies }) => {
  const theme = useTheme();

  if (!diagnosis && (!allergies || allergies.length === 0)) {
    return null;
  }

  const allergyText = allergies?.join(', ') || '';

  return (
    <Box>
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
            <AllergiesDisplay
              allergies={allergies}
              maxVisible={2}
              sx={{ gap: 1.5 }}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MedicalInfoRow;
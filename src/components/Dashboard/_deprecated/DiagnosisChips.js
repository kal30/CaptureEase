import React from 'react';
import {
  Box,
  Chip,
  Typography,
} from '@mui/material';
import {
  MedicalServices as DiagnosisIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * DiagnosisChips - Clean diagnosis display component
 * Shows up to 2 diagnosis chips with icon and count for remaining
 */
const DiagnosisChips = ({ concerns }) => {
  const theme = useTheme();

  if (!concerns || concerns.length === 0) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
      <DiagnosisIcon sx={{ 
        color: "#FF6B6B", 
        fontSize: 12,
        mr: 0.5 
      }} />
      
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {concerns.slice(0, 2).map((concern, index) => (
          <Chip
            key={index}
            label={concern.label || concern}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.7rem",
              borderRadius: 1,
              bgcolor: alpha("#FF6B6B", 0.1),
              color: "#FF6B6B",
              fontWeight: 500,
            }}
          />
        ))}
        {concerns.length > 2 && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: theme.palette.text.secondary,
              alignSelf: "center",
              ml: 0.5,
            }}
          >
            +{concerns.length - 2} more
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DiagnosisChips;


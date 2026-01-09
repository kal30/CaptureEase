import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MedicationDrawerHeader = ({ title, onClose }) => (
  <Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Typography variant="h6">{title}</Typography>
    <IconButton size="small" onClick={onClose}>
      <CloseIcon />
    </IconButton>
  </Box>
);

export default MedicationDrawerHeader;

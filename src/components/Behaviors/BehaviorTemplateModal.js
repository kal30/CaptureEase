
import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CategorizedBehaviorTemplates from './CategorizedBehaviorTemplates';

const BehaviorTemplateModal = ({ open, onClose, onSelectTemplate, refreshTrigger, childId }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Browse Behavior Templates
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <CategorizedBehaviorTemplates onSelectTemplate={onSelectTemplate} childId={childId} refreshTrigger={refreshTrigger} />
      </Box>
    </Modal>
  );
};

export default BehaviorTemplateModal;

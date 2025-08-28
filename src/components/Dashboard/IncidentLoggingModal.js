import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import IncidentTypeSelector from './IncidentTypeSelector';
import IncidentQuickCapture from './IncidentQuickCapture';
import OtherIncidentCapture from './OtherIncidentCapture';
import { INCIDENT_TYPES } from '../../services/incidentService';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const IncidentLoggingModal = ({ open, onClose, childId, childName }) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(1); // 1 = type selection, 2 = quick capture
  const [selectedIncidentType, setSelectedIncidentType] = useState(null);

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep(1);
    setSelectedIncidentType(null);
    onClose();
  };

  const handleTypeSelect = (incidentType) => {
    setSelectedIncidentType(incidentType);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
    setSelectedIncidentType(null);
  };

  const handleIncidentSaved = () => {
    // Reset and close after successful save
    setCurrentStep(1);
    setSelectedIncidentType(null);
    onClose();
  };

  const getStepTitle = () => {
    if (currentStep === 1) {
      return `Log Incident - ${childName}`;
    }
    const typeConfig = INCIDENT_TYPES[selectedIncidentType];
    return `${typeConfig?.icon} ${typeConfig?.label} - ${childName}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      fullScreen={window.innerWidth < 600} // Full screen on mobile
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: window.innerWidth < 600 ? 0 : 2,
          minHeight: window.innerWidth < 600 ? '100vh' : '60vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafbfc',
          color: '#1f2937',
          py: 3,
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Typography 
          variant="h6" 
          component="div"
          sx={{ 
            fontWeight: 600,
            letterSpacing: '-0.5px'
          }}
        >
          {getStepTitle()}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: '#6b7280',
            '&:hover': {
              bgcolor: '#f3f4f6',
              color: '#374151'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#fafbfc' }}>
        {currentStep === 1 && (
          <IncidentTypeSelector
            onTypeSelect={handleTypeSelect}
            onClose={handleClose}
          />
        )}

        {currentStep === 2 && selectedIncidentType && (
          <>
            {selectedIncidentType === 'OTHER' ? (
              <OtherIncidentCapture
                childId={childId}
                childName={childName}
                onBack={handleBack}
                onSaved={handleIncidentSaved}
                onClose={handleClose}
              />
            ) : (
              <IncidentQuickCapture
                incidentType={selectedIncidentType}
                childId={childId}
                childName={childName}
                onBack={handleBack}
                onSaved={handleIncidentSaved}
                onClose={handleClose}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IncidentLoggingModal;
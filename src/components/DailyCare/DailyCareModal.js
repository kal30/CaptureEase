import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Slider,
  Chip,
  TextField,
  FormControl,
  FormLabel,
  Fade,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import StyledButton from '../UI/StyledButton';
import { getDailyCareConfig } from './dailyCareConfig';
import { saveDailyCareEntry } from '../../services/dailyCareService';
import { useAsyncForm } from '../../hooks/useAsyncForm';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto',
};

const DailyCareModal = ({ open, onClose, child, actionType, onComplete }) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  // Get configuration for the specific action type
  const config = getDailyCareConfig(actionType, child);

  // Use async form hook for daily care entry submission
  const careForm = useAsyncForm({
    onSuccess: (result) => {
      onComplete(actionType, result);
      onClose();
    },
    validate: (data) => {
      const currentField = config?.fields[currentStep];
      if (currentField?.required) {
        const value = data.formData?.[currentField.key];
        if (value === undefined || value === null || value === '') {
          throw new Error(`${currentField.label} is required`);
        }
      }
    }
  });

  useEffect(() => {
    // Reset form when action type changes
    setCurrentStep(0);
    setFormData({});
    careForm.reset();
  }, [actionType, open, careForm]);

  // Define handleClose first to avoid circular dependency
  const handleClose = () => {
    setCurrentStep(0);
    setFormData({});
    careForm.reset();
    onClose();
  };

  // Always render the same structure to maintain consistent hooks
  if (!config || !open) {
    return (
      <Modal open={false} onClose={handleClose}>
        <Box />
      </Modal>
    );
  }

  const currentField = config.fields[currentStep];
  const progress = ((currentStep + 1) / config.fields.length) * 100;
  const isLastStep = currentStep === config.fields.length - 1;

  const handleFieldChange = (value) => {
    setFormData(prev => ({
      ...prev,
      [currentField.key]: value
    }));
  };

  const canProceed = () => {
    if (!currentField.required) return true;
    const value = formData[currentField.key];
    return value !== undefined && value !== null && value !== '';
  };

  const handleNext = () => {
    if (isLastStep) {
      // Save the data
      careForm.submitForm(
        async () => {
          const entryData = {
            childId: child.id,
            actionType,
            data: formData,
            timestamp: new Date(),
            completedBy: 'current_user', // TODO: Get from auth context
          };

          await saveDailyCareEntry(entryData);
          return entryData;
        },
        { formData }
      );
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderField = () => {
    const value = formData[currentField.key];

    switch (currentField.type) {
      case 'scale':
        return (
          <Box sx={{ px: 2, mt: 3 }}>
            <Slider
              value={value || currentField.defaultValue || 3}
              onChange={(_, newValue) => handleFieldChange(newValue)}
              min={currentField.min}
              max={currentField.max}
              step={1}
              marks={currentField.labels?.map((label, index) => ({
                value: index + 1,
                label: label.split(' ')[0] // Just the emoji
              }))}
              sx={{ 
                mt: 4, 
                mb: 2,
                color: theme.palette.dailyCare.primary, // Daily Care purple
                '& .MuiSlider-thumb': {
                  bgcolor: theme.palette.dailyCare.primary,
                },
                '& .MuiSlider-track': {
                  bgcolor: theme.palette.dailyCare.primary,
                },
                '& .MuiSlider-rail': {
                  bgcolor: alpha('#6D28D9', 0.2),
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
              {currentField.labels?.[value - 1] || 'Select a value'}
            </Typography>
          </Box>
        );

      case 'chips':
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {currentField.options?.map((option) => {
              const isSelected = currentField.multiple 
                ? value?.includes(option.value)
                : value === option.value;

              return (
                <Chip
                  key={option.value}
                  label={`${option.emoji} ${option.label}`}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    fontSize: '0.875rem',
                    color: isSelected ? 'white' : theme.palette.dailyCare.primary,
                    bgcolor: isSelected ? theme.palette.dailyCare.primary : 'transparent',
                    borderColor: theme.palette.dailyCare.primary,
                    '&:hover': { 
                      transform: 'scale(1.05)',
                      bgcolor: isSelected ? theme.palette.dailyCare.hover : theme.palette.dailyCare.background,
                    }
                  }}
                  onClick={() => {
                    if (currentField.multiple) {
                      const current = value || [];
                      const newValue = isSelected
                        ? current.filter(v => v !== option.value)
                        : [...current, option.value];
                      handleFieldChange(newValue);
                    } else {
                      handleFieldChange(option.value);
                    }
                  }}
                />
              );
            })}
          </Box>
        );

      case 'text':
        return (
          <TextField
            fullWidth
            multiline={currentField.multiline}
            rows={currentField.rows || 3}
            value={value || ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder={currentField.placeholder}
            sx={{ mt: 2 }}
          />
        );

      case 'time':
        return (
          <TextField
            type="time"
            fullWidth
            value={value || ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            sx={{ mt: 2 }}
          />
        );

      case 'number':
        return (
          <TextField
            type="number"
            fullWidth
            value={value || ''}
            onChange={(e) => handleFieldChange(e.target.value)}
            placeholder={currentField.placeholder}
            inputProps={{ min: currentField.min, max: currentField.max }}
            sx={{ mt: 2 }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '1.5rem' }}>{config.icon}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.dailyCare.primary }}>
              {config.title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} disabled={careForm.loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Progress */}
        {config.fields.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Step {currentStep + 1} of {config.fields.length} • {child.name}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                mt: 0.5, 
                height: 6, 
                borderRadius: 3,
                bgcolor: theme.palette.dailyCare.background,
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.dailyCare.primary,
                }
              }}
            />
          </Box>
        )}

        {/* Error Alert */}
        {careForm.error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => careForm.clearError()}
          >
            {careForm.error}
          </Alert>
        )}

        {/* Current Field */}
        <Fade in={true} key={currentStep}>
          <Box sx={{ minHeight: 200 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, fontWeight: 600, fontSize: '1.1rem', color: 'text.primary' }}>
                {currentField.label}
              </FormLabel>
              {currentField.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {currentField.description}
                </Typography>
              )}
              
              {renderField()}
            </FormControl>
          </Box>
        </Fade>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <StyledButton
            disabled={currentStep === 0 || careForm.loading}
            onClick={handleBack}
          >
            Back
          </StyledButton>

          <Typography variant="caption" color="text.secondary">
            {currentField.required ? 'Required' : 'Optional'}
          </Typography>
          
          <StyledButton
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed() || careForm.loading}
            endIcon={isLastStep ? <CheckIcon /> : null}
            sx={{
              bgcolor: '#6D28D9',
              '&:hover': {
                bgcolor: theme.palette.dailyCare.hover,
              },
              '&:disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            {careForm.loading ? 'Saving...' : isLastStep ? 'Complete' : 'Next'}
          </StyledButton>
        </Box>

        {/* Skip option for optional fields */}
        {!currentField.required && !canProceed() && (
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Button variant="text" size="small" onClick={handleNext} disabled={careForm.loading}>
              Skip this step
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default DailyCareModal;
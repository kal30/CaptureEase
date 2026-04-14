import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  ButtonBase,
  Button,
  Slider,
  Chip,
  TextField,
  FormControl,
  FormLabel,
  Fade,
  LinearProgress,
  Alert,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import StyledButton from '../UI/StyledButton';
import LogFormShell from '../UI/LogFormShell';
import { getDailyCareConfig } from './dailyCareConfig';
import {
  ACTIVITY_TYPE_OPTIONS,
  ACTIVITY_TYPE_SECTIONS,
  getActivityTheme,
  getPrimaryActivityTheme,
} from '../../constants/activityThemes';
import { saveDailyCareEntry } from '../../services/dailyCareService';
import { useAsyncForm } from '../../hooks/useAsyncForm';

const getDefaultFormData = (fields = []) => fields.reduce((acc, field) => {
  if (field.defaultValue !== undefined) {
    acc[field.key] = field.defaultValue;
  }
  return acc;
}, {});

const calculateSleepDuration = (bedtime, wakeTime) => {
  if (!bedtime || !wakeTime) {
    return null;
  }

  const [bedHour, bedMinute] = bedtime.split(':').map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);

  if ([bedHour, bedMinute, wakeHour, wakeMinute].some(Number.isNaN)) {
    return null;
  }

  const start = new Date();
  start.setHours(bedHour, bedMinute, 0, 0);

  const end = new Date();
  end.setHours(wakeHour, wakeMinute, 0, 0);

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const hours = (end - start) / (1000 * 60 * 60);
  return Number.isFinite(hours) ? Number(hours.toFixed(1)) : null;
};

const ACTIVITY_ENGAGEMENT_OPTIONS = [
  { value: 1, label: 'Refused', emoji: '😴', hint: 'Very low engagement' },
  { value: 2, label: 'Passive', emoji: '😐', hint: 'Needed lots of prompting' },
  { value: 3, label: 'Participated', emoji: '🙂', hint: 'Joined in some of the time' },
  { value: 4, label: 'Engaged', emoji: '😊', hint: 'Good engagement' },
  { value: 5, label: 'Focused', emoji: '🤩', hint: 'Great engagement!' },
];

const DailyCareModal = ({ open, onClose, child, actionType, onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [engagementValue, setEngagementValue] = useState(null);
  const isSinglePageFlow = actionType === 'activity';

  // Get configuration for the specific action type
  const config = getDailyCareConfig(actionType, child);
  // Use async form hook for daily care entry submission
  const careForm = useAsyncForm({
    onSuccess: (result) => {
      onComplete(actionType, result);
      onClose();
    },
    validate: (data) => {
      const fieldsToValidate = isSinglePageFlow
        ? (config?.fields || []).filter((field) => field.required)
        : [config?.fields?.[currentStep]].filter(Boolean).filter((field) => field.required);

      for (const field of fieldsToValidate) {
        const value = data.formData?.[field.key];
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          throw new Error(`${field.label} is required`);
        }
      }
    }
  });

  useEffect(() => {
    // Reset form when action type changes
    setCurrentStep(0);
    const defaultFormData = getDefaultFormData(config?.fields || []);
    setFormData(defaultFormData);
    setEngagementValue(defaultFormData.engagement ?? null);
    careForm.reset();
  }, [actionType, open]); // Remove careForm from dependencies to prevent infinite loop

  // Define handleClose first to avoid circular dependency
  const handleClose = () => {
    setCurrentStep(0);
    setFormData(getDefaultFormData(config?.fields || []));
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
  const fieldsToRender = isSinglePageFlow ? config.fields : [currentField];
  const handleFieldChange = (fieldKey, value) => {
    if (fieldKey === 'engagement') {
      setEngagementValue(Number(value));
    }
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const isValueFilled = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  };

  const canProceed = () => {
    if (isSinglePageFlow) {
      return config.fields.every((field) => !field.required || isValueFilled(formData[field.key]));
    }

    if (!currentField.required) return true;
    return isValueFilled(formData[currentField.key]);
  };

  const handleSave = () => {
    careForm.submitForm(
      async () => {
        const sleepDuration = actionType === 'sleep'
          ? calculateSleepDuration(formData.bedtime, formData.wakeTime)
          : null;
        const primaryActivityTheme = getPrimaryActivityTheme(formData.activityTypes || []);
        const entryData = {
          childId: child.id,
          actionType,
          data: actionType === 'sleep'
            ? {
                ...formData,
                sleepDuration: sleepDuration ?? formData.sleepDuration ?? null,
              }
            : actionType === 'activity'
              ? {
                  ...formData,
                  categoryId: 'activity',
                  categoryLabel: 'Activity',
                  categoryColor: primaryActivityTheme.color,
                  activityThemeKey: primaryActivityTheme.key,
                  activityThemeColor: primaryActivityTheme.color,
                  activityThemeLabel: primaryActivityTheme.label,
                }
              : formData,
          timestamp: new Date(),
          completedBy: 'current_user', // TODO: Get from auth context
        };

        await saveDailyCareEntry(entryData);
        return entryData;
      },
      { formData }
    );
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSave();
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderField = (field) => {
    const value = formData[field.key];
    const primaryActivityTheme = getPrimaryActivityTheme(formData.activityTypes || []);
    const groupedActivityOptions = ACTIVITY_TYPE_SECTIONS.map((section) => ({
      ...section,
      options: ACTIVITY_TYPE_OPTIONS.filter((option) => option.group === section.key),
    }));

    switch (field.type) {
      case 'scale':
        if (isSinglePageFlow && field.key === 'engagement') {
          const selectedValue = engagementValue ?? (value ?? null);
          const selectedActivityTheme = primaryActivityTheme;
          return (
            <Box sx={{ mt: 1, pb: 0.25 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'center',
                  width: '100%',
                  border: '1px solid #E2E8F0',
                  borderRadius: 999,
                  overflow: 'hidden',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                {ACTIVITY_ENGAGEMENT_OPTIONS.map((option, index) => {
                  const selected = Number(selectedValue) === option.value;
                  return (
                    <ButtonBase
                      key={option.value}
                      onClick={() => handleFieldChange(field.key, option.value)}
                      aria-pressed={selected}
                      component="button"
                      type="button"
                      sx={{
                        flex: '1 1 0',
                        minWidth: 0,
                        minHeight: { xs: 54, sm: 58 },
                        px: { xs: 0.5, sm: 0.75 },
                        py: 0.85,
                        borderRadius: 0,
                        border: '0',
                        borderRight: index === ACTIVITY_ENGAGEMENT_OPTIONS.length - 1 ? 'none' : '1px solid #E2E8F0',
                        bgcolor: selected ? selectedActivityTheme.softBg : '#FFFFFF',
                        color: selected ? selectedActivityTheme.dark : '#64748B',
                        textTransform: 'none',
                        appearance: 'none',
                        cursor: 'pointer',
                        boxShadow: selected ? `inset 0 0 0 1px ${selectedActivityTheme.color}` : 'none',
                        transition: 'background-color 200ms ease, color 200ms ease, box-shadow 200ms ease, transform 200ms ease',
                        '&:hover': {
                          bgcolor: selected ? selectedActivityTheme.softBg : '#F8FAFC',
                          boxShadow: selected ? `inset 0 0 0 1px ${selectedActivityTheme.color}` : 'none',
                          transform: 'translateY(-1px)',
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${selectedActivityTheme.color}`,
                          outlineOffset: 2,
                        },
                      }}
                      >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.05 }}>
                        <Typography component="span" sx={{ fontSize: '1rem', lineHeight: 1, mb: 0.15 }}>
                          {option.emoji}
                        </Typography>
                        <Typography component="span" sx={{ fontSize: '0.78rem', fontWeight: selected ? 700 : 600, lineHeight: 1.1 }}>
                          {option.label}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.85,
                  minHeight: 20,
                  fontSize: '0.85rem',
                  color: selectedActivityTheme.dark,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {ACTIVITY_ENGAGEMENT_OPTIONS.find((option) => option.value === Number(selectedValue))?.hint || 'Select an engagement level'}
              </Typography>
            </Box>
          );
        }

        return (
          <Box sx={{ px: 2, mt: 3 }}>
            <Slider
              value={value || field.defaultValue || 3}
              onChange={(_, newValue) => handleFieldChange(field.key, newValue)}
              min={field.min}
              max={field.max}
              step={1}
              marks={field.labels?.map((label, index) => ({
                value: index + 1,
                label: label.split(' ')[0]
              }))}
              sx={{ 
                mt: 4, 
                mb: 2,
                color: theme.palette.dailyCare.primary,
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
              {field.labels?.[value - 1] || 'Select a value'}
            </Typography>
          </Box>
        );

      case 'chips':
        if (isSinglePageFlow && field.key === 'activityTypes') {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.25, pb: 0.15 }}>
              {groupedActivityOptions.map((section) => (
                <Box key={section.key} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'text.secondary',
                    }}
                  >
                    {section.label}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {section.options.map((option) => {
                      const isSelected = field.multiple
                        ? value?.includes(option.value)
                        : value === option.value;
                      const activityTheme = getActivityTheme(option.themeKey || option.value);

                      return (
                        <ButtonBase
                          key={option.value}
                          component="button"
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            if (field.multiple) {
                              const current = value || [];
                              const newValue = isSelected
                                ? current.filter((v) => v !== option.value)
                                : [...current, option.value];
                              handleFieldChange(field.key, newValue);
                            } else {
                              handleFieldChange(field.key, option.value);
                            }
                          }}
                          sx={{
                            flex: '0 1 auto',
                            minHeight: 38,
                            px: 1.15,
                            py: 0.65,
                            borderRadius: 999,
                            border: '1px solid',
                            borderColor: isSelected ? activityTheme.color : '#E2E8F0',
                            bgcolor: isSelected ? activityTheme.softBg : '#FFFFFF',
                            color: isSelected ? activityTheme.dark : '#64748B',
                            textTransform: 'none',
                            appearance: 'none',
                            cursor: 'pointer',
                            boxShadow: isSelected ? `inset 0 0 0 1px ${activityTheme.color}` : 'none',
                            transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
                            '&:hover': {
                              bgcolor: isSelected ? activityTheme.softBg : '#F8FAFC',
                              borderColor: isSelected ? activityTheme.color : '#CBD5E1',
                              transform: 'translateY(-1px)',
                            },
                            '&:focus-visible': {
                              outline: `2px solid ${activityTheme.color}`,
                              outlineOffset: 2,
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Typography component="span" sx={{ fontSize: '0.95rem', lineHeight: 1, flexShrink: 0 }}>
                              {option.emoji}
                            </Typography>
                            <Typography component="span" sx={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 600, lineHeight: 1 }}>
                              {option.label}
                            </Typography>
                          </Box>
                        </ButtonBase>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          );
        }

        return (
          <Box sx={{ display: 'flex', flexWrap: field.wrap === false ? 'nowrap' : 'wrap', gap: 1, mt: 2, overflowX: field.wrap === false ? 'auto' : 'visible', pb: field.wrap === false ? 0.5 : 0 }}>
            {field.options?.map((option) => {
              const isSelected = field.multiple
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
                    if (field.multiple) {
                      const current = value || [];
                      const newValue = isSelected
                        ? current.filter(v => v !== option.value)
                        : [...current, option.value];
                      handleFieldChange(field.key, newValue);
                    } else {
                      handleFieldChange(field.key, option.value);
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
            multiline={field.multiline}
            rows={field.rows || 3}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            sx={{ mt: 2 }}
          />
        );

      case 'time':
        return (
          <TextField
            type="time"
            fullWidth
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            sx={{ mt: 2 }}
          />
        );

      case 'number':
        return (
          <TextField
            type="number"
            fullWidth
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            inputProps={{ min: field.min, max: field.max }}
            sx={{ mt: 2 }}
          />
        );

      case 'display': {
        const sleepDuration = calculateSleepDuration(formData.bedtime, formData.wakeTime);
        return (
          <Box
            sx={{
              bgcolor: 'primary.light',
              borderRadius: 2,
              p: 1.5,
              textAlign: 'center',
              mt: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
              {sleepDuration !== null ? `${sleepDuration.toFixed(1)} hours` : 'Select bedtime and wake time'}
            </Typography>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  const actionFooter = isSinglePageFlow ? (
    <StyledButton
      onClick={handleSave}
      disabled={!canProceed() || careForm.loading}
      endIcon={<CheckIcon />}
      sx={{
        bgcolor: !canProceed() || careForm.loading ? '#F1F5F9' : '#059669',
        color: !canProceed() || careForm.loading ? '#94A3B8' : '#FFFFFF',
        borderRadius: '0.9rem',
        boxShadow: !canProceed() || careForm.loading ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.08)',
        minWidth: '100%',
        width: '100%',
        border: '1px solid',
        borderColor: !canProceed() || careForm.loading ? '#E2E8F0' : '#059669',
        '&:hover': {
          bgcolor: !canProceed() || careForm.loading ? '#F1F5F9' : '#047857',
          borderColor: !canProceed() || careForm.loading ? '#E2E8F0' : '#047857',
        },
        '&:disabled': {
          bgcolor: '#F1F5F9',
          color: '#94A3B8',
          borderColor: '#E2E8F0',
          boxShadow: 'none',
        }
      }}
    >
      {careForm.loading ? 'Saving...' : 'Save Activity'}
    </StyledButton>
  ) : null;

  if (isSinglePageFlow) {
    return (
      <LogFormShell
        open={open}
        onClose={handleClose}
        title={config.title}
        subtitle={config.description}
        footer={actionFooter}
        forceDrawer={true}
      >
        {careForm.error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => careForm.clearError()}
          >
            {careForm.error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fieldsToRender.map((field, index) => (
            <Fade in={true} key={field.key || index}>
              <Box sx={{ minHeight: 'auto' }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.98rem', color: 'text.primary' }}>
                    {field.label}
                  </FormLabel>
                  {field.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25, fontSize: '0.9rem' }}>
                      {field.description}
                    </Typography>
                  )}

                  {renderField(field)}
                </FormControl>
              </Box>
            </Fade>
          ))}
        </Box>
      </LogFormShell>
    );
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
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
      }}>
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
        {!isSinglePageFlow && config.fields.length > 1 && (
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isSinglePageFlow ? 2 : 0 }}>
          {fieldsToRender.map((field, index) => (
            <Fade in={true} key={field.key || index}>
              <Box sx={{ minHeight: isSinglePageFlow ? 'auto' : 200 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: isSinglePageFlow ? 0.75 : 1, fontWeight: 600, fontSize: isSinglePageFlow ? '0.98rem' : '1.1rem', color: 'text.primary' }}>
                    {field.label}
                  </FormLabel>
                  {field.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: isSinglePageFlow ? 1.25 : 2, fontSize: isSinglePageFlow ? '0.9rem' : '0.875rem' }}>
                      {field.description}
                    </Typography>
                  )}

                  {renderField(field)}
                </FormControl>
              </Box>
            </Fade>
          ))}
        </Box>

        {/* Navigation */}
        {isSinglePageFlow ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 3 }}>
              <StyledButton
                variant="contained"
                onClick={handleSave}
                disabled={!canProceed() || careForm.loading}
                endIcon={<CheckIcon />}
                sx={{
                  bgcolor: !canProceed() || careForm.loading ? '#F1F5F9' : '#059669',
                  color: !canProceed() || careForm.loading ? '#94A3B8' : '#FFFFFF',
                  borderRadius: '0.75rem',
                  boxShadow: !canProceed() || careForm.loading ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.08)',
                  minWidth: isMobile ? '100%' : 180,
                  border: '1px solid',
                  borderColor: !canProceed() || careForm.loading ? '#E2E8F0' : '#059669',
                  '&:hover': {
                    bgcolor: !canProceed() || careForm.loading ? '#F1F5F9' : '#047857',
                    borderColor: !canProceed() || careForm.loading ? '#E2E8F0' : '#047857',
                  },
                  '&:disabled': {
                    bgcolor: '#F1F5F9',
                    color: '#94A3B8',
                    borderColor: '#E2E8F0',
                    boxShadow: 'none',
                  }
                }}
              >
              {careForm.loading ? 'Saving...' : 'Save Activity'}
            </StyledButton>
          </Box>
        ) : (
          <>
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
          </>
        )}
      </Box>
    </Modal>
  );
};

export default DailyCareModal;

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  ButtonBase,
  Button,
  Chip,
  Menu,
  MenuItem,
  Popover,
  Slider,
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

const formatTimeLabel = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const formatTimeInputValue = (date = new Date()) => {
  const safeDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(safeDate.getTime())) {
    return '12:00';
  }

  return [
    String(safeDate.getHours()).padStart(2, '0'),
    String(safeDate.getMinutes()).padStart(2, '0'),
  ].join(':');
};

const buildTimestampFromTimeInput = (timeValue, baseDate = new Date()) => {
  if (!timeValue) {
    return baseDate instanceof Date && !Number.isNaN(baseDate.getTime()) ? new Date(baseDate) : new Date();
  }

  const [hours, minutes] = String(timeValue).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return baseDate instanceof Date && !Number.isNaN(baseDate.getTime()) ? new Date(baseDate) : new Date();
  }

  const next = baseDate instanceof Date && !Number.isNaN(baseDate.getTime()) ? new Date(baseDate) : new Date();
  next.setHours(hours, minutes, 0, 0);
  return next;
};

const ACTIVITY_ENGAGEMENT_OPTIONS = [
  { value: 1, label: 'Low', emoji: '◔' },
  { value: 2, label: 'Okay', emoji: '◑' },
  { value: 3, label: 'Good', emoji: '◕' },
  { value: 4, label: 'Great', emoji: '◉' },
  { value: 5, label: 'Fully engaged', emoji: '★' },
];

const DailyCareModal = ({ open, onClose, child, actionType, onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [engagementValue, setEngagementValue] = useState(null);
  const [activityTimestamp, setActivityTimestamp] = useState(() => new Date());
  const [activityTimingMode, setActivityTimingMode] = useState('now');
  const [activityTimingMenuAnchor, setActivityTimingMenuAnchor] = useState(null);
  const [activityTimingPopoverAnchor, setActivityTimingPopoverAnchor] = useState(null);
  const [activityCustomTimeOpen, setActivityCustomTimeOpen] = useState(false);
  const [activityCustomTime, setActivityCustomTime] = useState(() => formatTimeInputValue(new Date()));
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
    setActivityTimestamp(new Date());
    setActivityTimingMode('now');
    setActivityTimingMenuAnchor(null);
    setActivityTimingPopoverAnchor(null);
    setActivityCustomTimeOpen(false);
    setActivityCustomTime(formatTimeInputValue(new Date()));
    careForm.reset();
  }, [actionType, open]); // Remove careForm from dependencies to prevent infinite loop

  // Define handleClose first to avoid circular dependency
  const handleClose = () => {
    setCurrentStep(0);
    setFormData(getDefaultFormData(config?.fields || []));
    setActivityTimestamp(new Date());
    setActivityTimingMode('now');
    setActivityTimingMenuAnchor(null);
    setActivityTimingPopoverAnchor(null);
    setActivityCustomTimeOpen(false);
    setActivityCustomTime(formatTimeInputValue(new Date()));
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
        const resolvedTimestamp = actionType === 'activity' ? activityTimestamp : new Date();
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
                  activityTiming: {
                    mode: activityTimingMode,
                    recordedAt: resolvedTimestamp.toISOString(),
                    durationMinutes: null,
                  },
                }
              : formData,
          timestamp: resolvedTimestamp,
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

  const handleActivityTimingSelect = (mode) => {
    const now = new Date();

    if (mode === 'now') {
      setActivityTimestamp(now);
      setActivityTimingMode('now');
      setActivityTimingMenuAnchor(null);
      return;
    }

    if (mode === 'minus_5') {
      setActivityTimestamp(new Date(now.getTime() - 5 * 60 * 1000));
      setActivityTimingMode('minus_5');
      setActivityTimingMenuAnchor(null);
      return;
    }

    if (mode === 'minus_15') {
      setActivityTimestamp(new Date(now.getTime() - 15 * 60 * 1000));
      setActivityTimingMode('minus_15');
      setActivityTimingMenuAnchor(null);
      return;
    }

    if (mode === 'custom') {
      setActivityCustomTime(formatTimeInputValue(activityTimestamp));
      setActivityCustomTimeOpen(true);
      setActivityTimingPopoverAnchor(activityTimingMenuAnchor);
      setActivityTimingMenuAnchor(null);
    }
  };

  const handleApplyCustomActivityTime = () => {
    const customTimestamp = buildTimestampFromTimeInput(activityCustomTime, new Date());
    setActivityTimestamp(customTimestamp);
    setActivityTimingMode('custom');
    setActivityCustomTimeOpen(false);
    setActivityTimingPopoverAnchor(null);
  };

  const activityTimingLabel = (() => {
    if (activityTimingMode === 'minus_5') return '5 min ago';
    if (activityTimingMode === 'minus_15') return '15 min ago';
    if (activityTimingMode === 'custom') return `Custom · ${formatTimeLabel(activityTimestamp)}`;
    return 'Just now';
  })();

  const renderField = (field) => {
    const value = formData[field.key];
    const primaryActivityTheme = getPrimaryActivityTheme(formData.activityTypes || []);

    switch (field.type) {
      case 'scale':
        if (isSinglePageFlow && field.key === 'engagement') {
          const selectedValue = engagementValue ?? (value ?? null);
          const selectedActivityTheme = primaryActivityTheme;
          return (
            <Box sx={{ mt: 0.65, pb: 0.1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gap: 0.6,
                  width: '100%',
                }}
              >
                {ACTIVITY_ENGAGEMENT_OPTIONS.map((option) => {
                  const selected = Number(selectedValue) === option.value;
                  return (
                    <ButtonBase
                      key={option.value}
                      onClick={() => handleFieldChange(field.key, option.value)}
                      aria-pressed={selected}
                      component="button"
                      type="button"
                      sx={{
                        minWidth: 0,
                        minHeight: 54,
                        px: 0.6,
                        py: 0.75,
                        borderRadius: '18px',
                        border: '1px solid',
                        borderColor: selected ? selectedActivityTheme.color : '#E2E8F0',
                        bgcolor: selected ? selectedActivityTheme.softBg : '#FFFFFF',
                        color: selected ? selectedActivityTheme.dark : '#64748B',
                        textTransform: 'none',
                        appearance: 'none',
                        cursor: 'pointer',
                        boxShadow: selected ? `0 0 0 1px ${selectedActivityTheme.color} inset` : 'none',
                        transition: 'background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 140ms ease',
                        '&:hover': {
                          bgcolor: selected ? selectedActivityTheme.softBg : '#F8FAFC',
                          transform: 'translateY(-1px)',
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${selectedActivityTheme.color}`,
                          outlineOffset: 2,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.25, width: '100%', minWidth: 0 }}>
                        <Typography component="span" sx={{ fontSize: '0.82rem', lineHeight: 1, opacity: 0.8 }}>
                          {option.emoji}
                        </Typography>
                        <Typography component="span" sx={{ fontSize: option.value === 5 ? '0.71rem' : '0.77rem', fontWeight: selected ? 700 : 600, lineHeight: 1.05, textAlign: 'center' }}>
                          {option.label}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
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
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
              gap: 0.75,
              mt: 1,
            }}>
              {ACTIVITY_TYPE_OPTIONS.map((option) => {
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
                      minHeight: 40,
                      px: 0.8,
                      py: 0.6,
                      borderRadius: '14px',
                      border: '1px solid',
                      borderColor: isSelected ? activityTheme.color : '#E2E8F0',
                      bgcolor: isSelected ? activityTheme.softBg : '#FFFFFF',
                      color: isSelected ? activityTheme.dark : '#64748B',
                      textTransform: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                      boxShadow: isSelected ? `inset 0 0 0 1px ${activityTheme.color}` : 'none',
                      transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease, transform 140ms ease, box-shadow 180ms ease',
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.55, width: '100%', minWidth: 0 }}>
                      <Typography component="span" sx={{ fontSize: '0.92rem', lineHeight: 1, flexShrink: 0, opacity: 0.95 }}>
                        {option.emoji}
                      </Typography>
                      <Typography component="span" sx={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 600, lineHeight: 1.05, textAlign: 'center' }}>
                        {option.label}
                      </Typography>
                    </Box>
                  </ButtonBase>
                );
              })}
            </Box>
          );
        }

        return (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
            gap: 0.75,
            mt: 1,
          }}>
            {field.options?.map((option) => {
              const isSelected = field.multiple
                ? value?.includes(option.value)
                : value === option.value;

              return (
                <Chip
                  key={option.value}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, width: '100%' }}>
                      <Typography component="span" sx={{ fontSize: '0.95rem', lineHeight: 1 }}>
                        {option.emoji}
                      </Typography>
                      <Typography component="span" sx={{ fontSize: '0.84rem', fontWeight: isSelected ? 700 : 600, lineHeight: 1, textAlign: 'center' }}>
                        {option.label}
                      </Typography>
                    </Box>
                  }
                  variant={isSelected ? 'filled' : 'outlined'}
                  clickable
                  sx={{
                    height: 40,
                    width: '100%',
                    borderRadius: '14px',
                    px: 0.75,
                    py: 0,
                    color: isSelected ? 'white' : theme.palette.dailyCare.primary,
                    bgcolor: isSelected ? theme.palette.dailyCare.primary : 'transparent',
                    borderColor: theme.palette.dailyCare.primary,
                    '& .MuiChip-label': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      px: 0,
                    },
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

        {actionType === 'activity' ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <ButtonBase
                onClick={(event) => setActivityTimingMenuAnchor(event.currentTarget)}
                sx={{
                  px: 1.05,
                  py: 0.55,
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  color: '#475569',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, lineHeight: 1 }}>
                  {activityTimingLabel} ▾
                </Typography>
              </ButtonBase>
            </Box>

            <Menu
              anchorEl={activityTimingMenuAnchor}
              open={Boolean(activityTimingMenuAnchor)}
              onClose={() => setActivityTimingMenuAnchor(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: '0 14px 40px rgba(15, 23, 42, 0.14)',
                  minWidth: 180,
                },
              }}
            >
              <MenuItem onClick={() => handleActivityTimingSelect('now')}>Just now</MenuItem>
              <MenuItem onClick={() => handleActivityTimingSelect('minus_5')}>5 min ago</MenuItem>
              <MenuItem onClick={() => handleActivityTimingSelect('minus_15')}>15 min ago</MenuItem>
              <MenuItem onClick={() => handleActivityTimingSelect('custom')}>Custom time</MenuItem>
            </Menu>

            <Popover
              open={activityCustomTimeOpen}
              onClose={() => setActivityCustomTimeOpen(false)}
              anchorEl={activityTimingPopoverAnchor}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  p: 2,
                  borderRadius: 2,
                  minWidth: 240,
                  boxShadow: '0 16px 44px rgba(15, 23, 42, 0.16)',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
                Choose a time
              </Typography>
              <TextField
                type="time"
                fullWidth
                size="small"
                value={activityCustomTime}
                onChange={(event) => setActivityCustomTime(event.target.value)}
                sx={{ mb: 1.5 }}
                inputProps={{ step: 60 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => {
                  setActivityCustomTimeOpen(false);
                  setActivityTimingPopoverAnchor(null);
                }}>
                  Cancel
                </Button>
                <Button size="small" variant="contained" onClick={handleApplyCustomActivityTime}>
                  Set time
                </Button>
              </Box>
            </Popover>
          </>
        ) : null}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.35 }}>
          {fieldsToRender.map((field, index) => (
            <Fade in={true} key={field.key || index}>
              <Box sx={{ minHeight: 'auto' }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 0.45, fontWeight: 600, fontSize: '0.98rem', color: 'text.primary' }}>
                    {field.label}
                  </FormLabel>
                  {field.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, fontSize: '0.9rem' }}>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isSinglePageFlow ? 1.35 : 0 }}>
          {fieldsToRender.map((field, index) => (
            <Fade in={true} key={field.key || index}>
              <Box sx={{ minHeight: isSinglePageFlow ? 'auto' : 200 }}>
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: isSinglePageFlow ? 0.45 : 1, fontWeight: 600, fontSize: isSinglePageFlow ? '0.98rem' : '1.1rem', color: 'text.primary' }}>
                    {field.label}
                  </FormLabel>
                  {field.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: isSinglePageFlow ? 0.75 : 2, fontSize: isSinglePageFlow ? '0.9rem' : '0.875rem' }}>
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

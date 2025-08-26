import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Rating,
  TextField,
  Chip,
  IconButton,
  Slide
} from '@mui/material';
import {
  Mood as MoodIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import StyledButton from "../UI/StyledButton";
import { useTheme } from '@mui/material/styles';

const QuickCheckIn = ({ child, onComplete, onSkip }) => {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [checkInData, setCheckInData] = useState({
    mood: 3,
    notes: '',
    highlights: [],
    concerns: []
  });

  const steps = ['Mood', 'Quick Note', 'Done'];

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const quickHighlights = ['Great sleep', 'Good appetite', 'Active play', 'Learning progress'];
  const quickConcerns = ['Tired', 'Fussy', 'Not eating', 'Behavior issues'];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(checkInData);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const toggleHighlight = (highlight) => {
    setCheckInData(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight]
    }));
  };

  const toggleConcern = (concern) => {
    setCheckInData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  return (
    <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Daily Check-in: {child.name}
          </Typography>
          <IconButton size="small" onClick={onSkip}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Progress */}
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 200 }}>
          {step === 0 && (
            <Slide direction="left" in={step === 0}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  How is {child.name} feeling today?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  {moodEmojis.map((emoji, index) => (
                    <StyledButton
                      key={index}
                      variant={checkInData.mood === index + 1 ? 'contained' : 'outlined'}
                      onClick={() => setCheckInData(prev => ({ ...prev, mood: index + 1 }))}
                      sx={{
                        fontSize: '2rem',
                        minWidth: 60,
                        minHeight: 60,
                        borderRadius: '50%'
                      }}
                    >
                      {emoji}
                    </StyledButton>
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tap to select mood
                </Typography>
              </Box>
            </Slide>
          )}

          {step === 1 && (
            <Slide direction="left" in={step === 1}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Any highlights or concerns?
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'success.main' }}>
                  ✨ Highlights
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {quickHighlights.map((highlight) => (
                    <Chip
                      key={highlight}
                      label={highlight}
                      variant={checkInData.highlights.includes(highlight) ? 'filled' : 'outlined'}
                      onClick={() => toggleHighlight(highlight)}
                      color="success"
                      size="small"
                    />
                  ))}
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 1, color: 'warning.main' }}>
                  ⚠️ Concerns
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {quickConcerns.map((concern) => (
                    <Chip
                      key={concern}
                      label={concern}
                      variant={checkInData.concerns.includes(concern) ? 'filled' : 'outlined'}
                      onClick={() => toggleConcern(concern)}
                      color="warning"
                      size="small"
                    />
                  ))}
                </Box>

                <TextField
                  fullWidth
                  placeholder="Quick note (optional)"
                  multiline
                  rows={2}
                  value={checkInData.notes}
                  onChange={(e) => setCheckInData(prev => ({ ...prev, notes: e.target.value }))}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Slide>
          )}

          {step === 2 && (
            <Slide direction="left" in={step === 2}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  All done! 
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {child.name}'s daily check-in complete
                </Typography>
              </Box>
            </Slide>
          )}
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={step === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {step < steps.length - 1 && (
              <Button variant="text" onClick={onSkip}>
                Skip Today
              </Button>
            )}
            <StyledButton
              variant="contained"
              onClick={handleNext}
            >
              {step === steps.length - 1 ? 'Complete' : 'Next'}
            </StyledButton>
          </Box>
        </Box>

        {/* Quick access to detailed entry */}
        {step === steps.length - 1 && (
          <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <StyledButton
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => {/* Navigate to detailed entry */}}
            >
              Add Detailed Entry
            </StyledButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickCheckIn;
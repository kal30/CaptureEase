import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Slider,
  IconButton,
  LinearProgress,
  Fade
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import StyledButton from "../UI/StyledButton";
import { useTheme, alpha } from '@mui/material/styles';

const MicroDataCollector = ({ child, onComplete, onSkip }) => {
  const theme = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [startTime] = useState(Date.now());

  // Get child's medical profile for contextual questions
  const medicalProfile = child?.medicalProfile || {};
  const { foodAllergies = [], dietaryRestrictions = [], sensoryIssues = [], behavioralTriggers = [] } = medicalProfile;

  // Smart questions based on correlation needs
  const questions = [
    {
      id: 'mood',
      type: 'scale',
      question: `How is ${child.name}'s mood right now?`,
      subtitle: 'This helps us track emotional patterns',
      min: 1,
      max: 5,
      labels: ['😢 Upset', '😕 Fussy', '😐 Okay', '🙂 Good', '😊 Happy'],
      required: true
    },
    {
      id: 'energy',
      type: 'scale', 
      question: 'Energy level today?',
      subtitle: 'Low energy might correlate with other factors',
      min: 1,
      max: 5,
      labels: ['😴 Very tired', '😑 Low', '😐 Normal', '😊 Active', '⚡ Very energetic'],
      required: true
    },
    {
      id: 'sleep_quality',
      type: 'chips',
      question: 'How was last night\'s sleep?',
      subtitle: 'Sleep quality affects everything else',
      options: [
        { label: 'Great sleep', value: 'great', emoji: '😴' },
        { label: 'Normal sleep', value: 'normal', emoji: '😌' },
        { label: 'Restless', value: 'restless', emoji: '😣' },
        { label: 'Woke up often', value: 'interrupted', emoji: '😵' },
        { label: 'Hard to fall asleep', value: 'difficulty', emoji: '😟' }
      ],
      required: true
    },
    {
      id: 'food_today',
      type: 'chips',
      question: 'What did they eat today?',
      subtitle: 'Food patterns might affect behavior and mood',
      options: [
        { label: 'Dairy', value: 'dairy', emoji: '🥛' },
        { label: 'Gluten/Wheat', value: 'gluten', emoji: '🍞' },
        { label: 'Sugar/Sweets', value: 'sugar', emoji: '🍭' },
        { label: 'Fruits', value: 'fruits', emoji: '🍎' },
        { label: 'Vegetables', value: 'vegetables', emoji: '🥕' },
        { label: 'Processed foods', value: 'processed', emoji: '🍟' }
      ],
      multiple: true,
      required: false
    },
    {
      id: 'activities',
      type: 'chips',
      question: 'Main activities today?',
      subtitle: 'Activities might influence mood and behavior',
      options: [
        { label: 'Outdoor play', value: 'outdoor', emoji: '🌳' },
        { label: 'Screen time', value: 'screen', emoji: '📱' },
        { label: 'Creative/Art', value: 'creative', emoji: '🎨' },
        { label: 'Physical exercise', value: 'exercise', emoji: '🏃' },
        { label: 'Social time', value: 'social', emoji: '👥' },
        { label: 'Quiet activities', value: 'quiet', emoji: '📚' }
      ],
      multiple: true,
      required: false
    },
    {
      id: 'concerns',
      type: 'chips',
      question: 'Any concerns today?',
      subtitle: 'Optional - only if something notable happened',
      options: [
        { label: 'Behavior challenges', value: 'behavior', emoji: '⚠️' },
        { label: 'Communication issues', value: 'communication', emoji: '🗣️' },
        { label: 'Sensory issues', value: 'sensory', emoji: '👂' },
        { label: 'Social difficulties', value: 'social', emoji: '😔' },
        { label: 'Learning struggles', value: 'learning', emoji: '📖' },
        { label: 'None today', value: 'none', emoji: '✅' }
      ],
      multiple: true,
      required: false
    }
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleResponse = (value) => {
    setResponses(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Complete collection
      const timeSpent = Date.now() - startTime;
      onComplete({
        responses,
        timeSpent,
        completionRate: Object.keys(responses).length / questions.length,
        timestamp: new Date()
      });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const canProceed = () => {
    if (!currentQ.required) return true;
    const response = responses[currentQ.id];
    return response !== undefined && response !== null && response !== '';
  };

  const renderQuestion = () => {
    switch (currentQ.type) {
      case 'scale':
        return (
          <Box sx={{ px: 2 }}>
            <Slider
              value={responses[currentQ.id] || 3}
              onChange={(_, value) => handleResponse(value)}
              min={currentQ.min}
              max={currentQ.max}
              step={1}
              marks={currentQ.labels?.map((label, index) => ({
                value: index + 1,
                label: label.split(' ')[0] // Just the emoji
              }))}
              sx={{ mt: 4, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {currentQ.labels?.[responses[currentQ.id] - 1] || 'Select a value'}
            </Typography>
          </Box>
        );

      case 'chips':
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {currentQ.options?.map((option) => {
              const isSelected = currentQ.multiple 
                ? responses[currentQ.id]?.includes(option.value)
                : responses[currentQ.id] === option.value;

              return (
                <Chip
                  key={option.value}
                  label={`${option.emoji} ${option.label}`}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'info' : 'default'}
                  onClick={() => {
                    if (currentQ.multiple) {
                      const current = responses[currentQ.id] || [];
                      const newValue = isSelected
                        ? current.filter(v => v !== option.value)
                        : [...current, option.value];
                      handleResponse(newValue);
                    } else {
                      handleResponse(option.value);
                    }
                  }}
                  sx={{ 
                    fontSize: '0.875rem',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                />
              );
            })}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📊 Quick Data Check
          </Typography>
          <IconButton size="small" onClick={onSkip}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Question {currentQuestion + 1} of {questions.length} • ~30 seconds
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Question */}
        <Fade in={true} key={currentQuestion}>
          <Box sx={{ minHeight: 200 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {currentQ.question}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentQ.subtitle}
            </Typography>
            
            {renderQuestion()}
          </Box>
        </Fade>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <StyledButton
            disabled={currentQuestion === 0}
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            Back
          </StyledButton>

          <Typography variant="caption" color="text.secondary">
            {currentQ.required ? 'Required' : 'Optional'}
          </Typography>
          
          <StyledButton
            variant="outlined"
            onClick={handleNext}
            disabled={!canProceed()}
            endIcon={currentQuestion === questions.length - 1 ? <CheckIcon /> : <NextIcon />}
            sx={{
              borderColor: 'info.main',
              color: 'info.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.1),
                borderColor: 'info.main'
              },
              '&:disabled': {
                borderColor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
          </StyledButton>
        </Box>

        {/* Skip option for optional questions */}
        {!currentQ.required && !canProceed() && (
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <StyledButton variant="text" size="small" onClick={handleNext}>
              Skip this question
            </StyledButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MicroDataCollector;
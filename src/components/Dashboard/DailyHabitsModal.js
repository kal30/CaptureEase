import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Slide,
  Button,
  Stack,
  Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTheme, alpha } from "@mui/material/styles";

import HabitCategorySelector from "./HabitCategorySelector";
import EntryForm from "../Common/EntryForm";
import { getHabitScale } from "../../constants/habitTypes";
import { saveHabitEntry, getCustomHabits } from "../../services/habitService";


/**
 * DailyHabitsModal - Main modal for daily habit logging
 * Supports multi-entry session (Option A from requirements)
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {function} props.onClose - Close handler
 * @param {string} props.childId - Child ID
 * @param {string} props.childName - Child name for display
 * @param {function} props.onHabitSaved - Optional callback when habit is saved
 */
const DailyHabitsModal = ({ open, onClose, childId, childName, onHabitSaved }) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState('select'); // 'select' | 'entry'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [completedHabits, setCompletedHabits] = useState([]);
  const [customHabits, setCustomHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load custom habits for this child
  useEffect(() => {
    if (open && childId) {
      loadCustomHabits();
    }
  }, [open, childId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCustomHabits = async () => {
    try {
      const habits = await getCustomHabits(childId);
      setCustomHabits(habits);
    } catch (error) {
      console.error('Error loading custom habits:', error);
      setCustomHabits([]);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep('select');
    setSelectedCategory(null);
    setCompletedHabits([]);
    onClose();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep('entry');
  };

  const handleBack = () => {
    setCurrentStep('select');
    setSelectedCategory(null);
  };

  const handleEntrySave = async (formData) => {
    setLoading(true);
    
    try {
      // Create habit entry object
      const habitEntry = {
        childId,
        categoryId: selectedCategory.id,
        categoryLabel: selectedCategory.label,
        level: formData.level, // Will be null for Quick Notes
        date: formData.date,
        notes: formData.notes,
        mediaFile: formData.mediaFile,
        audioBlob: formData.audioBlob,
        timestamp: formData.timestamp,
        customHabit: selectedCategory.customHabit || null
      };

      // Save to Firebase
      await saveHabitEntry(habitEntry);
      console.log('Habit entry saved successfully:', habitEntry);

      // Add to completed habits for session tracking
      setCompletedHabits(prev => [...prev, {
        id: Date.now(), // Temporary ID
        category: selectedCategory,
        level: formData.level,
        hasNotes: formData.notes && formData.notes.trim(),
        date: formData.date
      }]);

      // Notify parent component to refresh status
      if (onHabitSaved) {
        onHabitSaved(childId);
      }
      
      // Return to category selection for multi-entry
      setCurrentStep('select');
      setSelectedCategory(null);

    } catch (error) {
      console.error('Error saving habit entry:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (currentStep === 'entry') {
      return `Log ${selectedCategory?.label} for ${childName}`;
    }
    return `Daily Habits - ${childName}`;
  };

  const getEntryFormProps = () => {
    if (!selectedCategory) return {};

    const scale = getHabitScale(selectedCategory.id);
    
    return {
      title: `${selectedCategory.label} Entry`,
      sliderLabel: selectedCategory.sliderLabel || `${selectedCategory.label} Level`,
      scale,
      color: selectedCategory.color,
      notesPlaceholder: `Add notes about ${selectedCategory.label.toLowerCase()}...`,
      isTextInput: selectedCategory.isTextInput || false // Handle Quick Notes text input
    };
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slots={{ transition: Slide }}
      slotProps={{ transition: { direction: "up" } }}
      maxWidth="sm"
      fullWidth
      fullScreen={window.innerWidth < 600} // Full screen on mobile
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: window.innerWidth < 600 ? 0 : 2,
          minHeight: window.innerWidth < 600 ? "100vh" : "60vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fafbfc",
          color: "#1f2937",
          py: 3,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentStep === 'entry' && (
            <IconButton
              aria-label="back"
              onClick={handleBack}
              sx={{
                color: "#6b7280",
                "&:hover": {
                  bgcolor: "#f3f4f6",
                  color: "#374151",
                },
                mr: 1
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.5px",
            }}
          >
            {getModalTitle()}
          </Typography>
        </Box>
        
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: "#6b7280",
            "&:hover": {
              bgcolor: "#f3f4f6",
              color: "#374151",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Session Progress - Show completed habits */}
      {completedHabits.length > 0 && currentStep === 'select' && (
        <Box sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: alpha(theme.palette.success.main, 0.1),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
            Session Progress ({completedHabits.length} habits logged)
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {completedHabits.map((habit) => (
              <Chip
                key={habit.id}
                label={
                  habit.category.isTextInput 
                    ? `${habit.category.emoji || '📝'} ${habit.category.label}` 
                    : `${habit.category.emoji} ${habit.category.label} (${habit.level}/10)`
                }
                size="small"
                sx={{
                  bgcolor: alpha(habit.category.color, 0.1),
                  color: habit.category.color,
                  fontWeight: 600
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Dialog Content */}
      <DialogContent sx={{ p: 0, backgroundColor: "#fafbfc" }}>
        {currentStep === 'select' ? (
          <HabitCategorySelector
            onCategorySelect={handleCategorySelect}
            customHabits={customHabits}
            childName={childName}
          />
        ) : (
          <EntryForm
            {...getEntryFormProps()}
            onSave={handleEntrySave}
            onCancel={handleBack}
            loading={loading}
          />
        )}
      </DialogContent>

      {/* Footer Actions for Multi-Entry Session */}
      {completedHabits.length > 0 && currentStep === 'select' && (
        <Box sx={{ 
          px: 3, 
          py: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.default'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              You can continue logging more habits or finish your session
            </Typography>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ minWidth: 120 }}
            >
              Done for Today
            </Button>
          </Box>
        </Box>
      )}
    </Dialog>
  );
};

export default DailyHabitsModal;
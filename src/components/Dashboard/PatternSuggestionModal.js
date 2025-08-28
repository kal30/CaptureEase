import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useTheme } from '@mui/material/styles';

const PatternSuggestionModal = ({ 
  open, 
  onClose, 
  suggestions = [], 
  childName,
  onCreateCategory 
}) => {
  const theme = useTheme();
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());

  const handleSuggestionToggle = (suggestionIndex) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionIndex)) {
      newSelected.delete(suggestionIndex);
    } else {
      newSelected.add(suggestionIndex);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleCreateCategories = () => {
    const categoriesToCreate = suggestions
      .filter((_, index) => selectedSuggestions.has(index))
      .map(suggestion => ({
        name: suggestion.suggestedCategory,
        icon: suggestion.suggestedIcon,
        color: suggestion.suggestedColor,
        originalName: suggestion.customIncidentName,
        occurrences: suggestion.occurrences
      }));

    onCreateCategory(categoriesToCreate);
    onClose();
    setSelectedSuggestions(new Set());
  };

  const handleClose = () => {
    setSelectedSuggestions(new Set());
    onClose();
  };

  if (suggestions.length === 0) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon />
          <Box>
            <Typography variant="h6" component="div">
              Pattern Detected for {childName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Create custom categories from recurring incidents
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 1 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              The app noticed you've logged similar incidents multiple times. 
              Creating custom categories will make logging faster next time!
            </Typography>
          </Alert>
        </Box>

        <List sx={{ px: 3 }}>
          {suggestions.map((suggestion, index) => (
            <ListItem
              key={index}
              sx={{
                border: selectedSuggestions.has(index) 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : '1px solid #e0e0e0',
                borderRadius: 2,
                mb: 2,
                bgcolor: selectedSuggestions.has(index) 
                  ? `${theme.palette.primary.main}08` 
                  : 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: selectedSuggestions.has(index) 
                    ? `${theme.palette.primary.main}12` 
                    : '#f5f5f5',
                },
              }}
              onClick={() => handleSuggestionToggle(index)}
            >
              <Box sx={{ mr: 2, fontSize: '1.5rem' }}>
                {suggestion.suggestedIcon}
              </Box>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {suggestion.suggestedCategory}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${suggestion.occurrences} times`}
                      sx={{
                        bgcolor: suggestion.suggestedColor,
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Based on "{suggestion.customIncidentName}" incidents
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Button
                  variant={selectedSuggestions.has(index) ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionToggle(index);
                  }}
                  sx={{
                    bgcolor: selectedSuggestions.has(index) ? theme.palette.primary.main : 'transparent',
                  }}
                >
                  {selectedSuggestions.has(index) ? 'Selected' : 'Add'}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose}>
          Maybe Later
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateCategories}
          disabled={selectedSuggestions.size === 0}
          startIcon={<AddIcon />}
        >
          Create {selectedSuggestions.size} Categor{selectedSuggestions.size === 1 ? 'y' : 'ies'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatternSuggestionModal;
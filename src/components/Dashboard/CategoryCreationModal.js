import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress
} from '@mui/material';
import { EnhancedLoadingButton } from '../UI';
import CategoryPreview from './CategoryPreview';
import EmojiSelector from './EmojiSelector';
import ColorSelector from './ColorSelector';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import {
  createCustomCategory,
  migrateIncidentsToCustomCategory,
  getCustomCategories
} from '../../services/incidentService';
import { useAsyncForm } from '../../hooks/useAsyncForm';

const CategoryCreationModal = ({ 
  open, 
  onClose, 
  childId, 
  suggestion,
  onCategoryCreated 
}) => {
  const [user] = useAuthState(auth);
  const [step, setStep] = useState(1); // 1: configure, 2: confirm migration
  
  // Form state
  const [categoryName, setCategoryName] = useState(suggestion?.suggestedCategory || '');
  const [selectedColor, setSelectedColor] = useState(suggestion?.suggestedColor || '#6D28D9');
  const [selectedEmoji, setSelectedEmoji] = useState(suggestion?.suggestedIcon || '🤢');
  const [remedies, setRemedies] = useState(suggestion?.suggestedRemedies?.join(', ') || 'Monitor symptoms, Comfort measures, Other');
  const [confirmMigration] = useState(true);

  // Use async form hook for category creation
  const categoryForm = useAsyncForm({
    onSuccess: (result) => {
      onCategoryCreated(result);
      // Reset and close
      setStep(1);
      onClose();
    },
    validate: ({ categoryName }) => {
      if (!categoryName?.trim()) {
        throw new Error('Category name is required');
      }
    }
  });

  // Simple handlers with no cross-references
  const resetAndClose = () => {
    setStep(1);
    categoryForm.reset();
    onClose();
  };

  const proceedToStep2 = () => {
    if (!categoryName?.trim()) {
      return; // Validation will be handled by the hook
    }
    setStep(2);
  };

  const createCategory = () => {
    categoryForm.submitForm(
      async () => {
        // Check current category count
        const existingCategories = await getCustomCategories(childId);
        const categoryCount = Object.keys(existingCategories).length;

        if (categoryCount >= 10) {
          throw new Error('Maximum of 10 custom categories allowed. Please delete some categories first.');
        }

        if (categoryCount >= 7) {
          console.warn(`User has ${categoryCount} custom categories, approaching limit of 10.`);
        }

        // Prepare category data
        const categoryData = {
          label: categoryName.trim(),
          color: selectedColor,
          emoji: selectedEmoji,
          remedies: remedies.split(',').map(r => r.trim()).filter(r => r.length > 0)
        };

        const authorInfo = {
          uid: user?.uid,
          name: user?.displayName || user?.email?.split('@')[0] || 'User',
          email: user?.email
        };

        // Create the category
        const newCategory = await createCustomCategory(childId, categoryData, authorInfo);

        // Migrate incidents if requested
        let migratedCount = 0;
        if (confirmMigration && suggestion?.incidents?.length > 0) {
          migratedCount = await migrateIncidentsToCustomCategory(
            childId,
            suggestion.incidents,
            newCategory.key
          );
        }

        return {
          category: newCategory,
          migratedCount
        };
      },
      { categoryName }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      maxWidth="md"
      fullWidth
      fullScreen={window.innerWidth < 600}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafbfc',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {step === 1 ? 'Create New Category' : 'Confirm Migration'}
        </Typography>
        <IconButton onClick={resetAndClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#fafbfc' }}>
        {step === 1 && (
          <Box sx={{ p: 4 }}>
            {/* Error Alert */}
            {categoryForm.error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }} 
                onClose={() => categoryForm.clearError()}
              >
                {categoryForm.error}
              </Alert>
            )}

            {/* Category preview */}
            <CategoryPreview 
              emoji={selectedEmoji}
              name={categoryName}
              color={selectedColor}
            />

            {/* Category Name */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Category Name
              </Typography>
              <TextField
                fullWidth
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name..."
              />
            </Box>

            {/* Emoji Selection */}
            <EmojiSelector 
              selectedEmoji={selectedEmoji}
              onEmojiSelect={setSelectedEmoji}
            />

            {/* Color Selection */}
            <ColorSelector 
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />

            {/* Remedies */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Common Remedies
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={remedies}
                onChange={(e) => setRemedies(e.target.value)}
                placeholder="Enter remedies separated by commas..."
                helperText="These will appear as options when logging this type of incident"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={resetAndClose}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={proceedToStep2}
                disabled={!categoryName?.trim()}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ p: 4 }}>
            {/* Error Alert */}
            {categoryForm.error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }} 
                onClose={() => categoryForm.clearError()}
              >
                {categoryForm.error}
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon />
                <Typography variant="body2">
                  Creating category "{categoryName}" will organize your incident tracking.
                </Typography>
              </Box>
            </Alert>

            {suggestion?.incidents && suggestion.incidents.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Migrate Previous Incidents
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  We found {suggestion.incidents.length} similar incidents that can be moved to this category:
                </Typography>
                
                <List dense sx={{ maxHeight: 200, overflow: 'auto', my: 2 }}>
                  {suggestion.incidents.slice(0, 5).map((incident, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={incident.customIncidentName}
                        secondary={new Date(incident.timestamp?.toDate?.() || incident.timestamp).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                  {suggestion.incidents.length > 5 && (
                    <ListItem>
                      <ListItemText
                        primary={`... and ${suggestion.incidents.length - 5} more incidents`}
                        sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>

                <Typography variant="body2" color="text.secondary">
                  These incidents will keep their original names as reference, but will be organized under the new "{categoryName}" category.
                </Typography>
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => setStep(1)}>
                Back
              </Button>
              <EnhancedLoadingButton 
                variant="success-gradient"
                loading={categoryForm.loading}
                loadingStyle="waves"
                loadingText="Creating category..."
                onClick={createCategory}
                startIcon={<CheckIcon />}
              >
                Create Category
              </EnhancedLoadingButton>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategoryCreationModal;
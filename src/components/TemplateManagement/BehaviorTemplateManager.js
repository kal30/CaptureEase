
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getBehaviorTemplates, updateBehaviorTemplate, deleteBehaviorTemplate } from '../../services/behaviorService';

const BehaviorTemplateManager = ({ childId }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const fetchedTemplates = await getBehaviorTemplates(childId);
      setTemplates(fetchedTemplates);
      setError(null);
    } catch (err) {
      setError('Failed to fetch templates. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (childId) {
      fetchTemplates();
    }
  }, [childId]);

  const handleEditClick = (template) => {
    setCurrentTemplate(template);
    setEditedName(template.name);
    setEditedDescription(template.description);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (currentTemplate) {
      try {
        await updateBehaviorTemplate(currentTemplate.id, {
          name: editedName,
          description: editedDescription,
        });
        setEditModalOpen(false);
        fetchTemplates(); // Refresh the list
      } catch (error) {
        console.error('Error updating template:', error);
      }
    }
  };

  const handleDeleteClick = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteBehaviorTemplate(templateId);
        fetchTemplates(); // Refresh the list
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Your Custom Behavior Templates
      </Typography>
      {templates.length === 0 ? (
        <Typography>No custom templates defined yet.</Typography>
      ) : (
        <List>
          {templates.map((template) => (
            <ListItem
              key={template.id}
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditClick(template)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(template.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={template.name}
                secondary={template.description}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Edit Template Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Edit Behavior Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BehaviorTemplateManager;

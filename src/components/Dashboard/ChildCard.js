import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';  // Add Edit Icon
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';  // Adjust the path as necessary

const ChildCard = ({ child, onAssignCaregiver, onEditChild }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);  // State to manage the delete confirmation dialog

  // Handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  // Handle closing the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Handle deleting the child
  const handleDeleteChild = async () => {
    try {
      await deleteDoc(doc(db, 'children', child.id));
      console.log('Child deleted successfully');
      handleCloseDeleteDialog();  // Close the dialog after deleting
    } catch (error) {
      console.error('Error deleting child:', error);
    }
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Child Name and Age */}
            <Box>
              <Typography variant="h6">{child.name}</Typography>
              <Typography variant="body2">Age: {child.age}</Typography>
            </Box>

            {/* Action Buttons: Edit and Delete */}
            <Box>
              <IconButton 
                onClick={() => onEditChild(child)}  // Trigger edit functionality
                color="primary"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={handleOpenDeleteDialog}  // Open confirmation dialog on click
                color="secondary"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Caregiver Info */}
          {child.caregiver ? (
            <Typography variant="body2" color="textSecondary">
              Caregiver: {child.caregiver.name} ({child.caregiver.email})
            </Typography>
          ) : (
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => onAssignCaregiver(child)}
              sx={{ mt: 2 }}
            >
              Assign Caregiver
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{child.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteChild} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChildCard;
import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const MessageMenu = ({ anchorEl, handleCloseMenu, handleDelete, handleEdit, isEditing, message }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleCloseMenu}
      sx={{ zIndex: 9999 }}
    >
      {/* Delete option */}
      <MenuItem
        onClick={handleDelete}
        sx={{ padding: '10px 20px', backgroundColor: 'rgba(255, 0, 0, 0.1)', '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.2)' } }}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Delete" />
      </MenuItem>

      {/* Edit option (only if there's text) */}
      {message.text && (
        <MenuItem
          onClick={handleEdit}
          sx={{ padding: '10px 20px', backgroundColor: 'rgba(0, 0, 255, 0.1)', '&:hover': { backgroundColor: 'rgba(0, 0, 255, 0.2)' } }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={isEditing ? 'Save' : 'Edit'} />
        </MenuItem>
      )}
    </Menu>
  );
};

export default MessageMenu;
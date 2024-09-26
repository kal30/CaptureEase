import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Avatar, Box,Button, IconButton, Menu, MenuItem, List, ListItemButton, ListItemIcon, ListItemText, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MoodIcon from '@mui/icons-material/Mood';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useNavigate } from 'react-router-dom';

const ChildCard = ({ child, onEditChild, onDeleteChild, onUnlinkCaregiver, onAssignCaregiver }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Handle opening the action menu
  const handleMenuOpen = (event) => {
    event.stopPropagation();  // Prevent accordion from expanding
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the action menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}
       sx={{ backgroundColor: '#A9DFBF' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', }}>
          <Avatar src={child.photoURL || 'https://via.placeholder.com/150'} alt={child.name} sx={{ width: 56, height: 56, mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: '#333333' }}>{child.name}</Typography>
            <Typography variant="body1" sx={{ color: '#333333' }}>Age: {child.age}</Typography>

            {/* Caregiver Info */}
            {child.caregiver ? (
              <Chip
                label={`Caregiver: ${child.caregiver.name} (${child.caregiver.email})`}
                color="secondary"
                sx={{ fontSize: '0.9rem', fontWeight: '500', mt: 1 }}
              />
            ) : (
              <Button
              variant="text"
              sx={{
                color: '#1F3A93', 
                textTransform: 'none', 
                fontWeight: 'bold',
                fontSize:'18px',
                mt: 1,
              }}
              onClick={(e) => {
                e.stopPropagation();  // Prevent accordion from expanding
                onAssignCaregiver(child);
              }}
            >
              Assign Caregiver
            </Button>
            )}
          </Box>

          {/* Three-dot menu for Edit, Delete, and Unlink */}
          <IconButton onClick={handleMenuOpen} onFocus={(e) => e.stopPropagation()}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(event) => event.stopPropagation()}  // Prevent accordion from expanding when clicking the menu
          >
            <MenuItem onClick={() => { onEditChild(child); handleMenuClose(); }}>
              <EditIcon sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => { onDeleteChild(child); handleMenuClose(); }}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </MenuItem>
            {child.caregiver && (
              <MenuItem onClick={() => { onUnlinkCaregiver(child); handleMenuClose(); }}>
                <LinkOffIcon sx={{ mr: 1 }} /> Unlink Caregiver
              </MenuItem>
            )}
          </Menu>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ backgroundColor: '#E8E8E8', borderLeft: '4px solid #006766', padding: '16px' }}>
        <Typography variant="body1" sx={{ mb: 2, color:'#006766', fontSize:'18px', fontWeight:'bold' }}>
          Choose an option for {child.name}:
        </Typography>

        {/* Use ListItemButton instead of ListItem */}
        <List>
          <ListItemButton onClick={() => navigate('/messages')}>
            <ListItemIcon>
              <MessageIcon />
            </ListItemIcon>
            <ListItemText primary="Messages" />
          </ListItemButton>

          <ListItemButton onClick={() => navigate('/daily-activities')}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Daily Activities" />
          </ListItemButton>

          <ListItemButton onClick={() => navigate('/mood-tracker')}>
            <ListItemIcon>
              <MoodIcon />
            </ListItemIcon>
            <ListItemText primary="Mood Tracker" />
          </ListItemButton>

          <ListItemButton onClick={() => navigate('/health-info')}>
            <ListItemIcon>
              <HealthAndSafetyIcon />
            </ListItemIcon>
            <ListItemText primary="Health Information" />
          </ListItemButton>
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChildCard;
import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
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
    event.stopPropagation(); // Prevent accordion from expanding
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the action menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ backgroundColor: '#E2F3E4', padding: '8px' }} // Adjust padding for better alignment
      >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>         
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
         <Avatar
            src={child.photoURL || 'https://via.placeholder.com/150'}
            alt={child.name}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            {/* Child Name */}
            <Typography variant="h6" sx={{ color: '#333333', fontWeight: 'bold', fontSize: '1.2rem' }}>
              {child.name}
            </Typography>

            {/* Child Age */}
            <Typography variant="body1" sx={{ color: '#333333', fontSize: '1rem' }}>
              Age: {child.age}
            </Typography>

            {/* Caregiver Info */}
            {child.caregiver ? (
              <Chip
                label={`Caregiver: ${child.caregiver.name} (${child.caregiver.email})`}
                color="secondary"
                sx={{
                  fontSize: '1.0rem',
                  fontWeight: '500',
                  mt: 1,
                  padding: '4px',
                  backgroundColor: '#54A5BB', // Changed background to 'Rain' color from your palette
                }}
              />
            ) : (
              <Typography
                sx={{
                  color: '#1F3A93',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  mt: 1,
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion from expanding
                  onAssignCaregiver(child);
                }}
              >
                Assign Caregiver
              </Typography>
            )}
          </Box>
          </Box>

          {/* Three-dot menu for Edit, Delete, and Unlink */}
          <IconButton
            onClick={handleMenuOpen}
            onFocus={(e) => e.stopPropagation()}
            sx={{
              padding: '6px', 
              fontSize: '22px',
              color: '#2E6F81', 
              backgroundColor: '#E8F6F8', 
              borderRadius: '50%', 
              '&:hover': {
                backgroundColor: '#D0E9F0', 
              },
            }} 
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(event) => event.stopPropagation()} // Prevent accordion from expanding when clicking the menu
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

      <AccordionDetails
        sx={{
          backgroundColor: '#D1EDEA', // Slightly darker background for expansion
          borderLeft: '4px solid #006766', // Subtle border for emphasis
          padding: '16px',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)', // Add subtle shadow for a modern look
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: '#006766', // Bolder color for the heading
            fontSize: '18px',
            fontWeight: 'bold',
            mb: 2,
          }}
        >
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
          <ListItemButton onClick={() => navigate(`/child/${child.id}/journal`)}>
            <ListItemIcon>
              <MessageIcon />
            </ListItemIcon>
            <ListItemText primary="Journal" />
          </ListItemButton>
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChildCard;
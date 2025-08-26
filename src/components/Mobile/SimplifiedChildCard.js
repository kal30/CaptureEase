import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Mood as MoodIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  MedicalServices as MedicalIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import StyledButton from "../UI/StyledButton";
import { alpha, useTheme } from '@mui/material/styles';

const SimplifiedChildCard = ({ 
  child, 
  onQuickCheckIn, 
  onViewTimeline, 
  onDetailedEntry,
  hasCheckInToday = false 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const secondaryActions = [
    { label: 'Medical Log', icon: <MedicalIcon />, action: () => console.log('Medical') },
    { label: 'Progress Notes', icon: <AssignmentIcon />, action: () => console.log('Progress') },
    { label: 'Detailed Entry', icon: <EditIcon />, action: onDetailedEntry },
  ];

  return (
    <Card 
      elevation={0} 
      sx={{ 
        border: `1px solid ${theme.palette.divider}`, 
        mb: 2,
        bgcolor: hasCheckInToday ? alpha(theme.palette.success.main, 0.02) : 'background.paper'
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
              {child.name[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {child.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Age: {child.age}
              </Typography>
              {hasCheckInToday && (
                <Chip 
                  label="✓ Checked in today" 
                  size="small" 
                  color="success"
                  sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          </Box>
          
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Primary Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!hasCheckInToday ? (
            <StyledButton
              variant="contained"
              startIcon={<MoodIcon />}
              onClick={() => onQuickCheckIn(child)}
              sx={{ 
                flex: 1,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Daily Check-in
            </StyledButton>
          ) : (
            <StyledButton
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onDetailedEntry(child)}
              sx={{ 
                flex: 1,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Add More Details
            </StyledButton>
          )}
          
          <StyledButton
            variant="outlined"
            startIcon={<TimelineIcon />}
            onClick={() => onViewTimeline(child)}
            sx={{ 
              flex: 1,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            View Timeline
          </StyledButton>
        </Box>

        {/* Today's Summary (if checked in) */}
        {hasCheckInToday && (
          <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              TODAY'S SNAPSHOT
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2">Mood: 😊</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2">2 notes</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2">1 highlight</Typography>
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Secondary Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 180 }
        }}
      >
        {secondaryActions.map((action, index) => (
          <MenuItem 
            key={index}
            onClick={() => {
              action.action();
              handleMenuClose();
            }}
            sx={{ py: 1.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {action.icon}
              {action.label}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
};

export default SimplifiedChildCard;
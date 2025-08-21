import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Collapse,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { TIMELINE_TYPES } from '../../services/timelineService';

const DayDetailModal = ({ open, onClose, day, dayEntries, currentDate }) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  if (!day || !dayEntries) return null;

  const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Group and sort entries by type and time
  const entryTypes = Object.keys(dayEntries);
  const allEntries = Object.values(dayEntries).flat().sort((a, b) => {
    const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
    const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
    return bTime - aTime; // Newest first
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const toggleEntryExpansion = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatTime = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderEntryItem = (entry) => {
    const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === entry.type);
    const isExpanded = expandedEntries.has(entry.id);
    const hasContent = entry.content && entry.content.trim().length > 0;

    return (
      <ListItem
        key={entry.id}
        sx={{
          border: `1px solid ${alpha(typeConfig?.color || theme.palette.grey[400], 0.2)}`,
          borderRadius: 2,
          mb: 1,
          bgcolor: alpha(typeConfig?.color || theme.palette.grey[400], 0.02),
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <ListItemAvatar>
            <Avatar
              sx={{
                bgcolor: typeConfig?.color || theme.palette.grey[400],
                width: 32,
                height: 32,
                fontSize: '1rem'
              }}
            >
              {typeConfig?.icon || '📝'}
            </Avatar>
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {entry.title}
                </Typography>
                <Chip
                  label={typeConfig?.label || entry.type}
                  size="small"
                  sx={{
                    bgcolor: alpha(typeConfig?.color || theme.palette.grey[400], 0.1),
                    color: typeConfig?.color || theme.palette.grey[700],
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <TimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">
                  {formatTime(entry.timestamp)}
                </Typography>
                {entry.author && entry.author !== 'Unknown' && (
                  <>
                    <Typography variant="caption" sx={{ mx: 0.5 }}>•</Typography>
                    <Typography variant="caption">
                      {entry.author}
                    </Typography>
                  </>
                )}
              </Box>
            }
          />

          {hasContent && (
            <IconButton
              size="small"
              onClick={() => toggleEntryExpansion(entry.id)}
              sx={{ color: typeConfig?.color }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {hasContent && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
            <Box sx={{ pl: 6, pr: 2, pb: 1 }}>
              <Divider sx={{ mb: 1, borderColor: alpha(typeConfig?.color || theme.palette.grey[400], 0.1) }} />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {entry.content}
              </Typography>
            </Box>
          </Collapse>
        )}
      </ListItem>
    );
  };

  const renderTabContent = () => {
    if (selectedTab === 0) {
      // All entries chronologically
      return (
        <List sx={{ p: 0 }}>
          {allEntries.map(renderEntryItem)}
        </List>
      );
    } else {
      // Entries by type
      const selectedType = entryTypes[selectedTab - 1];
      const typeEntries = dayEntries[selectedType] || [];
      
      return (
        <List sx={{ p: 0 }}>
          {typeEntries.map(renderEntryItem)}
        </List>
      );
    }
  };

  const totalEntries = allEntries.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formattedDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'} • {entryTypes.length} {entryTypes.length === 1 ? 'type' : 'types'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        {/* Entry Type Summary */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {entryTypes.map(type => {
            const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === type);
            const count = dayEntries[type].length;
            
            return (
              <Chip
                key={type}
                label={`${typeConfig?.icon || '📝'} ${count} ${typeConfig?.label || type}${count > 1 ? 's' : ''}`}
                size="small"
                sx={{
                  bgcolor: alpha(typeConfig?.color || theme.palette.grey[400], 0.1),
                  color: typeConfig?.color || theme.palette.grey[700],
                  fontWeight: 600
                }}
              />
            );
          })}
        </Box>

        {/* Tabs for different views */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="All Entries" />
            {entryTypes.map(type => {
              const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === type);
              const count = dayEntries[type].length;
              return (
                <Tab
                  key={type}
                  label={`${typeConfig?.icon || '📝'} ${typeConfig?.label || type} (${count})`}
                />
              );
            })}
          </Tabs>
        </Box>

        {/* Tab Content */}
        {renderTabContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{
            bgcolor: 'success.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'success.dark'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DayDetailModal;
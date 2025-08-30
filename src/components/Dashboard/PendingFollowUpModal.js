import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getIncidentsPendingFollowUp, INCIDENT_TYPES } from '../../services/incidentService';
import { useNotificationBadges } from '../../hooks/useNotificationBadges';
import { IncidentFollowUpModal } from './Incidents';

const PendingFollowUpModal = ({ 
  open, 
  onClose, 
  childId, 
  childName 
}) => {
  const theme = useTheme();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // Use the same data source as the badge for consistency
  const childrenIds = React.useMemo(() => [childId], [childId]);
  const {
    pendingFollowUps,
    loading,
    refreshPendingFollowUps
  } = useNotificationBadges(childrenIds);

  // Get pending incidents for this specific child
  const pendingIncidents = pendingFollowUps[childId] || [];

  const formatTimeAgo = (timestamp) => {
    try {
      let time;
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        time = timestamp.toDate();
      } else {
        time = new Date(timestamp);
      }
      
      if (isNaN(time.getTime())) return 'Unknown';
      
      const now = new Date();
      const diffMs = now - time;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (error) {
      console.error('Error formatting time ago:', error);
      return 'Unknown';
    }
  };

  const formatFollowUpTime = (timestamp) => {
    try {
      let time;
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        time = timestamp.toDate();
      } else {
        time = new Date(timestamp);
      }
      
      if (isNaN(time.getTime())) return 'Invalid';
      
      const now = new Date();
      
      if (time <= now) {
        return 'Overdue';
      }
      
      const diffMs = time - now;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 60) return `in ${diffMins}m`;
      if (diffHours < 24) return `in ${diffHours}h`;
      return time.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting follow-up time:', error);
      return 'Invalid';
    }
  };

  const getIncidentIcon = (incident) => {
    const incidentConfig = Object.values(INCIDENT_TYPES).find(
      type => type.id === incident.type
    );
    return incidentConfig?.emoji || '📝';
  };

  const getFollowUpIcon = (incident) => {
    const followUpTime = getFollowUpDate(incident);
    if (!followUpTime) {
      return <WarningIcon color="disabled" />;
    }
    
    const now = new Date();
    
    if (followUpTime <= now) {
      return <WarningIcon color="error" />;
    }
    
    const diffMs = followUpTime - now;
    if (diffMs <= 60 * 60 * 1000) { // Within 1 hour
      return <ScheduleIcon color="warning" />;
    }
    
    return <ScheduleIcon color="primary" />;
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setShowFollowUpModal(true);
  };

  const handleFollowUpComplete = () => {
    setShowFollowUpModal(false);
    setSelectedIncident(null);
    // Refresh the data using the hook's refresh function
    refreshPendingFollowUps();
  };

  // Helper function to safely convert Firebase Timestamp to Date
  const getFollowUpDate = (incident) => {
    try {
      if (!incident.followUpTime) {
        console.warn(`⚠️ Incident ${incident.id} has no followUpTime`);
        return null;
      }
      
      // Handle Firebase Timestamp
      if (incident.followUpTime?.toDate && typeof incident.followUpTime.toDate === 'function') {
        return incident.followUpTime.toDate();
      }
      
      // Handle regular Date or date string
      const date = new Date(incident.followUpTime);
      if (isNaN(date.getTime())) {
        console.warn(`⚠️ Invalid followUpTime for incident ${incident.id}:`, incident.followUpTime);
        return null;
      }
      
      return date;
    } catch (error) {
      console.error(`Error parsing followUpTime for incident ${incident.id}:`, error);
      return null;
    }
  };

  const overdueIncidents = pendingIncidents.filter(incident => {
    const followUpTime = getFollowUpDate(incident);
    if (!followUpTime) return false;
    
    const isOverdue = followUpTime <= new Date();
    console.log(`📅 Incident ${incident.id}: followUpTime=${followUpTime.toISOString()}, isOverdue=${isOverdue}`);
    return isOverdue;
  });

  const upcomingIncidents = pendingIncidents.filter(incident => {
    const followUpTime = getFollowUpDate(incident);
    if (!followUpTime) return false;
    
    const isUpcoming = followUpTime > new Date();
    console.log(`🔮 Incident ${incident.id}: followUpTime=${followUpTime.toISOString()}, isUpcoming=${isUpcoming}`);
    return isUpcoming;
  });

  // Debug: Log the data when modal opens
  React.useEffect(() => {
    if (open) {
      console.log('🔍 PendingFollowUpModal opened for child:', childId);
      console.log('📊 Pending incidents from hook:', pendingIncidents);
      console.log('🔢 Count:', pendingIncidents.length);
      
      // Detailed breakdown
      console.log('📈 DETAILED BREAKDOWN:');
      pendingIncidents.forEach((incident, index) => {
        const followUpTime = getFollowUpDate(incident);
        const isOverdue = followUpTime ? followUpTime <= new Date() : false;
        const isUpcoming = followUpTime ? followUpTime > new Date() : false;
        console.log(`  ${index + 1}. ${incident.id}: ${incident.type} - followUpTime=${followUpTime?.toISOString() || 'INVALID'}, overdue=${isOverdue}, upcoming=${isUpcoming}`);
      });
      
      console.log(`🔴 Overdue count: ${overdueIncidents.length}`);
      console.log(`🟡 Upcoming count: ${upcomingIncidents.length}`);
      console.log(`📋 Total displayable: ${overdueIncidents.length + upcomingIncidents.length}`);
    }
  }, [open, childId, pendingIncidents, overdueIncidents.length, upcomingIncidents.length]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid #e5e7eb',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 3,
            px: 3,
            borderBottom: '1px solid #f1f3f4',
          }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Follow-ups for {childName}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { 
                bgcolor: 'grey.100',
                color: 'text.primary'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : pendingIncidents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 4 }}>
              <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 3, opacity: 0.8 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                All caught up!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>
                No pending follow-ups for {childName}. Great job staying on top of things! 🎉
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {/* Overdue Section */}
              {overdueIncidents.length > 0 && (
                <>
                  <ListItem 
                    sx={{ 
                      py: 2,
                      px: 3,
                      borderBottom: '1px solid #fecaca',
                      backgroundColor: '#fef2f2'
                    }}
                  >
                    <ListItemIcon>
                      <WarningIcon sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.dark' }}>
                          {overdueIncidents.length} Overdue Follow-up{overdueIncidents.length > 1 ? 's' : ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {overdueIncidents.map((incident) => (
                    <ListItem 
                      key={incident.id}
                      button
                      onClick={() => handleIncidentClick(incident)}
                      sx={{ 
                        py: 2,
                        px: 3,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f3f4f6',
                        mb: 1.5,
                        '&:hover': { 
                          backgroundColor: '#fef2f2',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          transform: 'translateY(-1px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      <ListItemIcon>
                        {getFollowUpIcon(incident)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {getIncidentIcon(incident)} {incident.customIncidentName || incident.type}
                            </Typography>
                            <Chip label="OVERDUE" size="small" color="error" />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Remedy: {incident.remedy} • {formatTimeAgo(incident.timestamp)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                  {upcomingIncidents.length > 0 && <Box sx={{ height: 8, backgroundColor: '#f9fafb' }} />}
                </>
              )}

              {/* Upcoming Section */}
              {upcomingIncidents.length > 0 && (
                <>
                  <ListItem 
                    sx={{ 
                      py: 2,
                      px: 3,
                      borderBottom: '1px solid #bfdbfe',
                      backgroundColor: '#eff6ff'
                    }}
                  >
                    <ListItemIcon>
                      <ScheduleIcon sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                          {upcomingIncidents.length} Upcoming Follow-up{upcomingIncidents.length > 1 ? 's' : ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {upcomingIncidents.map((incident) => (
                    <ListItem 
                      key={incident.id}
                      button
                      onClick={() => handleIncidentClick(incident)}
                      sx={{ 
                        py: 2,
                        px: 3,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f3f4f6',
                        mb: 1.5,
                        '&:hover': { 
                          backgroundColor: '#eff6ff',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          transform: 'translateY(-1px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      <ListItemIcon>
                        {getFollowUpIcon(incident)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {getIncidentIcon(incident)} {incident.customIncidentName || incident.type}
                            </Typography>
                            <Chip 
                              label={formatFollowUpTime(incident.followUpTime)} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Remedy: {incident.remedy} • {formatTimeAgo(incident.timestamp)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </>
              )}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #f1f3f4',
          justifyContent: 'flex-end'
        }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Follow-up Modal */}
      <IncidentFollowUpModal
        open={showFollowUpModal}
        onClose={handleFollowUpComplete}
        incident={selectedIncident}
        childName={childName}
      />
    </>
  );
};

export default PendingFollowUpModal;
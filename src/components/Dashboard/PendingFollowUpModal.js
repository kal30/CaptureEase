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
import IncidentFollowUpModal from './IncidentFollowUpModal';

const PendingFollowUpModal = ({ 
  open, 
  onClose, 
  childId, 
  childName 
}) => {
  const theme = useTheme();
  const [pendingIncidents, setPendingIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // Load pending follow-ups when modal opens
  useEffect(() => {
    if (open && childId) {
      loadPendingFollowUps();
    }
  }, [open, childId]);

  const loadPendingFollowUps = async () => {
    setLoading(true);
    try {
      const incidents = await getIncidentsPendingFollowUp(childId);
      setPendingIncidents(incidents);
    } catch (error) {
      console.error('Error loading pending follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const time = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatFollowUpTime = (timestamp) => {
    const time = timestamp?.toDate?.() || new Date(timestamp);
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
  };

  const getIncidentIcon = (incident) => {
    const incidentConfig = Object.values(INCIDENT_TYPES).find(
      type => type.id === incident.type
    );
    return incidentConfig?.emoji || '📝';
  };

  const getFollowUpIcon = (incident) => {
    const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
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
    // Refresh the list
    loadPendingFollowUps();
  };

  const overdueIncidents = pendingIncidents.filter(incident => {
    const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
    return followUpTime <= new Date();
  });

  const upcomingIncidents = pendingIncidents.filter(incident => {
    const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
    return followUpTime > new Date();
  });

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
                        borderLeft: '4px solid',
                        borderLeftColor: 'error.main',
                        backgroundColor: 'white',
                        '&:hover': { 
                          backgroundColor: '#fef2f2',
                        },
                        '&:not(:last-child)': {
                          borderBottom: '1px solid #f3f4f6'
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
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main',
                        backgroundColor: 'white',
                        '&:hover': { 
                          backgroundColor: '#eff6ff',
                        },
                        '&:not(:last-child)': {
                          borderBottom: '1px solid #f3f4f6'
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
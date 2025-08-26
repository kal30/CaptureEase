import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { getTodayCompletionStatus } from '../../services/dailyCareService';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
  maxHeight: '90vh',
  overflow: 'auto',
};

const DailyReportModal = ({ open, onClose, child, onEditAction }) => {
  const theme = useTheme();
  const [completionData, setCompletionData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayData = async () => {
      if (!child?.id) return;
      
      setLoading(true);
      try {
        // Get completion status from database
        const todayStatus = await getTodayCompletionStatus(child.id);
        setCompletionData(todayStatus);
      } catch (error) {
        console.error('Error fetching daily report data:', error);
        // Fallback to empty state
        setCompletionData({});
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchTodayData();
    }
  }, [open, child?.id]);

  const dailyCareItems = [
    {
      key: 'mood',
      label: 'Mood',
      icon: '😊',
      color: '#6D28D9',
      getSummary: (data) => data ? `${data.moodLevel}/5 ${data.moodTags?.join(', ') || ''}` : null
    },
    {
      key: 'sleep',
      label: 'Sleep',
      icon: '😴',
      color: '#6D28D9',
      getSummary: (data) => data ? `${data.sleepDuration || 0} hrs, ${data.sleepQuality}/5 quality` : null
    },
    {
      key: 'energy',
      label: 'Energy',
      icon: '⚡',
      color: '#6D28D9',
      getSummary: (data) => data ? `${data.energyLevel}/5 energy level` : null
    },
    {
      key: 'food_health',
      label: 'Food & Medicine',
      icon: '🍎',
      color: '#6D28D9',
      getSummary: (data) => data ? `${data.mealsEaten?.length || 0} meals logged` : null
    },
    {
      key: 'safety',
      label: 'Safety Check',
      icon: '🛡️',
      color: '#6D28D9',
      getSummary: (data) => data ? data.safetyStatus || 'Checked' : null
    }
  ];

  const completedItems = dailyCareItems.filter(item => completionData[item.key]);
  const hasAnyEntries = completedItems.length > 0;

  const handleEditClick = (actionKey) => {
    onEditAction(actionKey);
    onClose();
  };

  const handleStartWithMood = () => {
    onEditAction('mood');
    onClose();
  };

  if (loading) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography>Loading daily report...</Typography>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '1.5rem' }}>🗓️</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#6D28D9' }}>
              Daily Report for {child?.name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Date */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>

        {hasAnyEntries ? (
          <>
            {/* Completed Items */}
            <Box sx={{ mb: 3 }}>
              {dailyCareItems.map((item) => {
                const isCompleted = !!completionData[item.key];
                const data = completionData[item.key];
                const summary = item.getSummary(data);

                return (
                  <Box
                    key={item.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 2,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      {isCompleted ? (
                        <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: '1.2rem' }} />
                      ) : (
                        <UncheckedIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                      )}
                      
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography sx={{ fontSize: '1rem' }}>{item.icon}</Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              color: isCompleted ? 'text.primary' : 'text.secondary',
                              textDecoration: !isCompleted ? 'none' : 'none'
                            }}
                          >
                            {item.label}:
                          </Typography>
                        </Box>
                        
                        {isCompleted ? (
                          <>
                            <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                              {summary}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              logged at {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit', 
                                hour12: true 
                              }) : 'today'}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not logged yet
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <IconButton 
                      size="small" 
                      onClick={() => handleEditClick(item.key)}
                      sx={{ 
                        color: isCompleted ? item.color : 'text.secondary',
                        '&:hover': { bgcolor: alpha(item.color, 0.1) }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>

            {/* Summary Stats */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Chip
                label={`${completedItems.length} of ${dailyCareItems.length} completed today`}
                sx={{
                  bgcolor: completedItems.length === dailyCareItems.length 
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha('#6D28D9', 0.1),
                  color: completedItems.length === dailyCareItems.length 
                    ? theme.palette.success.dark
                    : '#6D28D9',
                  fontWeight: 600,
                }}
              />
            </Box>
          </>
        ) : (
          <>
            {/* Empty State */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>📝</Typography>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
                No entries yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                What would you like to start with?
              </Typography>
              
              <Button
                variant="contained"
                onClick={handleStartWithMood}
                sx={{
                  bgcolor: '#6D28D9',
                  '&:hover': { bgcolor: alpha('#6D28D9', 0.8) },
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                😊 Start with Mood
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default DailyReportModal;
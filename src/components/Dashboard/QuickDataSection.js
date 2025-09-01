import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Psychology as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FlashOn as FlashOnIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import CorrelationDashboard from '../Analytics/CorrelationDashboard';

const QuickDataSection = ({ children, userRole, onEditChild, onDeleteChild }) => {
  const theme = useTheme();
  const [showDataCollector, setShowDataCollector] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [mockData, setMockData] = useState({});

  // Initialize mock data for demo
  useEffect(() => {
    const initialData = {};
    children?.forEach(child => {
      initialData[child.id] = {
        hasDataToday: Math.random() > 0.6,
        dataCompleteness: Math.floor(Math.random() * 100),
        weeklyEntries: Math.floor(Math.random() * 7),
        recentInsights: [
          {
            finding: 'Better sleep correlates with improved focus',
            confidence: 0.82
          }
        ]
      };
    });
    setMockData(initialData);
  }, [children]);

  const handleQuickDataEntry = (child) => {
    setSelectedChild(child);
    setShowDataCollector(true);
  };

  const handleDataComplete = (data) => {
    console.log('Data collected:', data);
    // Update mock data
    setMockData(prev => ({
      ...prev,
      [selectedChild.id]: {
        ...prev[selectedChild.id],
        hasDataToday: true,
        dataCompleteness: Math.min(prev[selectedChild.id]?.dataCompleteness + 15, 100),
        weeklyEntries: (prev[selectedChild.id]?.weeklyEntries || 0) + 1
      }
    }));
    setShowDataCollector(false);
    setSelectedChild(null);
  };


  const getTotalDataCompleteness = () => {
    if (!children || children.length === 0) return 0;
    const total = Object.values(mockData).reduce((sum, data) => sum + (data.dataCompleteness || 0), 0);
    return total / children.length;
  };

  const getChildrenWithDataToday = () => {
    return children?.filter(child => mockData[child.id]?.hasDataToday).length || 0;
  };

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 3,
        mb: 4,
        bgcolor: alpha(theme.palette.info.main, 0.02),
        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FlashOnIcon sx={{ color: 'info.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
              Smart Data Collection
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick daily insights • 30 seconds per child • Discover patterns
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Progress Summary */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}
        icon={<InsightsIcon />}
      >
        <Typography variant="body2">
          <strong>{getChildrenWithDataToday()}/{children.length} children</strong> logged data today • 
          <strong> {Math.round(getTotalDataCompleteness())}%</strong> weekly completion rate • 
          Keep it up for better insights!
        </Typography>
      </Alert>

      <Collapse in={expanded}>
        {/* Child Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {children.map((child) => {
            const childData = mockData[child.id] || {};
            return (
              <Grid item xs={12} md={6} lg={4} key={child.id}>
                <Card>
                  <CardContent>
                    <Typography>Quick data view for {child.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Data-driven insights not available
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Weekly Progress Summary */}
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📈 This Week's Progress
            </Typography>
            
            <Grid container spacing={3}>
              {children.map((child) => {
                const childData = mockData[child.id] || {};
                const weeklyProgress = (childData.weeklyEntries || 0) / 7 * 100;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={child.id}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {child.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {childData.weeklyEntries || 0}/7 days
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={weeklyProgress}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={weeklyProgress >= 70 ? 'success' : weeklyProgress >= 40 ? 'warning' : 'error'}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {weeklyProgress >= 70 ? 'Excellent!' : weeklyProgress >= 40 ? 'Good progress' : 'Need more data'}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {/* Data Collection Modal */}
      {showDataCollector && selectedChild && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            p: 2
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDataCollector(false);
            }
          }}
        >
          <Box sx={{ maxWidth: 500, width: '100%' }}>
            <MicroDataCollector
              child={selectedChild}
              onComplete={handleDataComplete}
              onSkip={() => {
                setShowDataCollector(false);
                setSelectedChild(null);
              }}
            />
          </Box>
        </Box>
      )}

    </Paper>
  );
};

export default QuickDataSection;
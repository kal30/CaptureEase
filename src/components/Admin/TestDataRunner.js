import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid
} from '@mui/material';
import { 
  People as PeopleIcon,
  ChildCare as ChildIcon,
  PhotoLibrary as MediaIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import {
  createTestUsers,
  createTestChildren, 
  createTestActivityData,
  generateAllTestData
} from '../../services/testData/testDataGenerator';

const TestDataRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('');

  const runCompleteGeneration = async () => {
    setIsRunning(true);
    setResults(null);
    setError(null);
    setCurrentStep('Starting test data generation...');

    try {
      const result = await generateAllTestData();
      setResults(result);
      setCurrentStep('Completed!');
    } catch (error) {
      setError(error.message);
      setCurrentStep('Failed');
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualStep = async (stepFunction, stepName) => {
    setIsRunning(true);
    setError(null);
    setCurrentStep(`Running ${stepName}...`);

    try {
      const result = await stepFunction();
      setResults({ [stepName.toLowerCase()]: result });
      setCurrentStep(`${stepName} completed!`);
    } catch (error) {
      setError(error.message);
      setCurrentStep(`${stepName} failed`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Test Data Generator
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Generate realistic test data to populate your development environment with users, children, and activity data including photos, videos, and voice memos.
      </Typography>

      {/* Quick Start */}
      <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Start - Generate All Test Data
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Creates 8 test users, 3 children with different care team setups, and 75+ activity entries with media content.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={runCompleteGeneration}
            disabled={isRunning}
            startIcon={isRunning ? <CircularProgress size={20} /> : <PlayIcon />}
          >
            {isRunning ? 'Generating All Test Data...' : 'Generate Complete Test Dataset'}
          </Button>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Individual Steps */}
      <Typography variant="h6" gutterBottom>
        Individual Steps
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Users</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                8 test users with different roles: Care Owners, Partners, Caregivers, and Therapists
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth
                onClick={() => runIndividualStep(createTestUsers, 'Users')}
                disabled={isRunning}
              >
                Create Users
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ChildIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Children</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                3 test children with different care team configurations and access patterns
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth
                onClick={() => runIndividualStep(createTestChildren, 'Children')}
                disabled={isRunning}
              >
                Create Children
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MediaIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Activity Data</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Daily logs, incidents, and media content (photos, videos, voice memos)
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                fullWidth
                onClick={() => runIndividualStep(createTestActivityData, 'Activity Data')}
                disabled={isRunning}
              >
                Create Activities
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status */}
      {currentStep && (
        <Alert severity={isRunning ? "info" : "success"} sx={{ mb: 2 }}>
          {currentStep}
          {isRunning && <CircularProgress size={16} sx={{ ml: 2 }} />}
        </Alert>
      )}

      {/* Results */}
      {results && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
              ✅ Test Data Created Successfully!
            </Typography>
            
            {results.summary && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Summary:</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`${results.summary.users} Users`} color="primary" size="small" />
                  <Chip label={`${results.summary.children} Children`} color="secondary" size="small" />
                  <Chip label={`${results.summary.activities} Activities`} color="success" size="small" />
                </Box>
              </Box>
            )}

            {results.details && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Details:</Typography>
                {Object.entries(results.details).map(([category, items]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize', mb: 1 }}>
                      {category}:
                    </Typography>
                    <List dense>
                      {items.slice(0, 5).map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={item} 
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                          />
                        </ListItem>
                      ))}
                      {items.length > 5 && (
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={`... and ${items.length - 5} more`}
                            primaryTypographyProps={{ variant: 'body2', style: { fontStyle: 'italic' } }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Test data generation failed: {error}
        </Alert>
      )}

      {/* Test Data Overview */}
      <Card sx={{ bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 What Gets Created
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>👥 Test Users (8 total):</Typography>
              <List dense>
                <ListItem><ListItemText primary="• 2 Care Owners (Alice, Bob)" /></ListItem>
                <ListItem><ListItemText primary="• 2 Care Partners (Carol, David)" /></ListItem>
                <ListItem><ListItemText primary="• 2 Caregivers (Eve, Frank)" /></ListItem>
                <ListItem><ListItemText primary="• 2 Therapists (Grace, Henry)" /></ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>👶 Test Children (3 total):</Typography>
              <List dense>
                <ListItem><ListItemText primary="• Emma (complex team - 5 members)" /></ListItem>
                <ListItem><ListItemText primary="• Liam (standard team - 4 members)" /></ListItem>
                <ListItem><ListItemText primary="• Sofia (cross-role access pattern)" /></ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>📱 Activity Data (75+ entries):</Typography>
              <List dense>
                <ListItem><ListItemText primary="• Daily logs with photos, videos, and voice memos" /></ListItem>
                <ListItem><ListItemText primary="• Behavioral incidents with media documentation" /></ListItem>
                <ListItem><ListItemText primary="• Medical events and observations" /></ListItem>
                <ListItem><ListItemText primary="• 30 days of historical data with realistic timestamps" /></ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestDataRunner;
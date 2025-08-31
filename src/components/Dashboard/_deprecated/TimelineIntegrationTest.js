import React from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import { TimelineWidget, TimelineProgressRing, MiniCalendar } from '../UI';

/**
 * TimelineIntegrationTest - Simple test component to verify timeline integration
 * This can be imported and used in any page to test the components work correctly
 * Remove after confirming integration works
 */
const TimelineIntegrationTest = () => {
  // Mock data for testing
  const mockChild = {
    id: 'test-child-1',
    name: 'Test Child',
    age: 5
  };

  const mockDailyCareStatus = {
    mood: true,
    sleep: false,
    energy: true,
    food_health: false,
    safety: true,
    dataCompleteness: 60
  };

  const mockEntries = [
    {
      id: '1',
      type: 'daily_note',
      title: 'Great day at playground #fun',
      content: 'Had an amazing time at the playground today. Loved the swings and made new friends. #fun #social #playground',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      icon: '📝',
      color: '#2196F3'
    },
    {
      id: '2',
      type: 'mood_log', 
      title: 'Happy mood logged',
      content: 'Child was very happy today',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: '😊',
      color: '#E91E63'
    },
    {
      id: '3', 
      type: 'daily_note',
      title: 'Nap time #sleep',
      content: 'Took a good nap from 1-3pm. Slept soundly and woke up refreshed. #sleep #nap',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      icon: '📝',
      color: '#2196F3'
    },
    {
      id: '4', 
      type: 'sleep_log',
      title: 'Sleep quality logged',
      content: 'Slept well through the night',
      timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
      icon: '😴',
      color: '#673AB7'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Timeline Integration Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Testing timeline components with mock data including Daily Notes. The timeline now includes:
        <br />• Daily Notes (📝 from dailyLogs collection)
        <br />• Progress rings with completion tracking
        <br />• Full month calendar with navigation
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Test Progress Ring */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Progress Ring Test
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TimelineProgressRing
              status={mockDailyCareStatus}
              completionRate={mockDailyCareStatus.dataCompleteness}
              size="small"
              showPercentage={true}
            />
            <TimelineProgressRing
              status={mockDailyCareStatus}
              completionRate={mockDailyCareStatus.dataCompleteness}
              size="medium"
              showPercentage={true}
            />
            <TimelineProgressRing
              status={mockDailyCareStatus}
              completionRate={mockDailyCareStatus.dataCompleteness}
              size="large"
              showPercentage={true}
            />
          </Box>
        </Box>

        {/* Test Timeline Widget */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Timeline Widget Test
          </Typography>
          <TimelineWidget
            child={mockChild}
            entries={mockEntries}
            dailyCareStatus={mockDailyCareStatus}
            defaultExpanded={true}
            variant="full"
          />
        </Box>

        {/* Test MiniCalendar Standalone */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            MiniCalendar Standalone Test
          </Typography>
          <MiniCalendar
            entries={mockEntries}
            onDayClick={(day, dayEntries, date) => {
              console.log('MiniCalendar day clicked:', { day, dayEntries, date });
            }}
            currentMonth={new Date()}
          />
        </Box>

        {/* Test Timeline Widget Compact */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Timeline Widget Compact Test
          </Typography>
          <TimelineWidget
            child={mockChild}
            entries={[]} // Empty entries
            dailyCareStatus={{
              mood: false,
              sleep: false,
              energy: false,
              food_health: false,
              safety: false,
              dataCompleteness: 0
            }}
            defaultExpanded={false}
            variant="compact"
          />
        </Box>

      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
        If all components render without errors, the integration is successful!
      </Typography>
    </Container>
  );
};

export default TimelineIntegrationTest;


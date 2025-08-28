import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { TimelineWidget } from '../UI';
import { usePanelDashboard } from '../../hooks/usePanelDashboard';

/**
 * TimelineDemo - Standalone demo component for testing timeline integration
 * Safe to add to existing dashboard without breaking anything
 * 
 * Usage:
 * 1. Import in PanelDashboard.js: import TimelineDemo from '../components/Dashboard/TimelineDemo';
 * 2. Add to render: <TimelineDemo />
 * 3. Test functionality and remove after integration is complete
 */
const TimelineDemo = () => {
  const hook = usePanelDashboard();

  if (hook.loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!hook.children.length) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No children found for timeline demo
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Timeline Widget Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Testing the new timeline widget components with existing dashboard data.
        This demo shows how the timeline widget integrates with current daily care tracking.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {hook.children.slice(0, 3).map((child) => {
          const childEntries = hook.recentEntries[child.id] || [];
          const dailyCareStatus = hook.quickDataStatus[child.id] || {};

          return (
            <Box key={child.id}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {child.name}
              </Typography>
              
              {/* Timeline Widget Integration */}
              <TimelineWidget
                child={child}
                entries={childEntries}
                dailyCareStatus={dailyCareStatus}
                defaultExpanded={false}
                variant="full"
              />
              
              {/* Debug Info */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Debug: {childEntries.length} entries, {dailyCareStatus.dataCompleteness || 0}% daily care complete
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
        This demo component can be safely removed after timeline integration is complete.
      </Typography>
    </Container>
  );
};

export default TimelineDemo;
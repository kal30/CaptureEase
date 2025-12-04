import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  Fade
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Components
import EventTimeline from '../components/Timeline/EventTimeline';
import TimelineFilters from '../components/Timeline/EventTimelineFilters';
import { useChildContext } from '../contexts/ChildContext';
import { useEvents } from '../hooks/useEvents';

/**
 * TimelinePage - Main page for displaying the Event-based Timeline
 * Shows all Events chronologically with source information and classifier tags
 *
 * Features:
 * - Unified display of Events from all sources (SMS, WhatsApp, web)
 * - Classifier tags/bucket display when available
 * - Filters by child, bucket, and date range
 * - Chronological ordering with time grouping
 */
const TimelinePage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { children, selectedChild, setSelectedChild } = useChildContext();

  // Timeline filters state
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: null,
      endDate: null
    },
    buckets: [],
    sources: [],
    searchText: '',
    childId: childId
  });

  // Notification state
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Get Events data
  const {
    events,
    loading,
    error,
    metrics,
    refreshEvents
  } = useEvents(childId, filters);

  // Handle child selection from URL params
  React.useEffect(() => {
    if (childId && children.length > 0) {
      const child = children.find(c => c.id === childId);
      if (child && child.id !== selectedChild?.id) {
        setSelectedChild(child);
      }
    }
  }, [childId, children, selectedChild, setSelectedChild]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle child change from filters
  const handleChildChange = useCallback((newChildId) => {
    if (newChildId !== childId) {
      navigate(`/timeline/${newChildId}`);
    }
  }, [childId, navigate]);

  // Show notification
  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  }, []);

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Get current child
  const currentChild = selectedChild || children.find(c => c.id === childId);

  if (!currentChild && children.length > 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">
          Child not found. Please select a valid child from the dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<ChevronRightIcon fontSize="small" />}
          sx={{ mb: 1 }}
        >
          <Link
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Timeline
          </Typography>
        </Breadcrumbs>

        {/* Page Title */}
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Event Timeline
        </Typography>

        {currentChild && (
          <Typography variant="subtitle1" color="text.secondary">
            All events and activities for {currentChild.name}
          </Typography>
        )}
      </Box>

      {/* Timeline Filters */}
      <Fade in timeout={300}>
        <Box>
          <TimelineFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onChildChange={handleChildChange}
            children={children}
            currentChild={currentChild}
            metrics={metrics}
          />
        </Box>
      </Fade>

      {/* Main Timeline Content */}
      <Fade in timeout={600}>
        <Box sx={{ mt: 3 }}>
          <EventTimeline
            events={events}
            loading={loading}
            error={error}
            currentChild={currentChild}
            filters={filters}
            onRefresh={refreshEvents}
            onNotification={showNotification}
          />
        </Box>
      </Fade>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TimelinePage;
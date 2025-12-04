import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Preview as PreviewIcon,
  Timeline as TimelineIcon,
  FilterList as FilterIcon,
  DataObject as DataIcon
} from '@mui/icons-material';

import EventTimeline from './EventTimeline';
import EventTimelineFilters from './EventTimelineFilters';
import { useEvents } from '../../hooks/useEvents';

/**
 * TimelineExampleViews - Demonstration component showing different Timeline views
 *
 * This component showcases:
 * 1. Basic Timeline view with all events
 * 2. Filtered views (by source, bucket, date range)
 * 3. Data structure examples
 * 4. Mock event samples
 */
const TimelineExampleViews = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({});

  // Mock child data
  const mockChild = {
    id: 'demo_child_123',
    name: 'Alex Johnson'
  };

  const mockChildren = [mockChild];

  // Use Events hook with mock data
  const { events, loading, error, metrics, refreshEvents } = useEvents(mockChild.id, filters);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Example filter presets
  const exampleFilters = {
    smsOnly: {
      sources: ['sms'],
      description: 'SMS messages only'
    },
    medicalEvents: {
      buckets: ['Medical', 'Health'],
      description: 'Medical and health-related events'
    },
    lastWeek: {
      dateRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      description: 'Last 7 days'
    },
    highActivity: {
      buckets: ['Behavior', 'Activities', 'Social'],
      sources: ['app', 'web'],
      description: 'Behavior and activity events from app/web'
    }
  };

  const applyExampleFilter = (filterKey) => {
    const filter = exampleFilters[filterKey];
    setFilters(filter);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Event Timeline Examples
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Demonstration of the unified Event Timeline UI with mock data
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            icon={<TimelineIcon />}
            label="Live Timeline"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<FilterIcon />}
            label="Filter Examples"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<DataIcon />}
            label="Data Structure"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Live Timeline Tab */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              This is a fully functional Timeline UI displaying mock Event data.
              In production, this would connect to the real Event ingestion and classifier systems.
            </Typography>
          </Alert>

          {/* Timeline Filters */}
          <EventTimelineFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onChildChange={() => {}} // Mock - single child demo
            children={mockChildren}
            currentChild={mockChild}
            metrics={metrics}
          />

          {/* Timeline Display */}
          <EventTimeline
            events={events}
            loading={loading}
            error={error}
            currentChild={mockChild}
            filters={filters}
            onRefresh={refreshEvents}
            onNotification={(message, severity) => console.log(`Notification: ${message} (${severity})`)}
          />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Filter Examples Tab */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example Filter Presets
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click on any preset below to apply example filters to the timeline.
          </Typography>

          <Stack spacing={2} sx={{ mb: 3 }}>
            {Object.entries(exampleFilters).map(([key, filter]) => (
              <Card
                key={key}
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => applyExampleFilter(key)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filter.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {filter.sources && filter.sources.map(source => (
                        <Chip key={source} label={source} size="small" color="primary" variant="outlined" />
                      ))}
                      {filter.buckets && filter.buckets.map(bucket => (
                        <Chip key={bucket} label={bucket} size="small" color="secondary" variant="outlined" />
                      ))}
                      {filter.dateRange && (
                        <Chip label="Date Range" size="small" color="default" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Current Filter Status */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Current Filters
          </Typography>
          {Object.keys(filters).length > 0 ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                {JSON.stringify(filters, null, 2)}
              </pre>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No filters applied. Use the presets above or the Timeline tab to apply filters.
            </Typography>
          )}

          {/* Results Preview */}
          {events.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                Filtered Results ({events.length} events)
              </Typography>
              <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
                {events.slice(0, 5).map((event, index) => (
                  <Paper key={event.id} variant="outlined" sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.timestamp).toLocaleString()} • {event.source}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {event.title}
                    </Typography>
                    {event.buckets && event.buckets.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        {event.buckets.map(bucket => (
                          <Chip key={bucket} label={bucket} size="small" sx={{ mr: 0.5, height: 18 }} />
                        ))}
                      </Box>
                    )}
                  </Paper>
                ))}
                {events.length > 5 && (
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                    ... and {events.length - 5} more events
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {/* Data Structure Tab */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Event Data Structure
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This shows the expected structure of Event objects that the Timeline UI consumes.
          </Typography>

          {/* Sample Event */}
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            Sample Event Object
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
{`{
  "id": "event_123_456",
  "childId": "child_789",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "sms",
  "title": "Had a great day at school today!",
  "content": "Had a great day at school today! Made a new friend in art class and finished my science project.",
  "buckets": ["Education", "Social"],
  "author": "sms_user_1",
  "metadata": {
    "confidence": 0.87,
    "processingTime": 245,
    "classifierVersion": "1.2.3",
    "phoneNumber": "+1-555-0123"
  }
}`}
            </pre>
          </Paper>

          {/* Field Descriptions */}
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            Field Descriptions
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Stack spacing={1.5}>
              {[
                { field: 'id', description: 'Unique identifier for the event', type: 'string', required: true },
                { field: 'childId', description: 'ID of the child this event relates to', type: 'string', required: true },
                { field: 'timestamp', description: 'When the event occurred (ISO 8601)', type: 'string', required: true },
                { field: 'source', description: 'Source of the event (sms, whatsapp, web, email, app)', type: 'string', required: true },
                { field: 'title', description: 'Short title or summary of the event', type: 'string', required: false },
                { field: 'content', description: 'Full content/text of the event', type: 'string', required: false },
                { field: 'buckets', description: 'Classifier-assigned categories/tags', type: 'array', required: false },
                { field: 'author', description: 'User or system that created the event', type: 'string', required: false },
                { field: 'metadata', description: 'Additional source-specific or processing metadata', type: 'object', required: false }
              ].map(item => (
                <Box key={item.field} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Chip
                    label={item.field}
                    size="small"
                    color={item.required ? 'error' : 'default'}
                    variant="outlined"
                    sx={{ minWidth: 80, fontFamily: 'monospace' }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      {item.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Type: {item.type} • {item.required ? 'Required' : 'Optional'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Integration Notes */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Integration Notes:</strong><br />
              • Events are expected to come from the ingestion system (Agent A)<br />
              • Classifier tags/buckets come from the classification system (Agent B)<br />
              • This UI (Agent C) only consumes and displays the data<br />
              • In production, events would be fetched from Firestore or another data source
            </Typography>
          </Alert>
        </Box>
      )}
    </Container>
  );
};

export default TimelineExampleViews;
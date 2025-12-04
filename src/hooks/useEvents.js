import { useState, useEffect, useMemo, useCallback } from 'react';
import { filterEvents, calculateTimelineMetrics } from '../utils/timelineUtils';

/**
 * useEvents - Hook for fetching and managing Event data for the timeline
 *
 * Note: This hook currently returns mock data since the actual Event ingestion
 * and classifier systems are handled by other agents. In production, this would
 * connect to the real Event data source (Firestore collection, API, etc.)
 *
 * @param {string} childId - ID of the child to fetch events for
 * @param {Object} filters - Filter criteria for events
 * @returns {Object} Hook state and methods
 */
export const useEvents = (childId, filters = {}) => {
  const [rawEvents, setRawEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter and process events based on current filters
  const events = useMemo(() => {
    if (!rawEvents.length) return [];
    return filterEvents(rawEvents, filters);
  }, [rawEvents, filters]);

  // Calculate metrics from filtered events
  const metrics = useMemo(() => {
    return calculateTimelineMetrics(events);
  }, [events]);

  // Mock data generator for demonstration
  const generateMockEvents = useCallback((childId) => {
    if (!childId) return [];

    const now = new Date();
    const sources = ['sms', 'whatsapp', 'web', 'email', 'app'];
    const buckets = [
      ['Medical', 'Health'],
      ['Behavior', 'Activities'],
      ['Mood', 'Emotional'],
      ['Sleep', 'Rest'],
      ['Nutrition', 'Food'],
      ['Education', 'Learning'],
      ['Social', 'Friends'],
      ['Therapy', 'Treatment'],
      ['Safety', 'Emergency'],
      ['Communication', 'Messages']
    ];

    const sampleContents = [
      "Had a great day at school today! Made a new friend in art class.",
      "Feeling a bit anxious about tomorrow's test. Need some encouragement.",
      "Lunch was delicious - tried the new pasta dish in the cafeteria.",
      "Successfully completed homework without any meltdowns. Progress!",
      "Had trouble sleeping last night. Too excited about the field trip.",
      "Therapy session went well. Working on coping strategies.",
      "Medication taken at 8 AM as scheduled. No side effects noted.",
      "Played soccer at recess. Scored a goal and felt really proud.",
      "Sent a message to mom about pickup time change.",
      "Dr. Smith recommended increasing exercise time to 30 minutes daily.",
      "Behavioral intervention working well. Reduced outbursts this week.",
      "Communication device helped express feelings during difficult moment."
    ];

    const mockEvents = [];

    // Generate events for the past 30 days
    for (let days = 0; days < 30; days++) {
      const numEvents = Math.floor(Math.random() * 4) + 1; // 1-4 events per day

      for (let i = 0; i < numEvents; i++) {
        const eventDate = new Date(now);
        eventDate.setDate(eventDate.getDate() - days);
        eventDate.setHours(
          Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        );

        const source = sources[Math.floor(Math.random() * sources.length)];
        const bucketSet = buckets[Math.floor(Math.random() * buckets.length)];
        const content = sampleContents[Math.floor(Math.random() * sampleContents.length)];

        const event = {
          id: `event_${childId}_${days}_${i}`,
          childId,
          timestamp: eventDate.toISOString(),
          source,
          title: content.split('.')[0] + '.',
          content,
          buckets: Math.random() > 0.3 ? bucketSet : [], // 70% chance of having buckets
          author: `${source}_user_${Math.floor(Math.random() * 3) + 1}`,
          metadata: {
            confidence: Math.random() * 0.3 + 0.7, // 0.7 - 1.0 confidence
            processingTime: Math.floor(Math.random() * 1000) + 100,
            classifierVersion: '1.2.3'
          }
        };

        // Add source-specific metadata
        switch (source) {
          case 'sms':
            event.metadata.phoneNumber = '+1-555-0' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
            break;
          case 'whatsapp':
            event.metadata.whatsappId = 'wa_' + Math.random().toString(36).substring(7);
            break;
          case 'web':
            event.metadata.sessionId = 'sess_' + Math.random().toString(36).substring(7);
            event.metadata.userAgent = 'Mozilla/5.0 (Example Browser)';
            break;
          case 'email':
            event.metadata.emailId = 'email_' + Math.random().toString(36).substring(7);
            event.metadata.subject = content.split('.')[0];
            break;
          case 'app':
            event.metadata.deviceId = 'device_' + Math.random().toString(36).substring(7);
            event.metadata.appVersion = '2.1.0';
            break;
        }

        mockEvents.push(event);
      }
    }

    // Sort by timestamp (newest first)
    return mockEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, []);

  // Fetch events for the specified child
  const fetchEvents = useCallback(async (childId) => {
    if (!childId) {
      setRawEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In production, this would be a real API call:
      // const events = await eventsApi.getEventsForChild(childId);

      // For demo purposes, generate mock data
      const mockEvents = generateMockEvents(childId);

      setRawEvents(mockEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err);
      setRawEvents([]);
    } finally {
      setLoading(false);
    }
  }, [generateMockEvents]);

  // Refresh events
  const refreshEvents = useCallback(() => {
    if (childId) {
      fetchEvents(childId);
    }
  }, [childId, fetchEvents]);

  // Fetch events when childId changes
  useEffect(() => {
    fetchEvents(childId);
  }, [childId, fetchEvents]);

  return {
    events,
    rawEvents,
    loading,
    error,
    metrics,
    refreshEvents
  };
};

export default useEvents;
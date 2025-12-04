/**
 * Timeline utility functions for Event grouping and organization
 */

/**
 * Group events by day
 * @param {Array} events - Array of Event objects
 * @returns {Array} Array of day groups with events
 */
export const groupEventsByDay = (events = []) => {
  if (!events.length) return [];

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    const aTime = new Date(a.timestamp);
    const bTime = new Date(b.timestamp);
    return bTime - aTime;
  });

  // Group by day
  const groups = new Map();

  sortedEvents.forEach(event => {
    const eventDate = new Date(event.timestamp);
    const dayKey = eventDate.toDateString();

    if (!groups.has(dayKey)) {
      groups.set(dayKey, {
        date: new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
        events: []
      });
    }

    groups.get(dayKey).events.push(event);
  });

  return Array.from(groups.values());
};

/**
 * Group events by time period within a day (morning, afternoon, evening)
 * @param {Array} events - Array of Event objects for a single day
 * @returns {Array} Array of period groups
 */
export const groupEventsByPeriod = (events = []) => {
  if (!events.length) return [];

  const periods = {
    morning: {
      key: 'morning',
      label: '🌅 Morning',
      startHour: 6,
      endHour: 12,
      events: []
    },
    afternoon: {
      key: 'afternoon',
      label: '☀️ Afternoon',
      startHour: 12,
      endHour: 18,
      events: []
    },
    evening: {
      key: 'evening',
      label: '🌙 Evening',
      startHour: 18,
      endHour: 24,
      events: []
    },
    lateNight: {
      key: 'lateNight',
      label: '🌜 Late Night',
      startHour: 0,
      endHour: 6,
      events: []
    }
  };

  // Sort events by time within the day
  const sortedEvents = [...events].sort((a, b) => {
    const aTime = new Date(a.timestamp);
    const bTime = new Date(b.timestamp);
    return bTime - aTime; // Newest first within each period
  });

  // Group events into periods
  sortedEvents.forEach(event => {
    const eventTime = new Date(event.timestamp);
    const hour = eventTime.getHours();

    if (hour >= periods.morning.startHour && hour < periods.morning.endHour) {
      periods.morning.events.push(event);
    } else if (hour >= periods.afternoon.startHour && hour < periods.afternoon.endHour) {
      periods.afternoon.events.push(event);
    } else if (hour >= periods.evening.startHour && hour < periods.evening.endHour) {
      periods.evening.events.push(event);
    } else {
      periods.lateNight.events.push(event);
    }
  });

  // Return only periods that have events
  return Object.values(periods)
    .filter(period => period.events.length > 0)
    .sort((a, b) => {
      // Sort periods by their start time
      const order = ['morning', 'afternoon', 'evening', 'lateNight'];
      return order.indexOf(a.key) - order.indexOf(b.key);
    });
};

/**
 * Filter events based on filter criteria
 * @param {Array} events - Array of Event objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered events
 */
export const filterEvents = (events = [], filters = {}) => {
  let filtered = [...events];

  // Filter by date range
  if (filters.dateRange?.startDate) {
    const startDate = new Date(filters.dateRange.startDate);
    startDate.setHours(0, 0, 0, 0); // Start of day
    filtered = filtered.filter(event => new Date(event.timestamp) >= startDate);
  }

  if (filters.dateRange?.endDate) {
    const endDate = new Date(filters.dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter(event => new Date(event.timestamp) <= endDate);
  }

  // Filter by sources
  if (filters.sources && filters.sources.length > 0) {
    filtered = filtered.filter(event =>
      event.source && filters.sources.includes(event.source.toLowerCase())
    );
  }

  // Filter by buckets/categories
  if (filters.buckets && filters.buckets.length > 0) {
    filtered = filtered.filter(event => {
      if (!event.buckets || !event.buckets.length) return false;
      return event.buckets.some(bucket => filters.buckets.includes(bucket));
    });
  }

  // Filter by search text
  if (filters.searchText && filters.searchText.trim()) {
    const searchLower = filters.searchText.toLowerCase().trim();
    filtered = filtered.filter(event => {
      const searchableText = [
        event.title,
        event.content,
        event.source,
        ...(event.buckets || []),
        event.author
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(searchLower);
    });
  }

  return filtered;
};

/**
 * Calculate timeline metrics from events
 * @param {Array} events - Array of Event objects
 * @returns {Object} Metrics object
 */
export const calculateTimelineMetrics = (events = []) => {
  if (!events.length) {
    return {
      total: 0,
      sources: [],
      buckets: [],
      sourceCounts: {},
      bucketCounts: {},
      dateRange: null
    };
  }

  // Calculate source counts
  const sourceCounts = {};
  const sources = new Set();

  events.forEach(event => {
    if (event.source) {
      const source = event.source.toLowerCase();
      sources.add(source);
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    }
  });

  // Calculate bucket counts
  const bucketCounts = {};
  const buckets = new Set();

  events.forEach(event => {
    if (event.buckets && Array.isArray(event.buckets)) {
      event.buckets.forEach(bucket => {
        buckets.add(bucket);
        bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
      });
    }
  });

  // Calculate date range
  const timestamps = events.map(e => new Date(e.timestamp)).sort((a, b) => a - b);
  const dateRange = {
    start: timestamps[0],
    end: timestamps[timestamps.length - 1]
  };

  return {
    total: events.length,
    sources: Array.from(sources),
    buckets: Array.from(buckets),
    sourceCounts,
    bucketCounts,
    dateRange
  };
};

/**
 * Format a relative time string (e.g., "2 hours ago", "Yesterday")
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} Formatted relative time string
 */
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const eventTime = new Date(timestamp);
  const diffInMilliseconds = now - eventTime;
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return eventTime.toLocaleDateString();
  }
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} Whether the date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

/**
 * Check if a date is yesterday
 * @param {Date|string} date - Date to check
 * @returns {boolean} Whether the date is yesterday
 */
export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  return checkDate.toDateString() === yesterday.toDateString();
};
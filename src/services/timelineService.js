import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';

// Timeline entry types with their display configurations
export const TIMELINE_TYPES = {
  DAILY_NOTE: {
    type: 'daily_note',
    label: 'Daily Note', 
    icon: '📝',
    color: '#2196F3', // Blue (UI should prefer theme)
    entryGroup: 'dailyNote',
    collection: 'dailyLogs',
    isRootCollection: true // Indicates this is a root collection with childId filter
  },
  PROGRESS_NOTE: {
    type: 'progress_note', 
    label: 'Progress Note',
    icon: '📈',
    color: '#4CAF50', // Green (UI should prefer theme)
    entryGroup: 'dailyNote',
    collection: 'progressNotes'
  },
  SENSORY_LOG: {
    type: 'sensory_log',
    label: 'Sensory Log', 
    icon: '🧠',
    color: '#9C27B0', // Purple (UI should prefer theme)
    entryGroup: 'dailyHabit',
    collection: 'sensoryLogs'
  },
  BEHAVIOR: {
    type: 'behavior',
    label: 'Behavior',
    icon: '⚡',
    color: '#FF9800', // Orange (UI should prefer theme)
    entryGroup: 'dailyHabit',
    collection: 'behaviors'
  },
  MOOD_LOG: {
    type: 'mood_log',
    label: 'Mood Log',
    icon: '😊',
    color: '#E91E63', // Pink (UI should prefer theme)
    entryGroup: 'dailyHabit',
    collection: 'moodLogs'
  },
  MEDICATION_LOG: {
    type: 'medication_log',
    label: 'Medication Log',
    icon: '💊',
    color: '#FF5722', // Deep Orange (UI should prefer theme)
    entryGroup: 'dailyHabit',
    collection: 'medicationLogs'
  },
  FOOD_LOG: {
    type: 'food_log',
    label: 'Food Log',
    icon: '🍎',
    color: '#8BC34A', // Light Green (UI should prefer theme)
    entryGroup: 'dailyHabit',
    collection: 'foodLogs'
  },
  MEDICAL_EVENT: {
    type: 'medical_event',
    label: 'Medical Event',
    icon: '🏥',
    color: '#F44336', // Red (UI should prefer theme)
    entryGroup: 'incident',
    collection: 'medicalEvents'
  },
  SLEEP_LOG: {
    type: 'sleep_log',
    label: 'Sleep Log',
    icon: '😴',
    color: '#673AB7', // Deep Purple (UI should prefer theme)
    entryGroup: 'dailyHabit',
    collection: 'sleepLogs'
  },
  DAILY_CARE: {
    type: 'daily_care',
    label: 'Daily Care',
    icon: '📋',
    color: '#607D8B', // Blue Grey (UI should prefer theme)
    entryGroup: 'dailyHabit',
    collection: 'dailyCare',
    isRootCollection: true // Indicates this is a root collection with childId filter
  },
  CHILD_TIMELINE: {
    type: 'child_timeline',
    label: 'Timeline Entry',
    icon: '⏰',
    color: '#795548', // Brown (UI should prefer theme)  
    entryGroup: 'dailyHabit',
    collection: 'timeline',
    isChildSubCollection: true // Indicates this is a child subcollection
  }
};

export const getTimelineEntryGroup = (type) => {
  const cfg = Object.values(TIMELINE_TYPES).find(t => t.type === type);
  return cfg?.entryGroup || undefined;
};

// Normalize different data structures into a unified timeline entry format
const normalizeTimelineEntry = (doc, type) => {
  const data = doc.data();
  const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === type);
  
  // Extract common fields with fallbacks for different data structures
  let title = '';
  let content = '';
  let timestamp = data.timestamp || data.createdAt || data.date;
  
  switch (type) {
    case 'daily_note':
      // Daily notes from dailyLogs collection use 'text' field
      const noteText = data.text || data.note || data.content || data.description || '';
      // Generate title from first line of text (up to 50 chars) or use tags
      if (data.tags && data.tags.length > 0) {
        title = `Note: #${data.tags[0]}`;
      } else if (noteText) {
        const firstLine = noteText.split('\n')[0].trim();
        title = firstLine.length > 50 ? `${firstLine.substring(0, 47)}...` : firstLine || 'Daily Note';
      } else {
        title = 'Daily Note';
      }
      content = noteText;
      break;
    case 'progress_note':
      title = data.title || data.goal || 'Progress Update';
      content = data.note || data.progress || data.content || '';
      break;
    case 'sensory_log':
      title = `Sensory: ${data.sensoryType || 'General'}`;
      content = data.description || data.notes || data.content || '';
      break;
    case 'behavior':
      title = `Behavior: ${data.behaviorType || data.type || 'Incident'}`;
      content = data.description || data.notes || data.details || '';
      break;
    case 'mood_log':
      title = `Mood: ${data.mood || 'Update'}`;
      content = data.notes || data.description || data.details || '';
      break;
    case 'daily_care':
      // Handle daily care entries (mood, sleep, food, safety)
      const actionType = data.actionType || 'Daily Care';
      const careData = data.data || {};
      title = `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}: ${careData.value || careData.mood || careData.rating || 'Update'}`;
      content = careData.notes || data.notes || careData.description || '';
      break;
    case 'child_timeline':
      // Handle child timeline entries  
      title = data.title || data.actionType || 'Timeline Entry';
      content = data.notes || data.content || data.description || '';
      break;
    default:
      title = 'Entry';
      content = data.content || data.note || data.description || '';
  }

  return {
    id: doc.id,
    type,
    title,
    content,
    timestamp,
    author: data.author || data.createdBy || data.userId || 'Unknown',
    ...typeConfig,
    originalData: data // Keep original data for detailed views
  };
};

// Fetch timeline entries for a specific child
export const getTimelineEntries = (childId, callback) => {
  const unsubscribeFunctions = [];
  let allEntries = [];
  let loadedCollections = 0;
  const totalCollections = Object.keys(TIMELINE_TYPES).length;

  const updateCallback = () => {
    loadedCollections += 1;
    if (loadedCollections === totalCollections) {
      // Sort all entries by timestamp (newest first)
      const sortedEntries = allEntries.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp) || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp) || new Date(0);
        return bTime - aTime;
      });
      callback(sortedEntries);
    }
  };

  // Subscribe to each collection
  Object.values(TIMELINE_TYPES).forEach(typeConfig => {
    try {
      let q;
      
      if (typeConfig.isRootCollection) {
        // Root collection with childId filter (like dailyCare)
        q = query(
          collection(db, typeConfig.collection),
          where('childId', '==', childId),
          orderBy('timestamp', 'desc')
        );
      } else if (typeConfig.isChildSubCollection) {
        // Child subcollection (like children/[childId]/timeline)
        q = query(
          collection(db, 'children', childId, typeConfig.collection),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Legacy: Child-specific collection (traditional structure)
        q = query(
          collection(db, 'children', childId, typeConfig.collection),
          orderBy('timestamp', 'desc')
        );
      }

      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Remove existing entries of this type
        allEntries = allEntries.filter(entry => entry.type !== typeConfig.type);
        
        // Add new entries of this type
        const newEntries = snapshot.docs.map(doc => 
          normalizeTimelineEntry(doc, typeConfig.type)
        );
        allEntries = [...allEntries, ...newEntries];
        
        updateCallback();
      }, (error) => {
        console.error(`Error fetching ${typeConfig.collection}:`, error);
        updateCallback(); // Continue even if one collection fails
      });

      unsubscribeFunctions.push(unsubscribe);
    } catch (error) {
      console.error(`Error setting up listener for ${typeConfig.collection}:`, error);
      updateCallback(); // Continue even if setup fails
    }
  });

  // Return cleanup function
  return () => {
    unsubscribeFunctions.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
  };
};

// Filter timeline entries
export const filterTimelineEntries = (entries, filters = {}) => {
  let filtered = [...entries];

  // Filter by type
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(entry => filters.types.includes(entry.type));
  }

  // Filter by date range
  if (filters.startDate) {
    filtered = filtered.filter(entry => {
      const entryDate = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
      return entryDate >= filters.startDate;
    });
  }

  if (filters.endDate) {
    filtered = filtered.filter(entry => {
      const entryDate = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
      return entryDate <= filters.endDate;
    });
  }

  // Filter by search text
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(entry => 
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower)
    );
  }

  // Filter by author
  if (filters.author) {
    filtered = filtered.filter(entry => 
      entry.author && entry.author.toLowerCase().includes(filters.author.toLowerCase())
    );
  }

  return filtered;
};

// Export timeline data (for future use)
export const exportTimelineData = (entries, format = 'json') => {
  if (format === 'json') {
    return JSON.stringify(entries, null, 2);
  }
  
  if (format === 'csv') {
    const headers = ['Date', 'Time', 'Type', 'Title', 'Content', 'Author'];
    const rows = entries.map(entry => {
      const date = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        entry.label,
        entry.title,
        entry.content.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        entry.author
      ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  return entries;
};

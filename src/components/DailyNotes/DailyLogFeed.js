import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import LogEntry from "./LogEntry";
import { Box, Typography, CircularProgress, Divider, Paper } from "@mui/material";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

const DailyLogFeed = ({ childId, selectedDate = new Date(), searchQuery = "", onEntriesLoad }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const dateRefs = useRef({});

  // Firebase data fetching effect
  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }
    
    const q = query(
      collection(db, "dailyLogs"),
      where("childId", "==", childId)
      // Temporarily removed orderBy to avoid index requirement
      // Add back after creating composite index: childId + timestamp
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEntries = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp
              ? doc.data().timestamp.toDate()
              : new Date(), // Convert Firebase Timestamp to JS Date
          }))
          // Show ALL entries, no date filtering
          .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp desc in JavaScript
        
        // Extract unique dates that have entries
        const datesWithEntries = [...new Set(
          fetchedEntries.map(entry => entry.timestamp.toDateString())
        )];
        
        setEntries(fetchedEntries);
        setLoading(false);
        
        // Notify parent component of dates with entries
        if (onEntriesLoad) {
          onEntriesLoad(datesWithEntries);
        }
      },
      (error) => {
        console.error("Error fetching daily logs: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [childId]);

  // Scroll to selected date effect - using a simpler approach
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedDate && dateRefs.current) {
        const dateKey = dayjs(selectedDate).format('YYYY-MM-DD');
        const targetElement = dateRefs.current[dateKey];
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }
    }, 300); // Wait for entries to render

    return () => clearTimeout(timer);
  }, [selectedDate]);

  const handleEditEntry = async (entryId, newText) => {
    try {
      const entryRef = doc(db, "dailyLogs", entryId);
      await updateDoc(entryRef, {
        text: newText,
        // Re-extract tags from the updated text
        tags: extractTags(newText),
        updatedAt: new Date(),
      });
      console.log('Entry updated successfully');
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const entryRef = doc(db, "dailyLogs", entryId);
      await deleteDoc(entryRef);
      console.log('Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  };

  const extractTags = (inputText) => {
    const tagRegex = /#(\w+)/g;
    const matches = [...inputText.matchAll(tagRegex)];
    return matches.map((match) => match[1]);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (entries.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          📝 No entries yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start logging your child's daily activities, milestones, and observations above.
        </Typography>
      </Paper>
    );
  }

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const text = (entry.text || '').toLowerCase();
    const tags = entry.tags || [];
    
    // Search in text content
    if (text.includes(query)) return true;
    
    // Search in tags (support both #tag and tag format)
    const searchTerm = query.startsWith('#') ? query.slice(1) : query;
    if (tags.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
    
    return false;
  });

  // Group filtered entries by date for better organization
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = dayjs(entry.timestamp).format('YYYY-MM-DD');
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {});

  // Sort groups by date (newest first)
  const sortedGroupEntries = Object.entries(groupedEntries)
    .sort(([dateA], [dateB]) => dayjs(dateB).diff(dayjs(dateA)));

  // Show "no results" for search
  if (searchQuery.trim() && sortedGroupEntries.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          🔍 No results found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No entries match "{searchQuery}". Try a different search term.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {sortedGroupEntries.map(([date, dateEntries]) => (
        <Paper 
          key={date} 
          elevation={2} 
          ref={el => {
            if (el) {
              dateRefs.current[date] = el;
            }
          }}
          sx={{ 
            p: 3,
            borderRadius: 2
          }}
        >
          {/* Date Header */}
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              color: 'text.primary',
              fontWeight: 600
            }}
          >
            {dayjs(date).isSame(dayjs(), 'day') ? 'Today' :
             dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day') ? 'Yesterday' :
             dayjs(date).format('MMMM D, YYYY')}
          </Typography>

          {/* Entries for this day */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dateEntries.map((entry) => (
              <LogEntry 
                key={entry.id}
                entry={entry} 
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
              />
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default DailyLogFeed;

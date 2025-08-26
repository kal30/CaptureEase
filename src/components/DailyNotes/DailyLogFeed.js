import React, { useState, useEffect } from "react";
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
import { Box, Typography, CircularProgress } from "@mui/material";

const DailyLogFeed = ({ childId, selectedDate = new Date() }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }

    // Filter entries for the selected date
    const selectedDateString = selectedDate.toDateString();
    
    const q = query(
      collection(db, "dailyLogs"),
      where("childId", "==", childId),
      orderBy("timestamp", "desc")
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
          .filter((entry) => {
            // Filter by selected date
            const entryDate = entry.entryDate || entry.timestamp.toDateString();
            return entryDate === selectedDateString;
          });
        console.log('DailyLogFeed: Total docs from Firebase:', snapshot.docs.length);
        console.log('DailyLogFeed: Filtered entries for', selectedDateString, ':', fetchedEntries.length);
        setEntries(fetchedEntries);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching daily logs: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [childId, selectedDate]);

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
      <Typography
        variant="h6"
        color="textSecondary"
        align="center"
        sx={{ mt: 4 }}
      >
        No daily logs yet. Start by adding one above!
      </Typography>
    );
  }

  return (
    <Box>
      {entries.map((entry) => (
        <LogEntry key={entry.id} entry={entry} />
      ))}
    </Box>
  );
};

export default DailyLogFeed;

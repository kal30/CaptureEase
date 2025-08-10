import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import LogEntry from "./LogEntry";
import { Box, Typography, CircularProgress } from "@mui/material";

const DailyLogFeed = ({ childId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "dailyLogs"),
      where("childId", "==", childId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEntries = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp
            ? doc.data().timestamp.toDate()
            : new Date(), // Convert Firebase Timestamp to JS Date
        }));
        setEntries(fetchedEntries);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching daily logs: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [childId]);

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

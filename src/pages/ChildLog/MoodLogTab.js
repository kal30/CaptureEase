import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const MoodLogTab = ({ childId }) => {
  const [moodLogs, setMoodLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'children', childId, 'moodLogs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMoodLogs(logs);
    });

    return () => unsubscribe();
  }, [childId]);

  return (
    <Box>
      <Typography variant="h5">Mood Log</Typography>
      <List>
        {moodLogs.map(log => (
          <ListItem key={log.id}>
            <ListItemText 
              primary={log.mood}
              secondary={new Date(log.timestamp?.toDate()).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MoodLogTab;

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditJournalModal from './EditJournalModal';
import { deleteJournalEntry } from '../../services/journalService'; // Import the delete service
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; // Firebase imports
import { db } from '../../services/firebase'; // Import your Firebase configuration

const JournalList = ({ childId }) => {
  const [entries, setEntries] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'children', childId, 'journals'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => unsubscribe();
  }, [childId]);

  const handleEdit = (journal) => {
    setSelectedJournal(journal);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedJournal(null);
  };

  const handleDelete = async (journalId) => {
    try {
      await deleteJournalEntry(childId, journalId);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  return (
    <Box>
      {entries.map((entry) => (
        <Paper key={entry.id} sx={{ mb: 2, padding: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{entry.title}</Typography>
              <Typography variant="subtitle2">{new Date(entry.date.toDate()).toLocaleDateString()}</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>{entry.content}</Typography>
            </Box>
            <Box>
              {/* Edit and Delete Buttons */}
              <IconButton onClick={() => handleEdit(entry)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(entry.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      ))}

      {/* Edit Journal Modal */}
      {selectedJournal && (
        <EditJournalModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          journal={selectedJournal}
          childId={childId}
        />
      )}
    </Box>
  );
};

export default JournalList;
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditJournalModal from './EditJournalModal';
import MediaPreview from './MediaPreview'; // Import the MediaPreview component
import { deleteJournalEntry } from '../../services/journalService'; 
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'; 
import { db } from '../../services/firebase'; 

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
        <Paper 
          key={entry.id} 
          elevation={3} 
          sx={{ 
            mb: 3, 
            padding: 3, 
            borderRadius: 2, 
            backgroundColor: '#F4DECB', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', 
            transition: '0.3s ease-in-out', 
            '&:hover': { boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.2)' } 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flex: 1, marginRight: '20px', maxWidth: '80%' }}>
              {/* Title */}
              <Typography 
                variant="h6" 
                sx={{ fontWeight: 'bold', color: '#333333' }}
              >
                {entry.title}
              </Typography>

              {/* Date */}
              <Typography 
                variant="subtitle2" 
                sx={{ color: '#777777', mb: 1 }}
              >
                {new Date(entry.date.toDate()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>

              {/* Content */}
              <Typography 
                variant="body1" 
                sx={{ mt: 1, color: '#333333' }}
              >
                {entry.content}
              </Typography>

              {/* Render Media using MediaPreview */}
              {entry.mediaURL && <MediaPreview mediaURL={entry.mediaURL} />} {/* Use MediaPreview component */}
            </Box>

            {/* Edit and Delete Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: '50px' }}>
              <IconButton 
                onClick={() => handleEdit(entry)} 
                sx={{ 
                  '&:hover': { color: '#1F3A93' },
                  marginRight: '8px'
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={() => handleDelete(entry.id)} 
                sx={{ 
                  '&:hover': { color: '#FF6B6B' }
                }}
              >
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
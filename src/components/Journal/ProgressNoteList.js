import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditProgressNoteModal from "./EditProgressNoteModal";
import { deleteProgressNote } from "../../services/progressNotesService";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import MediaPreview from "./MediaPreview";

const ProgressNoteList = ({ childId, selectedDate }) => {
  const [entries, setEntries] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProgressNote, setSelectedProgressNote] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [progressNoteToDelete, setProgressNoteToDelete] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "children", childId, "progressNotes"),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => unsubscribe();
  }, [childId]);

  const handleDeleteClick = (progressNote) => {
    setProgressNoteToDelete(progressNote);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (progressNoteToDelete) {
      await deleteProgressNote(childId, progressNoteToDelete.id);
      setEntries(entries.filter((j) => j.id !== progressNoteToDelete.id));
      setDeleteConfirmOpen(false);
      setProgressNoteToDelete(null);
    }
  };

  const handleEditClick = (progressNote) => {
    setSelectedProgressNote(progressNote);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = async () => {
    setEditModalOpen(false);
    setSelectedProgressNote(null);
    // Refresh entries after edit
    const q = query(
      collection(db, "children", childId, "progressNotes"),
      orderBy("date", "desc")
    );
    const snapshot = await q;
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEntries(data);
  };

  const filteredEntries = selectedDate
    ? entries.filter(
        (entry) =>
          entry.date &&
          entry.date.toDate().toDateString() === selectedDate.toDateString()
      )
    : entries;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        All Progress Notes
      </Typography>
      {filteredEntries.length === 0 ? (
        <Typography>No progress notes found.</Typography>
      ) : (
        <List>
          {filteredEntries.map((entry) => (
            <ListItem
              key={entry.id}
              sx={{
                border: "1px solid #ddd",
                mb: 2,
                borderRadius: 2,
                flexDirection: "column",
                alignItems: "flex-start",
                backgroundColor: "background.default",
                boxShadow: `0px 4px 12px rgba(0, 0, 0, 0.05)`, // Lighter shadow
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: `0px 6px 14px rgba(0, 0, 0, 0.1)`, // Softer shadow on hover
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="h6" component="h2">
                    {entry.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Date:{" "}
                      {entry.date
                        ? entry.date.toDate().toLocaleDateString()
                        : "N/A"}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Progress Note: {entry.content}
                    </Typography>
                    {entry.tags && entry.tags.length > 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Tags: {entry.tags.join(", ")}
                      </Typography>
                    )}
                    {entry.mediaURL && (
                      <Box sx={{ mt: 2, width: "100%", maxWidth: 300 }}>
                        <MediaPreview mediaURL={entry.mediaURL} />
                      </Box>
                    )}
                  </>
                }
              />
              <Box sx={{ alignSelf: "flex-end" }}>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditClick(entry)}
                  sx={{
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteClick(entry)}
                  sx={{
                    "&:hover": { color: "secondary.main" },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      <EditProgressNoteModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        progressNote={selectedProgressNote}
        childId={childId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this progress note? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgressNoteList;

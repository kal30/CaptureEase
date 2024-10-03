import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, IconButton, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditJournalModal from "./EditJournalModal";
import { deleteJournalEntry } from "../../services/journalService";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";

const JournalList = ({ childId }) => {
  const [entries, setEntries] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, "children", childId, "journals"),
      orderBy("date", "desc")
    );
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
      console.error("Error deleting journal entry:", error);
    }
  };

  const renderMedia = (mediaURL) => {
    if (!mediaURL) return null;

    const fileExtension = mediaURL.split(".").pop().split("?")[0];
    const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension);
    const isVideo = ["mp4", "webm", "ogg"].includes(fileExtension);
    const isAudio = ["mp3", "wav", "ogg"].includes(fileExtension);

    if (isImage) {
      return (
        <img
          src={mediaURL}
          alt="journal-media"
          style={{
            maxWidth: "200px",
            maxHeight: "200px",
            borderRadius: "8px",
            marginTop: "10px",
          }}
        />
      );
    } else if (isVideo) {
      return (
        <video controls style={{ width: "200px", marginTop: "10px" }}>
          <source src={mediaURL} type={`video/${fileExtension}`} />
        </video>
      );
    } else if (isAudio) {
      return (
        <audio controls style={{ width: "100%", marginTop: "10px" }}>
          <source src={mediaURL} type={`audio/${fileExtension}`} />
        </audio>
      );
    } else {
      return null;
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
            backgroundColor: "#F4DECB",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            transition: "0.3s ease-in-out",
            "&:hover": { boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.2)" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 1, marginRight: "20px", maxWidth: "80%" }}>
              {/* Title */}
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#333333" }}
              >
                {entry.title}
              </Typography>
              {/* Date */}
              <Typography variant="subtitle2" sx={{ color: "#777777", mb: 1 }}>
                {new Date(entry.date.toDate()).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
              {/* Content */}
              <Typography variant="body1" sx={{ mt: 1, color: "#333333" }}>
                {entry.content}
              </Typography>
              {/* Render Media */}
              {renderMedia(entry.mediaURL)}
              {entry.tags &&
                Array.isArray(entry.tags) &&
                entry.tags.length > 0 && (
                  <Box
                    sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}
                  >
                    {entry.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag.name || tag}
                        sx={{ backgroundColor: "#E0F7FA", color: "#00796B" }}
                      />
                    ))}
                  </Box>
                )}
            </Box>

            {/* Edit and Delete Icons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                minWidth: "50px",
              }}
            >
              <IconButton
                onClick={() => handleEdit(entry)}
                sx={{
                  "&:hover": { color: "#1F3A93" },
                  marginRight: "8px",
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(entry.id)}
                sx={{
                  "&:hover": { color: "#FF6B6B" },
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

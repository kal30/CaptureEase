import React, { useState, useEffect } from "react";
import { Box, Modal, TextField, Button, Typography } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import MediaUploader from "./MediaUploader";
import TagInput from "./TagInput";
import { fetchTags, addTag } from "../../services/tagService"; // Tag service

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%", // Dynamic width for responsiveness
  maxWidth: 500, // Set a max width to avoid too much stretch on large screens
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AddJournalModal = ({ open, onClose, childId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mediaURL, setMediaURL] = useState("");
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]); // For tag dropdown options

  // Fetch available tags for the specific child

  useEffect(() => {
    const fetchAvailableTags = async () => {
      const fetchedTags = await fetchTags(childId); // Fetch tags from the 'tags' collection
      setAvailableTags(fetchedTags.map((tag) => tag.name)); // Store just the tag names
    };

    fetchAvailableTags();
  }, [childId]);

  const handleSave = async () => {
    console.log("Tags before saving:", tags); // Check tag structure before saving

    if (!title || !content) return;

    try {
      // If tags are objects, extract the name field
      const formattedTags = tags.map((tag) =>
        typeof tag === "string" ? tag : tag.name
      );

      await addDoc(collection(db, "children", childId, "journals"), {
        title,
        content,
        date: new Date(date),
        mediaURL,
        tags: formattedTags, // Save only tag names
        timestamp: new Date(),
      });

      console.log("Formatted Tags after saving:", formattedTags);

      // Optionally save new tags to the tags collection
      for (let tag of formattedTags) {
        await addTag(childId, tag);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving journal entry:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDate(new Date().toISOString().split("T")[0]);
    setMediaURL("");
    setTags([]);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Add Journal Entry
        </Typography>

        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ my: 2 }}
        />

        <TextField
          label="Date"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ my: 2 }}
        />

        <TextField
          label="Content"
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ my: 2 }}
        />

        {/* Tag Input Component */}
        <TagInput
          childId={childId}
          tags={tags}
          setTags={setTags}
          availableTags={availableTags}
        />

        <MediaUploader childId={childId} onUploadComplete={setMediaURL} />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 2 }}
        >
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default AddJournalModal;

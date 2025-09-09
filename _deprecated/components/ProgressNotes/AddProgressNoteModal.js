import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import MicNoneIcon from "@mui/icons-material/MicNone";
import { addProgressNote } from "../../services/progressNotesService";
import StyledButton from "../UI/StyledButton"; // Add this line

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

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const AddProgressNoteModal = ({ open, onClose, childId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mediaURL, setMediaURL] = useState("");
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]); // For tag dropdown options
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setContent((prevContent) => prevContent + transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const handleVoiceInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

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

      await addProgressNote(childId, {
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
      console.error("Error saving progress note:", error);
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
          Add Progress Note
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
          label="Progress Note"
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe observations, interventions, and outcomes."
          helperText="Provide a detailed progress note for this entry."
          sx={{ my: 2 }}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleVoiceInput} disabled={isListening}>
                <MicNoneIcon color={isListening ? "primary" : "action"} />
              </IconButton>
            ),
          }}
        />

        {/* Tag Input Component */}
        <TagInput
          childId={childId}
          tags={tags}
          setTags={setTags}
          availableTags={availableTags}
        />

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid #e0e0e0",
            pt: 3,
          }}
        >
          <MediaUploader childId={childId} onUploadComplete={setMediaURL} />

          <StyledButton
            onClick={handleSave}
            disabled={!title || !content}
            color="secondary"
            sx={{ minWidth: "150px", height: "45px" }}
          >
            Save Progress Note
          </StyledButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddProgressNoteModal;

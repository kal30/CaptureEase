import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, IconButton } from "@mui/material";
import MicNoneIcon from '@mui/icons-material/MicNone';
import { addProgressNote } from "../../services/progressNotesService";
import MediaUploader from "../../components/Journal/MediaUploader";
import TagInput from "../../components/Journal/TagInput";
import { fetchTags, addTag } from "../../services/tagService";
import ProgressNoteList from "../../components/Journal/ProgressNoteList"; // Re-use existing list
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const ProgressNoteTab = ({ childId, onSaveSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(dayjs());
  const [mediaURL, setMediaURL] = useState("");
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true); // State to toggle between add form and list

  useEffect(() => {
    const fetchAvailableTags = async () => {
      const fetchedTags = await fetchTags(childId);
      setAvailableTags(fetchedTags.map((tag) => tag.name));
    };
    fetchAvailableTags();

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
  }, [childId]);

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

  const handleSave = async () => {
    if (!title || !content) return;

    try {
      const formattedTags = tags.map((tag) =>
        typeof tag === "string" ? tag : tag.name
      );

      await addProgressNote(childId, {
        title,
        content,
        date: date.toDate(),
        mediaURL,
        tags: formattedTags,
        timestamp: new Date(),
      });

      for (let tag of formattedTags) {
        await addTag(childId, tag);
      }

      resetForm();
      onSaveSuccess(); // Notify parent to refresh calendar
    } catch (error) {
      console.error("Error saving progress note:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDate(dayjs());
    setMediaURL("");
    setTags([]);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add New Entry
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowAddForm(false)}
          disabled={!showAddForm}
        >
          View Previous Entries
        </Button>
      </Box>

      {showAddForm ? (
        <>
          <Typography variant="h6" gutterBottom>Add Progress Note</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ my: 2 }}
            />
            <DatePicker
              label="Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ my: 2 }} />}
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
            <TagInput
              childId={childId}
              tags={tags}
              setTags={setTags}
              availableTags={availableTags}
            />
            <MediaUploader childId={childId} onUploadComplete={setMediaURL} />
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
              Save Progress Note
            </Button>
          </LocalizationProvider>
        </>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Recent Progress Notes</Typography>
          <ProgressNoteList childId={childId} />
        </Box>
      )}
    </Box>
  );
};

export default ProgressNoteTab;

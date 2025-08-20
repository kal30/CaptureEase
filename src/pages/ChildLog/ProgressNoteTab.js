import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { addProgressNote } from "../../services/progressNotesService";
import TagInput from "../../components/ProgressNotes/TagInput";
import { fetchTags, addTag } from "../../services/tagService";
import ProgressNoteList from "../../components/ProgressNotes/ProgressNoteList";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import RichTextInput from "../../components/UI/RichTextInput";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../services/firebase";

const ProgressNoteTab = ({ childId, onSaveSuccess }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(dayjs());
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showAddForm, setShowAddForm] = useState(true);
  const [richTextData, setRichTextData] = useState(null);

  useEffect(() => {
    const fetchAvailableTags = async () => {
      const fetchedTags = await fetchTags(childId);
      setAvailableTags(fetchedTags.map((tag) => tag.name));
    };
    fetchAvailableTags();
  }, [childId]);

  const handleSave = async () => {
    if (!title || !richTextData || !richTextData.text.trim()) return;

    let mediaURL = "";
    let voiceMemoURL = "";
    let mediaType = "";

    try {
      if (richTextData.mediaFile) {
        const mediaRef = ref(
          storage,
          `progressNotes/${childId}/${Date.now()}-${richTextData.mediaFile.file.name}`
        );
        await uploadBytes(mediaRef, richTextData.mediaFile.file);
        mediaURL = await getDownloadURL(mediaRef);
        mediaType = richTextData.mediaFile.type;
      }

      if (richTextData.audioBlob) {
        const audioRef = ref(
          storage,
          `progressNotes/${childId}/${Date.now()}-voice-memo.webm`
        );
        await uploadBytes(audioRef, richTextData.audioBlob);
        voiceMemoURL = await getDownloadURL(audioRef);
      }

      const formattedTags = tags.map((tag) =>
        typeof tag === "string" ? tag : tag.name
      );

      await addProgressNote(childId, {
        title,
        content: richTextData.text,
        date: date.toDate(),
        mediaURL,
        mediaType,
        voiceMemoURL,
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
    setDate(dayjs());
    setTags([]);
    setRichTextData(null);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 2 }}>
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
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Add Progress Note
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <DatePicker
                label="Date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <RichTextInput onDataChange={setRichTextData} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TagInput
                childId={childId}
                tags={tags}
                setTags={setTags}
                availableTags={availableTags}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mt: 2 }}
            >
              Save Progress Note
            </Button>
          </LocalizationProvider>
        </>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Recent Progress Notes
          </Typography>
          <ProgressNoteList childId={childId} />
        </Box>
      )}
    </Box>
  );
};

export default ProgressNoteTab;

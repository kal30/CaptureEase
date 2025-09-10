import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useTheme } from "@mui/material/styles";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../services/firebase";
import { createTherapyNote } from "../../services/timeline/therapyNotesDataService";
import { therapyTheme, createTherapyStyles } from "../../assets/theme/therapyTheme";
import RichTextInput from "../UI/RichTextInput";

const TherapyNoteInput = ({ childId, selectedDate = new Date() }) => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [clearInput, setClearInput] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState("observation");
  const [sessionType, setSessionType] = useState("therapy");
  const [clinicalArea, setClinicalArea] = useState("");
  const [tags, setTags] = useState("");
  const [richTextData, setRichTextData] = useState(null);

  // Professional note type options
  const noteTypes = [
    { value: "observation", label: "Observation" },
    { value: "progress", label: "Progress Note" },
    { value: "recommendation", label: "Recommendation" },
    { value: "question", label: "Question/Concern" },
    { value: "assessment", label: "Assessment" },
    { value: "goal", label: "Goal Setting" }
  ];

  // Session type options
  const sessionTypes = [
    { value: "therapy", label: "Therapy Session" },
    { value: "assessment", label: "Assessment" },
    { value: "consultation", label: "Consultation" },
    { value: "evaluation", label: "Evaluation" },
    { value: "planning", label: "Care Planning" }
  ];

  // Clinical area options
  const clinicalAreas = [
    { value: "speech", label: "Speech Therapy" },
    { value: "motor", label: "Motor Skills" },
    { value: "behavioral", label: "Behavioral" },
    { value: "cognitive", label: "Cognitive" },
    { value: "sensory", label: "Sensory Processing" },
    { value: "social", label: "Social Skills" },
    { value: "general", label: "General" }
  ];

  const extractTags = (tagString) => {
    return tagString
      .split(/[,\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag.slice(1) : tag);
  };

  const handleSubmit = async () => {
    if (!richTextData?.text?.trim() && !title.trim()) {
      return; // Don't submit empty
    }

    setLoading(true);

    try {
      const noteData = {
        createdBy: user?.uid,
        title: title.trim() || "Therapy Note",
        content: richTextData?.text?.trim() || "",
        noteType,
        sessionType,
        clinicalArea: clinicalArea || "general",
        tags: tags ? extractTags(tags) : [],
        category: "therapy"
      };

      await createTherapyNote(childId, noteData);

      // Clear the form after successful submission
      setTitle("");
      setNoteType("observation");
      setSessionType("therapy");
      setClinicalArea("");
      setTags("");
      setClearInput(true);
      setTimeout(() => setClearInput(false), 100);
      setRichTextData(null);
    } catch (error) {
      console.error("Error creating therapy note:", error);
    } finally {
      setLoading(false);
    }
  };

  const therapyStyles = createTherapyStyles(theme);

  const hasContent = (richTextData?.text?.trim() || title.trim());

  return (
    <Box
      sx={{
        p: 3,
        ...therapyStyles.card,
        mb: 2
      }}
    >
      {/* Professional Header */}
      <Box sx={{ ...therapyStyles.header, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: therapyTheme.text.primary,
            fontWeight: 600,
            mb: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          🩺 Professional Note Entry
        </Typography>
        <Typography variant="body2" sx={{ color: therapyTheme.text.secondary }}>
          Create structured therapy notes for {selectedDate.toLocaleDateString()}
        </Typography>
      </Box>

      {/* Form Fields */}
      <Stack spacing={3} sx={{ mb: 3 }}>
        {/* Title */}
        <Box sx={therapyStyles.input}>
          <TextField
            label="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Brief title for this note..."
            size="medium"
          />
        </Box>

        {/* Row 1: Note Type and Session Type */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Box sx={{ ...therapyStyles.input, flex: 1 }}>
            <FormControl fullWidth size="medium">
              <InputLabel>Note Type</InputLabel>
              <Select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                label="Note Type"
              >
                {noteTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ ...therapyStyles.input, flex: 1 }}>
            <FormControl fullWidth size="medium">
              <InputLabel>Session Type</InputLabel>
              <Select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                label="Session Type"
              >
                {sessionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {/* Row 2: Clinical Area and Tags */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Box sx={{ ...therapyStyles.input, flex: 1 }}>
            <FormControl fullWidth size="medium">
              <InputLabel>Clinical Area</InputLabel>
              <Select
                value={clinicalArea}
                onChange={(e) => setClinicalArea(e.target.value)}
                label="Clinical Area"
              >
                {clinicalAreas.map((area) => (
                  <MenuItem key={area.value} value={area.value}>
                    {area.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ ...therapyStyles.input, flex: 1 }}>
            <TextField
              label="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              fullWidth
              size="medium"
              placeholder="progress, speech, goals..."
              helperText="Separate tags with commas"
            />
          </Box>
        </Stack>
      </Stack>

      {/* Rich Text Content */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: therapyTheme.text.primary }}>
          Note Content:
        </Typography>
        <Box sx={therapyStyles.input}>
          <RichTextInput
            onDataChange={setRichTextData}
            clearData={clearInput}
            placeholder="Enter detailed therapy note content..."
          />
        </Box>
      </Box>

      {/* Submit Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <Button
          variant="contained"
          endIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          onClick={handleSubmit}
          disabled={loading || !hasContent}
          sx={therapyStyles.button}
        >
          {loading ? "Saving..." : "Save Note"}
        </Button>
      </Box>
    </Box>
  );
};

export default TherapyNoteInput;
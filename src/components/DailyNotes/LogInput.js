import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useTheme } from "@mui/material/styles"; // Import useTheme
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../services/firebase";
import RichTextInput from "../UI/RichTextInput";
import { useAuthState } from "react-firebase-hooks/auth";

const LogInput = ({ childId, selectedDate = new Date() }) => {
  const theme = useTheme(); // Get the theme object
  const [richTextData, setRichTextData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearInput, setClearInput] = useState(false);
  const [templateText, setTemplateText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [user] = useAuthState(auth);

  const extractTags = (inputText) => {
    const tagRegex = /#(\w+)/g;
    const matches = [...inputText.matchAll(tagRegex)];
    return matches.map((match) => match[1]);
  };

  // Entry templates with category and tags
  const templates = [
    { 
      emoji: "🍽️", 
      name: "Meal Time",
      text: "Had [meal] at [time]. Ate [food items].",
      category: "mealtime",
      tags: ["mealtime", "food"]
    },
    { 
      emoji: "😊", 
      name: "Good Day",
      text: "Great day today! Was happy and engaged. Had fun [activity].",
      category: "mood",
      tags: ["goodday", "mood", "positive"]
    },
    { 
      emoji: "😴", 
      name: "Nap Time",
      text: "Took a nap from [start time] to [end time]. Slept well.",
      category: "sleep",
      tags: ["nap", "sleep", "rest"]
    },
    { 
      emoji: "🎉", 
      name: "Milestone",
      text: "🎉 Did something amazing today! [achievement]. So proud!",
      category: "milestone",
      tags: ["milestone", "development", "achievement"]
    },
    { 
      emoji: "😤", 
      name: "Challenge",
      text: "Had some challenges today. Struggled with [issue]. We worked through it by [solution].",
      category: "challenge",
      tags: ["challenges", "behavior", "coping"]
    },
    { 
      emoji: "🏥", 
      name: "Medical",
      text: "Medical update: [medical information].",
      category: "medical_note",
      tags: ["medical", "health", "notes"]
    }
  ];

  const applyTemplate = (template) => {
    setTemplateText(template.text);
    setSelectedTemplate(template);
    // Reset template text after a brief moment to allow for multiple uses
    setTimeout(() => setTemplateText(""), 100);
  };

  const handleSubmit = async () => {
    console.log('LogInput: handleSubmit called with richTextData:', richTextData);
    if (!richTextData || (!richTextData.text.trim() && !richTextData.mediaFile && !richTextData.audioBlob)) {
      console.log('LogInput: Submission blocked - no content');
      return; // Don't submit empty
    }

    setLoading(true);
    let mediaURL = "";
    let voiceMemoURL = "";
    let mediaType = "";
    
    // Combine template tags with extracted hashtags
    const hashtagTags = extractTags(richTextData.text);
    const templateTags = selectedTemplate?.tags || [];
    const allTags = [...new Set([...templateTags, ...hashtagTags])]; // Remove duplicates

    try {
      if (richTextData.mediaFile) {
        const mediaRef = ref(
          storage,
          `dailyLogs/${childId}/${Date.now()}-${richTextData.mediaFile.file.name}`
        );
        await uploadBytes(mediaRef, richTextData.mediaFile.file);
        mediaURL = await getDownloadURL(mediaRef);
        mediaType = richTextData.mediaFile.type;
      }

      if (richTextData.audioBlob) {
        const audioRef = ref(
          storage,
          `dailyLogs/${childId}/${Date.now()}-voice-memo.webm`
        );
        await uploadBytes(audioRef, richTextData.audioBlob);
        voiceMemoURL = await getDownloadURL(audioRef);
      }

      // Create timestamp for the selected date
      const entryTimestamp = new Date(selectedDate);
      // Set to current time but keep the selected date
      const now = new Date();
      entryTimestamp.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

      const docData = {
        // Required fields for Firestore rules
        childId,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        text: richTextData.text,
        status: 'active',
        
        // Optional structured fields
        ...(selectedTemplate?.category && { category: selectedTemplate.category }),
        ...(allTags.length > 0 && { tags: allTags }),
        
        // Media fields (optional)
        ...(mediaURL && { mediaURL }),
        ...(mediaType && { mediaType }),
        ...(voiceMemoURL && { voiceMemoURL }),
        
        // Timestamp fields for UI
        timestamp: entryTimestamp, // Use selected date with current time
        entryDate: selectedDate.toDateString(), // Store the selected date for filtering
        
        // Author info (keeping for UI display)
        authorId: user?.uid,
        authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
        authorEmail: user?.email,
      };
      
      // Debug logging to see exactly what's being sent
      console.log('🔍 LogInput Debug Info:');
      console.log('  childId:', childId);
      console.log('  user?.uid:', user?.uid);
      console.log('  user object:', user);
      console.log('  docData being sent:', {
        ...docData,
        createdAt: '[serverTimestamp()]' // serverTimestamp shows as function, not actual value
      });
      
      await addDoc(collection(db, "dailyLogs"), docData);

      // Clear the input after successful submission
      setClearInput(true);
      setTimeout(() => setClearInput(false), 100); // Reset clear flag
      setRichTextData(null);
      setSelectedTemplate(null); // Clear selected template
    } catch (error) {
      console.error("Error adding daily log:", error);
      console.error("Full error details:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Template Buttons */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontSize: '0.8rem' }}>
          Quick Templates:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {templates.map((template) => (
            <Chip
              key={template.name}
              label={`${template.emoji} ${template.name}`}
              variant="outlined"
              size="small"
              clickable
              onClick={() => applyTemplate(template)}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                  borderColor: theme.palette.primary.main,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <RichTextInput 
        onDataChange={setRichTextData} 
        clearData={clearInput} 
        templateText={templateText}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 2,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          endIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          onClick={handleSubmit}
          disabled={loading || !richTextData || (!richTextData.text.trim() && !richTextData.mediaFile && !richTextData.audioBlob)}
        >
          {loading ? 'Saving...' : 'Log'}
        </Button>
      </Box>
    </Box>
  );
};

export default LogInput;

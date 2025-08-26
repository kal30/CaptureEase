import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../services/firebase";
import RichTextInput from "../UI/RichTextInput";

const LogInput = ({ childId, selectedDate = new Date() }) => {
  const [richTextData, setRichTextData] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractTags = (inputText) => {
    const tagRegex = /#(\w+)/g;
    const matches = [...inputText.matchAll(tagRegex)];
    return matches.map((match) => match[1]);
  };

  const handleSubmit = async () => {
    if (!richTextData || (!richTextData.text.trim() && !richTextData.mediaFile && !richTextData.audioBlob)) {
      return; // Don't submit empty
    }

    setLoading(true);
    let mediaURL = "";
    let voiceMemoURL = "";
    let mediaType = "";
    const tags = extractTags(richTextData.text);

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
        childId,
        text: richTextData.text,
        mediaURL,
        mediaType,
        voiceMemoURL,
        tags,
        timestamp: entryTimestamp, // Use selected date with current time
        entryDate: selectedDate.toDateString(), // Store the selected date for filtering
      };
      
      console.log('LogInput: Saving entry with data:', docData);
      await addDoc(collection(db, "dailyLogs"), docData);
      console.log('LogInput: Entry saved successfully');

      setRichTextData(null); // Clear the input after submission
    } catch (error) {
      console.error("Error adding daily log:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ padding: 2, marginBottom: 3 }}>
      <RichTextInput onDataChange={setRichTextData} />
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
          Log
        </Button>
      </Box>
    </Paper>
  );
};

export default LogInput;
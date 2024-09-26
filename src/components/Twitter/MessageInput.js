import React, { useState } from 'react';
import { Box, IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import MediaInput from './MediaInput';  // Import MediaInput component
import MessageTextInput from './MessageTextInput';  // Import MessageTextInput component
import SpeechInput from './SpeechInput';  // Import SpeechInput component

const MessageInput = ({ setMessages }) => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const storage = getStorage();

  // Handle file change for both file attachment and camera
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  // Submit a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !mediaFile) return;  // Prevent submitting empty messages
    
    setUploading(true);
    let mediaURL = null;

    // Upload media file if available
    if (mediaFile) {
      const mediaRef = ref(storage, `media/${mediaFile.name}`);
      await uploadBytes(mediaRef, mediaFile);
      mediaURL = await getDownloadURL(mediaRef);
    }

    try {
      const newMessage = {
        userId: auth.currentUser.uid,
        profilePic: 'https://via.placeholder.com/50',  // Example profile picture
        text: text || '',
        mediaURL: mediaURL || '',
        timestamp: new Date(),
      };
      
      await addDoc(collection(db, 'entries'), newMessage);
      setText('');  // Clear input
      setMediaFile(null);  // Clear the media file
      setMessages((prevMessages) => [newMessage, ...prevMessages]);  // Add new message to the list
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setUploading(false);
    }
  };

  // Detect Enter key press for submission
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);  // Call submit when Enter is pressed
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        borderRadius: 2,
        mb: 3,
        boxShadow: 1,
        border: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9',  // Light background
      }}
    >
      {/* MediaInput component (camera and attach icons) */}
      <MediaInput handleFileChange={handleFileChange} />

      {/* MessageTextInput component (text input with Enter detection) */}
      <MessageTextInput
        text={text}
        setText={setText}
        handleKeyDown={handleKeyDown}
      />

      {/* SpeechInput component (microphone for speech-to-text) */}
      <SpeechInput setText={setText} />

      {/* Send message icon */}
      <IconButton
        type="submit"
        color="primary"
        disabled={uploading || !text}
        sx={{ marginLeft: 1 }}
      >
        <SendIcon />
      </IconButton>
    </Paper>
  );
};

export default MessageInput;
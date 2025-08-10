import React, { useState } from 'react';
import { IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import MediaInput from './MediaInput';
import MessageTextInput from './MessageTextInput';
import SpeechInput from './SpeechInput';

const MessageInput = ({ childId }) => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const storage = getStorage();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!text && !mediaFile) return;

    setUploading(true);
    let mediaURL = null;

    if (mediaFile) {
      const mediaRef = ref(storage, `media/${mediaFile.name}`);
      await uploadBytes(mediaRef, mediaFile);
      mediaURL = await getDownloadURL(mediaRef);
    }

    try {
      const newMessage = {
        childId: childId, // Add childId to the message
        userId: auth.currentUser.uid,
        profilePic: 'https://via.placeholder.com/50',
        text: text || '',
        mediaURL: mediaURL || '',
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'entries'), newMessage);
      setText('');
      setMediaFile(null);
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
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
        backgroundColor: '#f9f9f9',
      }}
    >
      <MediaInput handleFileChange={handleFileChange} />
      <MessageTextInput
        text={text}
        setText={setText}
        handleKeyDown={handleKeyDown}
      />
      <SpeechInput setText={setText} handleSubmit={handleSubmit} />
      <IconButton
        type="submit"
        color="primary"
        disabled={uploading || (!text && !mediaFile)}
        sx={{ marginLeft: 1 }}
      >
        <SendIcon />
      </IconButton>
    </Paper>
  );
};

export default MessageInput;

import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Typography } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Message from '../components/Record/Message';
import MessageInput from '../components/Record/MessageInput';
import dayjs from 'dayjs';

const RecordEntry = () => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const storage = getStorage();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'entries'), (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched messages:', messagesData); 
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e) => {
    setMediaFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
  
    let mediaURL = null;
    if (mediaFile) {
      const mediaRef = ref(storage, `media/${mediaFile.name}`);
      await uploadBytes(mediaRef, mediaFile);
      mediaURL = await getDownloadURL(mediaRef);
      console.log('Media URL:', mediaURL);  // Log the media URL to ensure it's uploaded
    }
  
    try {
      const messageData = {
        userId: auth.currentUser.uid,
        text,
        mediaURL: mediaURL || '',
        timestamp: new Date(),
      };
      await addDoc(collection(db, 'entries'), messageData);
      console.log('Message data:', messageData);  // Log the full message data
  
      setText('');
      setMediaFile(null);
    } catch (e) {
      console.error('Error saving entry:', e);
    } finally {
      setUploading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, message) => {
      const date = dayjs(message.timestamp.toDate()).format('MMMM D, YYYY');
      if (!acc[date]) acc[date] = [];
      acc[date].push(message);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 2,
          overflowY: 'auto',
          backgroundColor: '#f5f7fa',
          maxHeight: '70vh',
        }}
      >
        {Object.keys(groupedMessages).map((date) => (
          <Box key={date} sx={{ mb: 3 }}>
            {/* Display the date once per day */}
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
              {date}
            </Typography>
            {groupedMessages[date].map((message, index) => (
              <Message key={message.id} message={message} />
            ))}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <MessageInput
        text={text}
        setText={setText}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        uploading={uploading}
      />
    </Container>
  );
};

export default RecordEntry;
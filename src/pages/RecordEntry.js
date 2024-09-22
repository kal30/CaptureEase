import React, { useState, useEffect, useRef } from 'react';
import { Container, Box } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import MessageInput from '../components/Record/MessageInput';  // Already split
import MessageList from '../components/Record/MessageList';  // New component
import FilePreview from '../components/Record/FilePreview';  // New component
import dayjs from 'dayjs';

const RecordEntry = () => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const storage = getStorage();
  const messagesEndRef = useRef(null);

  // Fetch messages from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'entries'), (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  // Scroll to the latest message when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);  // Set preview for selected file
      };
      reader.readAsDataURL(file);  // Convert file to base64 for preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let mediaURL = null;
    if (mediaFile) {
      try {
        const sanitizedFileName = mediaFile.name.replace(/\s+/g, '_');
        const mediaRef = ref(storage, `media/${sanitizedFileName}`);
        await uploadBytes(mediaRef, mediaFile);
        mediaURL = await getDownloadURL(mediaRef);
      } catch (error) {
        console.error('Error uploading media:', error);
      }
    }

    try {
      await addDoc(collection(db, 'entries'), {
        userId: auth.currentUser.uid,
        text,
        mediaURL: mediaURL || '',
        timestamp: new Date(),
      });
      setText('');
      setMediaFile(null);
      setMediaPreview(null);
    } catch (e) {
      console.error('Error saving entry:', e);
    } finally {
      setUploading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      {/* MessageList component */}
      <MessageList groupedMessages={groupedMessages} messagesEndRef={messagesEndRef} />

      {/* FilePreview component */}
      <FilePreview mediaFile={mediaFile} mediaPreview={mediaPreview} />

      {/* MessageInput component */}
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
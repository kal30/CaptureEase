import React, { useState, useEffect, useRef } from 'react';
import { Container, Box } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import MessageInput from '../components/Record/MessageInput';
import MessageList from '../components/Record/MessageList';
import dayjs from 'dayjs';

const RecordEntry = () => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);  // Media preview for photo modal
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const storage = getStorage();
  const messagesEndRef = useRef(null);

  // Fetch messages from Firestore, sorted by timestamp
  useEffect(() => {
    const q = query(collection(db, 'entries'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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

 // Handle file change (for photo capture or selection)
const handleFileChange = (e) => {
  const file = e.target.files[0];

  // Log to check if a file is selected
  if (file) {
    console.log('File selected:', file.name);

    setMediaFile(file);  // Set the media file

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);  // Set preview for the image in modal
    };
    reader.readAsDataURL(file);
  } else {
    console.log('No file selected');
  }
};


  // Make sure the handleSubmit function is marked as async
  const handleSubmit = async (e, mediaFile) => {
    e.preventDefault();
    setUploading(true);
  
    let mediaURL = null;
  
    // If a media file (image) is selected, upload it to Firebase Storage
    if (mediaFile) {
      console.log('media file');
      try {
        const sanitizedFileName = mediaFile.name.replace(/\s+/g, '_');  // Clean the file name
        const mediaRef = ref(storage, `media/${sanitizedFileName}`);  // Reference to Firebase Storage
        // Upload the file to Firebase Storage
        await uploadBytes(mediaRef, mediaFile);
        
        // Get the download URL of the uploaded file
        mediaURL = await getDownloadURL(mediaRef);
        console.log('Retrieved media URL:', mediaURL);  // Check if mediaURL is retrieved
      } catch (error) {
        console.error('Error uploading media:', error);
        // Don't return early—proceed to save the text-only message if media upload fails
      }
    }
  
    // Ensure the image URL or message text is saved in Firestore
    try {
      const messageData = {
        userId: auth.currentUser.uid,
        text: text || '',  // Store the message text or an empty string if no text
        mediaURL: mediaURL || '',  // Store the image URL or an empty string if no image
        timestamp: new Date(),
      };  
      await addDoc(collection(db, 'entries'), messageData);
      setText('');
      setMediaFile(null);  // Clear the media file after submission
      setMediaPreview(null);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setUploading(false);
    }
  };

  // Scroll to the latest message in the chat
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
      {/* Message List Component */}
      <MessageList groupedMessages={groupedMessages} messagesEndRef={messagesEndRef} />

      {/* Message Input + Photo Modal */}
      <MessageInput
        text={text}
        setText={setText}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        uploading={uploading}
        mediaPreview={mediaPreview}
        setMediaPreview={setMediaPreview}
      />

      {/* Automatically scroll to the latest message */}
      <div ref={messagesEndRef} />
    </Container>
  );
};

export default RecordEntry;
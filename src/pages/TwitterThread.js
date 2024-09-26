import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import MessageBubble from '../components/Twitter/MessageBubble';  // Import from Twitter folder
import MessageInput from '../components/Twitter/MessageInput';  // Import updated MessageInput

const TwitterThread = () => {
  const [messages, setMessages] = useState([]);

  // Fetch messages from Firestore, sorted by timestamp
  useEffect(() => {
    const q = query(collection(db, 'entries'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Twitter-Like Feed
      </Typography>

      {/* Message input area */}
      <MessageInput setMessages={setMessages} />

      {/* Display the messages (Twitter-like feed) */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </Container>
  );
};

export default TwitterThread;
import React, { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import MessageBubble from "../components/Record/MessageBubble";
import MessageInput from "../components/Record/MessageInput";
import { useChildContext } from "../contexts/ChildContext";
import useChildName from "../hooks/useChildName";

const TwitterThread = () => {
  const [messages, setMessages] = useState([]);
  const { currentChildId } = useChildContext();
  const {
    childName,
    loading: childNameLoading,
    error,
  } = useChildName(currentChildId);
  const [messagesLoading, setMessagesLoading] = useState(true);

  console.log("currentChildId:", currentChildId);
  console.log("childName:", childName);
  console.log("childNameLoading:", childNameLoading);
  console.log("messagesLoading:", messagesLoading);
  console.log("error:", error);
  console.log("messages:", messages);

  useEffect(() => {
    if (!currentChildId) {
      setMessagesLoading(false);
      return;
    }

    const q = query(
      collection(db, "entries"),
      where("childId", "==", currentChildId),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
      setMessagesLoading(false);
    });

    return () => unsubscribe();
  }, [currentChildId]);

  if (childNameLoading || messagesLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error loading child's name.</Typography>;
  }

  if (!currentChildId) {
    return (
      <Typography>
        No child selected. Please select a child from the dashboard.
      </Typography>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {childName ? `${childName}'s Messages` : "Messages"}
      </Typography>
      <MessageInput childId={currentChildId} />
      <MessageBubble messages={messages} />
    </Container>
  );
};

export default TwitterThread;

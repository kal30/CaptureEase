import React from 'react';
import { Box, Typography } from '@mui/material';
import Message from './Message';  // Import your Message component

const MessageList = ({ groupedMessages, messagesEndRef }) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',  // Align to the top
        padding: 2,
        backgroundColor: '#f5f7fa',
        overflowY: 'auto',  // Enable scrolling
        height: '70vh',  // Set height so it can scroll
      }}
    >
      {Object.keys(groupedMessages).map((date) => (
        <Box key={date} sx={{ mb: 3 }}>
          {/* Display date header */}
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 1 }}>
            {date}
          </Typography>
          {groupedMessages[date].map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </Box>
      ))}
      <div ref={messagesEndRef} />  {/* Scroll to this div */}
    </Box>
  );
};

export default MessageList;
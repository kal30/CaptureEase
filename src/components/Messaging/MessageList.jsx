// MessageList Component
// Renders grouped messages with date separators and bubbles

import React from 'react';
import { Box, Fade } from '@mui/material';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';

const MessageList = ({ groupedMessages, currentUserId, onReply, endRef }) => {
  if (!groupedMessages) return null;

  return (
    <>
      {groupedMessages.map((group) => (
        <Fade key={group.id} in={true}>
          <div>
            {group.type === 'date' ? (
              <DateSeparator date={group.date} />
            ) : (
              <Box className="message-bubble" sx={{ mb: 2 }}>
                {group.messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                    showAvatar={index === 0}
                    showTimestamp={index === group.messages.length - 1}
                    onReply={onReply}
                  />
                ))}
              </Box>
            )}
          </div>
        </Fade>
      ))}
      <div ref={endRef} />
    </>
  );
};

export default MessageList;


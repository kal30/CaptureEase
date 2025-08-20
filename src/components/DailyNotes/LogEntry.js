import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const LogEntry = ({ entry }) => {
  const formattedTime = entry.timestamp ? dayjs(entry.timestamp.toDate()).fromNow() : '';

  const renderTextWithTags = (text, tags) => {
    if (!text) return null;
    let displayableText = text;
    tags.forEach(tag => {
      const tagPattern = new RegExp(`#${tag}`, 'g');
      displayableText = displayableText.replace(tagPattern, `<span style="color: #1DA1F2;">#${tag}</span>`);
    });
    return <div dangerouslySetInnerHTML={{ __html: displayableText }} />;
  };

  return (
    <Paper elevation={1} sx={{ padding: 2, marginBottom: 2, display: 'flex' }}>
      <Avatar sx={{ marginRight: 2 }}>
        {/* You can replace this with child's actual avatar if available */}
        C
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }}>
            {/* Replace with actual child name if passed as prop */}
            Child Name
          </Typography>
          <Typography variant="caption" color="textSecondary">
            &bull; {formattedTime}
          </Typography>
        </Box>

        {entry.text && (
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            {renderTextWithTags(entry.text, entry.tags || [])}
          </Typography>
        )}

        {entry.mediaURL && entry.mediaType === 'image' && (
          <Box sx={{ marginBottom: 1 }}>
            <img src={entry.mediaURL} alt="log media" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </Box>
        )}

        {entry.mediaURL && entry.mediaType === 'video' && (
          <Box sx={{ marginBottom: 1 }}>
            <video controls src={entry.mediaURL} style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </Box>
        )}

        {entry.voiceMemoURL && (
          <Box sx={{ marginBottom: 1 }}>
            <audio controls src={entry.voiceMemoURL} />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default LogEntry;

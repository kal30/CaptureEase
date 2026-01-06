import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

const JournalDetails = ({ entry, onEditTags }) => {
  // Don't render if entry has no meaningful content
  const hasContent = entry.text || (entry.tags && entry.tags.length > 0) || entry.mediaURL || entry.voiceMemoURL;
  
  if (!hasContent) {
    return null;
  }

  return (
    <Box>
      {entry.text && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
          {entry.text.length > 150 ? `${entry.text.substring(0, 150)}...` : entry.text}
        </Typography>
      )}
      {entry.tags && entry.tags.length > 0 && (
        <Box
          sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5, cursor: onEditTags ? 'pointer' : 'default' }}
          onClick={() => onEditTags?.(entry)}
          title={onEditTags ? 'Edit tags' : undefined}
        >
          {entry.tags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          ))}
        </Box>
      )}

      {/* Show media if present */}
      {(entry.mediaURL || entry.voiceMemoURL) && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
            📎 Media attached
            {entry.mediaURL && ' • Photo/Video'}
            {entry.voiceMemoURL && ' • Voice Memo'}
          </Typography>
        </Box>
      )}

    </Box>
  );
};

export default React.memo(JournalDetails);

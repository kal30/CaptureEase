import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

const normalizeAttachment = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    return {
      url: value,
      type: 'image',
      filename: 'Attachment',
    };
  }

  if (typeof value === 'object') {
    const url = value.url || value.downloadURL || value.mediaURL || '';
    if (!url) return null;

    const mimeType = String(value.mimeType || '').toLowerCase();
    const type = value.type
      || (mimeType.startsWith('video/')
        ? 'video'
        : mimeType.startsWith('audio/')
          ? 'audio'
          : 'image');

    return {
      url,
      type,
      filename: value.filename || value.name || 'Attachment',
    };
  }

  return null;
};

const DailyLogDetails = ({ entry }) => {
  const text = entry.text || '';
  const notesText = entry.notes || entry.content || entry.bathroomDetails?.notes || '';
  const attachments = [
    normalizeAttachment(entry.mediaURL),
    ...(Array.isArray(entry.mediaUrls) ? entry.mediaUrls.map(normalizeAttachment) : []),
    ...(Array.isArray(entry.mediaAttachments) ? entry.mediaAttachments.map(normalizeAttachment) : []),
  ].filter(Boolean);
  const firstAttachment = attachments[0] || null;
  const hasContent = Boolean(text || notesText || (entry.tags && entry.tags.length > 0) || firstAttachment);

  if (!hasContent) {
    return null;
  }

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'relative',
        zIndex: 1,
        backgroundColor: '#FFFFFF',
        isolation: 'isolate',
      }}
    >
      {text ? (
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            lineHeight: { xs: 1.4, md: 1.45 },
            fontSize: { xs: '1rem', md: '0.95rem' },
          }}
        >
          {text.length > 150 ? `${text.substring(0, 150)}...` : text}
        </Typography>
      ) : null}

      {notesText ? (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: { xs: 1.4, md: 1.45 },
            fontSize: { xs: '0.95rem', md: '0.9rem' },
          }}
        >
          {notesText.length > 180 ? `${notesText.substring(0, 180)}...` : notesText}
        </Typography>
      ) : null}

      {firstAttachment?.url && firstAttachment.type === 'image' && (
        <Box sx={{ mt: 0.5 }}>
          <Box
            component="img"
            src={firstAttachment.url}
            alt={firstAttachment.filename || 'Daily log attachment'}
            sx={{
              width: '100%',
              maxWidth: 320,
              maxHeight: 240,
              borderRadius: 2,
              display: 'block',
              objectFit: 'cover',
              border: '1px solid',
              borderColor: 'grey.200',
              bgcolor: 'grey.50',
            }}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {firstAttachment.filename}
          </Typography>
        </Box>
      )}

      {firstAttachment?.url && firstAttachment.type === 'video' && (
        <Box sx={{ mt: 0.5 }}>
          <Box
            component="video"
            controls
            src={firstAttachment.url}
            sx={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 2,
              display: 'block',
              bgcolor: '#111827',
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {firstAttachment.filename}
          </Typography>
        </Box>
      )}

      {firstAttachment?.url && firstAttachment.type === 'audio' && (
        <Box sx={{ mt: 0.5 }}>
          <audio controls src={firstAttachment.url} style={{ width: '100%' }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {firstAttachment.filename}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default React.memo(DailyLogDetails);

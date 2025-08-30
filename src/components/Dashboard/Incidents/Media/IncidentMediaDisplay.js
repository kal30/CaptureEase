import React from 'react';
import { Box, Typography, Card, CardMedia, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const IncidentMediaDisplay = ({ mediaUrls = [] }) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        📎 Attached Media:
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mediaUrls.map((media, idx) => (
          <Card key={idx} elevation={1} sx={{ maxWidth: '100%' }}>
            {media.type === 'image' && (
              <CardMedia
                component="img"
                image={media.url}
                alt={`Incident photo ${idx + 1}`}
                sx={{ 
                  maxHeight: 300,
                  objectFit: 'contain',
                  backgroundColor: '#f5f5f5'
                }}
              />
            )}
            
            {media.type === 'video' && (
              <Box sx={{ position: 'relative' }}>
                <video 
                  controls 
                  src={media.url} 
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            )}
            
            {media.type === 'audio' && (
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <VolumeUpIcon color="primary" />
                <audio 
                  controls 
                  src={media.url}
                  style={{ flex: 1 }}
                />
              </Box>
            )}
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default IncidentMediaDisplay;
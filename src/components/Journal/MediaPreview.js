// components/Journal/MediaPreview.js

import React from 'react';

const MediaPreview = ({ mediaURL }) => {
  if (!mediaURL) return null;

  const fileExtension = mediaURL.split('.').pop().split('?')[0];
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
  const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension);
  const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension);

  if (isImage) {
    return <img src={mediaURL} alt="media-preview" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />;
  } else if (isVideo) {
    return <video controls src={mediaURL} style={{ width: '100%', marginTop: '10px' }} />;
  } else if (isAudio) {
    return <audio controls src={mediaURL} style={{ width: '100%', marginTop: '10px' }} />;
  } else {
    return <p>Unsupported media format</p>;
  }
};



export default MediaPreview;


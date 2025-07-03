import React, { useState } from 'react';
import { TextField, IconButton, Paper } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CameraAltIcon from '@mui/icons-material/CameraAlt';  // Camera icon for taking photos
import { useTheme } from '@mui/material/styles';
import PhotoModal from './PhotoModal';  // Import the PhotoModal component

const MessageInput = ({ text, setText, handleSubmit, uploading, mediaPreview, setMediaPreview }) => {
  const theme = useTheme();

  // Define mediaFile state to hold the selected file
  const [mediaFile, setMediaFile] = useState(null);  // Add this line

  const [modalOpen, setModalOpen] = useState(false);

  // Open the photo modal when a file is selected
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    console.log('Huh this is entered');
    if (file) {
      console.log('File selected:', file.name);  // Debugging log to verify file selection

      // Set the media file for uploading later
      setMediaFile(file);  // Set the file

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);  // Set the preview image
        setModalOpen(true);  // Open the photo modal
      };
      reader.readAsDataURL(file);
    }
  };

  // Close the modal and reset preview
  const handleCloseModal = () => {
    setModalOpen(false);
    setMediaPreview(null);  // Reset media preview
  };

  // Send the photo + message and close the modal
  const handleSendMessage = (e) => {
    handleSubmit(e, mediaFile);  // Pass the mediaFile to handleSubmit
    handleCloseModal();  // Close the modal after sending
  };

  return (
    <>
      {/* Modal for previewing and sending the photo */}
      <PhotoModal
        open={modalOpen}
        handleClose={handleCloseModal}
        mediaPreview={mediaPreview}
        text={text}
        setText={setText}
        handleSend={handleSendMessage}  // Sends both message and media, and closes modal
      />

      {/* Message input area */}
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(1),
          marginTop: theme.spacing(1),
          borderRadius: theme.shape.borderRadius,
        }}
      >
        {/* Camera button */}
        <IconButton component="label" sx={{ color: theme.palette.secondary.main }}>
          <CameraAltIcon />
          <input
            type="file"
            hidden
            accept="image/*"
            capture="environment"
            onChange={handleFileInputChange}  // Open the photo modal
          />
        </IconButton>

        {/* Attach button */}
        <IconButton component="label" sx={{ color: theme.palette.secondary.main }}>
          <AttachFileIcon />
          <input type="file" hidden accept="image/*" onChange={handleFileInputChange} />
        </IconButton>

        {/* Text input for typing a message */}
        <TextField
          placeholder="Type a message"
          variant="outlined"
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            '& .MuiOutlinedInput-root': {
              borderRadius: theme.shape.borderRadius,
              height: '40px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        />

        {/* Send button */}
        <IconButton
          type="submit"
          color="primary"
          onClick={handleSubmit}
          disabled={uploading}
          sx={{ color: theme.palette.primary.main }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </>
  );
};

export default MessageInput;
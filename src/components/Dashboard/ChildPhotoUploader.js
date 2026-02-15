import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Button, Typography, Tooltip, Stack } from '@mui/material';
import { PhotoCamera, AddPhotoAlternate, CameraAlt, Close } from '@mui/icons-material';

const ChildPhotoUploader = ({ setPhoto, photoURL, setPhotoURL }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize video element when camera is shown
  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.muted = true;
      const tryPlay = () => {
        video.play?.().catch(() => {});
      };
      if (video.readyState >= 2) {
        tryPlay();
      } else {
        video.onloadedmetadata = tryPlay;
      }
    }
  }, [showCamera]);

  // Handle file change for the photo (from gallery/file picker)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
      };
      reader.readAsDataURL(file);
      // Close camera if open
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        setShowCamera(false);
      }
    }
  };

  // Open camera for live capture
  const handleCameraClick = async () => {
    if (showCamera) {
      // Close camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setShowCamera(false);
      setCameraError(null);
    } else {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        streamRef.current = stream;
        setShowCamera(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setCameraError(
          'Could not access camera. Please ensure you have granted camera permissions.'
        );
      }
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `child-photo-${Date.now()}.png`, {
            type: 'image/png',
          });
          setPhoto(file);
          
          // Create preview URL
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotoURL(reader.result);
          };
          reader.readAsDataURL(file);
          
          // Stop camera stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
          setShowCamera(false);
        }
      }, 'image/png');
    }
  };

  // Clear the current photo
  const clearPhoto = () => {
    setPhoto(null);
    setPhotoURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      {/* Photo Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Add Photo:
        </Typography>
        
        {/* Camera button for live capture */}
        <Tooltip title="Take photo with camera">
          <IconButton 
            color={showCamera ? 'error' : 'primary'} 
            onClick={handleCameraClick}
            sx={{
              backgroundColor: showCamera ? 'error.light' : 'action.hover',
              '&:hover': {
                backgroundColor: showCamera ? 'error.main' : 'primary.light',
              },
            }}
          >
            {showCamera ? <Close /> : <CameraAlt />}
          </IconButton>
        </Tooltip>

        {/* File picker for gallery/existing photos */}
        <Tooltip title="Choose from gallery">
          <IconButton 
            component="label" 
            color="primary"
            sx={{
              backgroundColor: 'action.hover',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            <AddPhotoAlternate />
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Camera Error Message */}
      {cameraError && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 2 }}>
          {cameraError}
        </Typography>
      )}

      {/* Live Camera View */}
      {showCamera && (
        <Box
          sx={{
            my: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxWidth: '300px',
              borderRadius: '8px',
              transform: 'scaleX(-1)', // Mirror for selfie feel
            }}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<PhotoCamera />}
              onClick={capturePhoto}
            >
              Capture
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleCameraClick}
            >
              Cancel
            </Button>
          </Stack>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>
      )}

      {/* Photo Preview */}
      {photoURL && !showCamera && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50',
          }}
        >
          <img
            src={photoURL}
            alt="Child Preview"
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #4caf50',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              Photo added
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click below to change or remove
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CameraAlt />}
                onClick={handleCameraClick}
              >
                Retake
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Close />}
                onClick={clearPhoto}
              >
                Remove
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChildPhotoUploader;

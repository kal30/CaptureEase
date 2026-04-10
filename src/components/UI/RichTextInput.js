import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VideocamIcon from "@mui/icons-material/Videocam";
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";

const RichTextInput = ({
  value,
  onDataChange,
  clearData,
  templateText,
  placeholder,
  hideMediaControls = false,
  hidePhotoButton = false,
}) => {
  const normalizeValue = (incoming) => ({
    text: incoming?.text || '',
    mediaFile: incoming?.mediaFile || null,
  });
  const initialValue = normalizeValue(value);
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState(initialValue.mediaFile);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const videoRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [captureMode, setCaptureMode] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const streamRef = useRef(null);
  const idSuffixRef = useRef(Math.random().toString(36).slice(2, 8));
  const imageInputId = `icon-button-file-image-${idSuffixRef.current}`;
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const closeCapture = () => {
    stopStream();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCaptureMode(null);
    setIsVideoRecording(false);
  };

  useEffect(() => {
    onDataChange({ text, mediaFile });
  }, [text, mediaFile, onDataChange]);

  useEffect(() => {
    if (value === undefined || value === null) {
      return;
    }

    const nextValue = normalizeValue(value);
    setText(nextValue.text);
    setMediaFile(nextValue.mediaFile);
  }, [value, value?.text, value?.mediaFile]);

  useEffect(() => {
    if (!mediaFile?.file) {
      setMediaPreviewUrl(null);
      return undefined;
    }

    if (mediaFile.type !== 'image' && mediaFile.type !== 'video') {
      setMediaPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(mediaFile.file);
    setMediaPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [mediaFile]);

  // Clear data when clearData prop changes
  useEffect(() => {
    if (clearData) {
      setText("");
      setMediaFile(null);
      setIsVideoRecording(false);
      closeCapture();
    }
  }, [clearData]);

  // Handle template text insertion
  useEffect(() => {
    if (templateText && templateText.trim()) {
      setText(templateText);
    }
  }, [templateText]);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile({ file, type });
      closeCapture();
    }
  };

  const openCapture = async (mode, facing = cameraFacing) => {
    try {
      closeCapture();
      const constraints = {
        video: { facingMode: { ideal: facing } },
        ...(mode === 'video' ? { audio: true } : {}),
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        if (mode === 'video') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: cameraFacing } },
          });
        } else {
          throw error;
        }
      }

      streamRef.current = stream;
      setCaptureMode(mode);
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Could not access camera. Please ensure you have granted camera permissions."
      );
    }
  };

  const handleCameraClick = async () => {
    if (showCamera && captureMode === 'photo') {
      closeCapture();
      return;
    }
    await openCapture('photo', cameraFacing);
  };

  const handleVideoClick = async () => {
    if (showCamera && captureMode === 'video') {
      closeCapture();
      return;
    }
    await openCapture('video', cameraFacing);
  };

  const handleFlipCamera = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (showCamera) {
      await openCapture(captureMode || 'photo', nextFacing);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.png`, {
            type: "image/png",
          });
          setMediaFile({ file, type: "image" });
          closeCapture();
        }
      }, "image/png");
    }
  };

  useEffect(() => {
    return () => {
      closeCapture();
      if (videoRecorderRef.current?.state === 'recording') {
        videoRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!showCamera || !streamRef.current || !videoRef.current) {
      return undefined;
    }

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

    return () => {
      video.onloadedmetadata = null;
    };
  }, [showCamera]);

  const startVideoRecording = async () => {
    if (!streamRef.current) {
      await openCapture('video');
    }

    if (!streamRef.current) {
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      alert('Video recording is not supported in this browser.');
      return;
    }

    const preferredMimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    const supportedMimeType = preferredMimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));

    try {
      videoChunksRef.current = [];
      videoRecorderRef.current = new MediaRecorder(
        streamRef.current,
        supportedMimeType ? { mimeType: supportedMimeType } : undefined
      );

      videoRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      videoRecorderRef.current.onstop = () => {
        const blob = new Blob(videoChunksRef.current, {
          type: videoRecorderRef.current?.mimeType || 'video/webm',
        });
        const file = new File([blob], `video-${Date.now()}.webm`, {
          type: blob.type || 'video/webm',
        });
        setMediaFile({ file, type: "video" });
        setIsVideoRecording(false);
        closeCapture();
      };

      videoRecorderRef.current.start();
      setIsVideoRecording(true);
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert('Could not start video recording. Please try again.');
    }
  };

  const stopVideoRecording = () => {
    if (
      videoRecorderRef.current &&
      videoRecorderRef.current.state === 'recording'
    ) {
      videoRecorderRef.current.stop();
      setIsVideoRecording(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        placeholder={placeholder || "What's on your mind today? #tags"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ pr: '48px' }} // Add padding to the right to make space for the icons
      />
      {!hideMediaControls ? (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: '4px',
          }}
        >
          {!hidePhotoButton ? (
            <>
              <input
                accept="image/*"
                id={imageInputId}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e, "image")}
              />
              <label htmlFor={imageInputId}>
                <IconButton color="primary" component="span" size="small">
                  <AddPhotoAlternateIcon />
                </IconButton>
              </label>
            </>
          ) : null}

          <IconButton color="primary" onClick={handleCameraClick} size="small">
            <PhotoCameraIcon />
          </IconButton>
          <IconButton color="primary" onClick={handleVideoClick} size="small">
            <VideocamIcon />
          </IconButton>
        </Box>
      ) : null}
      {!hideMediaControls && showCamera && (
        <Box
          sx={{
            my: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            width: "100%",
            gap: 1,
          }}
          >
          {captureMode === 'video' && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 0.5,
              }}
            >
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#b91c1c' }}>
                Recording video
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Preview is live while you record
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              width: '100%',
              maxWidth: 520,
              alignSelf: 'center',
              position: 'relative',
            }}
          >
            <IconButton
              onClick={handleFlipCamera}
              size="small"
              disabled={isVideoRecording}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 2,
                bgcolor: 'rgba(17, 24, 39, 0.75)',
                color: '#fff',
                '&:hover': {
                  bgcolor: 'rgba(17, 24, 39, 0.9)',
                },
              }}
            >
              <FlipCameraIosIcon fontSize="small" />
            </IconButton>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                display: 'block',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
                borderRadius: "12px",
                backgroundColor: '#111827',
                border: '1px solid #d1d5db',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              }}
            ></video>
          </Box>
          {captureMode === 'photo' ? (
            <Button variant="contained" onClick={capturePhoto} sx={{ mt: 1 }}>
              Capture
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={isVideoRecording ? stopVideoRecording : startVideoRecording}
              sx={{ mt: 1 }}
              color={isVideoRecording ? 'error' : 'primary'}
            >
              {isVideoRecording ? 'Stop Recording' : 'Record Video'}
            </Button>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </Box>
      )}
      {!hideMediaControls && mediaFile && (
        <Typography variant="caption" sx={{ marginLeft: 1 }}>
          {mediaFile.file.name} attached
        </Typography>
      )}
      {!hideMediaControls && mediaPreviewUrl && mediaFile?.type === 'image' && (
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={mediaPreviewUrl}
            alt={mediaFile?.file?.name || 'Attached image preview'}
            sx={{
              width: '100%',
              maxWidth: 420,
              maxHeight: 280,
              objectFit: 'cover',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
            }}
          />
        </Box>
      )}
      {!hideMediaControls && mediaPreviewUrl && mediaFile?.type === 'video' && (
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            component="video"
            src={mediaPreviewUrl}
            controls
            playsInline
            sx={{
              width: '100%',
              maxWidth: 420,
              maxHeight: 320,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              bgcolor: '#000',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default RichTextInput;

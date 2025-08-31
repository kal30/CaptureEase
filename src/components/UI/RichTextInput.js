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
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

const RichTextInput = ({ onDataChange, clearData, templateText, placeholder }) => {
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    onDataChange({ text, mediaFile, audioBlob });
  }, [text, mediaFile, audioBlob, onDataChange]);

  // Clear data when clearData prop changes
  useEffect(() => {
    if (clearData) {
      setText("");
      setMediaFile(null);
      setAudioBlob(null);
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        setShowCamera(false);
      }
    }
  }, [clearData]);

  // templateText is now used as placeholder, not as actual content

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile({ file, type });
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        setShowCamera(false);
      }
    }
  };

  const handleCameraClick = async () => {
    if (showCamera) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setShowCamera(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = stream;
        setShowCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert(
          "Could not access camera. Please ensure you have granted camera permissions."
        );
      }
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
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
          setShowCamera(false);
        }
      }, "image/png");
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setShowCamera(false);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        placeholder={templateText || placeholder || "What's on your mind today? #tags"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ pr: '48px' }} // Add padding to the right to make space for the icons
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          display: 'flex',
          gap: '4px',
        }}
      >
        <input
          accept="image/*"
          id="icon-button-file-image"
          type="file"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e, "image")}
        />
        <label htmlFor="icon-button-file-image">
          <IconButton color="primary" component="span" size="small">
            <AddPhotoAlternateIcon />
          </IconButton>
        </label>

        <IconButton color="primary" onClick={handleCameraClick} size="small">
          <PhotoCameraIcon />
        </IconButton>

        <input
          accept="video/*"
          id="icon-button-file-video"
          type="file"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e, "video")}
        />
        <label htmlFor="icon-button-file-video">
          <IconButton color="primary" component="span" size="small">
            <VideocamIcon />
          </IconButton>
        </label>

        <IconButton
          color="primary"
          onClick={isRecording ? stopRecording : startRecording}
          size="small"
        >
          {isRecording ? <StopIcon sx={{ color: "red" }} /> : <MicIcon />}
        </IconButton>
      </Box>
      {showCamera && (
        <Box
          sx={{
            my: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              maxWidth: "400px",
              borderRadius: "8px",
            }}
          ></video>
          <Button variant="contained" onClick={capturePhoto} sx={{ mt: 1 }}>
            Capture
          </Button>
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
        </Box>
      )}
      {audioBlob && (
        <Typography variant="caption" sx={{ marginLeft: 1 }}>
          Voice memo attached
        </Typography>
      )}
      {mediaFile && (
        <Typography variant="caption" sx={{ marginLeft: 1 }}>
          {mediaFile.file.name} attached
        </Typography>
      )}
    </Box>
  );
};

export default RichTextInput;

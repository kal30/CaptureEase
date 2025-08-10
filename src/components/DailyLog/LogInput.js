import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../services/firebase";

const LogInput = ({ childId }) => {
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const streamRef = useRef(null);

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

  // Stop camera when component unmounts
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
        stream.getTracks().forEach((track) => track.stop()); // Stop the microphone
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

  const extractTags = (inputText) => {
    const tagRegex = /#(\w+)/g;
    const matches = [...inputText.matchAll(tagRegex)];
    return matches.map((match) => match[1]);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !mediaFile && !audioBlob) {
      return; // Don't submit empty
    }

    setLoading(true);
    let mediaURL = "";
    let voiceMemoURL = "";
    let mediaType = "";
    const tags = extractTags(text);

    try {
      if (mediaFile) {
        const mediaRef = ref(
          storage,
          `dailyLogs/${childId}/${Date.now()}-${mediaFile.file.name}`
        );
        await uploadBytes(mediaRef, mediaFile.file);
        mediaURL = await getDownloadURL(mediaRef);
        mediaType = mediaFile.type;
      }

      if (audioBlob) {
        const audioRef = ref(
          storage,
          `dailyLogs/${childId}/${Date.now()}-voice-memo.webm`
        );
        await uploadBytes(audioRef, audioBlob);
        voiceMemoURL = await getDownloadURL(audioRef);
      }

      await addDoc(collection(db, "dailyLogs"), {
        childId,
        text,
        mediaURL,
        mediaType,
        voiceMemoURL,
        tags,
        timestamp: serverTimestamp(),
      });

      setText("");
      setMediaFile(null);
      setAudioBlob(null);
    } catch (error) {
      console.error("Error adding daily log:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ padding: 2, marginBottom: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        placeholder="What's on your mind today? #tags"
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <input
            accept="image/*"
            id="icon-button-file-image"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "image")}
          />
          <label htmlFor="icon-button-file-image">
            <IconButton color="primary" component="span">
              <AddPhotoAlternateIcon />
            </IconButton>
          </label>

          <IconButton color="primary" onClick={handleCameraClick}>
            <PhotoCameraIcon />
          </IconButton>

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

          <input
            accept="video/*"
            id="icon-button-file-video"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange(e, "video")}
          />
          <label htmlFor="icon-button-file-video">
            <IconButton color="primary" component="span">
              <VideocamIcon />
            </IconButton>
          </label>

          <IconButton
            color="primary"
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <StopIcon sx={{ color: "red" }} /> : <MicIcon />}
          </IconButton>
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
        <Button
          variant="contained"
          endIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          onClick={handleSubmit}
          disabled={loading || (!text.trim() && !mediaFile && !audioBlob)}
        >
          Log
        </Button>
      </Box>
    </Paper>
  );
};

export default LogInput;

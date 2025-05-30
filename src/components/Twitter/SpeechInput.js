import React, { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';

const SpeechInput = ({ setText, handleSubmit }) => {
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);  // Track if speech recognition is running

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const speechText = event.results[0][0].transcript;
        setText((prevText) => `${prevText} ${speechText}`);  // Append the recognized speech to the input
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);  // Stop listening on error
      };

      recognitionInstance.onend = () => {
        setIsListening(false);  // Reset listening state when recognition ends
        handleSubmit();  // Automatically submit the message after speech ends
        //setText('');  // Clear the input text after submission
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech Recognition API is not supported in this browser.');
    }
  }, [setText, handleSubmit]);

  // Start speech recognition
  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
      setIsListening(true);  // Set the listening flag to true when recognition starts
    }
  };

  return (
    <IconButton onClick={startListening} sx={{ marginLeft: 1 }} color={isListening ? 'secondary' : 'default'}>
      <MicIcon />
    </IconButton>
  );
};

export default SpeechInput;
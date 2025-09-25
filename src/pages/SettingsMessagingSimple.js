import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const SettingsMessagingSimple = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState('');
  
  const auth = getAuth();

  useEffect(() => {
    // Initialize reCAPTCHA on component mount
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: (response) => {
        console.log('reCAPTCHA solved:', response);
      }
    });
    
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, [auth]);

  const sendCode = async () => {
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      setMessage('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setMessage('SMS sent! Check your phone for the verification code.');
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error.message}`);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: (response) => {
            console.log('reCAPTCHA solved:', response);
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || !confirmationResult) {
      setMessage('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      setMessage('Phone number verified successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Verification failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Phone Verification Test
      </Typography>

      <Card>
        <CardContent>
          {!confirmationResult ? (
            <>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
              />
              
              <Box id="recaptcha-container" sx={{ mb: 2 }}></Box>
              
              <Button
                variant="contained"
                onClick={sendCode}
                disabled={loading || !phoneNumber}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                sx={{ mb: 2 }}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
              />
              
              <Button
                variant="contained"
                onClick={verifyCode}
                disabled={loading || !verificationCode}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </>
          )}
          
          {message && (
            <Alert 
              severity={message.includes('Error') ? 'error' : 'info'} 
              sx={{ mt: 2 }}
            >
              {message}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsMessagingSimple;
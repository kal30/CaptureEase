import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Divider,
  Link
} from '@mui/material';
import { Check, Phone, Message, Link as LinkIcon, LinkOff } from '@mui/icons-material';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../services/firebase';
import { getActiveChildren } from '../services/childService';
import { usePhoneStatus } from '../hooks/usePhoneStatus';

const functions = getFunctions(app, 'us-central1');
const linkPhoneAndDefaultChildCallable = httpsCallable(functions, 'linkPhoneAndDefaultChild');
const updateChildSmsSettingsCallable = httpsCallable(functions, 'updateChildSmsSettings');
const delinkPhoneCallable = httpsCallable(functions, 'delinkPhone');

const SettingsMessaging = () => {
  const auth = getAuth();
  
  // Use the centralized phone status hook
  const phoneStatus = usePhoneStatus();
  
  // Phone verification state (only for the verification process)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  
  // OTP countdown state
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState(null);

  // Default child state
  const [children, setChildren] = useState([]);
  const [defaultChildId, setDefaultChildId] = useState('');
  const [childrenLoading, setChildrenLoading] = useState(false);

  // UI state
  const [linkLoading, setLinkLoading] = useState(false);
  const [delinkLoading, setDelinkLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Sync local state with hook state
  const { verified: phoneVerified, phone, linked: phoneLinked } = phoneStatus;

  // Sync phone number from hook to local state
  useEffect(() => {
    if (phone && phone !== phoneNumber) {
      setPhoneNumber(phone);
    }
  }, [phone]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadAccessibleChildren();
      } else {
        setChildren([]);
      }
    });

    return () => {
      unsubscribe();

      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (error) {
          console.warn('Error clearing reCAPTCHA verifier:', error);
        }
        setRecaptchaVerifier(null);
      }
      
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, []);

  // Load default child from user document if available
  useEffect(() => {
    const loadDefaultChild = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.defaultChildId) {
            setDefaultChildId(userData.defaultChildId);
          }
        }
      } catch (error) {
        console.error('Error loading default child:', error);
      }
    };
    
    loadDefaultChild();
  }, [auth.currentUser]);

  const loadAccessibleChildren = async () => {
    if (!auth.currentUser) {
      return;
    }

    setChildrenLoading(true);
    try {
      // Use the same service that dashboard uses - this works reliably
      const childrenData = await getActiveChildren();
      console.log('🎯 Setting children in state:', childrenData);
      setChildren(childrenData);
    } catch (error) {
      console.error('❌ Error loading children:', error);
      
      // Don't show error if user is not authenticated (expected)
      if (!auth.currentUser) {
        console.log('🔍 Skipping error display - user not authenticated');
        return;
      }
      
      let message = 'Failed to load children';
      
      if (error.message?.includes('timeout') || error.code === 'deadline-exceeded') {
        message = 'Timeout loading children. Please check your connection and refresh.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        message = 'Network error loading children. Please check your internet connection.';
      }
      
      showSnackbar(message, 'error');
    } finally {
      setChildrenLoading(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    // Basic E.164 validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  const sendVerificationCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      showSnackbar('Please enter a valid phone number (e.g., +1234567890)', 'error');
      return;
    }

    setPhoneLoading(true);
    try {
      // Initialize reCAPTCHA verifier if not already created
      let verifier = recaptchaVerifier;
      if (!verifier) {
        // Check if DOM element exists
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (!recaptchaContainer) {
          showSnackbar('reCAPTCHA container not found. Please refresh the page.', 'error');
          setPhoneLoading(false);
          return;
        }

        try {
          verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'normal',
            callback: () => {
              console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
              showSnackbar('reCAPTCHA expired. Please try again.', 'error');
            }
          });
          
          // Render the verifier
          await verifier.render();
          setRecaptchaVerifier(verifier);
        } catch (error) {
          console.error('Error creating reCAPTCHA verifier:', error);
          let message = 'Failed to initialize reCAPTCHA. Please refresh the page.';
          
          if (error.message?.includes('timeout')) {
            message = 'reCAPTCHA loading timeout. Please check your connection and refresh.';
          }
          
          showSnackbar(message, 'error');
          setPhoneLoading(false);
          return;
        }
      }

      // Send verification code
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmation);
      
      // Start 60-second countdown
      startOtpCountdown();
      
      showSnackbar('Verification code sent! Enter the code within 60 seconds.', 'success');
    } catch (error) {
      console.error('Error sending verification code:', error);
      let message = 'Failed to send verification code';
      
      if (error.code === 'auth/invalid-phone-number') {
        message = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/internal-error') {
        message = 'Service temporarily unavailable. Please refresh and try again.';
      } else if (error.code === 'auth/network-request-failed' || error.message?.includes('timeout')) {
        message = 'Network timeout. Please check your connection and try again.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        message = 'Network error. Please check your internet connection.';
      }
      
      showSnackbar(message, 'error');
      
      // Clear and reset reCAPTCHA verifier on error
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (clearError) {
          console.warn('Error clearing reCAPTCHA:', clearError);
        }
        setRecaptchaVerifier(null);
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!confirmationResult || !verificationCode) {
      showSnackbar('Please enter the verification code', 'error');
      return;
    }

    if (!auth.currentUser) {
      showSnackbar('You must be logged in to link a phone number', 'error');
      return;
    }

    setPhoneLoading(true);
    try {
      // Store the current user info before verification
      const originalUser = auth.currentUser;
      const originalUserUid = originalUser.uid;
      
      // Create phone credential from the confirmation result
      const phoneCredential = PhoneAuthProvider.credential(
        confirmationResult.verificationId, 
        verificationCode
      );
      
      // Link the phone credential to the existing Google account
      const result = await linkWithCredential(originalUser, phoneCredential);
      
      // Verify we're still the same user
      if (result.user.uid === originalUserUid) {
        // Update Firestore user document with phone verification status
        try {
          await updateDoc(doc(db, 'users', originalUserUid), {
            phone: phoneNumber,
            phoneVerified: true,
            phoneVerifiedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('✅ Updated user document with phone verification');
        } catch (error) {
          console.error('❌ Failed to update user document:', error);
        }
        
        showSnackbar('Phone number successfully verified!', 'success');
        
        // Reload children since we're still the same authenticated user
        loadAccessibleChildren();
        
        // The usePhoneStatus hook will automatically update the verification status
      } else {
        console.error('❌ User ID changed unexpectedly during linking');
        showSnackbar('Error: User account changed during linking', 'error');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      let message = 'Invalid verification code';

      if (error.code === 'auth/invalid-verification-code') {
        message = 'Invalid verification code. Please try again.';
      } else if (error.code === 'auth/code-expired') {
        message = 'Verification code has expired. Please request a new one.';
      } else if (error.code === 'auth/credential-already-in-use') {
        message = 'This phone number is already linked to another account.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'This phone number is already associated with a different account. Please use a different phone number.';
      } else if (error.code === 'auth/provider-already-linked') {
        // Phone already linked - treat as success and update Firestore
        console.log('Phone already linked to account, updating Firestore...');
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            phone: phoneNumber,
            phoneVerified: true,
            phoneVerifiedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('✅ Updated user document with phone verification');
          showSnackbar('Phone number already verified!', 'success');
          loadAccessibleChildren();
          setPhoneLoading(false);
          return; // Exit early - this is success
        } catch (firestoreError) {
          console.error('❌ Failed to update user document:', firestoreError);
          message = 'Phone already linked but failed to update settings. Please refresh the page.';
        }
      } else if (error.code === 'auth/network-request-failed' || error.message?.includes('timeout')) {
        message = 'Network timeout. Please check your connection and try again.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        message = 'Network error. Please check your internet connection.';
      }

      showSnackbar(message, 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSaveAndLink = async () => {
    if (!phoneVerified || !defaultChildId) {
      showSnackbar('Please verify your phone and select a default child', 'error');
      return;
    }

    setLinkLoading(true);
    try {
      const result = await linkPhoneAndDefaultChildCallable({
        phoneE164: phoneNumber,
        defaultChildId: defaultChildId
      });

      console.log('Phone linked successfully:', result.data);
      
      // The hook will automatically update the linked status
      const selectedChild = children.find(child => child.id === defaultChildId);
      const childName = selectedChild ? selectedChild.name : 'your child';
      
      showSnackbar(`Linked! Incoming SMS/WhatsApp will route to ${childName}`, 'success');
    } catch (error) {
      console.error('Error linking phone:', error);
      let message = 'Failed to link phone number';
      
      if (error.code === 'functions/already-exists') {
        message = 'This phone number is already linked to another account';
      } else if (error.code === 'functions/permission-denied') {
        message = 'You don\'t have access to the selected child';
      } else if (error.code === 'functions/invalid-argument') {
        message = 'Invalid phone number or child selection';
      } else if (error.code === 'functions/deadline-exceeded' || error.message?.includes('timeout')) {
        message = 'Request timeout. Please check your connection and try again.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        message = 'Network error. Please check your internet connection.';
      }
      
      showSnackbar(message, 'error');
    } finally {
      setLinkLoading(false);
    }
  };

  const startOtpCountdown = () => {
    setOtpCountdown(60);
    
    const interval = setInterval(() => {
      setOtpCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(interval);
          setCountdownInterval(null);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    setCountdownInterval(interval);
  };

  const resetCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setOtpCountdown(0);
  };

  const handleResendCode = async () => {
    // Reset verification state
    setVerificationCode('');
    setConfirmationResult(null);
    resetCountdown();
    
    // Send new verification code
    await sendVerificationCode();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelinkPhone = async () => {
    if (!window.confirm('Are you sure you want to delink your phone number? You will no longer receive SMS/WhatsApp messages.')) {
      return;
    }

    setDelinkLoading(true);
    try {
      const result = await delinkPhoneCallable();
      console.log('Phone delinked successfully:', result.data);
      showSnackbar('Phone number successfully delinked', 'success');

      // Reload children and reset default child selection
      setDefaultChildId('');
      loadAccessibleChildren();
    } catch (error) {
      console.error('Error delinking phone:', error);
      let message = 'Failed to delink phone number';

      if (error.code === 'functions/not-found') {
        message = 'No linked phone number found';
      } else if (error.code === 'functions/permission-denied') {
        message = 'You don\'t have permission to delink this phone';
      } else if (error.code === 'functions/deadline-exceeded' || error.message?.includes('timeout')) {
        message = 'Request timeout. Please check your connection and try again.';
      } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        message = 'Network error. Please check your internet connection.';
      }

      showSnackbar(message, 'error');
    } finally {
      setDelinkLoading(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Message color="primary" />
        Phone & Messaging Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Log entries from WhatsApp/SMS. Messages are saved as logs, not team chat.
      </Typography>

      {/* Section 1: Phone Verification - only show if not verified */}
      {!phoneVerified && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Phone />
            Phone Verification
            {phoneVerified && <Chip icon={<Check />} label="Verified" color="success" size="small" />}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Phone Number (E.164 format)"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={phoneVerified}
              sx={{ mb: 2 }}
            />
            
            {!phoneVerified && !confirmationResult && (
              <Box sx={{ mb: 2 }}>
                <div id="recaptcha-container"></div>
              </Box>
            )}
            
            {!confirmationResult && !phoneVerified && (
              <Button
                variant="contained"
                onClick={sendVerificationCode}
                disabled={phoneLoading || !phoneNumber}
                startIcon={phoneLoading ? <CircularProgress size={16} /> : <Phone />}
              >
                {phoneLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            )}
            
            {confirmationResult && !phoneVerified && (
              <Box>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                {/* OTP Countdown Timer */}
                {otpCountdown > 0 && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: otpCountdown <= 10 ? '#ffebee' : undefined,
                      '& .MuiAlert-icon': {
                        color: otpCountdown <= 10 ? '#f44336' : undefined
                      }
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: otpCountdown <= 10 ? '#f44336' : 'text.primary'
                      }}
                    >
                      Enter code within {otpCountdown} seconds
                    </Typography>
                  </Alert>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={verifyCode}
                    disabled={phoneLoading || !verificationCode}
                    startIcon={phoneLoading ? <CircularProgress size={16} /> : <Check />}
                    sx={{ flexGrow: 1 }}
                  >
                    {phoneLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  
                  {otpCountdown === 0 && (
                    <Button
                      variant="outlined"
                      onClick={handleResendCode}
                      disabled={phoneLoading}
                      startIcon={phoneLoading ? <CircularProgress size={16} /> : <Phone />}
                    >
                      Resend
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Box>
          </CardContent>
        </Card>
      )}

      {/* Section 1.5: Phone Status Display - show if verified */}
      {phoneVerified && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone />
              Phone Status
              <Chip icon={<Check />} label="Verified" color="success" size="small" />
              {phoneLinked && <Chip icon={<LinkIcon />} label="Linked" color="primary" size="small" />}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Phone Number:</strong> {phoneNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {phoneLinked 
                ? 'Your phone number is verified and linked. SMS/WhatsApp messages will be automatically logged.' 
                : 'Your phone number is verified and ready to receive SMS/WhatsApp messages.'}
            </Typography>
            {phoneLinked && (
              <>
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Ready to go!</strong> Use "Name: message" or an alias (like "arj:"). If you leave the name out, we use your Default Child.
                  </Typography>
                </Alert>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelinkPhone}
                    disabled={delinkLoading}
                    startIcon={delinkLoading ? <CircularProgress size={16} /> : <LinkOff />}
                  >
                    {delinkLoading ? 'Delinking...' : 'Delink Phone Number'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 2: Default Child */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Default Child for Messages
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This is only used when a message does not include a child name or alias.
            You can still log for any child by starting with their name or alias.
          </Typography>
          
          {childrenLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl>
                <FormLabel>Select the fallback child for messages without a child name:</FormLabel>
                <RadioGroup
                  value={defaultChildId}
                  onChange={(e) => setDefaultChildId(e.target.value)}
                >
                  {children.map((child) => (
                    <FormControlLabel
                      key={child.id}
                      value={child.id}
                      control={<Radio />}
                      label={child.name}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <Alert severity="info" sx={{ mt: 2 }}>
                Examples: "Arjun: had lunch" logs for Arjun. "Had lunch" logs to your Default Child.
              </Alert>
            </>
          )}
          
          {children.length === 0 && !childrenLoading && (
            <Alert severity="info">
              No accessible children found. You need to be part of a child's care team to receive messages.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Link to Ingest - only show if phone is verified but not linked */}
      {phoneVerified && !phoneLinked && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon />
              Link Phone to Account
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect your verified phone number. Messages with no child name will go to your Default Child, and named messages can log for any authorized child.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleSaveAndLink}
              disabled={!phoneVerified || !defaultChildId || linkLoading}
              startIcon={linkLoading ? <CircularProgress size={16} /> : <LinkIcon />}
              sx={{ mb: 2 }}
            >
              {linkLoading ? 'Linking...' : 'Save & Link'}
            </Button>
            
            {(!phoneVerified || !defaultChildId) && (
              <Alert severity="warning">
                Please verify your phone number and pick a Default Child to finish linking. This default is only a fallback.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 4: WhatsApp Sandbox Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            WhatsApp Sandbox Testing
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            For testing WhatsApp integration, use Twilio's sandbox:
          </Typography>
          
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              <strong>Sandbox Number:</strong> +1 415 523 8886
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              <strong>Join Code:</strong> Send "join {'{'}code{'}'}" to connect
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              <strong>Webhook URL:</strong> https://ingestmessage-rj2mc3r72a-uc.a.run.app
            </Typography>
          </Box>
          
          <Alert severity="info">
            <Typography variant="body2">
              After linking your phone, send a WhatsApp message to the sandbox number like: 
              <br />
              <strong>"Had lunch with applesauce #childname"</strong>
              <br />
              The message will be automatically logged and categorized!
            </Typography>
          </Alert>
          
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> To log for a specific child, include a tag like #Emma or the child's id (e.g., #tfVn2r0S...). If no tag is provided, we'll use your Default Child.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsMessaging;

import React, { useState } from 'react';
import { sendInvitation } from '../../services/invitationService';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  CircularProgress,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  FormHelperText
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const InviteTeamMemberModal = ({ open, onClose, allChildren }) => {
  const [role, setRole] = useState('caregiver');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedChildren, setSelectedChildren] = useState([]);

  const handleClose = () => {
    setRole('caregiver');
    setEmail('');
    setEmailError('');
    setSpecialization('');
    setMessage('');
    setLoading(false);
    setError('');
    setSuccess('');
    setSelectedChildren([]);
    onClose();
  };

  // Enhanced email validation
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email) {
      return 'Email address is required';
    }
    
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    if (email.length > 254) {
      return 'Email address is too long';
    }
    
    return '';
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Real-time validation
    if (newEmail) {
      const emailValidationError = validateEmail(newEmail);
      setEmailError(emailValidationError);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate all required fields
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setError('Please fix the email address error.');
      setLoading(false);
      return;
    }

    if (!role) {
      setError('Please select a role.');
      setLoading(false);
      return;
    }

    if (selectedChildren.length === 0) {
      setError('Please select at least one child.');
      setLoading(false);
      return;
    }

    if (role === 'therapist' && !specialization.trim()) {
      setError('Specialization is required for therapists.');
      setLoading(false);
      return;
    }

    try {
      const results = [];
      const childNames = [];
      
      for (const childId of selectedChildren) {
        const child = allChildren.find(c => c.id === childId);
        childNames.push(child?.name || 'Unknown');
        
        const result = await sendInvitation(
          childId, 
          email.trim().toLowerCase(), 
          role, 
          specialization.trim(), 
          message.trim()
        );
        results.push(result.message);
      }
      
      const successMessage = `Invitation sent successfully to ${email} for ${childNames.join(', ')}.`;
      setSuccess(successMessage);
      
      // Reset form after success
      setTimeout(() => {
        setEmail('');
        setEmailError('');
        setSpecialization('');
        setMessage('');
        setSelectedChildren([]);
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Invitation error:', err);
      let errorMessage = 'Failed to send invitation. Please try again.';
      
      if (err.message) {
        if (err.message.includes('already assigned')) {
          errorMessage = 'This person is already assigned to the selected child(ren).';
        } else if (err.message.includes('not found')) {
          errorMessage = 'Child not found. Please refresh and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Invite Team Member</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mb: 2 }}>
          <InputLabel id="select-children-label">Select Child(ren)</InputLabel>
          <Select
            labelId="select-children-label"
            multiple
            value={selectedChildren}
            onChange={(e) => setSelectedChildren(e.target.value)}
            input={<OutlinedInput label="Select Child(ren)" />}
            renderValue={(selected) => selected.map(id => allChildren.find(child => child.id === id)?.name).join(', ')}
            fullWidth
          >
            {allChildren.map((child) => (
              <MenuItem key={child.id} value={child.id}>
                {child.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Select Role:</Typography>
          <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)}>
            <FormControlLabel value="caregiver" control={<Radio />} label="Caregiver" />
            <FormControlLabel value="therapist" control={<Radio />} label="Therapist" />
          </RadioGroup>
        </Box>

        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={handleEmailChange}
          error={!!emailError}
          helperText={emailError || 'Enter the email address of the person you want to invite'}
          placeholder="example@email.com"
          InputProps={{
            startAdornment: <EmailIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
          sx={{ mb: 2 }}
        />

        {role === 'therapist' && (
          <TextField
            margin="dense"
            id="specialization"
            label="Specialization (e.g., OT, SLP)"
            type="text"
            fullWidth
            variant="outlined"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          margin="dense"
          id="message"
          label="Personal Message (optional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          color="secondary" 
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color="primary" 
          disabled={loading || !!emailError || !email}
          startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
          sx={{ 
            minWidth: 140,
            background: 'linear-gradient(135deg, #F27F45 0%, #E85D2F 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #E85D2F 0%, #D64925 100%)',
            }
          }}
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteTeamMemberModal;

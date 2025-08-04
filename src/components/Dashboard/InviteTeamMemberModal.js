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
  OutlinedInput
} from '@mui/material';

const InviteTeamMemberModal = ({ open, onClose, allChildren }) => {
  const [role, setRole] = useState('caregiver');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedChildren, setSelectedChildren] = useState([]);

  const handleClose = () => {
    setRole('caregiver');
    setEmail('');
    setSpecialization('');
    setMessage('');
    setLoading(false);
    setError('');
    setSuccess('');
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !role || selectedChildren.length === 0) {
      setError('Email, Role, and at least one Child are required.');
      setLoading(false);
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const results = [];
      for (const childId of selectedChildren) {
        const result = await sendInvitation(childId, email, role, specialization, message);
        results.push(result.message);
      }
      setSuccess(results.join(' '));
      // handleClose(); // Close after success or keep open for more invitations
    } catch (err) {
      console.error('Invitation error:', err);
      setError(err.message || 'Failed to send invitation. Please try again.');
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
          onChange={(e) => setEmail(e.target.value)}
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
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteTeamMemberModal;

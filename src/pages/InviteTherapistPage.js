import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Psychology as TherapyIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import StyledButton from '../components/UI/StyledButton';
import { sendInvitation } from '../services/invitationService';
import { useRole } from '../contexts/RoleContext';

const InviteTherapistPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { childrenWithAccess: children } = useRole();

  // Form state
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-select child if passed via URL param
  useEffect(() => {
    const childId = searchParams.get('childId');
    if (childId && children.find(child => child.id === childId)) {
      setSelectedChildId(childId);
    } else if (children.length === 1) {
      // Auto-select if only one child
      setSelectedChildId(children[0].id);
    }
  }, [searchParams, children]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedChildId) {
      setError('Please select a child');
      return;
    }
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendInvitation(
        selectedChildId,
        email,
        'therapist',
        specialization,
        personalMessage
      );

      const selectedChild = children.find(child => child.id === selectedChildId);

      // Navigate to success page with details
      navigate('/invite/success', {
        state: {
          recipientEmail: email,
          role: 'therapist',
          childName: selectedChild?.name,
          message: result.message
        }
      });
    } catch (error) {
      console.error('Error sending therapist invitation:', error);
      setError(error.message || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const commonSpecializations = [
    'Occupational Therapy',
    'Speech Therapy',
    'Physical Therapy',
    'Applied Behavior Analysis (ABA)',
    'Behavioral Therapy',
    'Developmental Therapy',
    'Play Therapy',
    'Social Skills Training'
  ];

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 4,
          border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
          p: 4,
          textAlign: 'center'
        }}>
          <TherapyIcon sx={{ 
            fontSize: 64, 
            color: theme.palette.secondary.main, 
            mb: 2 
          }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Invite a Therapist
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Add a professional to your care team
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Role Information */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            p: 3,
            border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            mb: 3
          }}>
            <Box sx={{ color: theme.palette.secondary.main }}>
              <PersonIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Professional Team
                </Typography>
                <Chip
                  label="View Only"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: alpha(theme.palette.secondary.main, 0.15),
                    color: theme.palette.secondary.main,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    fontWeight: 500
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Therapists can view progress and provide professional guidance
              </Typography>
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            {/* Child Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Child</InputLabel>
              <Select
                value={selectedChildId}
                label="Select Child"
                onChange={(e) => setSelectedChildId(e.target.value)}
                required
              >
                {children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {child.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Email */}
            <TextField
              fullWidth
              label="Therapist Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              helperText="The therapist will receive an invitation email"
            />

            {/* Specialization */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={specialization}
                label="Specialization"
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <MenuItem value="">
                  <em>Select a specialization</em>
                </MenuItem>
                {commonSpecializations.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Custom specialization input */}
            {specialization === 'Other' && (
              <TextField
                fullWidth
                label="Custom Specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                sx={{ mb: 3 }}
                placeholder="Enter custom specialization"
              />
            )}

            {/* Personal Message */}
            <TextField
              fullWidth
              label="Personal Message (Optional)"
              multiline
              rows={3}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              sx={{ mb: 4 }}
              helperText="Add a personal note to the invitation email"
            />

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'center'
            }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/care-team')}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                Cancel
              </Button>
              <StyledButton
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={loading}
                sx={{ 
                  minWidth: 150,
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.3)}`
                  }
                }}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </StyledButton>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default InviteTherapistPage;
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  Checkbox
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
  FamilyRestroom as FamilyIcon,
  Psychology as TherapyIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { sendInvitation, sendMultiChildInvitation } from '../services/invitationService';
import StyledButton from './UI/StyledButton';

const InviteTeamMemberModal = ({ 
  open, 
  onClose, 
  children = [],
  selectedChildId = null,
  onInviteSuccess 
}) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('family_member');
  const [specialization, setSpecialization] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Multi-child selection state
  const [inviteAllChildren, setInviteAllChildren] = useState(true);
  const [selectedChildIds, setSelectedChildIds] = useState(new Set());

  // Initialize child selection when modal opens
  useEffect(() => {
    if (open) {
      if (selectedChildId) {
        // Modal opened from specific child section
        setInviteAllChildren(false);
        setSelectedChildIds(new Set([selectedChildId]));
      } else {
        // Modal opened from global invite button
        setInviteAllChildren(true);
        setSelectedChildIds(new Set());
      }
    }
  }, [open, selectedChildId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Determine which children to invite for
      const childrenToInviteFor = inviteAllChildren 
        ? children 
        : children.filter(child => selectedChildIds.has(child.id));

      if (childrenToInviteFor.length === 0) {
        setError('Please select at least one child to invite team member for.');
        setLoading(false);
        return;
      }

      // TEMPORARY FIX: Use single invitation for now to test roles
      let result;
      let childNames;
      
      if (childrenToInviteFor.length === 1) {
        // Single child - use original function
        result = await sendInvitation(
          childrenToInviteFor[0].id,
          email,
          role,
          role === 'therapist' ? specialization : null,
          personalMessage || null
        );
        childNames = childrenToInviteFor[0].name;
      } else {
        // Multi-child - try the new function, fall back to single if it fails
        try {
          const childIds = childrenToInviteFor.map(child => child.id);
          result = await sendMultiChildInvitation(
            childIds,
            email,
            role,
            role === 'therapist' ? specialization : null,
            personalMessage || null
          );
          childNames = result.children.join(', ');
        } catch (error) {
          console.error('Multi-child invitation failed, falling back to single invitations:', error);
          // Fallback: Send separate invitations for each child
          const results = [];
          for (const child of childrenToInviteFor) {
            const singleResult = await sendInvitation(
              child.id,
              email,
              role,
              role === 'therapist' ? specialization : null,
              personalMessage || null
            );
            results.push(singleResult);
          }
          result = { status: 'invited', message: 'Invitations sent successfully' };
          childNames = childrenToInviteFor.map(c => c.name).join(', ');
        }
      }
      setSuccess(`Invitation sent successfully for ${childNames}`);
      
      // Clear form after successful invitation
      setTimeout(() => {
        setEmail('');
        setRole('family_member');
        setSpecialization('');
        setPersonalMessage('');
        setInviteAllChildren(true);
        setSelectedChildIds(new Set());
        setSuccess('');
        onInviteSuccess?.(result);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(error.message || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setRole('family_member');
      setSpecialization('');
      setPersonalMessage('');
      setError('');
      setSuccess('');
      onClose();
    }
  };

  const roleOptions = [
    {
      value: 'co_parent',
      label: '👨‍👩‍👧‍👦 Co-Parent',
      icon: <FamilyIcon />,
      description: 'Spouse/Partner - Full access like you (add children, invite others)',
      color: '#8B5CF6',
      badge: 'Full Access'
    },
    {
      value: 'family_member',
      label: '👵 Family Member', 
      icon: <FamilyIcon />,
      description: 'Aunt, Grandma, Uncle - Can log daily activities and view all progress',
      color: '#10B981',
      badge: 'Data Entry + Full View'
    },
    {
      value: 'caregiver',
      label: '👤 Caregiver',
      icon: <PersonIcon />,
      description: 'Babysitter, Nanny - Limited access (you control what they see)',
      color: '#F59E0B',
      badge: 'Restricted Access'
    },
    {
      value: 'therapist', 
      label: '🩺 Therapist',
      icon: <TherapyIcon />,
      description: 'Professional - Read-only access to provide guidance',
      color: '#64748B',
      badge: 'View Only'
    }
  ];

  const getDefaultMessage = () => {
    const childrenToInviteFor = inviteAllChildren 
      ? children 
      : children.filter(child => selectedChildIds.has(child.id));
    
    if (childrenToInviteFor.length === 0) {
      return '';
    } else if (childrenToInviteFor.length === 1) {
      const childName = childrenToInviteFor[0].name;
      if (role === 'caregiver') {
        return `Hi! I'd love for you to help track ${childName}'s daily progress in our CaptureEase app. You'll be able to log daily activities, behaviors, and milestones that help us understand ${childName} better. Looking forward to working together!`;
      } else {
        return `Hi! I'd like to invite you to view ${childName}'s progress in our CaptureEase app. You'll have access to timeline data, analytics, and progress tracking that might be helpful for our sessions. Thanks for being part of ${childName}'s care team!`;
      }
    } else {
      const childNames = childrenToInviteFor.map(c => c.name).join(', ');
      if (role === 'caregiver') {
        return `Hi! I'd love for you to help track daily progress for ${childNames} in our CaptureEase app. You'll be able to log daily activities, behaviors, and milestones that help us understand the children better. Looking forward to working together!`;
      } else {
        return `Hi! I'd like to invite you to view progress for ${childNames} in our CaptureEase app. You'll have access to timeline data, analytics, and progress tracking that might be helpful for your sessions. Thanks for being part of their care team!`;
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      maxHeight="90vh"
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 2
        }}
      >
        <PersonAddIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Invite Team Member
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add someone to your children's care team
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ 
          p: 3,
          flex: 1,
          overflow: 'auto',
          maxHeight: 'calc(90vh - 200px)' // Account for header and footer
        }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Email Input */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              📧 Email Address
            </Typography>
            <TextField
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@email.com"
              required
              disabled={loading}
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>

          {/* Role Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              👥 Team Role
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                {roleOptions.map((option) => (
                  <Box key={option.value} sx={{ mb: 2 }}>
                    <FormControlLabel
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 2,
                          border: `2px solid ${role === option.value ? option.color : alpha(theme.palette.divider, 0.3)}`,
                          borderRadius: 2,
                          bgcolor: role === option.value ? alpha(option.color, 0.05) : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: option.color,
                            bgcolor: alpha(option.color, 0.02)
                          }
                        }}>
                          <Box sx={{ color: option.color }}>
                            {option.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {option.label}
                              </Typography>
                              <Chip
                                label={option.badge}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: alpha(option.color, 0.15),
                                  color: option.color,
                                  border: `1px solid ${alpha(option.color, 0.3)}`,
                                  fontWeight: 500
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Child Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              👨‍👩‍👧‍👦 Add to Care Team For
            </Typography>
            
            {/* All Children Option */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={inviteAllChildren}
                  onChange={(e) => {
                    setInviteAllChildren(e.target.checked);
                    if (e.target.checked) {
                      setSelectedChildIds(new Set());
                    }
                  }}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    All Children (Recommended)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Give access to all {children.length} children
                  </Typography>
                </Box>
              }
              sx={{ mb: 2, alignItems: 'flex-start' }}
            />

            {/* Individual Child Selection */}
            {!inviteAllChildren && (
              <Box sx={{ 
                pl: 2, 
                borderLeft: `3px solid ${alpha(theme.palette.divider, 0.3)}`,
                ml: 1
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                  Or select specific children:
                </Typography>
                {children.map((child) => (
                  <FormControlLabel
                    key={child.id}
                    control={
                      <Checkbox
                        checked={selectedChildIds.has(child.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedChildIds);
                          if (e.target.checked) {
                            newSet.add(child.id);
                          } else {
                            newSet.delete(child.id);
                          }
                          setSelectedChildIds(newSet);
                        }}
                        sx={{
                          color: 'success.main',
                          '&.Mui-checked': {
                            color: 'success.main',
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {child.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Age {child.age}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 1, alignItems: 'flex-start' }}
                  />
                ))}
                
                {selectedChildIds.size > 0 && (
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 500, mt: 1, display: 'block' }}>
                    ✓ {selectedChildIds.size} child{selectedChildIds.size !== 1 ? 'ren' : ''} selected
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Specialization for Therapists */}
          {role === 'therapist' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                🩺 Specialization (Optional)
              </Typography>
              <TextField
                fullWidth
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g., Speech Therapy, Occupational Therapy, ABA"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Personal Message */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              💬 Personal Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder={getDefaultMessage()}
              disabled={loading}
              helperText="This message will be included in the invitation email"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          gap: 1,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: 'background.paper',
          flexShrink: 0
        }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ 
              px: 3,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: alpha(theme.palette.text.secondary, 0.05)
              }
            }}
          >
            Cancel
          </Button>
          <StyledButton
            type="submit"
            variant="contained"
            disabled={!email || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              '&:disabled': {
                background: theme.palette.grey[300],
                color: theme.palette.grey[500]
              }
            }}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </StyledButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteTeamMemberModal;
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  FamilyRestroom as FamilyIcon,
  Psychology as TherapyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { assignCaregiver, assignTherapist, assignCoParent, assignFamilyMember } from '../services/childService';
import { createUserProfile } from '../services/userService';
import StyledButton from '../components/UI/StyledButton';

const AcceptInvite = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user] = useAuthState(auth);
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Invalid invitation link. Please check your email for the correct link.');
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(decodeURIComponent(token)));
      
      // Validate invitation data (handle both single-child and multi-child)
      const isMultiChild = decoded.childIds && decoded.childNames;
      const isSingleChild = decoded.childId && decoded.childName;
      
      if (!decoded.email || !decoded.role || (!isMultiChild && !isSingleChild)) {
        throw new Error('Invalid invitation data');
      }

      // Check if invitation is not too old (optional - 30 days)
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      if (decoded.timestamp && (Date.now() - decoded.timestamp) > thirtyDaysMs) {
        throw new Error('This invitation has expired. Please request a new one.');
      }

      console.log('Parsed invitation data:', decoded);
      setInviteData(decoded);
    } catch (error) {
      console.error('Error parsing invitation:', error);
      setError('Invalid invitation link. Please check your email for the correct link.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleAcceptInvitation = async () => {
    console.log('handleAcceptInvitation clicked!');
    console.log('Current user:', user?.email);
    console.log('Invite data:', inviteData);
    
    if (!user || !inviteData) {
      console.log('Missing user or invite data');
      setError('You must be logged in to accept this invitation.');
      return;
    }

    if (user.email !== inviteData.email) {
      console.log('Email mismatch:', user.email, 'vs', inviteData.email);
      setError(`This invitation was sent to ${inviteData.email}. Please log in with that email address.`);
      return;
    }

    console.log('All checks passed, starting acceptance...');
    setAccepting(true);
    setError('');

    try {
      console.log('Starting invitation acceptance process...');
      
      // Create/update user profile
      console.log('Creating user profile...');
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        role: inviteData.role,
        lastActive: new Date()
      });
      console.log('User profile created successfully');

      // Assign user to child(ren) based on role
      const isMultiChild = inviteData.childIds && inviteData.childNames;
      const childIds = isMultiChild ? inviteData.childIds : [inviteData.childId];
      const childNames = isMultiChild ? inviteData.childNames : [inviteData.childName];
      
      console.log('Assigning user to children with role:', inviteData.role, 'Children:', childIds);
      
      for (const childId of childIds) {
        if (inviteData.role === 'co_parent') {
          console.log('Assigning as co-parent to child:', childId);
          await assignCoParent(childId, user.uid);
        } else if (inviteData.role === 'family_member') {
          console.log('Assigning as family member to child:', childId);
          await assignFamilyMember(childId, user.uid);
        } else if (inviteData.role === 'caregiver') {
          console.log('Assigning as caregiver to child:', childId);
          await assignCaregiver(childId, user.uid);
        } else if (inviteData.role === 'therapist') {
          console.log('Assigning as therapist to child:', childId);
          await assignTherapist(childId, user.uid);
        }
      }
      console.log('Assignment completed successfully for all children');

      const successMessage = childNames.length === 1 
        ? `Welcome to ${childNames[0]}'s care team!`
        : `Welcome to the care team for ${childNames.join(', ')}!`;
      setSuccess(successMessage);
      
      // Redirect to dashboard after 2 seconds with forced refresh
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error) {
      console.error('Error accepting invitation:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to join the care team. ';
      if (error.message.includes('permission')) {
        errorMessage += 'Permission denied. The invitation may be invalid or expired.';
      } else if (error.message.includes('not found')) {
        errorMessage += 'The child or invitation could not be found.';
      } else if (error.message.includes('already exists')) {
        errorMessage += 'You are already part of this care team.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  const getRoleInfo = (role) => {
    if (role === 'caregiver') {
      return {
        icon: <FamilyIcon />,
        label: 'Family & Caregiver',
        color: '#10B981',
        badge: 'Can Add Data',
        description: 'You can track daily progress and add entries'
      };
    } else if (role === 'therapist') {
      return {
        icon: <TherapyIcon />,
        label: 'Professional Team',
        color: '#64748B', 
        badge: 'View Only',
        description: 'You can view progress and provide guidance'
      };
    }
    return {};
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading invitation...
        </Typography>
      </Container>
    );
  }

  if (!inviteData || error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || 'Invalid invitation'}
            </Alert>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Invitation Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              There was a problem with your invitation link. Please contact the person who invited you for a new link.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const roleInfo = getRoleInfo(inviteData.role);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 4,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          p: 4,
          textAlign: 'center'
        }}>
          <PersonAddIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            You're Invited!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {inviteData.childNames ? 
              `Join the care team for ${inviteData.childNames.join(', ')}` :
              `Join ${inviteData.childName}'s care team`
            }
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              icon={<CheckIcon />}
            >
              {success} Redirecting to dashboard...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!success && (
            <>
              {/* Role Information */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 3,
                border: `2px solid ${alpha(roleInfo.color, 0.3)}`,
                borderRadius: 2,
                bgcolor: alpha(roleInfo.color, 0.05),
                mb: 3
              }}>
                <Box sx={{ color: roleInfo.color }}>
                  {roleInfo.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {roleInfo.label}
                    </Typography>
                    <Chip
                      label={roleInfo.badge}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        bgcolor: alpha(roleInfo.color, 0.15),
                        color: roleInfo.color,
                        border: `1px solid ${alpha(roleInfo.color, 0.3)}`,
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {roleInfo.description}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* User Status */}
              {!user ? (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    You need to sign in to accept this invitation
                  </Typography>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login', { state: { returnTo: window.location.pathname + window.location.search } })}
                    sx={{ mb: 1 }}
                  >
                    Sign In
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Make sure to sign in with: {inviteData.email}
                  </Typography>
                </Box>
              ) : user.email !== inviteData.email ? (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You're signed in as {user.email}, but this invitation was sent to {inviteData.email}
                  </Alert>
                  <Button
                    variant="outlined"
                    onClick={() => auth.signOut()}
                  >
                    Sign Out & Use Correct Email
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Ready to join {inviteData.childName}'s care team?
                  </Typography>
                  <StyledButton
                    variant="contained"
                    size="large"
                    onClick={handleAcceptInvitation}
                    disabled={accepting}
                    startIcon={accepting ? <CircularProgress size={16} /> : <CheckIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${roleInfo.color} 0%, ${alpha(roleInfo.color, 0.8)} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 6px 20px ${alpha(roleInfo.color, 0.3)}`
                      }
                    }}
                  >
                    {accepting ? 'Joining...' : 'Accept Invitation'}
                  </StyledButton>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AcceptInvite;
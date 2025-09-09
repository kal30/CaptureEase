import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert
} from '@mui/material';
import {
  Check as CheckIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import StyledButton from '../components/UI/StyledButton';

const InviteSuccessPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get success data from navigation state
  const { 
    recipientEmail, 
    role, 
    childName, 
    message 
  } = location.state || {};

  const getRoleInfo = (role) => {
    switch (role) {
      case 'therapist':
        return {
          label: 'Therapist',
          color: theme.palette.secondary.main,
          description: 'Professional team member'
        };
      case 'caregiver':
        return {
          label: 'Caregiver',
          color: theme.palette.primary.main,
          description: 'Care team member'
        };
      case 'care_partner':
        return {
          label: 'Care Partner',
          color: theme.palette.primary.main,
          description: 'Care team partner'
        };
      default:
        return {
          label: 'Team Member',
          color: theme.palette.grey[600],
          description: 'Care team member'
        };
    }
  };

  const roleInfo = getRoleInfo(role);

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 4,
          border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
          overflow: 'hidden'
        }}
      >
        {/* Success Header */}
        <Box sx={{ 
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.1)} 100%)`,
          p: 4,
          textAlign: 'center'
        }}>
          <CheckIcon sx={{ 
            fontSize: 64, 
            color: theme.palette.success.main, 
            mb: 2 
          }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Invitation Sent!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your invitation has been delivered successfully
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Success Details */}
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<SendIcon />}
          >
            {message || `Invitation sent to ${recipientEmail || 'the recipient'}`}
          </Alert>

          {/* Invitation Summary */}
          {recipientEmail && role && childName && (
            <Box sx={{ 
              p: 3,
              border: `1px solid ${alpha(roleInfo.color, 0.3)}`,
              borderRadius: 2,
              bgcolor: alpha(roleInfo.color, 0.05),
              mb: 3
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Invitation Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Invited:</strong> {recipientEmail}
                </Typography>
                <Typography variant="body2">
                  <strong>Role:</strong> {roleInfo.label}
                </Typography>
                <Typography variant="body2">
                  <strong>Child:</strong> {childName}
                </Typography>
              </Box>
            </Box>
          )}

          {/* What happens next */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              What happens next?
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • The recipient will receive an email invitation
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • They can click the link to join the care team
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • You'll see them in the care team once they accept
              </Typography>
            </Box>
          </Box>

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
              sx={{ minWidth: 150 }}
            >
              Back to Care Team
            </Button>
            <StyledButton
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{ minWidth: 150 }}
            >
              Back to Dashboard
            </StyledButton>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default InviteSuccessPage;
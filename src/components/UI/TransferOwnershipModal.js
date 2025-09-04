import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  Warning as WarningIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { transferOwnership } from '../../services/rolePermissionService';
import { USER_ROLES, ROLE_DISPLAY } from '../../constants/roles';
import GradientButton from './GradientButton';

/**
 * Transfer Ownership Modal
 * KISS: Simple modal for Care Owner to transfer ownership to another team member
 */
const TransferOwnershipModal = ({ 
  open, 
  onClose, 
  childId,
  childName,
  teamMembers = [],
  currentOwnerId,
  onTransferSuccess 
}) => {
  const theme = useTheme();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationStep, setConfirmationStep] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedUserId('');
      setError('');
      setConfirmationStep(false);
    }
  }, [open]);

  // Filter out current owner from team members
  const eligibleMembers = teamMembers.filter(member => 
    member.userId !== currentOwnerId && 
    // Only Care Partners, Caregivers, and Therapists can become owners
    [USER_ROLES.CARE_PARTNER, USER_ROLES.CAREGIVER, USER_ROLES.THERAPIST].includes(member.role)
  );

  const selectedMember = eligibleMembers.find(member => member.userId === selectedUserId);

  const handleNext = () => {
    if (!selectedUserId) {
      setError('Please select a team member to transfer ownership to.');
      return;
    }
    setError('');
    setConfirmationStep(true);
  };

  const handleTransfer = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    setError('');

    try {
      await transferOwnership(childId, selectedUserId, currentOwnerId);
      
      onTransferSuccess?.({
        newOwnerId: selectedUserId,
        newOwnerName: selectedMember?.displayName || 'Team Member',
        childName
      });
      
      onClose();
    } catch (error) {
      console.error('Error transferring ownership:', error);
      setError(error.message || 'Failed to transfer ownership. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleBack = () => {
    setConfirmationStep(false);
    setError('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        pb: 2
      }}>
        <TransferIcon sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Transfer Ownership
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hand over control of {childName}'s care to another team member
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!confirmationStep ? (
          // Step 1: Select new owner
          <Box>
            <Alert 
              severity="info" 
              icon={<WarningIcon />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Important: This action cannot be undone
              </Typography>
              <Typography variant="body2">
                • You will become a Care Partner (lose management privileges)
                <br />
                • The new owner will have full control over {childName}
                <br />
                • Only they can transfer ownership back to you
              </Typography>
            </Alert>

            {eligibleMembers.length === 0 ? (
              <Alert severity="warning">
                <Typography variant="body2">
                  No eligible team members found. You need at least one Care Partner, Caregiver, or Therapist to transfer ownership to.
                </Typography>
              </Alert>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select New Care Owner</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Select New Care Owner"
                  disabled={loading}
                >
                  {eligibleMembers.map((member) => {
                    const roleDisplay = ROLE_DISPLAY[member.role];
                    return (
                      <MenuItem key={member.userId} value={member.userId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Avatar 
                            src={member.photoURL} 
                            sx={{ width: 32, height: 32 }}
                          >
                            {member.displayName?.charAt(0) || <PersonIcon />}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {member.displayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                          <Chip
                            label={roleDisplay.badge}
                            size="small"
                            sx={{
                              bgcolor: alpha(roleDisplay.color, 0.1),
                              color: roleDisplay.color,
                              border: `1px solid ${alpha(roleDisplay.color, 0.3)}`,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          </Box>
        ) : (
          // Step 2: Confirmation
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Confirm Transfer
              </Typography>
              <Typography variant="body2">
                You are about to transfer ownership of <strong>{childName}</strong> to:
              </Typography>
            </Alert>

            <Box sx={{ 
              p: 3, 
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              mb: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={selectedMember?.photoURL} 
                  sx={{ width: 48, height: 48 }}
                >
                  {selectedMember?.displayName?.charAt(0) || <PersonIcon />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedMember?.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMember?.email}
                  </Typography>
                  <Chip
                    label="Will become Care Owner"
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: alpha(ROLE_DISPLAY[USER_ROLES.CARE_OWNER].color, 0.1),
                      color: ROLE_DISPLAY[USER_ROLES.CARE_OWNER].color,
                      border: `1px solid ${alpha(ROLE_DISPLAY[USER_ROLES.CARE_OWNER].color, 0.3)}`,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                After transfer, you will become a Care Partner and lose:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>Ability to delete {childName}</li>
                <li>Ability to invite/remove team members</li>
                <li>Ability to manage privacy settings</li>
                <li>Ability to transfer ownership again</li>
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={confirmationStep ? handleBack : handleClose}
          disabled={loading}
          sx={{ px: 3 }}
        >
          {confirmationStep ? 'Back' : 'Cancel'}
        </Button>
        
        {!confirmationStep ? (
          <GradientButton
            onClick={handleNext}
            disabled={!selectedUserId || eligibleMembers.length === 0}
            startIcon={<TransferIcon />}
            size="large"
          >
            Next
          </GradientButton>
        ) : (
          <Button
            onClick={handleTransfer}
            disabled={loading}
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={16} /> : <TransferIcon />}
            sx={{ px: 3 }}
          >
            {loading ? 'Transferring...' : 'Transfer Ownership'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TransferOwnershipModal;
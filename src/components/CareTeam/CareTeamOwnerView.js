import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  AccessTime as AccessTimeIcon,
  Email as EmailIcon,
  AdminPanelSettings as TransferIcon,
  FamilyRestroom as FamilyIcon,
  Psychology as TherapyIcon
} from '@mui/icons-material';
import { USER_ROLES } from '../../constants/roles';
import GradientButton from '../UI/GradientButton';

/**
 * CareTeamOwnerView - Full management view for Care Owners
 * Shows team member cards with management actions
 */
const CareTeamOwnerView = ({ child, onTeamUpdate }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // Get all team members from populated data
  const getAllTeamMembers = () => {
    const members = [];
    
    // Add care partners
    if (child.users?.care_partners) {
      members.push(...child.users.care_partners.map(member => ({
        ...member,
        role: USER_ROLES.CARE_PARTNER
      })));
    }
    
    // Add caregivers
    if (child.users?.caregivers) {
      members.push(...child.users.caregivers.map(member => ({
        ...member,
        role: USER_ROLES.CAREGIVER
      })));
    }
    
    // Add therapists
    if (child.users?.therapists) {
      members.push(...child.users.therapists.map(member => ({
        ...member,
        role: USER_ROLES.THERAPIST
      })));
    }
    
    return members;
  };

  const teamMembers = getAllTeamMembers();

  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleChangeRole = (member) => {
    // TODO: Implement role change
    console.log('Change role for:', member);
    handleMenuClose();
  };

  const handleRemoveMember = (member) => {
    // TODO: Implement member removal
    console.log('Remove member:', member);
    handleMenuClose();
  };

  const handleTransferOwnership = () => {
    // TODO: Implement ownership transfer
    console.log('Transfer ownership for:', child);
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 3 
      ? local.substring(0, 3) + '***'
      : local.substring(0, 1) + '***';
    return `${maskedLocal}@${domain}`;
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case USER_ROLES.CARE_PARTNER:
        return { color: "#45B7D1", emoji: "👨‍👩‍👧‍👦", label: "Care Partner" };
      case USER_ROLES.CAREGIVER:
        return { color: "#4ECDC4", emoji: "🤱", label: "Caregiver" };
      case USER_ROLES.THERAPIST:
        return { color: "#FF6B6B", emoji: "🩺", label: "Therapist" };
      default:
        return { color: "#94A3B8", emoji: "👤", label: "Unknown" };
    }
  };

  return (
    <Box>
      {/* Team Overview */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Team for {child.name} ({teamMembers.length} members)
          </Typography>
        </Box>
        
        {/* Invite Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <GradientButton
            variant="gradient"
            startIcon={<FamilyIcon />}
            onClick={() => navigate(`/invite/caregiver?childId=${child.id}`)}
            sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
          >
            Invite Caregiver
          </GradientButton>
          <Button
            variant="outlined"
            startIcon={<TherapyIcon />}
            onClick={() => navigate(`/invite/therapist?childId=${child.id}`)}
            sx={{ 
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              borderColor: 'secondary.main',
              color: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.dark',
                bgcolor: 'secondary.light'
              }
            }}
          >
            Invite Therapist
          </Button>
        </Box>
      </Box>

      {/* Team Member Cards */}
      {teamMembers.length > 0 ? (
        <Grid container spacing={2}>
          {teamMembers.map((member, index) => {
            const roleConfig = getRoleConfig(member.role);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={member.uid || index}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <CardContent>
                    {/* Member Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar 
                        src={member.photoURL}
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          mr: 2,
                          bgcolor: roleConfig.color
                        }}
                      >
                        {member.displayName?.[0]?.toUpperCase() || roleConfig.emoji}
                      </Avatar>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {member.displayName || 'Unknown User'}
                        </Typography>
                        <Chip
                          label={roleConfig.label}
                          size="small"
                          sx={{
                            bgcolor: `${roleConfig.color}20`,
                            color: roleConfig.color,
                            fontWeight: 500
                          }}
                        />
                      </Box>

                      {/* Actions Menu */}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, member)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    {/* Member Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {maskEmail(member.email)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {member.lastSeen ? 'Active recently' : 'Never logged in'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info">
          No team members yet. Invite care partners, caregivers, or therapists to help care for {child.name}.
        </Alert>
      )}

      {/* Danger Zone */}
      <Box sx={{ mt: 4, p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 1 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Transfer ownership of {child.name}'s care to another team member. This cannot be undone.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<TransferIcon />}
          onClick={handleTransferOwnership}
          disabled={teamMembers.length === 0}
        >
          Transfer Ownership
        </Button>
      </Box>

      {/* Permissions Legend */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Role Permissions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>👨‍👩‍👧‍👦 Care Partners</Typography>
            <Typography variant="caption" color="text.secondary">
              View, add data, invite others
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>🤱 Caregivers</Typography>
            <Typography variant="caption" color="text.secondary">
              View, add daily care data
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>🩺 Therapists</Typography>
            <Typography variant="caption" color="text.secondary">
              View only, add professional notes
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleChangeRole(selectedMember)}>
          Change Role
        </MenuItem>
        <MenuItem onClick={() => handleRemoveMember(selectedMember)} sx={{ color: 'error.main' }}>
          Remove from Team
        </MenuItem>
      </Menu>

    </Box>
  );
};

export default CareTeamOwnerView;
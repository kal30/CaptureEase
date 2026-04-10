import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Email as EmailIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { USER_ROLES } from '../../constants/roles';

/**
 * CareTeamPartnerView - Read-only view for Care Partners
 * Shows team member cards without management actions
 */
const CareTeamPartnerView = ({ child }) => {
  
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Team for {child.name} ({teamMembers.length} members)
        </Typography>
        <Tooltip title="Only the Care Owner can manage the team">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Read-only view
            </Typography>
          </Box>
        </Tooltip>
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
                    opacity: 0.9 // Slightly faded to indicate read-only
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
          No team members yet for {child.name}.
        </Alert>
      )}

      {/* Permissions Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Role Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>👨‍👩‍👧‍👦 Care Partners</Typography>
            <Typography variant="caption" color="text.secondary">
              Family members and close friends
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>🤱 Caregivers</Typography>
            <Typography variant="caption" color="text.secondary">
              Professional daily care helpers
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>🩺 Therapists</Typography>
            <Typography variant="caption" color="text.secondary">
              Professional advisors and specialists
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Help Text */}
      <Alert severity="info" sx={{ mt: 2 }}>
        Need to make changes to the team? Contact the Care Owner for {child.name} to manage team members.
      </Alert>
    </Box>
  );
};

export default CareTeamPartnerView;
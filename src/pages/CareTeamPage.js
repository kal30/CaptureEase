import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Alert,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid
} from '@mui/material';
import { useRole } from '../contexts/RoleContext';
import { USER_ROLES } from '../constants/roles';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { populateChildTeamMembers } from '../services/rolePermissionService';

const CareTeamPage = () => {
  const { childrenWithAccess, getUserRoleForChild, loading } = useRole();
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [enrichedChildren, setEnrichedChildren] = useState([]);

  // Simple access check and data loading
  useEffect(() => {
    const loadTeamData = async () => {
      if (!loading && childrenWithAccess.length > 0) {
        // Check if user has any Care Owner or Care Partner roles
        const hasOwnerOrPartner = childrenWithAccess.some(child => {
          const role = getUserRoleForChild(child.id);
          return role === USER_ROLES.CARE_OWNER || role === USER_ROLES.CARE_PARTNER;
        });
        
        setHasAccess(hasOwnerOrPartner);
        
        // Set highest role
        const isOwner = childrenWithAccess.some(child => 
          getUserRoleForChild(child.id) === USER_ROLES.CARE_OWNER
        );
        setUserRole(isOwner ? USER_ROLES.CARE_OWNER : USER_ROLES.CARE_PARTNER);

        // Load team member details for each child
        if (hasOwnerOrPartner) {
          try {
            const enrichedChildrenData = [];
            for (const child of childrenWithAccess) {
              const enrichedChild = await populateChildTeamMembers(child);
              enrichedChildrenData.push(enrichedChild);
            }
            setEnrichedChildren(enrichedChildrenData);
          } catch (error) {
            console.error('Error loading team data:', error);
          }
        }
      }
    };

    loadTeamData();
  }, [childrenWithAccess, getUserRoleForChild, loading]);

  if (loading) {
    return (
      <ResponsiveLayout pageTitle="Care Team">
        <LoadingSpinner message="Loading..." />
      </ResponsiveLayout>
    );
  }

  if (!hasAccess) {
    return (
      <ResponsiveLayout pageTitle="Care Team">
        <Alert severity="warning">
          You don't have permission to access the care team management page.
        </Alert>
      </ResponsiveLayout>
    );
  }

  // Simple team member card component
  const TeamMemberCard = ({ member }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {member.name?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {member.name || 'Unknown User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.email}
            </Typography>
          </Box>
          <Chip 
            label={member.role}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );

  // Simple child team section component
  const ChildTeamSection = ({ child }) => {
    const allMembers = [
      ...(child.users?.care_partners || []),
      ...(child.users?.caregivers || []),
      ...(child.users?.therapists || [])
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          {child.name}'s Care Team
        </Typography>
        {allMembers.length === 0 ? (
          <Alert severity="info">
            No team members found for {child.name}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {allMembers.map((member, index) => (
              <Grid item xs={12} md={6} key={`${member.uid}-${index}`}>
                <TeamMemberCard member={member} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <ResponsiveLayout pageTitle="Care Team">
      <Typography variant="h4" gutterBottom>
        Care Team
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">
          Your role: {userRole === USER_ROLES.CARE_OWNER ? "Care Owner" : "Care Partner"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Managing {enrichedChildren.length} children
        </Typography>
      </Box>

      {enrichedChildren.length === 0 ? (
        <Alert severity="info">
          Loading team members... (Found {childrenWithAccess.length} children)
        </Alert>
      ) : (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Found {enrichedChildren.length} children with team data
          </Alert>
          {enrichedChildren.map((child) => (
            <ChildTeamSection key={child.id} child={child} />
          ))}
        </Box>
      )}
    </ResponsiveLayout>
  );
};

export default CareTeamPage;
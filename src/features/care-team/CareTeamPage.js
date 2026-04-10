import React, { useState, useEffect } from 'react';
import {
  Typography, 
  Box, 
  Alert,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useRole } from '../../contexts/RoleContext';
import { USER_ROLES } from '../../constants/roles';
import ResponsiveLayout from '../../components/Layout/ResponsiveLayout';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { populateChildTeamMembers } from '../../services/rolePermissionService';
import { listChildInvitations, resendInvitation, editInvitation, cancelInvitation } from '../../services/invitationService';

const CareTeamPage = () => {
  const navigate = useNavigate();
  const { childrenWithAccess, getUserRoleForChild, loading } = useRole();
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [enrichedChildren, setEnrichedChildren] = useState([]);
  const [childInvitations, setChildInvitations] = useState({});
  const [inviteLoading, setInviteLoading] = useState(false);
  const [resendingInviteId, setResendingInviteId] = useState(null);
  const [editingInvite, setEditingInvite] = useState(null);
  const [editingInviteEmail, setEditingInviteEmail] = useState('');
  const [editingInviteMessage, setEditingInviteMessage] = useState('');
  const [editingInviteRole, setEditingInviteRole] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [cancelingInviteId, setCancelingInviteId] = useState(null);

  const getInviteStatusTone = (invite) => {
    const status = String(invite?.status || '').toLowerCase();
    if (['failed', 'bounced', 'complained'].includes(status)) return 'error';
    if (['pending'].includes(status)) return 'warning';
    if (['sent', 'resent'].includes(status)) return 'info';
    if (['accepted'].includes(status)) return 'success';
    return 'default';
  };

  const getInviteStatusLabel = (invite) => {
    const status = String(invite?.status || 'pending').toLowerCase();
    if (status === 'resent') return 'resent';
    if (status === 'bounced') return 'bounced';
    if (status === 'complained') return 'complained';
    if (status === 'accepted') return 'accepted';
    if (status === 'failed') return 'failed';
    if (status === 'sent') return 'sent';
    return 'pending';
  };

  // Simple access check and data loading
  useEffect(() => {
    const loadTeamData = async () => {
      if (!loading && childrenWithAccess.length > 0) {
        // Check if user has any Care Owner or Care Partner roles
        const hasOwnerOrPartner = childrenWithAccess.some(child => {
          const role = getUserRoleForChild?.(child.id) || null;
          return role === USER_ROLES.CARE_OWNER || role === USER_ROLES.CARE_PARTNER;
        });
        
        setHasAccess(hasOwnerOrPartner);
        
        // Set highest role
        const isOwner = childrenWithAccess.some(child => 
          getUserRoleForChild?.(child.id) === USER_ROLES.CARE_OWNER
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

            if (isOwner) {
              setInviteLoading(true);
              const invitePairs = await Promise.all(
                enrichedChildrenData.map(async (child) => {
                  try {
                    const invites = await listChildInvitations(child.id);
                    return [child.id, invites];
                  } catch (error) {
                    console.warn(`Error loading invitations for ${child.id}:`, error);
                    return [child.id, []];
                  }
                })
              );

              setChildInvitations(Object.fromEntries(invitePairs));
              setInviteLoading(false);
            }
          } catch (error) {
            console.error('Error loading team data:', error);
            setInviteLoading(false);
          }
        }
      }
    };

    loadTeamData();
  }, [childrenWithAccess, getUserRoleForChild, loading]);

  const reloadInvitationsForChild = async (childId) => {
    try {
      const invites = await listChildInvitations(childId);
      setChildInvitations((prev) => ({
        ...prev,
        [childId]: invites,
      }));
    } catch (error) {
      console.warn('Failed to reload invitations for child', childId, error);
    }
  };

  const handleResendInvite = async (invite) => {
    try {
      setResendingInviteId(invite.id);
      await resendInvitation(invite.id);
      await reloadInvitationsForChild(invite.childId);
    } catch (error) {
      console.error('Error resending invitation:', error);
    } finally {
      setResendingInviteId(null);
    }
  };

  const openEditInvite = (invite) => {
    setEditingInvite(invite);
    setEditingInviteEmail(invite.recipientEmail || '');
    setEditingInviteMessage(invite.personalMessage || '');
    setEditingInviteRole(invite.role || '');
  };

  const closeEditInvite = () => {
    setEditingInvite(null);
    setEditingInviteEmail('');
    setEditingInviteMessage('');
    setEditingInviteRole('');
  };

  const handleSaveInviteEdit = async () => {
    if (!editingInvite) return;

    try {
      setEditSaving(true);
      await editInvitation(
        editingInvite.id,
        editingInviteEmail,
        editingInviteRole,
        editingInviteMessage
      );
      await reloadInvitationsForChild(editingInvite.childId);
      closeEditInvite();
    } catch (error) {
      console.error('Error updating invitation:', error);
    } finally {
      setEditSaving(false);
    }
  };

  const handleCancelInvite = async (invite) => {
    try {
      setCancelingInviteId(invite.id);
      await cancelInvitation(invite.id);
      await reloadInvitationsForChild(invite.childId);
    } catch (error) {
      console.error('Error canceling invitation:', error);
    } finally {
      setCancelingInviteId(null);
    }
  };

  const inviteSummary = React.useMemo(() => {
    const summary = {
      total: 0,
      pending: 0,
      sent: 0,
      resent: 0,
      failed: 0,
      bounced: 0,
      complained: 0,
      accepted: 0,
    };

    Object.values(childInvitations).flat().forEach((invite) => {
      summary.total += 1;
      const status = String(invite?.status || 'pending').toLowerCase();
      if (summary[status] !== undefined) {
        summary[status] += 1;
      }
    });

    return summary;
  }, [childInvitations]);

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
    const invites = childInvitations[child.id] || [];
    const activeInvites = invites.filter((invite) => invite.status !== 'accepted');
    const acceptedInvites = invites.filter((invite) => invite.status === 'accepted');
    const canOpenChat = allMembers.length > 0;

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            {child.name}'s Care Team
          </Typography>
          {canOpenChat ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ForumOutlinedIcon />}
              onClick={() => navigate(`/messages?childId=${child.id}&openChildChat=1&returnToDashboard=1`, {
                state: {
                  selectedChildId: child.id,
                  openChildChat: true,
                  returnToDashboard: true,
                },
              })}
              sx={{
                textTransform: 'none',
                borderRadius: 9999,
                fontWeight: 700,
              }}
            >
              Open chat
            </Button>
          ) : null}
        </Box>
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

        {userRole === USER_ROLES.CARE_OWNER ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
              Invite status
            </Typography>
            {inviteLoading ? (
              <LoadingSpinner message="Loading invite status..." />
            ) : activeInvites.length === 0 ? (
              <Alert severity="info">No open invites for {child.name}.</Alert>
            ) : (
              <Grid container spacing={2}>
                {activeInvites.map((invite) => (
                  <Grid item xs={12} md={6} key={invite.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        borderColor: getInviteStatusTone(invite) === 'error' ? 'error.main' : undefined,
                        bgcolor: getInviteStatusTone(invite) === 'error' ? 'rgba(211, 47, 47, 0.04)' : 'background.paper',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {invite.recipientEmail}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {invite.role}{invite.multiChild ? ' • Multi-child' : ''}
                            </Typography>
                            <Box sx={{ mt: 0.75 }}>
                              <Chip
                                size="small"
                                label={getInviteStatusLabel(invite)}
                                color={getInviteStatusTone(invite)}
                                variant={getInviteStatusTone(invite) === 'default' ? 'outlined' : 'filled'}
                              />
                            </Box>
                            {invite.emailError ? (
                              <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                                {invite.emailError}
                              </Typography>
                            ) : null}
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleResendInvite(invite)}
                            disabled={resendingInviteId === invite.id}
                          >
                            {resendingInviteId === invite.id ? 'Resending...' : 'Resend'}
                          </Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                          <Button size="small" onClick={() => openEditInvite(invite)}>
                            Edit email
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleCancelInvite(invite)}
                            disabled={cancelingInviteId === invite.id}
                          >
                            {cancelingInviteId === invite.id ? 'Canceling...' : 'Cancel invite'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {acceptedInvites.length > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Accepted invites
                </Typography>
                <Grid container spacing={2}>
                  {acceptedInvites.map((invite) => (
                    <Grid item xs={12} md={6} key={invite.id}>
                      <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'success.50' }}>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {invite.recipientEmail}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {invite.role}{invite.multiChild ? ' • Multi-child' : ''}
                          </Typography>
                          <Box sx={{ mt: 0.75 }}>
                            <Chip size="small" label="accepted" color="success" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
    );
  };

  return (
    <ResponsiveLayout pageTitle="Care Team" showSidebar={false}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Care Team
        </Typography>

        <Typography variant="body1">
          Your role: {userRole === USER_ROLES.CARE_OWNER ? "Care Owner" : "Care Partner"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Managing {enrichedChildren.length} children
        </Typography>
      </Box>

      {userRole === USER_ROLES.CARE_OWNER ? (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Invite overview
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Total ${inviteSummary.total}`} variant="outlined" />
              <Chip label={`Pending ${inviteSummary.pending}`} color="warning" variant="outlined" />
              <Chip label={`Sent ${inviteSummary.sent + inviteSummary.resent}`} color="info" variant="outlined" />
              <Chip label={`Failed ${inviteSummary.failed + inviteSummary.bounced + inviteSummary.complained}`} color="error" variant="outlined" />
              <Chip label={`Accepted ${inviteSummary.accepted}`} color="success" variant="outlined" />
            </Box>
          </CardContent>
        </Card>
      ) : null}

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

      <Dialog open={Boolean(editingInvite)} onClose={closeEditInvite} fullWidth maxWidth="sm">
        <DialogTitle>Edit invitation</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Recipient Email"
            type="email"
            value={editingInviteEmail}
            onChange={(e) => setEditingInviteEmail(e.target.value)}
            sx={{ mt: 1.5 }}
          />
          <TextField
            fullWidth
            label="Role"
            value={editingInviteRole}
            onChange={(e) => setEditingInviteRole(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Use care_partner, caregiver, or therapist"
          />
          <TextField
            fullWidth
            label="Personal Message"
            multiline
            minRows={3}
            value={editingInviteMessage}
            onChange={(e) => setEditingInviteMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditInvite} disabled={editSaving}>Close</Button>
          <Button onClick={handleSaveInviteEdit} variant="contained" disabled={editSaving}>
            {editSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveLayout>
  );
};

export default CareTeamPage;

// New Conversation Modal Component
// Modal for creating new conversations with team members

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Checkbox,
  CircularProgress,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import {
  Close,
  Group,
  Person,
  Add,
  Search
} from '@mui/icons-material';

// Services and hooks
import { createConversation } from '../../services/messaging';
import { useChildContext } from '../../contexts/ChildContext';
import { getChildren } from '../../services/childService';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

/**
 * User selection item component
 */
const UserSelectionItem = ({
  user,
  selected,
  onToggle,
  disabled = false
}) => {
  const { t } = useTranslation('terms');
  return (
    <ListItemButton
      onClick={() => !disabled && onToggle(user.id)}
      disabled={disabled}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 36,
            height: 36
          }}
        >
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={user.name || user.email || user.id}
        secondary={
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user.role || t('team_member_one')}
            </Typography>
            {user.email && user.email !== user.name && (
              <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled' }}>
                {user.email}
              </Typography>
            )}
          </Box>
        }
      />
      <Checkbox
        checked={selected}
        disabled={disabled}
        sx={{ ml: 1 }}
      />
    </ListItemButton>
  );
};

/**
 * Selected participants chips
 */
const SelectedParticipants = ({ participants, onRemove, currentUserId }) => {
  const { t } = useTranslation('terms');
  const selectedUsers = participants.filter(p => p.id !== currentUserId);

  if (selectedUsers.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        {t('no_participants_selected')}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {selectedUsers.map((user) => (
        <Chip
          key={user.id}
          label={user.name || user.email || user.id}
          onDelete={() => onRemove(user.id)}
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
          }
          variant="outlined"
          size="small"
        />
      ))}
    </Box>
  );
};

/**
 * Main NewConversationModal component
 */
const NewConversationModal = ({
  open,
  onClose,
  onConversationCreated,
  currentUserId,
  selectedChildId = null
}) => {
  const { t } = useTranslation('terms');
  const { currentChildId } = useChildContext();
  
  // State management
  const [conversationType, setConversationType] = useState('group');
  const [conversationTitle, setConversationTitle] = useState('');
  const [selectedChild, setSelectedChild] = useState(selectedChildId || currentChildId || '');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  /**
   * Fetch children for current user
   */
  const fetchChildren = async () => {
    setLoadingChildren(true);
    try {
      const childrenData = await getChildren();
      setChildren(childrenData);
      
      // If no child is selected but we have children, select the first one or current one
      if (!selectedChild && childrenData.length > 0) {
        const childToSelect = currentChildId || childrenData[0].id;
        setSelectedChild(childToSelect);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setError(t('loading_care_team_members'));
    } finally {
      setLoadingChildren(false);
    }
  };

  /**
   * Fetch user details from users collection
   */
  const fetchUserDetails = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: userId,
          name: userData.displayName || userData.name || userData.email,
          email: userData.email,
        };
      }
      
      // Fallback if user document doesn't exist
      return {
        id: userId,
        name: `User (${userId.substring(0, 8)}...)`,
        email: null,
      };
    } catch (error) {
      console.error('Error fetching user details:', userId, error);
      return {
        id: userId,
        name: `User (${userId.substring(0, 8)}...)`,
        email: null,
      };
    }
  };

  /**
   * Fetch real care team members from Firestore
   * RESTRICTION: Only care team members (care partners, caregivers, therapists) 
   * can participate in conversations. This enforces child privacy and security.
   */
  const fetchCareTeamMembers = async (childId) => {
    if (!childId) {
      setAvailableUsers([]);
      return;
    }

    setLoadingUsers(true);
    try {
      // Get child document from Firestore
      const childRef = doc(db, 'children', childId);
      const childDoc = await getDoc(childRef);
      
      if (!childDoc.exists()) {
        console.error('Child document not found:', childId);
        setAvailableUsers([]);
        return;
      }

      const childData = childDoc.data();
      const currentUser = getAuth().currentUser;
      const userIds = new Set(); // Collect all unique user IDs

      // Note: Current user will be automatically added as a participant
      // when creating the conversation, so we don't add them to the selectable list

      // Collect all team member IDs (excluding current user)
      const collectUserIds = (userList, roleName) => {
        if (!userList) return;
        
        userList.forEach(user => {
          let userId;
          if (typeof user === 'string') {
            userId = user;
          } else {
            userId = user.uid || user.userId || user.email;
          }
          
          if (userId && userId !== currentUser?.uid && userId !== currentUser?.email) {
            userIds.add(userId);
            console.log(`Added ${roleName}: ${userId}`);
          } else {
            console.log(`Skipped ${roleName}: ${userId} (current user or invalid)`);
          }
        });
      };

      // Collect IDs from all roles
      collectUserIds(childData.users?.care_partners, 'Care Partner');
      collectUserIds(childData.users?.caregivers, 'Caregiver'); 
      collectUserIds(childData.users?.therapists, 'Therapist');

      // Fetch user details for all collected IDs
      const teamMembers = [];
      const userDetailsPromises = Array.from(userIds).map(async (userId) => {
        const userDetails = await fetchUserDetails(userId);
        
        // Determine role based on which array the user is in
        let role = 'Team Member';
        if (childData.users?.care_partners?.includes(userId)) {
          role = 'Care Partner';
        } else if (childData.users?.caregivers?.includes(userId)) {
          role = 'Caregiver';
        } else if (childData.users?.therapists?.includes(userId)) {
          role = 'Therapist';
        }
        
        return {
          ...userDetails,
          role,
          isCurrentUser: false
        };
      });

      // Wait for all user details to be fetched
      const resolvedTeamMembers = await Promise.all(userDetailsPromises);
      teamMembers.push(...resolvedTeamMembers);

      console.log(`🏥 Found ${teamMembers.length} care team members for ${childData.name}`);
      console.log('🔒 RESTRICTED: Only care team members can participate in conversations');
      console.log('Care team members:', teamMembers);
      
      // Debug: Log raw data to see what's in the child document
      console.log('Raw child data users:', childData.users);
      console.log('Current user UID:', currentUser?.uid);
      
      setAvailableUsers(teamMembers);
      
    } catch (error) {
      console.error('Error fetching care team members:', error);
      setError(`${t('loading_care_team_members')} ${error.message}`);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch children when modal opens
  useEffect(() => {
    if (open) {
      fetchChildren();
    }
  }, [open]);

  // Fetch team members when selected child changes
  useEffect(() => {
    if (selectedChild) {
      fetchCareTeamMembers(selectedChild);
    } else {
      setAvailableUsers([]);
    }
  }, [selectedChild]);

  /**
   * Filter available users based on search
   */
  const filteredUsers = availableUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Handle participant toggle
   */
  const handleParticipantToggle = (userId) => {
    const user = availableUsers.find(u => u.id === userId);
    if (!user) return;

    setSelectedParticipants(prev => {
      const isSelected = prev.some(p => p.id === userId);
      if (isSelected) {
        return prev.filter(p => p.id !== userId);
      } else {
        return [...prev, user];
      }
    });
  };

  /**
   * Remove participant
   */
  const handleRemoveParticipant = (userId) => {
    setSelectedParticipants(prev => prev.filter(p => p.id !== userId));
  };

  /**
   * Handle conversation type change
   */
  const handleTypeChange = (event) => {
    const type = event.target.value;
    setConversationType(type);
    
    // Clear participants when switching to direct (will be limited to 1)
    if (type === 'direct') {
      setSelectedParticipants(prev => prev.slice(0, 1));
    }
  };

  /**
   * Generate conversation title
   */
  const generateTitle = () => {
    const child = children?.find(c => c.id === selectedChild);
    const childName = child?.name || t('profile_one');
    
    if (conversationType === 'direct' && selectedParticipants.length === 1) {
      return `${childName} - Direct Message`;
    }
    
    if (selectedParticipants.length > 0) {
      return `${childName} Care Team`;
    }
    
    return `${childName} Conversation`;
  };

  /**
   * Handle form submission
   */
  const handleCreateConversation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!selectedChild) {
        setError(t('please_select_profile'));
        return;
      }

      if (selectedParticipants.length === 0) {
        setError(t('please_select_participant'));
        return;
      }

      if (conversationType === 'direct' && selectedParticipants.length > 1) {
        setError(t('max_one_direct'));
        return;
      }

      const title = conversationTitle.trim() || generateTitle();
      // Ensure current user is included and remove duplicates
      const participantIds = Array.from(new Set([currentUserId, ...selectedParticipants.map(p => p.id)]))
        .filter(id => id && typeof id === 'string'); // Ensure all IDs are valid strings

      // Additional validation after filtering
      if (participantIds.length < 2) {
        setError('Unable to create conversation - invalid participant data. Please try selecting participants again.');
        return;
      }

      console.log('🆕 Creating conversation:', {
        participants: participantIds,
        childId: selectedChild,
        type: conversationType,
        title,
        createdBy: currentUserId
      });

      const result = await createConversation({
        participants: participantIds,
        childId: selectedChild,
        type: conversationType,
        title,
        createdBy: currentUserId
      });

      if (result.success) {
        
        // Create conversation object for immediate UI update
        const newConversation = {
          id: result.conversationId,
          title,
          type: conversationType,
          participants: participantIds,
          childId: selectedChild,
          createdBy: currentUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          lastMessage: null,
          unreadCounts: Object.fromEntries(participantIds.map(id => [id, 0]))
        };

        // Notify parent and close modal
        onConversationCreated?.(newConversation);
        handleClose();
      } else {
        console.error('Failed to create conversation:', result.error);
        setError(result.error || t('creating'));
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError(error.message || t('creating'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (loading) return; // Prevent closing during creation
    
    // Reset form
    setConversationType('group');
    setConversationTitle('');
    setSelectedChild(selectedChildId || '');
    setSelectedParticipants([]);
    setSearchTerm('');
    setError(null);
    
    onClose?.();
  };

  // Update selected child when prop changes
  useEffect(() => {
    if (selectedChildId && !selectedChild) {
      setSelectedChild(selectedChildId);
    }
  }, [selectedChildId, selectedChild]);

  // Auto-generate title when participants change
  useEffect(() => {
    if (!conversationTitle.trim()) {
      // Auto-update title preview
    }
  }, [selectedParticipants, selectedChild, conversationType, conversationTitle]);

  const isFormValid = selectedChild && selectedParticipants.length > 0 && 
    (conversationType === 'group' || selectedParticipants.length === 1);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('create_conversation')}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Conversation Type */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('conversation_type') || 'Conversation Type'}</InputLabel>
          <Select
            value={conversationType}
            onChange={handleTypeChange}
            label={t('conversation_type') || 'Conversation Type'}
            disabled={loading}
          >
            <MenuItem value="direct">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                <Box>
                  <Typography>{t('direct_message') || 'Direct Message'}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('direct_message_subtitle') || 'Private conversation with one person'}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <MenuItem value="group">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group />
                <Box>
                  <Typography>{t('group_conversation') || 'Group Conversation'}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {t('group_conversation_subtitle') || 'Team conversation with multiple people'}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Child Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('profile_select_label')}</InputLabel>
          <Select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            label={t('profile_select_label')}
            disabled={loading}
          >
            {children?.map((child) => (
              <MenuItem key={child.id} value={child.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
                    {child.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  {child.name}
                </Box>
              </MenuItem>
            )) || []}
          </Select>
        </FormControl>

        {/* Selected Child Context Display */}
        {selectedChild && children && (
          <Alert 
            severity="info" 
            sx={{ mb: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}
            icon={false}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem', bgcolor: 'primary.main' }}>
                {children.find(c => c.id === selectedChild)?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {t('creating_conversation_for', { name: children.find(c => c.id === selectedChild)?.name })}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Conversation Title */}
        <TextField
          fullWidth
          label={t('conversation_title_optional')}
          value={conversationTitle}
          onChange={(e) => setConversationTitle(e.target.value)}
          placeholder={generateTitle()}
          disabled={loading}
          sx={{ mb: 2 }}
          helperText={t('leave_empty_to_auto_generate')}
        />

        {/* Selected Participants */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {t('selected_participants', { count: selectedParticipants.length })}
            {conversationType === 'direct' && (
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                {t('max_one_direct')}
              </Typography>
            )}
          </Typography>
          <SelectedParticipants
            participants={selectedParticipants}
            onRemove={handleRemoveParticipant}
            currentUserId={currentUserId}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Care Team Notice */}
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          icon={<Group />}
        >
          <Typography variant="body2">
            {t('restriction_profile_notice')}
          </Typography>
        </Alert>

        {/* User Search */}
        <TextField
          fullWidth
          size="small"
          placeholder={t('care_team_members') + '...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          slotProps={{
            input: {
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
            }
          }}
          sx={{ mb: 2 }}
        />

        {/* Available Users */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {t('care_team_members')}
          </Typography>
          <List sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            {loadingUsers ? (
              <ListItem>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 2 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('loading_care_team_members')}
                  </Typography>
                </Box>
              </ListItem>
            ) : !selectedChild ? (
              <ListItem>
                <ListItemText
                  primary={t('select_profile_first_title')}
                  secondary={t('select_profile_first_subtitle')}
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ) : availableUsers.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={t('no_care_team_members_found')}
                  secondary={t('restriction_profile_notice')}
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ) : filteredUsers.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={t('no_members_match_search')}
                  secondary={t('try_different_search')}
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedParticipants.some(p => p.id === user.id);
                const isDisabled = conversationType === 'direct' && selectedParticipants.length >= 1 && !isSelected;
                
                return (
                  <UserSelectionItem
                    key={user.id}
                    user={user}
                    selected={isSelected}
                    onToggle={handleParticipantToggle}
                    disabled={isDisabled || loading}
                  />
                );
              })
            )}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateConversation}
          variant="contained"
          disabled={!isFormValid || loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Add />}
        >
          {loading ? t('creating') : t('create_conversation')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewConversationModal;

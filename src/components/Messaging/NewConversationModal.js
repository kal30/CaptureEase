// New Conversation Modal Component
// Modal for creating new conversations with team members

import React, { useState, useEffect } from 'react';
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

/**
 * User selection item component
 */
const UserSelectionItem = ({
  user,
  selected,
  onToggle,
  disabled = false
}) => {
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
              {user.role || 'Team Member'}
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
  const selectedUsers = participants.filter(p => p.id !== currentUserId);

  if (selectedUsers.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        No participants selected
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
  const { children } = useChildContext();
  
  // State management
  const [conversationType, setConversationType] = useState('group');
  const [conversationTitle, setConversationTitle] = useState('');
  const [selectedChild, setSelectedChild] = useState(selectedChildId || '');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock team members - TODO: Replace with real data from child access/team members
  const [availableUsers] = useState([
    {
      id: 'user_parent_1',
      name: 'Sarah Parent',
      email: 'sarah@example.com',
      role: 'Parent'
    },
    {
      id: 'user_caregiver_1',
      name: 'Maria Caregiver',
      email: 'maria@example.com',
      role: 'Caregiver'
    },
    {
      id: 'user_therapist_1',
      name: 'Dr. Johnson',
      email: 'johnson@therapy.com',
      role: 'Therapist'
    },
    {
      id: 'user_teacher_1',
      name: 'Ms. Anderson',
      email: 'anderson@school.edu',
      role: 'Teacher'
    }
  ]);

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
    const childName = child?.name || 'Child';
    
    if (conversationType === 'direct' && selectedParticipants.length === 1) {
      return `${childName} - Direct Message`;
    }
    
    if (selectedParticipants.length > 0) {
      const participantNames = selectedParticipants.map(p => p.name || p.email).join(', ');
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
        setError('Please select a child for this conversation');
        return;
      }

      if (selectedParticipants.length === 0) {
        setError('Please select at least one participant');
        return;
      }

      if (conversationType === 'direct' && selectedParticipants.length > 1) {
        setError('Direct conversations can only have one other participant');
        return;
      }

      const title = conversationTitle.trim() || generateTitle();
      const participantIds = [currentUserId, ...selectedParticipants.map(p => p.id)];

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
        console.log('✅ Conversation created:', result.conversationId);
        
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
        setError(result.error || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError(error.message || 'Failed to create conversation');
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
  }, [selectedParticipants, selectedChild, conversationType]);

  const isFormValid = selectedChild && selectedParticipants.length > 0 && 
    (conversationType === 'group' || selectedParticipants.length === 1);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh'
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
            New Conversation
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
          <InputLabel>Conversation Type</InputLabel>
          <Select
            value={conversationType}
            onChange={handleTypeChange}
            label="Conversation Type"
            disabled={loading}
          >
            <MenuItem value="direct">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                <Box>
                  <Typography>Direct Message</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Private conversation with one person
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <MenuItem value="group">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group />
                <Box>
                  <Typography>Group Conversation</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Team conversation with multiple people
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Child Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Child</InputLabel>
          <Select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            label="Child"
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

        {/* Conversation Title */}
        <TextField
          fullWidth
          label="Conversation Title (Optional)"
          value={conversationTitle}
          onChange={(e) => setConversationTitle(e.target.value)}
          placeholder={generateTitle()}
          disabled={loading}
          sx={{ mb: 2 }}
          helperText="Leave empty to auto-generate"
        />

        {/* Selected Participants */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Selected Participants ({selectedParticipants.length})
            {conversationType === 'direct' && (
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                (Max 1 for direct messages)
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

        {/* User Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          sx={{ mb: 2 }}
        />

        {/* Available Users */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Available Team Members
          </Typography>
          <List sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            {filteredUsers.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No team members found"
                  secondary="Try a different search term"
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
          {loading ? 'Creating...' : 'Create Conversation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewConversationModal;
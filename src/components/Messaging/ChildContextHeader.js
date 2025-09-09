/**
 * ChildContextHeader - Shows child context and messaging mode selector
 * Displays child info prominently and allows switching between care team and all contacts
 */

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import { Group, ContactPage, ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { getMessagingTheme } from '../../assets/theme/messagingTheme';
import { useTranslation } from 'react-i18next';

/**
 * Child context header with messaging mode selector
 * 
 * @param {Object} props
 * @param {Object} props.contextChild - Child object for context
 * @param {string} props.messagingMode - Current messaging mode ('child_specific' | 'all_contacts')
 * @param {function} props.onModeChange - Handler for mode changes
 * @param {number} props.careTeamCount - Number of care team members
 * @param {number} props.allContactsCount - Total number of contacts
 * @param {boolean} props.isMobile - Mobile layout flag
 * @param {function} props.onBack - Optional back navigation handler
 */
const ChildContextHeader = ({
  contextChild,
  messagingMode,
  onModeChange,
  careTeamCount = 0,
  allContactsCount = 0,
  isMobile = false,
  onBack
}) => {
  const theme = useTheme();
  const messagingTheme = getMessagingTheme(theme);
  const { t } = useTranslation('terms');

  if (!contextChild && messagingMode === 'all_contacts') {
    // Show general messaging header when no child context
    return (
      <Box sx={{ mb: 2 }}>
        {isMobile && onBack && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              sx={{ color: 'text.secondary' }}
            >
              Back
            </Button>
          </Box>
        )}
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            fontFamily: '"Lancelot", serif',
          }}
        >
          💬 {t('messages')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('all_team_members_across_profiles')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Mobile back button */}
      {isMobile && onBack && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ color: 'text.secondary' }}
          >
            Back
          </Button>
        </Box>
      )}

      {/* Child context display */}
      {contextChild && (
        <Box
          sx={{
            ...messagingTheme.childContext.header,
            mb: 2,
            p: 2
          }}
        >
          <Avatar
            src={contextChild.photoURL}
            sx={messagingTheme.childContext.avatar}
          >
            {contextChild.name?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={messagingTheme.childContext.text}>
              {t('messages_about_profile', { name: contextChild.name })}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Secure team communication
            </Typography>
          </Box>
        </Box>
      )}

      {/* Messaging mode selector */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          {t('show_contacts')}
        </Typography>

        {/* Child's care team button */}
        {contextChild && (
          <Button
            variant={messagingMode === 'child_specific' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<Group />}
            onClick={() => onModeChange('child_specific')}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '0.875rem'
            }}
          >
            {contextChild.name}'s {t('care_team')} ({careTeamCount})
          </Button>
        )}

        {/* All contacts button */}
        <Button
          variant={messagingMode === 'all_contacts' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<ContactPage />}
          onClick={() => onModeChange('all_contacts')}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '0.875rem'
          }}
        >
          {t('all_contacts')} ({allContactsCount})
        </Button>
      </Box>

      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

export default ChildContextHeader;

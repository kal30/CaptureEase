import React, { useState } from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { useRole } from '../../../contexts/RoleContext';
import { getMessagesDisplayInfo } from '../../../constants/uiDisplayConstants';
import QuickNoteLog from '../QuickNoteLog';
import QuickNoteIcon from '../QuickNoteLog/QuickNoteIcon';
import SmsToggle from './SmsToggle';
import { Search } from '@mui/icons-material';
import useIsMobile from '../../../hooks/useIsMobile';

/**
 * ChildCardActions - Action buttons for quick log/search/messaging
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object
 * @param {string} props.userRole - User's role for this child
 * @param {function} props.onMessages - Handler for Messages button click
 * @param {function} props.onAskQuestion - Handler for Ask Question button click
 * @param {Object} props.sx - Additional styling
 */
const ChildCardActions = ({
  child,
  userRole,
  onMessages,
  onAskQuestion,
  sx = {}
}) => {
  const { USER_ROLES } = useRole();
  const messagesDisplay = getMessagesDisplayInfo();
  const [showQuickNote, setShowQuickNote] = useState(false);
  const isMobile = useIsMobile();
  const actionSize = isMobile ? 34 : 40;
  const actionFontSize = isMobile ? '0.95rem' : '1.1rem';

  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 1 : 2,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        ...sx 
      }}
    >
      {/* Role-Specific Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 0.75 : 1.5,
          alignSelf: 'stretch',
          pt: { xs: 0, md: 0.5 },
          width: { xs: '100%', md: 'auto' },
          justifyContent: { xs: 'center', md: 'flex-end' },
          order: { xs: 2, md: 0 }
        }}
      >
        {/* SMS Toggle - Available for all roles */}
        <SmsToggle child={child} />

        {/* Quick Note Icon Button - Available for all roles */}
        <QuickNoteIcon onClick={() => setShowQuickNote(true)} size={actionSize} fontSize={actionFontSize} />

        {/* Ask Question Button */}
        <Tooltip title="Ask a question about logs" arrow>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (onAskQuestion) {
                onAskQuestion(child);
              }
            }}
            sx={{
              width: actionSize,
              height: actionSize,
              backgroundColor: '#0EA5E9',
              color: 'white',
              fontSize: actionFontSize,
              border: '2px solid #E0F2FE',
              '&:hover': {
                backgroundColor: '#0284C7',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Search fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Messages Icon Button - Available for all roles */}
        <Tooltip title={`${messagesDisplay.label}: ${messagesDisplay.description}`} arrow>
          <IconButton
            onClick={(e) => {
              e.stopPropagation(); // Prevent card expansion
              if (onMessages) {
                onMessages(child);
              }
            }}
            sx={{
              width: actionSize,
              height: actionSize,
              backgroundColor: '#6366F1', // Indigo for messages
              color: 'white',
              fontSize: actionFontSize,
              border: '2px solid #E0E7FF',
              '&:hover': {
                backgroundColor: '#4F46E5',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {messagesDisplay.emoji}
          </IconButton>
        </Tooltip>

        {userRole === USER_ROLES.THERAPIST && (
          // Professional tools for therapists
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card expansion
              // TODO: Navigate to analytics/insights page
              console.log('View Analytics for child:', child.id);
            }}
            sx={{
              py: 0.5,
              px: 1.5,
              fontSize: '0.875rem',
              minWidth: 'auto',
              borderRadius: 1,
              background:
                'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
              color: 'white',
              '&:hover': {
                background:
                  'linear-gradient(135deg, #64748B 0%, #475569 100%)',
              },
            }}
          >
            📊 Analytics
          </Button>
        )}
      </Box>

      {/* Quick Note Dialog */}
      <QuickNoteLog
        childId={child.id}
        childName={child.name}
        open={showQuickNote}
        onClose={() => setShowQuickNote(false)}
      />
    </Box>
  );
};

export default ChildCardActions;

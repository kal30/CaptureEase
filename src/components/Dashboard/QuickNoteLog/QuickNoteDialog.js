import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { Close, NoteAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../../../contexts/ChildContext';
import QuickNoteForm from './QuickNoteForm';
import QuickNoteActions from './QuickNoteActions';
import useQuickNoteLog from './useQuickNoteLog';
import useIsMobile from '../../../hooks/useIsMobile';

const QuickNoteDialog = ({ childId, childName, open, onClose, onLogged }) => {
  const navigate = useNavigate();
  const { setCurrentChildId } = useChildContext();
  const isMobile = useIsMobile();

  const {
    note,
    setNote,
    isImportant,
    setIsImportant,
    tags,
    setTags,
    loading,
    message,
    setMessage,
    handleSubmit,
    handleClose,
    handleKeyPress,
    stopPropagation
  } = useQuickNoteLog({ childId, onClose, onLogged });

  const handleDetailedLog = () => {
    setCurrentChildId(childId);
    navigate('/log');
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100%' : '300px'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          px: isMobile ? 2 : 3,
          pt: isMobile ? 2 : 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAdd color="primary" />
          Quick Note for {childName}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, px: isMobile ? 2 : 3, pb: isMobile ? 10 : 3 }}>
        {message.text && (
          <Alert
            severity={message.type}
            sx={{ mb: 2 }}
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
        )}

        {/* Smart Classification Hint Banner */}
        {!message.text && (
           <Box
             sx={{
               mb: 2,
               p: 1.5,
               bgcolor: '#EEF2FF',
               borderRadius: 2,
               border: '1px solid #C7D2FE',
               display: 'flex',
               gap: 1.5,
               alignItems: 'center'
             }}
           >
             <Box sx={{ fontSize: '1.2rem' }}>✨</Box>
             <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4338CA', lineHeight: 1.2 }}>
                  Smart Auto-Classification
                </Typography>
                <Typography variant="caption" sx={{ color: '#4338CA', display: 'block', lineHeight: 1.1, mt: 0.5 }}>
                  Just write naturally! We'll sort it as Behavior, Mood, or Log automatically.
                </Typography>
             </Box>
           </Box>
        )}

        <QuickNoteForm
          note={note}
          onNoteChange={setNote}
          tags={tags}
          onTagsChange={setTags}
          isImportant={isImportant}
          onImportantChange={setIsImportant}
          loading={loading}
          childId={childId}
          onKeyPress={handleKeyPress}
          stopPropagation={stopPropagation}
        />

        {!isMobile && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Press Ctrl+Enter to submit quickly
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: isMobile ? 2 : 3,
          pb: isMobile ? 2 : 3,
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          position: isMobile ? 'sticky' : 'static',
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: isMobile ? '1px solid' : 'none',
          borderColor: isMobile ? 'divider' : 'transparent'
        }}
      >
        <QuickNoteActions
          onDetailedLog={handleDetailedLog}
          onCancel={handleClose}
          onSubmit={handleSubmit}
          loading={loading}
          canSubmit={!!note.trim()}
          stacked={isMobile}
        />
      </DialogActions>
    </Dialog>
  );
};

export default QuickNoteDialog;

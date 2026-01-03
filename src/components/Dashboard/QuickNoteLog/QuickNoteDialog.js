import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Box
} from '@mui/material';
import { Close, NoteAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../../../contexts/ChildContext';
import QuickNoteForm from './QuickNoteForm';
import QuickNoteActions from './QuickNoteActions';
import useQuickNoteLog from './useQuickNoteLog';

const QuickNoteDialog = ({ childId, childName, open, onClose, onLogged }) => {
  const navigate = useNavigate();
  const { setCurrentChildId } = useChildContext();

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
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '300px'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
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

      <DialogContent sx={{ pt: 2 }}>
        {message.text && (
          <Alert
            severity={message.type}
            sx={{ mb: 2 }}
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
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

        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Press Ctrl+Enter to submit quickly
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <QuickNoteActions
          onDetailedLog={handleDetailedLog}
          onCancel={handleClose}
          onSubmit={handleSubmit}
          loading={loading}
          canSubmit={!!note.trim()}
        />
      </DialogActions>
    </Dialog>
  );
};

export default QuickNoteDialog;

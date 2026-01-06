import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { archiveLog, updateLog } from '../../../services/logsService';
import LogEditDialog from './LogEditDialog';

const LogEntryActions = ({
  entry,
  onUpdated,
  forceOpen = false,
  focusField = 'note',
  onForceOpenHandled
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSave = async ({ note, tags, noteType }) => {
    if (!entry?.id) return;
    setBusy(true);
    try {
      const existingMeta = entry?.meta || entry?.originalData?.meta || {};
      await updateLog(entry.id, {
        note,
        tags,
        meta: { ...existingMeta, noteType }
      });
      onUpdated?.({
        note,
        tags,
        meta: { ...existingMeta, noteType }
      });
      setEditOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    if (!entry?.id) return;
    setBusy(true);
    try {
      await archiveLog(entry.id);
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    if (!forceOpen) return;
    setEditOpen(true);
    onForceOpenHandled?.();
  }, [forceOpen, onForceOpenHandled]);

  return (
    <>
      <Box
        className="timeline-entry-actions"
        sx={{
          display: 'flex',
          gap: 0.1,
          alignItems: 'center',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.15s ease',
          '& .MuiIconButton-root': {
            color: 'text.secondary',
            p: 0.25,
            borderRadius: 1,
            fontSize: '0.95rem',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          },
          '@media (hover: none)': {
            opacity: 1,
            pointerEvents: 'auto'
          }
        }}
      >
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => setEditOpen(true)}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => setConfirmOpen(true)}
            sx={{ '&:hover': { color: 'error.main' } }}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>

      <LogEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        entry={entry}
        onSave={handleSave}
        focusField={focusField}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete log?</DialogTitle>
        <DialogContent>
          This will archive the log so it no longer shows in the timeline.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleArchive} color="error" variant="contained" disabled={busy}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogEntryActions;

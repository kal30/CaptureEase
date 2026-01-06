import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';
import TagInput from '../../Common/TagInput';

const LogEditDialog = ({ open, onClose, entry, onSave, focusField = 'note' }) => {
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    if (!entry) return;
    setNote(entry.text || entry.note || '');
    setTags(entry.tags || []);
    setIsImportant(entry?.meta?.noteType === 'important');
  }, [entry]);

  const handleSave = () => {
    onSave({
      note: note.trim(),
      tags,
      noteType: isImportant ? 'important' : 'routine'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit log</DialogTitle>
      <DialogContent>
        <TextField
          label="Note"
          autoFocus={focusField === 'note'}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          fullWidth
          multiline
          minRows={4}
          sx={{ mt: 1 }}
        />
        <Box sx={{ mt: 2 }}>
          <TagInput
            value={tags}
            onChange={setTags}
            label="Tags"
            placeholder="Add tags"
            autoFocus={focusField === 'tags'}
          />
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={isImportant}
              onChange={(event) => setIsImportant(event.target.checked)}
            />
          }
          label="Mark as important moment"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!note.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogEditDialog;

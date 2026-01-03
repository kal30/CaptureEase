import React from 'react';
import { Box, FormControlLabel, Switch, TextField } from '@mui/material';
import { Star } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import TagInput from '../../Common/TagInput';
import useTagSuggestions from '../../../hooks/useTagSuggestions';

const QuickNoteForm = ({
  note,
  onNoteChange,
  tags,
  onTagsChange,
  childId,
  isImportant,
  onImportantChange,
  loading,
  onKeyPress,
  stopPropagation
}) => {
  const theme = useTheme();
  const suggestions = useTagSuggestions(childId);

  return (
    <>
      <TextField
        autoFocus
        placeholder="What happened? (e.g., 'Had lunch with applesauce', 'Took a 2-hour nap', 'Fell at playground but okay')"
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        onKeyPress={onKeyPress}
        disabled={loading}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#E0E7FF'
            },
            '&:hover fieldset': {
              borderColor: '#C7D2FE'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366F1'
            }
          }
        }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={isImportant}
            onChange={(e) => onImportantChange(e.target.checked)}
            size="small"
            disabled={loading}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: theme.palette.quickNote.importantSwitch
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: theme.palette.quickNote.importantSwitch
              }
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Star sx={{ fontSize: '1rem', color: theme.palette.quickNote.importantIcon }} />
            <Box sx={{ fontWeight: 600 }}>
              {isImportant ? 'Marked as Important Moment' : 'Flag as Important Moment'}
            </Box>
          </Box>
        }
        sx={{
          mt: 1.25,
          px: 1.25,
          py: 0.5,
          borderRadius: 1.5,
          bgcolor: isImportant
            ? theme.palette.quickNote.importantBgActive
            : theme.palette.quickNote.importantBg,
          color: theme.palette.quickNote.importantText,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.85rem'
          }
        }}
      />

      <Box sx={{ mt: 1.5 }}>
        <TagInput
          value={tags}
          onChange={onTagsChange}
          suggestions={suggestions}
          label="Tags"
          placeholder="Add tags"
          disabled={loading}
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
        />
      </Box>
    </>
  );
};

export default QuickNoteForm;

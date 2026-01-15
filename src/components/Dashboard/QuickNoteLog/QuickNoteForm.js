import React, { useState } from 'react';
import { Box, Collapse, FormControlLabel, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import {
  Bedtime,
  BedtimeOff,
  Hotel,
  SentimentNeutral,
  SentimentSatisfiedAlt,
  SentimentVeryDissatisfied,
  SentimentVerySatisfied
} from '@mui/icons-material';
import { Star } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import TagInput from '../../Common/TagInput';
import useTagSuggestions from '../../../hooks/useTagSuggestions';
import useIsMobile from '../../../hooks/useIsMobile';

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
  const isMobile = useIsMobile();
  const suggestions = useTagSuggestions(childId);
  const moodOptions = [
    { value: 'calm', label: 'Calm', color: '#16A34A', icon: <SentimentVerySatisfied fontSize="small" /> },
    { value: 'ok', label: 'Ok', color: '#F59E0B', icon: <SentimentNeutral fontSize="small" /> },
    { value: 'rough', label: 'Rough', color: '#DC2626', icon: <SentimentVeryDissatisfied fontSize="small" /> }
  ];
  const sleepOptions = [
    { value: 'good', label: 'Good', color: '#2563EB', icon: <Bedtime fontSize="small" /> },
    { value: 'ok', label: 'Ok', color: '#0EA5E9', icon: <Hotel fontSize="small" /> },
    { value: 'poor', label: 'Poor', color: '#7C3AED', icon: <BedtimeOff fontSize="small" /> }
  ];
  const [showQuickTags, setShowQuickTags] = useState(false);

  const getCategoryValue = (category) => {
    const prefix = `${category}:`;
    const current = tags.find((tag) => tag.startsWith(prefix));
    return current ? current.slice(prefix.length) : null;
  };

  const setCategoryValue = (category, nextValue) => {
    const prefix = `${category}:`;
    const filtered = tags.filter((tag) => !tag.startsWith(prefix));
    if (!nextValue) {
      onTagsChange(filtered);
      return;
    }
    onTagsChange([...filtered, `${prefix}${nextValue}`]);
  };

  return (
    <>
      <TextField
        autoFocus
        placeholder="What happened? (e.g., 'Had lunch with applesauce', 'Took a 2-hour nap', 'Fell at playground but okay')"
        multiline
        rows={isMobile ? 3 : 4}
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

      <Box
        sx={{
          mt: isMobile ? 1 : 1.25,
          display: 'grid',
          gap: 0.75
        }}
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
      >
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setShowQuickTags((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setShowQuickTags((prev) => !prev);
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            color: showQuickTags ? theme.palette.primary.main : theme.palette.text.secondary,
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            width: isMobile ? '100%' : 'fit-content',
            px: 1,
            py: 0.5,
            borderRadius: 999,
            border: '1px solid',
            borderColor: showQuickTags ? theme.palette.primary.main : theme.palette.divider,
            bgcolor: showQuickTags
              ? theme.palette.action.selected
              : theme.palette.action.hover,
            fontWeight: 600
          }}
        >
          <LocalOfferIcon sx={{ fontSize: '1rem' }} />
          <Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>Quick tags</Typography>
          <ExpandMoreIcon
            sx={{
              fontSize: '1rem',
              transform: showQuickTags ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </Box>
        <Collapse in={showQuickTags} timeout="auto" unmountOnExit>
          <Box sx={{ display: 'grid', gap: 0.75 }}>
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  minWidth: '3rem'
                }}
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  <SentimentSatisfiedAlt sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                  Mood
                </Box>
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={getCategoryValue('mood')}
                onChange={(_, value) => setCategoryValue('mood', value)}
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    borderRadius: 1,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    px: 1
                  },
                  '& .MuiToggleButton-root.Mui-selected': {
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.action.selected
                  }
                }}
              >
                {moodOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    sx={{
                      borderColor: option.color,
                      color: option.color,
                      '&.Mui-selected': {
                        bgcolor: `${option.color}22`,
                        borderColor: option.color,
                        color: option.color
                      }
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  minWidth: '3rem'
                }}
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  <Bedtime sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                  Sleep
                </Box>
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={getCategoryValue('sleep')}
                onChange={(_, value) => setCategoryValue('sleep', value)}
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    borderRadius: 1,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    px: 1
                  },
                  '& .MuiToggleButton-root.Mui-selected': {
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.action.selected
                  }
                }}
              >
                {sleepOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    sx={{
                      borderColor: option.color,
                      color: option.color,
                      '&.Mui-selected': {
                        bgcolor: `${option.color}22`,
                        borderColor: option.color,
                        color: option.color
                      }
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Collapse>
      </Box>

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
          mt: isMobile ? 1 : 1.25,
          px: isMobile ? 1 : 1.25,
          py: isMobile ? 0.35 : 0.5,
          borderRadius: 1.5,
          bgcolor: isImportant
            ? theme.palette.quickNote.importantBgActive
            : theme.palette.quickNote.importantBg,
          color: theme.palette.quickNote.importantText,
          '& .MuiFormControlLabel-label': {
            fontSize: isMobile ? '0.8rem' : '0.85rem'
          }
        }}
      />

      <Box sx={{ mt: isMobile ? 1.25 : 1.5 }}>
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

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Stack,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  InfoOutlined as InfoOutlinedIcon,
  Close as CloseIcon,
  LocalOffer as LocalOfferIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import StyledButton from '../UI/StyledButton';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const QUICK_TAG_CATEGORY_MAP = {
  meltdown: 'behavior',
  medication: 'health',
  sleep: 'sleep',
  win: 'milestone',
  food: 'food',
  anxiety: 'mood',
};

const QUICK_TAG_PLACEHOLDERS = {
  meltdown: 'What triggered it? How long did it last?',
  medication: 'Which medication? Any reaction?',
  sleep: 'What happened? How many hours?',
  food: 'What did they eat or refuse?',
  anxiety: 'What caused it? How did they respond?',
  win: 'What happened? Celebrate it!',
};

const QUICK_TAG_COLORS = {
  meltdown: { main: '#D32F2F', soft: '#FDECEC', selected: '#F8D7D7', text: '#8F1F1F' },
  medication: { main: '#00796B', soft: '#E6F4F1', selected: '#CDEBE5', text: '#00584E' },
  sleep: { main: '#1A237E', soft: '#ECEEFC', selected: '#D7DBF8', text: '#141B63' },
  food: { main: '#E65100', soft: '#FFF1E7', selected: '#FFE0CC', text: '#A53A00' },
  anxiety: { main: '#F57F17', soft: '#FFF7E7', selected: '#FEEABF', text: '#A6540F' },
  win: { main: '#2E7D32', soft: '#EDF7EE', selected: '#D8EED9', text: '#1F5A23' },
};

const CATEGORY_KEYWORDS = {
  health: ['fever', 'doctor', 'sick', 'ill', 'medicine', 'medication', 'dose', 'clinic', 'pain', 'rash', 'cough'],
  food: ['ate', 'eating', 'food', 'meal', 'snack', 'lunch', 'dinner', 'breakfast', 'refused food', 'hungry', 'drank'],
  sleep: ['sleep', 'slept', 'nap', 'napped', 'woke', 'woke up', 'wake', 'bedtime', 'rested', 'restless'],
  mood: ['sad', 'happy', 'angry', 'mood', 'anxious', 'anxiety', 'calm', 'upset', 'frustrated', 'worried'],
  behavior: ['meltdown', 'tantrum', 'behavior', 'aggressive', 'hit', 'bit', 'threw', 'screamed', 'eloped'],
  milestone: ['win', 'milestone', 'progress', 'achievement', 'success', 'did it', 'great job'],
};

const CATEGORY_PRIORITY = ['health', 'behavior', 'sleep', 'food', 'mood', 'milestone'];

const QUICK_TAG_GROUPS = [
  {
    items: [
      { key: 'meltdown', label: 'Meltdown', icon: <Box component="span" sx={{ fontSize: '1.1rem' }}>🌋</Box> },
      { key: 'win', label: 'Win', icon: <Box component="span" sx={{ fontSize: '1.1rem' }}>⭐</Box> },
      { key: 'sleep', label: 'Sleep', icon: <Box component="span" sx={{ fontSize: '1.1rem' }}>😴</Box> },
    ]
  },
  {
    items: [
      { key: 'food', label: 'Food', icon: <Box component="span" sx={{ fontSize: '1.1rem' }}>🍽️</Box> },
      { key: 'anxiety', label: 'Anxiety', icon: <Box component="span" sx={{ fontSize: '1.1rem' }}>😰</Box> },
      { key: 'medication', label: 'Medication', icon: <Box component="span" sx={{ fontSize: '1.1rem' }}>💊</Box> },
    ]
  }
];

const QuickCheckIn = ({ child, onComplete, onSkip }) => {
  const [user] = useAuthState(auth);

  const [noteText, setNoteText] = useState('');
  const [showQuickTags, setShowQuickTags] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [importantMoment, setImportantMoment] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedTagCategory = useMemo(() => {
    return selectedTag ? QUICK_TAG_CATEGORY_MAP[selectedTag] || null : null;
  }, [selectedTag]);

  const autoCategory = useMemo(() => {
    const text = noteText.toLowerCase();
    if (!text.trim()) return 'log';

    for (const category of CATEGORY_PRIORITY) {
      if (CATEGORY_KEYWORDS[category].some((keyword) => text.includes(keyword))) {
        return category;
      }
    }

    return 'log';
  }, [noteText]);

  const resolvedCategory = selectedTagCategory || autoCategory;

  const combinedTags = useMemo(() => (selectedTag ? [selectedTag] : []), [selectedTag]);

  const notePlaceholder = selectedTag
    ? QUICK_TAG_PLACEHOLDERS[selectedTag]
    : "What happened? (e.g., 'Had lunch with applesauce', 'Took a 2-hour nap', 'Fell at playground but okay')";

  const toggleQuickTag = (tagKey) => {
    setSelectedTag((prev) => (prev === tagKey ? null : tagKey));
  };

  const saveQuickNote = async () => {
    const text = noteText.trim();
    if (!text) return;

    setSaving(true);
    try {
      const optimisticEntry = {
        childId: child.id,
        text,
        status: 'active',
        category: resolvedCategory,
        tags: combinedTags,
        importantMoment,
        timestamp: new Date(),
        authorId: user?.uid,
        authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
        authorEmail: user?.email,
      };

      await addDoc(collection(db, 'dailyLogs'), {
        childId: child.id,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        ...optimisticEntry,
        entryDate: new Date().toDateString(),
      });

      window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
        detail: {
          id: `local-${Date.now()}`,
          collection: 'dailyLogs',
          ...optimisticEntry,
        },
      }));

      onComplete?.({
        text,
        tags: combinedTags,
        importantMoment,
        category: resolvedCategory,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error saving quick note:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: '2px solid #cfcfcf',
        borderRadius: '32px',
        backgroundColor: '#f8f8f8',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Typography sx={{ fontSize: '1.9rem', lineHeight: 1 }}>
              📝
            </Typography>
            <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.35rem' }, fontWeight: 800, color: '#33343a', lineHeight: 1.2 }}>
              Quick Note for {child.name}
            </Typography>
          </Box>
          <IconButton onClick={onSkip}>
            <CloseIcon sx={{ fontSize: 32, color: '#7d7d80' }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            borderRadius: '24px',
            bgcolor: '#edf2ff',
            p: 1,
            mb: 1.6,
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start',
          }}
        >
          <InfoOutlinedIcon sx={{ color: '#3f44be', fontSize: 18, mt: 0.2 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#3f44be', fontWeight: 700, fontSize: { xs: '0.95rem', md: '1rem' }, lineHeight: 1.1 }}>
              Smart Auto-Classification
            </Typography>
            <Typography sx={{ color: '#3f44be', fontSize: { xs: '0.78rem', md: '0.82rem' }, lineHeight: 1.2 }}>
              Just write naturally. Quick tags and keywords will sort it into the right category automatically.
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={5}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'Enter') {
              e.preventDefault();
              if (noteText.trim() && !saving) saveQuickNote();
            }
          }}
          placeholder={notePlaceholder}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
              fontSize: '1rem',
              color: '#48484b',
              '& fieldset': { borderColor: '#c7d2f4', borderWidth: 3 },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#86888e',
              opacity: 0.75,
              fontSize: '1rem',
            }
          }}
        />

        <Button
          variant="outlined"
          startIcon={<LocalOfferIcon sx={{ color: '#102d72' }} />}
          endIcon={<ExpandMoreIcon sx={{ transform: showQuickTags ? 'rotate(180deg)' : 'none', transition: 'all 0.2s', color: '#102d72' }} />}
          onClick={() => setShowQuickTags((prev) => !prev)}
          sx={{
            borderRadius: '999px',
            borderColor: '#102d72',
            color: '#102d72',
            px: 2.5,
            py: 0.8,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            mb: 1.5,
          }}
        >
          Quick tags
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1.8, gap: 1.1 }}>
          {showQuickTags && (
            <Stack spacing={1} sx={{ width: '100%' }}>
              {QUICK_TAG_GROUPS.map((group, groupIndex) => (
                <Box
                  key={groupIndex}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 140px))' },
                    gap: 1,
                    width: '100%',
                  }}
                >
                  {group.items.map((item) => {
                    const selected = selectedTag === item.key;
                    const tagColors = QUICK_TAG_COLORS[item.key];
                    return (
                      <Tooltip key={item.key} title={item.label}>
                        <Chip
                          icon={item.icon}
                          label={item.label}
                          onClick={() => toggleQuickTag(item.key)}
                          sx={{
                            borderRadius: '14px',
                            border: `2px solid ${selected ? tagColors.main : 'rgba(148, 163, 184, 0.28)'}`,
                            bgcolor: selected ? tagColors.selected : tagColors.soft,
                            color: tagColors.text,
                            width: '100%',
                            maxWidth: { xs: '100%', sm: 140 },
                            justifyContent: 'flex-start',
                            px: 0.5,
                            height: 44,
                            boxShadow: selected ? `0 8px 18px ${tagColors.main}33` : 'none',
                            '& .MuiChip-label': {
                              px: 0.5,
                              width: '100%',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: tagColors.text,
                              textAlign: 'left',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            },
                            '& .MuiChip-icon': {
                              ml: 0.75,
                              mr: 0.25,
                              fontSize: 21,
                              opacity: selected ? 1 : 0.92,
                            },
                            '&:hover': {
                              bgcolor: selected ? tagColors.selected : tagColors.soft,
                              borderColor: tagColors.main,
                            },
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              ))}
            </Stack>
          )}

          <Box
            sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.2,
            py: 0.45,
            borderRadius: '999px',
            bgcolor: '#ece5f8',
            minHeight: 42,
            '& .MuiSwitch-root': {
              p: 0.5,
              mr: 0.25,
            },
          }}
          >
          <Switch
            checked={importantMoment}
            onChange={(e) => setImportantMoment(e.target.checked)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase': {
                p: 0.5,
              },
              '& .MuiSwitch-thumb': {
                width: 18,
                height: 18,
              },
              '& .MuiSwitch-track': {
                borderRadius: 10,
              },
            }}
          />
          <Box component="span" sx={{ color: '#6c43e5', fontSize: 22, lineHeight: 1 }}>
            ⭐
          </Box>
          <Typography sx={{ fontWeight: 800, color: '#35353a', fontSize: '0.9rem', lineHeight: 1 }}>Flag as Important Moment</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="text"
              onClick={onSkip}
              disabled={saving}
              sx={{ color: '#b4c8de', fontWeight: 700, fontSize: '1rem', textTransform: 'none' }}
            >
              Cancel
            </Button>

            <StyledButton
              variant="contained"
              onClick={saveQuickNote}
              disabled={!noteText.trim() || saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <DescriptionIcon />}
              sx={{
                minWidth: 180,
                height: 58,
                borderRadius: '24px',
                bgcolor: noteText.trim() ? '#2e7d32' : '#e3e3e5',
                color: noteText.trim() ? '#ffffff' : '#88898f',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: noteText.trim() ? '#256628' : '#d8d8dc' },
                '&.Mui-disabled': {
                  bgcolor: '#e3e3e5',
                  color: '#b0b1b5',
                },
              }}
            >
              {saving ? 'Saving...' : 'Log Note'}
            </StyledButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickCheckIn;

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Slide,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalOffer as LocalOfferIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  KeyboardVoice as KeyboardVoiceIcon,
} from '@mui/icons-material';
import StyledButton from '../UI/StyledButton';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { uploadIncidentMedia } from '../Dashboard/Incidents/Media/mediaUploadService';
import { CATEGORY_COLORS } from '../../constants/categoryColors';
import { classifyQuickNoteCategory, QUICK_TAG_CATEGORY_MAP } from '../../utils/quickNoteClassification';

const QUICK_TAG_PLACEHOLDERS = {
  meltdown: 'What triggered it? How long did it last?',
  medication: 'Which medication? Any reaction?',
  sleep: 'What happened? How many hours?',
  food: 'What did they eat or refuse?',
  anxiety: 'What caused it? How did they respond?',
  win: 'What happened? Celebrate it!',
};

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
  const [showQuickTags, setShowQuickTags] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [importantMoment, setImportantMoment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const photoInputRef = useRef(null);
  const quickTagTouchStartYRef = useRef(null);

  const selectedTagCategory = useMemo(() => {
    return selectedTag ? QUICK_TAG_CATEGORY_MAP[selectedTag] || null : null;
  }, [selectedTag]);

  const autoCategory = useMemo(() => {
    return classifyQuickNoteCategory(noteText);
  }, [noteText]);

  const resolvedCategory = selectedTagCategory || autoCategory;

  const combinedTags = useMemo(() => (selectedTag ? [selectedTag] : []), [selectedTag]);

  const notePlaceholder = selectedTag
    ? QUICK_TAG_PLACEHOLDERS[selectedTag]
    : "Just write what happened — we'll figure out the rest.";

  const toggleQuickTag = (tagKey) => {
    setSelectedTag((prev) => (prev === tagKey ? null : tagKey));
  };

  const handleQuickTagSelect = (tagKey) => {
    toggleQuickTag(tagKey);
    setShowQuickTags(false);
  };

  const closeQuickTags = () => {
    setShowQuickTags(false);
  };

  const handleQuickTagTouchStart = (event) => {
    quickTagTouchStartYRef.current = event.touches?.[0]?.clientY ?? null;
  };

  const handleQuickTagTouchEnd = (event) => {
    const touchStartY = quickTagTouchStartYRef.current;
    const touchEndY = event.changedTouches?.[0]?.clientY ?? null;
    quickTagTouchStartYRef.current = null;

    if (touchStartY == null || touchEndY == null) {
      return;
    }

    if (touchEndY - touchStartY > 50) {
      closeQuickTags();
    }
  };

  useEffect(() => {
    if (!selectedPhotoFile) {
      setPhotoPreviewUrl('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedPhotoFile);
    setPhotoPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedPhotoFile]);

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedPhotoFile(file);
    event.target.value = '';
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

      const docRef = await addDoc(collection(db, 'dailyLogs'), {
        childId: child.id,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        ...optimisticEntry,
        entryDate: new Date().toDateString(),
      });

      let mediaUrls = [];

      if (selectedPhotoFile) {
        const uploadedMedia = await uploadIncidentMedia(
          { file: selectedPhotoFile, type: 'image' },
          null,
          docRef.id,
          `dailyLogs/${docRef.id}`
        );
        mediaUrls = uploadedMedia.map((item) => item.url).filter(Boolean);

        if (mediaUrls.length > 0) {
          await updateDoc(docRef, { mediaUrls });
        }
      }

      window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
        detail: {
          id: docRef.id,
          collection: 'dailyLogs',
          ...optimisticEntry,
          ...(mediaUrls.length > 0 && { mediaUrls }),
        },
      }));

      onComplete?.({
        text,
        tags: combinedTags,
        importantMoment,
        category: resolvedCategory,
        timestamp: new Date(),
        ...(mediaUrls.length > 0 && { mediaUrls }),
      });
      setSelectedPhotoFile(null);
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1.25,
            px: 0.25,
          }}
        >
          <Avatar
            src={child.profilePhoto}
            alt={child.name}
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.95rem',
              fontWeight: 700,
              bgcolor: 'primary.main',
            }}
          >
            {!child.profilePhoto && child.name?.[0]?.toUpperCase()}
          </Avatar>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#51607a' }}>
            Logging for {child.name}
          </Typography>
        </Box>

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

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.7 }}>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#51607a' }}>
              Your note
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.45, color: '#6b7280' }}>
              <KeyboardVoiceIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 600 }}>
                Use your keyboard mic to dictate
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
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
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
        </Box>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handlePhotoSelect}
        />

        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
            <Button
              variant="outlined"
              onClick={() => photoInputRef.current?.click()}
              sx={{
                minHeight: 44,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.98rem',
                color: '#2f3441',
                borderColor: '#d7dbe2',
                bgcolor: '#f1f3f6',
                px: 2.2,
                py: 0.85,
                flex: { xs: 1, sm: '0 0 auto' },
                '&:hover': {
                  bgcolor: '#e6eaf0',
                  borderColor: '#c8ced8',
                },
              }}
            >
              <Box component="span" sx={{ fontSize: '1.2rem', mr: 0.9, lineHeight: 1 }}>
                📷
              </Box>
              Add Photo or Video
            </Button>

            <Button
              variant="outlined"
              onClick={() => setImportantMoment((prev) => !prev)}
              sx={{
                minHeight: 44,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                color: importantMoment ? '#8A5A00' : '#4b5563',
                borderColor: importantMoment ? '#F4B400' : '#d7dbe2',
                bgcolor: importantMoment ? '#FFFBF0' : '#f1f3f6',
                px: 1.8,
                py: 0.85,
                flex: { xs: 1, sm: '0 0 auto' },
                '&:hover': {
                  bgcolor: importantMoment ? '#FFF4CC' : '#e6eaf0',
                  borderColor: importantMoment ? '#E0A800' : '#c8ced8',
                },
              }}
            >
              <Box component="span" sx={{ fontSize: '1.1rem', mr: 0.75, lineHeight: 1 }}>
                ⭐
              </Box>
              {importantMoment ? 'Important Moment On' : 'Flag Important'}
            </Button>
          </Box>

          {photoPreviewUrl ? (
            <Box
              component="img"
              src={photoPreviewUrl}
              alt="Selected attachment"
              sx={{
                width: 92,
                height: 92,
                objectFit: 'cover',
                borderRadius: '10px',
                border: '2px solid #d7def4',
              }}
            />
          ) : null}
        </Box>

        <Button
          variant="outlined"
          startIcon={<LocalOfferIcon sx={{ color: '#102d72' }} />}
          endIcon={<ExpandMoreIcon sx={{ transform: showQuickTags ? 'rotate(180deg)' : 'none', transition: 'all 0.2s', color: '#102d72' }} />}
          onClick={() => setShowQuickTags((prev) => !prev)}
          sx={{
            borderRadius: '10px',
            borderColor: '#102d72',
            color: '#102d72',
            px: 2.5,
            py: 0.8,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            mb: 1.5,
            bgcolor: '#f1f5ff',
            '&:hover': {
              bgcolor: '#e7eeff',
              borderColor: '#102d72',
            },
          }}
        >
          {selectedTag ? `Quick tags: ${selectedTag}` : 'Quick tags'}
        </Button>

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

      <Slide direction="up" in={showQuickTags} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(15, 23, 42, 0.2)',
            }}
            onClick={closeQuickTags}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                px: 1.5,
                pb: 1.5,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <Box
                sx={{
                  borderRadius: '18px 18px 12px 12px',
                  border: '1px solid #d8def0',
                  bgcolor: '#ffffff',
                  boxShadow: '0 -18px 40px rgba(31, 41, 55, 0.16)',
                  p: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                    onTouchStart={handleQuickTagTouchStart}
                    onTouchEnd={handleQuickTagTouchEnd}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 5,
                        borderRadius: 999,
                        bgcolor: '#d5d9e3',
                      }}
                    />
                  </Box>

                  <IconButton
                    size="small"
                    onClick={closeQuickTags}
                    sx={{
                      ml: 1,
                      mt: -0.5,
                      color: '#6b7280',
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>

                <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#283142', mb: 1.25 }}>
                  Pick a quick tag
                </Typography>

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
                        const categoryKey = QUICK_TAG_CATEGORY_MAP[item.key] || 'log';
                        const categoryColors = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.log;
                        return (
                          <Chip
                            key={item.key}
                            icon={item.icon}
                            label={selected ? `✓ ${item.label}` : item.label}
                            onClick={() => handleQuickTagSelect(item.key)}
                            sx={{
                              borderRadius: '10px',
                              border: `2px solid ${categoryColors.border}`,
                              bgcolor: selected ? categoryColors.border : categoryColors.bg,
                              color: selected ? '#ffffff' : categoryColors.text,
                              width: '100%',
                              maxWidth: { xs: '100%', sm: 140 },
                              justifyContent: 'flex-start',
                              px: 0.5,
                              height: 46,
                              boxShadow: selected ? `0 10px 22px ${categoryColors.border}40` : 'none',
                              '& .MuiChip-label': {
                                px: 0.5,
                                width: '100%',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: selected ? '#ffffff' : categoryColors.text,
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
                                color: selected ? '#ffffff' : categoryColors.text,
                              },
                              '&:hover': {
                                bgcolor: selected ? categoryColors.border : categoryColors.bg,
                                borderColor: categoryColors.border,
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Card>
  );
};

export default QuickCheckIn;

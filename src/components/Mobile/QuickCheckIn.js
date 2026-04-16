import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Slide,
  TextField,
  Popover,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DescriptionIcon from '@mui/icons-material/Description';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import StyledButton from '../UI/StyledButton';
import RichTextInput from '../UI/RichTextInput';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { uploadIncidentMedia } from '../Dashboard/Incidents/Media/mediaUploadService';
import { CATEGORY_COLORS } from '../../constants/categoryColors';
import {
  classifyQuickNoteCategory,
  QUICK_TAG_CATEGORY_MAP,
} from '../../utils/quickNoteClassification';
import {
  getQuickTagGroups,
  getQuickTagPlaceholder,
} from '../../constants/logTypeRegistry';
import {
  QUICK_TAG_EMOJI_CHOICES,
  createCustomQuickTag,
  getAllQuickTagOptions,
  loadCustomQuickTags,
  saveCustomQuickTags,
} from '../../utils/quickTags';
import { getCalendarDateKey } from '../../utils/calendarDateKey';
import { ACTIVE_TIMELINE_DATE_STORAGE_KEY } from '../Dashboard/shared/DashboardViewContext';
import { coerceCalendarDate } from '../../utils/calendarDateKey';
import colors from '../../assets/theme/colors';
import LogSheetTitle from '../UI/LogSheetTitle';
import LogDateField from '../UI/LogDateField';
import LogTimeField from '../UI/LogTimeField';

const getTimeInputValue = (date = new Date()) =>
  new Date(date).toTimeString().slice(0, 5);

const formatSheetDateValue = (dateValue) => {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return 'Select date';
  }

  return dateValue.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const formatLocalDateInput = (dateValue) => {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return '';
  }

  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildUtcTimestampFromLocalInput = (dateValue, timeValue) => {
  const timestamp = new Date(dateValue);
  if (timeValue) {
    const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      timestamp.setHours(hours, minutes, 0, 0);
    }
  }
  return timestamp;
};

const getTimezoneMetadata = () => {
  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  const timeZoneOffsetMinutes = -new Date().getTimezoneOffset();
  return { timeZoneName, timeZoneOffsetMinutes };
};

const getStoredTimelineDate = () => {
  if (typeof window === 'undefined') {
    return new Date();
  }

  const stored = window.localStorage.getItem(ACTIVE_TIMELINE_DATE_STORAGE_KEY);
  return coerceCalendarDate(stored) || new Date();
};

const QuickCheckIn = ({ child, onComplete, onSkip, initialDate = null }) => {
  const [user] = useAuthState(auth);

  const [noteData, setNoteData] = useState({ text: '', mediaFile: null, audioBlob: null });
  const [selectedDate, setSelectedDate] = useState(() => getStoredTimelineDate());
  const [selectedTime, setSelectedTime] = useState(() => getTimeInputValue());
  const [showQuickTags, setShowQuickTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [importantMoment, setImportantMoment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [customQuickTags, setCustomQuickTags] = useState([]);
  const [tagDraftOpen, setTagDraftOpen] = useState(false);
  const [tagDraftLabel, setTagDraftLabel] = useState('');
  const [tagDraftEmoji, setTagDraftEmoji] = useState(QUICK_TAG_EMOJI_CHOICES[0]);
  const quickTagTouchStartYRef = useRef(null);

  useEffect(() => {
    setCustomQuickTags(loadCustomQuickTags(user?.uid));
  }, [user?.uid]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleTimelineDateChanged = (event) => {
      const nextDate = coerceCalendarDate(event?.detail?.dateKey);
      if (nextDate) {
        setSelectedDate(nextDate);
      }
    };

    const storedDate = getStoredTimelineDate();
    if (storedDate) {
      setSelectedDate(storedDate);
    }

    window.addEventListener('captureez:timeline-date-changed', handleTimelineDateChanged);
    return () => window.removeEventListener('captureez:timeline-date-changed', handleTimelineDateChanged);
  }, []);

  useEffect(() => {
    const nextDate = coerceCalendarDate(initialDate);
    if (nextDate) {
      setSelectedDate(nextDate);
      return;
    }

    const storedDate = getStoredTimelineDate();
    if (storedDate) {
      setSelectedDate(storedDate);
    }
  }, [initialDate]);

  const quickTagGroups = useMemo(() => {
    const builtInGroups = getQuickTagGroups();
    const customGroup = customQuickTags.length > 0
      ? {
          id: 'custom-tags',
          label: 'Your tags',
          items: customQuickTags,
        }
      : null;

    return [...builtInGroups, customGroup].filter(Boolean);
  }, [customQuickTags]);

  const quickTagLookup = useMemo(() => {
    const registry = new Map();
    getAllQuickTagOptions(customQuickTags).forEach((tag) => {
      registry.set(tag.key, tag);
    });
    return registry;
  }, [customQuickTags]);

  const selectedTagCategory = useMemo(() => {
    const primaryTag = selectedTags[0];
    return primaryTag ? QUICK_TAG_CATEGORY_MAP[primaryTag] || null : null;
  }, [selectedTags]);
  const primaryTagMeta = selectedTags.length > 0 ? quickTagLookup.get(selectedTags[0]) : null;

  const noteText = noteData?.text || '';

  const autoCategory = useMemo(() => {
    return classifyQuickNoteCategory(noteText);
  }, [noteText]);

  const resolvedCategory = selectedTagCategory || autoCategory;

  const combinedTags = useMemo(() => selectedTags, [selectedTags]);

  const notePlaceholder = selectedTags.length === 1
    ? getQuickTagPlaceholder(selectedTags[0])
    : "Just write what happened — we'll figure out the rest.";

  const toggleQuickTag = (tagKey) => {
    setSelectedTags((prev) => (
      prev.includes(tagKey)
        ? prev.filter((key) => key !== tagKey)
        : [...prev, tagKey]
    ));
  };

  const handleQuickTagSelect = (tagKey) => {
    toggleQuickTag(tagKey);
  };

  const handleCreateQuickTag = () => {
    const label = tagDraftLabel.trim();
    if (!label) {
      return;
    }

    const nextTag = createCustomQuickTag(label, tagDraftEmoji);
    if (!nextTag.key) {
      return;
    }

    setCustomQuickTags((prev) => {
      const existingIndex = prev.findIndex((tag) => tag.key === nextTag.key);
      const nextTags = existingIndex >= 0
        ? prev.map((tag) => (tag.key === nextTag.key ? { ...tag, label: nextTag.label, icon: nextTag.icon } : tag))
        : [...prev, nextTag];

      saveCustomQuickTags(user?.uid, nextTags);
      return nextTags;
    });

    setSelectedTags((prev) => (prev.includes(nextTag.key) ? prev : [...prev, nextTag.key]));
    setTagDraftLabel('');
    setTagDraftEmoji(QUICK_TAG_EMOJI_CHOICES[0]);
    setTagDraftOpen(false);
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

  const handleDatePickerOpen = (event) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handleDateChange = (nextDate) => {
    if (!nextDate) {
      return;
    }

    setSelectedDate(nextDate);
    setDatePickerAnchor(null);

    if (typeof window !== 'undefined') {
      const dateKey = getCalendarDateKey(nextDate);
      window.localStorage.setItem(ACTIVE_TIMELINE_DATE_STORAGE_KEY, dateKey);
      window.dispatchEvent(new CustomEvent('captureez:timeline-date-changed', {
        detail: { dateKey },
      }));
    }
  };

  const saveQuickNote = async () => {
    const text = noteText.trim();
    const hasContent = Boolean(text || noteData?.mediaFile || noteData?.audioBlob);
    if (!hasContent) return;

    setSaving(true);
    try {
      const timestampUtc = buildUtcTimestampFromLocalInput(selectedDate, selectedTime);
      const localDate = formatLocalDateInput(selectedDate);
      const { timeZoneName, timeZoneOffsetMinutes } = getTimezoneMetadata();
      const optimisticEntry = {
        childId: child.id,
        text: text || 'Shared media note',
        status: 'active',
        category: resolvedCategory,
        tags: combinedTags,
        importantMoment,
        timestamp: timestampUtc,
        timestampUtc,
        localDate,
        localTime: selectedTime,
        timeZoneName,
        timeZoneOffsetMinutes,
        timestampSource: 'local-input',
        authorId: user?.uid,
        authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
        authorEmail: user?.email,
      };

      const docRef = await addDoc(collection(db, 'dailyLogs'), {
        childId: child.id,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        ...optimisticEntry,
        entryDate: localDate,
      });

      let mediaUrls = [];

      if (noteData?.mediaFile || noteData?.audioBlob) {
        const uploadedRichMedia = await uploadIncidentMedia(
          noteData?.mediaFile,
          noteData?.audioBlob,
          docRef.id,
          `dailyLogs/${docRef.id}`
        );
        mediaUrls = [
          ...mediaUrls,
          ...(uploadedRichMedia || []).map((item) => item.url).filter(Boolean),
        ];
      }

      if (mediaUrls.length > 0) {
        await updateDoc(docRef, { mediaUrls });
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
        timestamp: timestampUtc,
        timestampUtc,
        localDate,
        localTime: selectedTime,
        timeZoneName,
        timeZoneOffsetMinutes,
        timestampSource: 'local-input',
        entryDate: localDate,
        ...(mediaUrls.length > 0 && { mediaUrls }),
      });
      setNoteData({ text: '', mediaFile: null, audioBlob: null });
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
        border: '1px solid #e4dcca',
        borderRadius: { xs: '28px', md: '32px' },
        backgroundColor: '#ffffff',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2.25, md: 2.5 } }}>
        <LogSheetTitle
          title="Quick Note"
          titleBadge={child.name}
          onClose={onSkip}
          compactTitle
        />

        <Box
          sx={{
            mb: 2,
            p: { xs: 1.1, sm: 1.25 },
            borderRadius: '24px',
            bgcolor: colors.brand.ice,
            border: `1px solid ${colors.brand.tint}`,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: '100%',
              alignItems: 'stretch',
            }}
          >
            <Box sx={{ flex: 1.05, minWidth: 0 }}>
              <LogDateField
                label="Date"
                value={formatSheetDateValue(selectedDate)}
                onClick={handleDatePickerOpen}
              />
            </Box>

            <Box sx={{ flex: 0.95, minWidth: 0 }}>
              <LogTimeField
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                label="Time"
              />
            </Box>
          </Stack>
          <Popover
            open={Boolean(datePickerAnchor)}
            anchorEl={datePickerAnchor}
            onClose={handleDatePickerClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '16px',
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
                overflow: 'hidden',
              },
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </Popover>
        </Box>

        <Box sx={{ mt: 2 }}>
          <RichTextInput
            value={noteData}
            placeholder={notePlaceholder}
            onDataChange={setNoteData}
          />
        </Box>

        {selectedTags.length > 0 && (
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
            }}
          >
            {selectedTags.map((tag) => {
              const tagMeta = quickTagLookup.get(tag);
              const categoryKey = QUICK_TAG_CATEGORY_MAP[tag] || 'log';
              const categoryColors = tagMeta?.custom
                ? {
                    bg: '#F8FAFC',
                    text: '#334155',
                    border: '#C7D9C4',
                  }
                : (CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.log);
              return (
                <Chip
                  key={tag}
                  label={tagMeta?.label || tag}
                  onDelete={() => toggleQuickTag(tag)}
                  sx={{
                    borderRadius: '999px',
                    bgcolor: categoryColors.bg,
                    color: categoryColors.text,
                    border: `1px solid ${categoryColors.border}`,
                    fontWeight: 700,
                    '& .MuiChip-deleteIcon': {
                      color: categoryColors.text,
                      fontSize: 16,
                    },
                  }}
                />
              );
            })}
          </Box>
        )}

        <Box
          sx={{
            mt: 1.5,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 1,
              width: '100%',
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setImportantMoment((prev) => !prev)}
              sx={{
                minHeight: 42,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                color: '#6a7280',
                borderColor: '#dfe3ea',
                bgcolor: '#f7f8fa',
                px: 1,
                py: 0.75,
                width: '100%',
                minWidth: 0,
                '&:hover': {
                  bgcolor: '#f0f2f6',
                  borderColor: '#d3d9e2',
                },
              }}
            >
              <Box component="span" sx={{ fontSize: '0.9rem', mr: 0.4, lineHeight: 1 }}>
                ⭐
              </Box>
              <Box component="span" sx={{ lineHeight: 1, whiteSpace: 'nowrap', fontWeight: 650 }}>
                {importantMoment ? 'Important On' : 'Flag Important'}
              </Box>
            </Button>

            <Button
              variant="outlined"
              startIcon={<LocalOfferIcon sx={{ color: '#102d72' }} />}
              endIcon={<ExpandMoreIcon sx={{ transform: showQuickTags ? 'rotate(180deg)' : 'none', transition: 'all 0.2s', color: '#102d72' }} />}
              onClick={() => setShowQuickTags((prev) => !prev)}
              sx={{
                minHeight: 42,
                borderRadius: '10px',
                borderColor: '#dfe3ea',
                color: '#6a7280',
                px: 1,
                py: 0.75,
                width: '100%',
                minWidth: 0,
                textTransform: 'none',
                fontSize: '0.82rem',
                fontWeight: 650,
                bgcolor: '#f7f8fa',
                '&:hover': {
                  bgcolor: '#f0f2f6',
                  borderColor: '#d3d9e2',
                },
                '& .MuiButton-startIcon': {
                  mr: 0.25,
                  ml: 0,
                },
                '& .MuiButton-endIcon': {
                  ml: 0.25,
                },
                }}
              >
              {selectedTags.length > 0
                ? selectedTags.length === 1
                  ? `Tags: ${primaryTagMeta?.label || selectedTags[0]}`
                  : `Tags (${selectedTags.length})`
              : 'Add context'}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
            }}
          >
            <StyledButton
              variant="contained"
              onClick={saveQuickNote}
              disabled={(!noteText.trim() && !noteData?.mediaFile && !noteData?.audioBlob) || saving}
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
                width: { xs: '100%', sm: 'auto' },
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
              {quickTagGroups.map((group, groupIndex) => (
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
                        const selected = selectedTags.includes(item.key);
                        const categoryKey = QUICK_TAG_CATEGORY_MAP[item.key] || 'log';
                        const categoryColors = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.log;
                        return (
                          <Chip
                            key={item.key}
                            icon={<Box component="span" sx={{ fontSize: '1.1rem' }}>{item.icon}</Box>}
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

                {!tagDraftOpen ? (
                  <Box sx={{ mt: 1.25, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      onClick={() => setTagDraftOpen(true)}
                      aria-label="Add a new quick tag"
                      variant="outlined"
                      sx={{
                        minWidth: 40,
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        borderWidth: '1px',
                        borderColor: '#C7D9C4',
                        color: '#334155',
                        bgcolor: '#ffffff',
                        textTransform: 'none',
                        fontWeight: 900,
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                        '&:hover': {
                          borderWidth: '1px',
                          borderColor: '#B8D3B5',
                          bgcolor: '#F7FBF9',
                        },
                      }}
                    >
                      +
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 1.25,
                      p: 1.2,
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      bgcolor: '#F8FAFC',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748B', mb: 1 }}>
                      Add your own tag
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={tagDraftLabel}
                      onChange={(event) => setTagDraftLabel(event.target.value)}
                      placeholder="1-2 words"
                      helperText="Keep it short so it stays quick."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#ffffff',
                        },
                      }}
                    />

                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748B', mb: 0.75 }}>
                        Pick an emoji
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                        {QUICK_TAG_EMOJI_CHOICES.map((emoji) => (
                          <Chip
                            key={emoji}
                            label={emoji}
                            onClick={() => setTagDraftEmoji(emoji)}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '12px',
                              border: `1px solid ${tagDraftEmoji === emoji ? '#8FC9C0' : '#E2E8F0'}`,
                              bgcolor: tagDraftEmoji === emoji ? '#EAF4F2' : '#ffffff',
                              fontSize: '1rem',
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1.2 }}>
                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => {
                          setTagDraftOpen(false);
                          setTagDraftLabel('');
                          setTagDraftEmoji(QUICK_TAG_EMOJI_CHOICES[0]);
                        }}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '12px',
                          color: '#64748B',
                          fontWeight: 700,
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleCreateQuickTag}
                        disabled={!tagDraftLabel.trim()}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '12px',
                          bgcolor: '#8FC9C0',
                          color: '#0F172A',
                          fontWeight: 800,
                          '&:hover': {
                            bgcolor: '#7EB8AF',
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#E2E8F0',
                            color: '#94A3B8',
                          },
                        }}
                      >
                        Add tag
                      </Button>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={closeQuickTags}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '10px',
                      px: 2,
                      bgcolor: '#102d72',
                      '&:hover': { bgcolor: '#0b255d' },
                    }}
                  >
                    Done
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Slide>
    </Card>
  );
};

export default QuickCheckIn;

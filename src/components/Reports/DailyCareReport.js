import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { alpha, useTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getTimelineEntries } from "../../services/timelineService";

const RANGE_PRESET = {
  WEEK: "week",
  MONTH: "month",
  CUSTOM: "custom",
};

const CATEGORY_META = {
  incident: { label: "IMPORTANT MOMENT", emoji: "🚨", order: 1 },
  behavior: { label: "BEHAVIOR", emoji: "🌋", order: 2 },
  health: { label: "HEALTH", emoji: "💊", order: 3 },
  mood: { label: "MOOD", emoji: "😰", order: 4 },
  sleep: { label: "SLEEP", emoji: "😴", order: 5 },
  food: { label: "FOOD", emoji: "🍽️", order: 6 },
  milestone: { label: "WIN", emoji: "⭐", order: 7 },
  log: { label: "DAILY LOG", emoji: "📓", order: 8 },
  daily_note: { label: "DAILY LOG", emoji: "📓", order: 8 },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toEntryDate = (timestamp) => timestamp?.toDate?.() || new Date(timestamp);

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const getWeekRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { start, end };
};

const getMonthRange = () => {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { start, end };
};

const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());

const formatCompactDate = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const formatLongDate = (date) =>
  date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const formatPeriodLabel = (start, end, preset) => {
  if (!isValidDate(start) || !isValidDate(end)) return "";

  if (preset === RANGE_PRESET.WEEK) {
    return `Week of ${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  }

  return `${formatLongDate(start)} – ${formatLongDate(end)}`;
};

const getRangeHelperText = (preset) => {
  if (preset === RANGE_PRESET.WEEK) {
    return "This Week — default for weekly therapy appointments";
  }
  if (preset === RANGE_PRESET.MONTH) {
    return "This Month — for monthly specialist visits, psychiatrist appointments, IEP reviews";
  }
  return "Custom Range — for parents who want to pull 6 weeks before an annual IEP meeting or a new doctor consultation";
};

const sanitizeSummary = (value = "") => value.replace(/^(Behavior|Health|Mood|Sleep|Food|Win|Daily Log|Important Moment):\s*/i, "").trim();

const getMeaningfulSummary = (entry) => {
  const content = sanitizeSummary(entry.content || entry.originalData?.text || entry.originalData?.notes || entry.originalData?.description || "");
  if (content) return content;

  const title = sanitizeSummary(entry.title || "");
  if (title && title !== "Entry" && title !== "Daily Care") return title;

  return "";
};

const getLoggedByName = (entry) => {
  const value =
    entry.originalData?.authorName ||
    entry.originalData?.loggedBy?.name ||
    entry.originalData?.author ||
    entry.originalData?.createdByName ||
    entry.author;

  if (!value || value === "Unknown") {
    return "";
  }

  return String(value).trim();
};

const isLowSignalEntry = (entry) => {
  if (entry.type === "daily_care") {
    return true;
  }

  const summary = getMeaningfulSummary(entry);
  if (!summary) {
    return true;
  }

  if (["mood_log", "sleep_log", "food_log"].includes(entry.type) && /update$/i.test(summary)) {
    return true;
  }

  return false;
};

const getCategoryMeta = (entry) => CATEGORY_META[entry.type] || CATEGORY_META.log;

const buildCategorySections = (entries) => {
  const grouped = entries.reduce((acc, entry) => {
    const meta = getCategoryMeta(entry);
    const key = meta.label;
    if (!acc[key]) {
      acc[key] = { ...meta, items: [] };
    }
    acc[key].items.push(entry);
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map((section) => ({
      ...section,
      items: section.items.sort((a, b) => toEntryDate(b.timestamp) - toEntryDate(a.timestamp)),
    }));
};

const buildDateSections = (entries) => {
  const grouped = entries.reduce((acc, entry) => {
    const date = toEntryDate(entry.timestamp);
    const key = startOfDay(date).toISOString();
    if (!acc[key]) {
      acc[key] = { date, items: [] };
    }
    acc[key].items.push(entry);
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => b.date - a.date)
    .map((section) => ({
      ...section,
      items: section.items.sort((a, b) => toEntryDate(b.timestamp) - toEntryDate(a.timestamp)),
    }));
};

const buildShareText = ({ childName, periodLabel, groupMode, categorySections, dateSections }) => {
  const lines = [`Therapy Prep — ${childName}`, periodLabel, `Grouped by ${groupMode === "category" ? "Category" : "Date"}`, ""];

  if (groupMode === "category") {
    categorySections.forEach((section) => {
      lines.push(`${section.emoji} ${section.label} · ${section.items.length} ${section.items.length === 1 ? "entry" : "entries"}`);
      lines.push("───────────────────");
      section.items.forEach((entry) => {
        lines.push(`${formatCompactDate(toEntryDate(entry.timestamp))} · ${getMeaningfulSummary(entry)}`);
      });
      lines.push("");
    });
  } else {
    dateSections.forEach((section) => {
      lines.push(section.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
      lines.push("───────────────────");
      section.items.forEach((entry) => {
        const meta = getCategoryMeta(entry);
        lines.push(`${meta.emoji} ${meta.label} · ${getMeaningfulSummary(entry)}`);
      });
      lines.push("");
    });
  }

  return lines.join("\n").trim();
};

const DailyCareReport = ({ open, onClose, child, childId, childName, onLogSomething }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [rangePreset, setRangePreset] = useState(RANGE_PRESET.WEEK);
  const [customStartDate, setCustomStartDate] = useState(() => getWeekRange().start);
  const [customEndDate, setCustomEndDate] = useState(() => getWeekRange().end);
  const [entries, setEntries] = useState([]);

  const activeRange = useMemo(() => {
    if (rangePreset === RANGE_PRESET.MONTH) return getMonthRange();
    if (rangePreset === RANGE_PRESET.CUSTOM) return { start: customStartDate, end: customEndDate };
    return getWeekRange();
  }, [customEndDate, customStartDate, rangePreset]);

  const rangeStart = useMemo(() => startOfDay(activeRange.start), [activeRange]);
  const rangeEnd = useMemo(() => endOfDay(activeRange.end), [activeRange]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const date = toEntryDate(entry.timestamp);
        return isValidDate(date) && date >= rangeStart && date <= rangeEnd;
      })
      .filter((entry) => !isLowSignalEntry(entry));
  }, [entries, rangeEnd, rangeStart]);

  const dayCount = useMemo(() => {
    return Math.floor((startOfDay(rangeEnd) - startOfDay(rangeStart)) / MS_PER_DAY) + 1;
  }, [rangeEnd, rangeStart]);

  const groupMode = dayCount > 14 ? "date" : "category";
  const categorySections = useMemo(() => buildCategorySections(filteredEntries), [filteredEntries]);
  const dateSections = useMemo(() => buildDateSections(filteredEntries), [filteredEntries]);
  const peopleLoggedCount = useMemo(() => {
    return new Set(filteredEntries.map(getLoggedByName).filter(Boolean)).size;
  }, [filteredEntries]);
  const periodLabel = useMemo(
    () => formatPeriodLabel(rangeStart, rangeEnd, rangePreset),
    [rangeEnd, rangePreset, rangeStart]
  );

  const shareText = useMemo(
    () =>
      buildShareText({
        childName,
        periodLabel,
        groupMode,
        categorySections,
        dateSections,
      }),
    [categorySections, childName, dateSections, groupMode, periodLabel]
  );

  const loadEntries = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setFeedback("");

    try {
      const timelineEntries = await new Promise((resolve) => {
        let settled = false;
        const unsubscribe = getTimelineEntries(childId, (nextEntries) => {
          if (settled) return;
          settled = true;
          resolve(nextEntries || []);
          unsubscribe();
        });
      });

      setEntries(timelineEntries);
    } catch (error) {
      console.error("Error loading therapy prep entries:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    if (open && childId) {
      loadEntries();
    }
  }, [childId, loadEntries, open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setFeedback("Therapy prep copied.");
    } catch (error) {
      console.error("Error copying therapy prep:", error);
      setFeedback("Copy failed. Try again.");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Therapy Prep — ${childName}`,
          text: shareText,
        });
        setFeedback("Therapy prep shared.");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setFeedback("Share is not available here. Copied instead.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Error sharing therapy prep:", error);
        setFeedback("Share failed. Try again.");
      }
    }
  };

  const handleLogSomething = () => {
    if (child && typeof onLogSomething === "function") {
      onLogSomething(child);
    }
  };

  const renderCategorySections = () => (
    <Stack spacing={3}>
      {categorySections.map((section) => (
        <Box key={section.label}>
          <Typography variant="h6" sx={{ fontWeight: 900, fontSize: "1.08rem", mb: 1, letterSpacing: 0.5 }}>
            {section.emoji} {section.label} · {section.items.length} {section.items.length === 1 ? "entry" : "entries"}
          </Typography>
          <Box sx={{ height: 1, bgcolor: alpha(theme.palette.text.primary, 0.14), mb: 1.5 }} />
          <Stack spacing={0}>
            {section.items.map((entry, index) => (
              <Box
                key={entry.id}
                sx={{
                  py: 1,
                  borderBottom: index === section.items.length - 1 ? "none" : `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                }}
              >
                <Typography variant="body1" sx={{ color: "text.primary" }}>
                  {formatCompactDate(toEntryDate(entry.timestamp))} · {getMeaningfulSummary(entry)}
                  {getLoggedByName(entry) ? (
                    <Box
                      component="span"
                      sx={{
                        ml: 0.75,
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "primary.main",
                      }}
                    >
                      · {getLoggedByName(entry)}
                    </Box>
                  ) : null}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );

  const renderDateSections = () => (
    <Stack spacing={3}>
      {dateSections.map((section) => (
        <Box key={section.date.toISOString()}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            {section.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </Typography>
          <Box sx={{ height: 1, bgcolor: alpha(theme.palette.text.primary, 0.14), mb: 1.5 }} />
          <Stack spacing={0}>
            {section.items.map((entry, index) => {
              const meta = getCategoryMeta(entry);
              return (
                <Box
                  key={entry.id}
                  sx={{
                    py: 1,
                    borderBottom: index === section.items.length - 1 ? "none" : `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                  }}
                >
                  <Typography variant="body1" sx={{ color: "text.primary" }}>
                    {meta.emoji} {meta.label} · {getMeaningfulSummary(entry)}
                    {getLoggedByName(entry) ? (
                      <Box
                        component="span"
                        sx={{
                          ml: 0.75,
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "primary.main",
                        }}
                      >
                        · {getLoggedByName(entry)}
                      </Box>
                    ) : null}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );

  const isCustomRangeInvalid = !isValidDate(rangeStart) || !isValidDate(rangeEnd) || rangeStart > rangeEnd;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid #eee", py: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
            <AssignmentOutlinedIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Therapy Prep
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {childName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                <Chip
                  label="This Week"
                  clickable
                  color={rangePreset === RANGE_PRESET.WEEK ? "primary" : "default"}
                  variant={rangePreset === RANGE_PRESET.WEEK ? "filled" : "outlined"}
                  onClick={() => setRangePreset(RANGE_PRESET.WEEK)}
                />
                <Chip
                  label="This Month"
                  clickable
                  color={rangePreset === RANGE_PRESET.MONTH ? "primary" : "default"}
                  variant={rangePreset === RANGE_PRESET.MONTH ? "filled" : "outlined"}
                  onClick={() => setRangePreset(RANGE_PRESET.MONTH)}
                />
                <Chip
                  label="Custom Range"
                  clickable
                  color={rangePreset === RANGE_PRESET.CUSTOM ? "primary" : "default"}
                  variant={rangePreset === RANGE_PRESET.CUSTOM ? "filled" : "outlined"}
                  onClick={() => setRangePreset(RANGE_PRESET.CUSTOM)}
                />
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: rangePreset === RANGE_PRESET.CUSTOM ? 2 : 0 }}>
                {getRangeHelperText(rangePreset)}
              </Typography>

              {rangePreset === RANGE_PRESET.CUSTOM && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <DatePicker
                    label="Start"
                    value={customStartDate}
                    onChange={(value) => value && setCustomStartDate(value)}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                  <DatePicker
                    label="End"
                    value={customEndDate}
                    onChange={(value) => value && setCustomEndDate(value)}
                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                  />
                </Stack>
              )}
            </Box>

            {feedback && <Alert severity="info">{feedback}</Alert>}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  Building therapy prep...
                </Typography>
              </Box>
            ) : isCustomRangeInvalid ? (
              <Alert severity="warning">Select a valid date range to build therapy prep.</Alert>
            ) : filteredEntries.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  Therapy Prep — {childName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {periodLabel}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  No entries logged for this period. Start logging to build your therapy prep report.
                </Typography>
                <Link
                  component="button"
                  type="button"
                  onClick={handleLogSomething}
                  underline="hover"
                  sx={{ fontWeight: 700 }}
                >
                  Open the daily log popup
                </Link>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={handleLogSomething}>
                    + Log Something
                  </Button>
                </Box>
              </Paper>
            ) : (
              <Stack spacing={3}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Therapy Prep — {childName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                      {periodLabel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontWeight: 600 }}>
                      {filteredEntries.length} total {filteredEntries.length === 1 ? "entry" : "entries"}
                      {` · ${peopleLoggedCount} ${peopleLoggedCount === 1 ? "person" : "people"} logged`}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Grouped by {groupMode === "category" ? "Category" : "Date"}
                </Typography>

                {groupMode === "category" ? renderCategorySections() : renderDateSections()}

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, pt: 1 }}>
                  <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                    Copy
                  </Button>
                  <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>
                    Share with Care Team
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};

export default DailyCareReport;

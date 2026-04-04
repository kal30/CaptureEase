import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { CATEGORY_COLORS } from '../../../constants/categoryColors';
import {
  detectPossibleDuplicateImportRow,
  fetchExistingLogsForChild,
  saveImportedLogs,
} from './importLogsService';
import { auth } from '../../../services/firebase';

const CATEGORY_OPTIONS = [
  { value: 'behavior', label: 'Behavior' },
  { value: 'health', label: 'Health' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'mood', label: 'Mood' },
  { value: 'daily', label: 'Daily' },
  { value: 'other', label: 'Other' },
];

const IMPORTANCE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Important' },
];

const CATEGORY_TO_COLOR = (category) => CATEGORY_COLORS[category] || CATEGORY_COLORS.log;

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const normalizePreviewRow = (entry, index) => ({
  id: entry.id || `${Date.now()}-${index}`,
  date: toDateInputValue(entry.date),
  note: entry.note || '',
  category: entry.category || 'daily',
  importance: entry.importance === 'important' ? 'important' : 'normal',
  childName: entry.childName || null,
  include: true,
});

const ImportLogsModal = ({
  open,
  onClose,
  entries = [],
  children = [],
  initialChildId = '',
  onImported,
  onViewCalendar,
  onViewPrepForTherapy,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rows, setRows] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(initialChildId || children[0]?.id || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingLogs, setExistingLogs] = useState([]);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setRows(entries.map(normalizePreviewRow));
    setSelectedChildId(initialChildId || children[0]?.id || '');
    setError('');
    setExistingLogs([]);
    setDuplicateLoading(false);
    setImportSuccess(null);
  }, [open, entries, initialChildId, children]);

  useEffect(() => {
    if (!open || !selectedChildId) {
      setExistingLogs([]);
      return;
    }

    let cancelled = false;

    const loadExistingLogs = async () => {
      try {
        setDuplicateLoading(true);
        const logs = await fetchExistingLogsForChild(selectedChildId);
        if (!cancelled) {
          setExistingLogs(logs);
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Error loading existing logs for import comparison:', loadError);
          setExistingLogs([]);
        }
      } finally {
        if (!cancelled) {
          setDuplicateLoading(false);
        }
      }
    };

    loadExistingLogs();

    return () => {
      cancelled = true;
    };
  }, [open, selectedChildId]);

  useEffect(() => {
    if (!open || !existingLogs.length || !rows.length) {
      return;
    }

    setRows((currentRows) => currentRows.map((row) => {
      const duplicateInfo = detectPossibleDuplicateImportRow(row, existingLogs);
      return duplicateInfo.matched && row.include !== false
        ? { ...row, include: false }
        : row;
    }));
  }, [open, existingLogs]);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) || null,
    [children, selectedChildId]
  );

  const rowsWithStatus = useMemo(
    () => rows.map((row) => {
      const duplicateInfo = detectPossibleDuplicateImportRow(row, existingLogs);
      return {
        ...row,
        duplicate: duplicateInfo.matched,
        duplicateReason: duplicateInfo.reason,
      };
    }),
    [existingLogs, rows]
  );

  const duplicateCount = rowsWithStatus.filter((row) => row.duplicate && row.include === false).length;
  const includedRows = rowsWithStatus.filter((row) => row.include !== false && row.note.trim());

  const handleRowChange = (rowId, field, value) => {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  const handleIncludeChange = (rowId, include) => {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, include } : row)));
  };

  const handleDeleteRow = (rowId) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
  };

  const handleConfirmImport = async () => {
    try {
      setSaving(true);
      setError('');
      const user = auth.currentUser;
      const payloadRows = includedRows.map((row) => ({
        date: row.date || null,
        note: row.note.trim(),
        category: row.category,
        importance: row.importance,
      }));

      if (!selectedChildId) {
        throw new Error('Please choose a child before importing.');
      }

      if (!payloadRows.length) {
        throw new Error('There are no entries selected to import.');
      }

      const result = await saveImportedLogs({
        rows: payloadRows,
        childId: selectedChildId,
        user,
      });

      setImportSuccess({
        importedCount: result.count,
        skippedDuplicateCount: duplicateCount,
        child: selectedChild,
      });
      onImported?.(result.count, selectedChild);
    } catch (saveError) {
      setError(saveError.message || 'Something went wrong while saving the import.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    setImportSuccess(null);
    onClose?.();
  };

  const handleViewCalendar = () => {
    const child = selectedChild || children.find((candidate) => candidate.id === selectedChildId) || null;
    setImportSuccess(null);
    onViewCalendar?.(child);
  };

  const handleViewPrep = () => {
    const child = selectedChild || children.find((candidate) => candidate.id === selectedChildId) || null;
    setImportSuccess(null);
    onViewPrepForTherapy?.(child);
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : handleClose}
      fullScreen={isMobile}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: '100vh', sm: '92vh' },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {importSuccess ? 'Import complete' : 'Import preview'}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {importSuccess
            ? 'Check the calendar or Prep for Therapy to review your new entries.'
            : 'Review the parsed entries before saving them to daily logs.'}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, overflowY: 'auto' }}>
        {importSuccess ? (
          <Box sx={{ py: { xs: 2, sm: 4 } }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Import complete. Check the calendar or Prep for Therapy to review your new entries.
            </Alert>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: 'background.default',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                {importSuccess.importedCount} entr{importSuccess.importedCount === 1 ? 'y' : 'ies'} saved
              </Typography>
              {importSuccess.skippedDuplicateCount > 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {importSuccess.skippedDuplicateCount} possible duplicate
                  {importSuccess.skippedDuplicateCount === 1 ? ' was' : 's were'} skipped.
                </Typography>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                Your new entries are now in daily logs.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  justifyContent: 'center',
                  mt: 3,
                }}
              >
                <Button variant="outlined" onClick={handleViewCalendar}>
                  View Calendar
                </Button>
                <Button variant="contained" onClick={handleViewPrep}>
                  View Prep for Therapy
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : (
          <>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 1,
                backgroundColor: 'background.default',
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Attach to child
              </Typography>
              <Select
                size="small"
                fullWidth
                value={selectedChildId}
                onChange={(event) => setSelectedChildId(event.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a child
                </MenuItem>
                {children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {child.name}
                  </MenuItem>
                ))}
              </Select>
              {duplicateLoading ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Checking existing logs for possible duplicates...
                </Typography>
              ) : null}
            </Paper>

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                {rowsWithStatus.length} parsed entr{rowsWithStatus.length === 1 ? 'y' : 'ies'}
              </Typography>
              {duplicateCount > 0 ? (
                <Chip
                  size="small"
                  variant="outlined"
                  color="warning"
                  label={`${duplicateCount} possible duplicate${duplicateCount === 1 ? '' : 's'} defaulted off`}
                />
              ) : null}
            </Box>

            <Box
              sx={{
                overflowX: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Table size="small" stickyHeader sx={{ minWidth: 1040 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: 88 }}>Use</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Note</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Importance</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Child</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 72 }}>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowsWithStatus.map((row) => {
                    const categoryColors = CATEGORY_TO_COLOR(row.category);
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          backgroundColor: row.duplicate && row.include === false
                            ? 'rgba(245, 158, 11, 0.06)'
                            : 'transparent',
                        }}
                      >
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Checkbox
                            checked={row.include !== false}
                            onChange={(event) => handleIncludeChange(row.id, event.target.checked)}
                            inputProps={{ 'aria-label': `Include ${row.note || 'entry'}` }}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 150, verticalAlign: 'top' }}>
                          <TextField
                            type="date"
                            size="small"
                            fullWidth
                            value={row.date}
                            onChange={(event) => handleRowChange(row.id, 'date', event.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 280, verticalAlign: 'top' }}>
                          <TextField
                            multiline
                            minRows={2}
                            fullWidth
                            value={row.note}
                            onChange={(event) => handleRowChange(row.id, 'note', event.target.value)}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 160, verticalAlign: 'top' }}>
                          <Select
                            size="small"
                            fullWidth
                            value={row.category}
                            onChange={(event) => handleRowChange(row.id, 'category', event.target.value)}
                            renderValue={(value) => (
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  px: 1,
                                  py: 0.4,
                                  borderRadius: 0.5,
                                  border: '1px solid',
                                  borderColor: categoryColors.border,
                                  bgcolor: categoryColors.bg,
                                  color: categoryColors.text,
                                  fontWeight: 700,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {value}
                              </Box>
                            )}
                          >
                            {CATEGORY_OPTIONS.map((option) => {
                              const optionColors = CATEGORY_TO_COLOR(option.value);
                              return (
                                <MenuItem key={option.value} value={option.value}>
                                  <Box
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 1,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: optionColors.dot,
                                      }}
                                    />
                                    {option.label}
                                  </Box>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </TableCell>
                        <TableCell sx={{ minWidth: 150, verticalAlign: 'top' }}>
                          <Select
                            size="small"
                            fullWidth
                            value={row.importance}
                            onChange={(event) => handleRowChange(row.id, 'importance', event.target.value)}
                          >
                            {IMPORTANCE_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell sx={{ minWidth: 150, verticalAlign: 'top' }}>
                          <Typography variant="body2" color="text.secondary">
                            {row.childName || selectedChild?.name || 'Selected child'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top', minWidth: 160 }}>
                          {row.duplicate ? (
                            <Chip
                              size="small"
                              variant={row.include === false ? 'filled' : 'outlined'}
                              color="warning"
                              label={row.duplicateReason || 'Possible duplicate'}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Ready
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <IconButton onClick={() => handleDeleteRow(row.id)} size="small" color="error">
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            {!rowsWithStatus.length ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                There are no parsed rows to preview.
              </Alert>
            ) : null}
          </>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: { xs: 1.5, sm: 2.5 }, py: 2, flexWrap: 'wrap' }}>
        {importSuccess ? (
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={saving} variant="text">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={saving || !includedRows.length || !selectedChildId}
              variant="contained"
            >
              {saving ? 'Saving...' : 'Confirm Import'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportLogsModal;

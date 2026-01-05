import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { ContentCopy as CopyIcon, Print as PrintIcon } from '@mui/icons-material';
import {
  buildPrintHtml,
  buildSummary,
  buildTextRecap,
  formatDateInput,
  parseDateInput,
  toDate
} from './shareLogsUtils';

const ShareLogsDialog = ({
  open,
  onClose,
  childName,
  entries = [],
  brandName = 'CaptureEase',
  brandLogoUrl,
  defaultRangeDays = 7
}) => {
  const nowRef = useRef(new Date());
  const defaultStart = new Date(
    nowRef.current.getTime() - defaultRangeDays * 24 * 60 * 60 * 1000
  );
  const [startDate, setStartDate] = useState(formatDateInput(defaultStart));
  const [endDate, setEndDate] = useState(formatDateInput(nowRef.current));
  const [includeEntries, setIncludeEntries] = useState(true);
  const [copied, setCopied] = useState(false);
  const resolvedLogoUrl =
    brandLogoUrl || `${window.location.origin}/logo192.png`;

  const filteredEntries = useMemo(() => {
    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);
    if (!start || !end) return [];
    const endOfDay = new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1);
    return entries
      .filter((entry) => {
        const entryDate = toDate(entry);
        return entryDate >= start && entryDate <= endOfDay;
      })
      .sort((a, b) => toDate(a) - toDate(b));
  }, [entries, startDate, endDate]);

  const summary = useMemo(() => {
    const start = parseDateInput(startDate) || nowRef.current;
    const end = parseDateInput(endDate) || nowRef.current;
    return buildSummary(filteredEntries, start, end);
  }, [filteredEntries, startDate, endDate]);

  const recapText = useMemo(
    () => buildTextRecap({ brandName, childName, summary, entries: filteredEntries, includeEntries }),
    [brandName, childName, summary, filteredEntries, includeEntries]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recapText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy recap:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = buildPrintHtml({
      brandName,
      brandLogoUrl: resolvedLogoUrl,
      childName,
      summary,
      entries: filteredEntries,
      includeEntries
    });
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share logs</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose a date range and export a recap or full log list.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <TextField
            label="Start date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="End date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={includeEntries}
              onChange={(event) => setIncludeEntries(event.target.checked)}
            />
          }
          label="Include all entries"
        />
        <TextField
          value={recapText}
          multiline
          minRows={6}
          fullWidth
          variant="outlined"
          InputProps={{ readOnly: true }}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={handleCopy} startIcon={<CopyIcon />} size="small">
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button onClick={handlePrint} startIcon={<PrintIcon />} size="small">
            Download PDF
          </Button>
        </Box>
        <Button onClick={onClose} variant="outlined" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareLogsDialog;

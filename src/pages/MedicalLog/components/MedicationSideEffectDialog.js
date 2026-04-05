import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const MedicationSideEffectDialog = ({
  open,
  medications,
  medicationId,
  setMedicationId,
  sideEffectForm,
  onChange,
  onSeverityChange,
  onSubmit,
  onClose,
  editingSideEffectId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const selectedMedication = medications.find((med) => med.id === medicationId) || null;
  const showMedicationSelector = !medicationId;
  const titleMedicationName = selectedMedication?.name || 'Medication';
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const defaultDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const sideEffectDateTime = new Date(
    `${sideEffectForm.date || defaultDateTime.slice(0, 10)}T${sideEffectForm.timeOfDay || defaultDateTime.slice(11, 16)}:00`
  );
  const severityColors = ['#4caf50', '#8bc34a', '#ffc107', '#ff9800', '#f44336'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 0,
          maxHeight: isMobile ? '100%' : '92vh',
          width: isMobile ? '95%' : 480,
          maxWidth: isMobile ? '95%' : 480,
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
          m: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1.25,
          bgcolor: 'background.paper',
        }}
      >
        Add side effect for {titleMedicationName}
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 1.5, px: { xs: 1.5, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {showMedicationSelector ? (
            <Autocomplete
              options={medications}
              getOptionLabel={(option) => option.name}
              value={selectedMedication}
              onChange={(event, newValue) => {
                setMedicationId(newValue ? newValue.id : null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  required
                  fullWidth
                  label="Select Medication"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                    },
                  }}
                />
              )}
            />
          ) : null}

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
             
              value={sideEffectDateTime}
              onChange={(newValue) => {
                if (!newValue || Number.isNaN(newValue.getTime())) return;
                const dateValue = newValue.toISOString().split('T')[0];
                const timeValue = newValue.toTimeString().slice(0, 5);
                onChange({
                  target: { name: 'date', value: dateValue },
                });
                onChange({
                  target: { name: 'timeOfDay', value: timeValue },
                });
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  margin: 'none',
                  sx: {
                    '& .MuiInputBase-root': {
                      minHeight: 40,
                      borderRadius: 0,
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: 0,
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            id="sideEffectDescription"
            label="What was the side effect?"
            placeholder="e.g. drowsiness, irritability, rash"
            name="description"
            value={sideEffectForm.description}
            onChange={onChange}
            required
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          <TextField
            fullWidth
            id="sideEffectDuration"
            label="Duration"
            placeholder="e.g. 2 hours, all day"
            name="duration"
            value={sideEffectForm.duration}
            onChange={onChange}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          <TextField
            fullWidth
            id="sideEffectNotes"
            label="Notes"
            name="notes"
            multiline
            rows={2}
            value={sideEffectForm.notes || ''}
            onChange={onChange}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />

          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Severity
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map((num) => {
                const colors = ['#4caf50', '#8bc34a', '#ffc107', '#ff9800', '#f44336'];
                const selected = sideEffectForm.severity === num;
                return (
                  <Button
                    key={num}
                    onClick={() => onSeverityChange(num)}
                    sx={{
                      minWidth: 44,
                      height: 44,
                      borderRadius: '50%',
                      p: 0,
                      fontWeight: 700,
                      fontSize: '1rem',
                      border: `2px solid ${colors[num - 1]}`,
                      bgcolor: selected ? colors[num - 1] : 'transparent',
                      color: selected ? 'white' : colors[num - 1],
                      '&:hover': { bgcolor: colors[num - 1], color: 'white', opacity: 0.85 },
                    }}
                  >
                    {num}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          flexWrap: 'wrap',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: 0, textTransform: 'none', minWidth: 120 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={onSubmit}
          sx={{ borderRadius: 0, textTransform: 'none', minWidth: 160 }}
        >
          {editingSideEffectId ? 'Update Side Effect' : 'Add Side Effect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicationSideEffectDialog;

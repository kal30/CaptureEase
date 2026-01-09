import React from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Replay as ReplayIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const MedicationDrawerList = ({
  medications,
  discontinuedMeds,
  showDiscontinued,
  onToggleDiscontinued,
  onEdit,
  onDiscontinue,
  onReactivate,
  onRemove,
}) => (
  <>
    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
      Active Medications
    </Typography>
    {medications.length === 0 ? (
      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
        No active medications.
      </Typography>
    ) : (
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {medications.map((med) => (
          <Box
            key={med.id}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
              position: 'relative',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {med.name}{' '}
                  <Typography component="span" variant="body2" color="text.secondary">
                    ({med.dosage})
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {med.frequency}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <IconButton size="small" onClick={() => onEdit(med)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="warning" onClick={() => onDiscontinue(med.id)} title="Discontinue">
                  <BlockIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onRemove(med.id)} title="Delete permanently">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {med.scheduledTimes && med.scheduledTimes.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                {med.scheduledTimes.map((time, idx) => (
                  <Chip key={idx} label={time} size="small" variant="outlined" />
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    )}

    {discontinuedMeds.length > 0 && (
      <>
        <Divider sx={{ my: 2 }} />
        <Button
          fullWidth
          onClick={onToggleDiscontinued}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: showDiscontinued ? 'rotate(180deg)' : 'rotate(0)',
                transition: '0.2s'
              }}
            />
          }
          sx={{ mb: 1, justifyContent: 'space-between' }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Discontinued Medications ({discontinuedMeds.length})
          </Typography>
        </Button>
        {showDiscontinued && (
          <Stack spacing={1.5}>
            {discontinuedMeds.map((med) => (
              <Box
                key={med.id}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  position: 'relative',
                  opacity: 0.7,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1, pr: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {med.name}{' '}
                      <Typography component="span" variant="body2" color="text.secondary">
                        ({med.dosage})
                      </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {med.frequency}
                    </Typography>
                    {med.endDate && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Discontinued: {new Date(med.endDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <IconButton size="small" color="success" onClick={() => onReactivate(med.id)} title="Reactivate">
                      <ReplayIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onRemove(med.id)} title="Delete permanently">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </>
    )}
  </>
);

export default MedicationDrawerList;

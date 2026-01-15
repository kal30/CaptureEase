import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import SettingsIcon from '@mui/icons-material/Settings';
import { getMedications } from '../../../services/medicationManagementService';
import { markMedicationTaken } from '../../../services/markMedicationTaken';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { startOfDay, endOfDay } from 'date-fns';
import useIsMobile from '../../../hooks/useIsMobile';
import MedicationManagementDialog from './MedicationManagementDialog';
import MedicationDrawer from './MedicationDrawer';
import MedicationRecentView from './MedicationRecentView';

/**
 * TodaysMedications - Quick action component for marking medications as taken
 * Shows scheduled medications and allows marking as taken (creates log entry)
 */
const TodaysMedications = ({ child, onLogCreated }) => {
  const [medications, setMedications] = useState([]);
  const [takenToday, setTakenToday] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingTaken, setMarkingTaken] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const fetchData = async () => {
    if (!child?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get active medications
      const meds = await getMedications(child.id, true);
      setMedications(meds);

      // Get today's medication logs to mark as taken
      const today = new Date();
      const startOfToday = Timestamp.fromDate(startOfDay(today));
      const endOfToday = Timestamp.fromDate(endOfDay(today));

      const logsRef = collection(db, 'logs');
      const q = query(
        logsRef,
        where('childId', '==', child.id),
        where('type', '==', 'medication'),
        where('timeStart', '>=', startOfToday),
        where('timeStart', '<=', endOfToday)
      );

      const querySnapshot = await getDocs(q);
      const latestByMedication = new Map();
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const medicationId = data.meta?.medicationId;
        if (!medicationId || data.status === 'deleted' || data.status === 'archived') return;
        const timestamp = data.timeStart?.toDate?.() || data.createdAt?.toDate?.() || new Date(0);
        const current = latestByMedication.get(medicationId);
        if (!current || timestamp > current.timestamp) {
          latestByMedication.set(medicationId, { data, timestamp });
        }
      });

      const statusMap = {};
      latestByMedication.forEach(({ data }, medicationId) => {
        statusMap[medicationId] = data.meta?.takenStatus !== false;
      });

      setTakenToday(statusMap);
    } catch (err) {
      console.error('[TodaysMedications] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [child?.id]);

  const handleToggleTaken = async (medication, nextTaken) => {
    if (!child?.id) return;

    try {
      setMarkingTaken(medication.id);
      setTakenToday(prev => ({ ...prev, [medication.id]: nextTaken }));

      await markMedicationTaken({
        childId: child.id,
        medicationId: medication.id,
        medicationName: medication.name,
        dosage: medication.dosage,
        timeStart: new Date(),
        note: `${medication.name} ${medication.dosage} ${nextTaken ? 'taken' : 'not taken'}`,
        takenStatus: nextTaken,
      });

      // Notify parent if callback provided
      if (onLogCreated) {
        onLogCreated();
      }
    } catch (err) {
      console.error('[TodaysMedications] Error marking as taken:', err);
      alert(`Error: ${err.message}`);
      setTakenToday(prev => ({ ...prev, [medication.id]: !nextTaken }));
    } finally {
      setMarkingTaken(null);
    }
  };

  const pendingCount = medications.filter((med) => !takenToday[med.id]).length;

  return (
    <Box
      sx={{
        mb: 1.5,
        px: isMobile ? 1.25 : 1.5,
        py: isMobile ? 0.75 : 1,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicationIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Today's medications{pendingCount > 0 ? ` (${pendingCount} pending)` : ''}
          </Typography>
          {loading && <CircularProgress size={16} />}
        </Box>
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            setDialogOpen(true);
          }}
          title="Manage medications"
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Box>

      {error && (
        <Typography variant="caption" color="error">
          Error loading medications
        </Typography>
      )}

      {!loading && !error && medications.length > 0 && (
        <>
          <Box
            sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}
            onClick={(event) => event.stopPropagation()}
          >
            {medications.map((med) => {
              const isTaken = !!takenToday[med.id];
              const isMarking = markingTaken === med.id;
              const times = med.scheduledTimes || [];
              const visibleTimes = times.slice(0, 2);
              const remainingTimes = times.length - visibleTimes.length;
              const timeLabel = visibleTimes.join(', ');
              const timesSuffix = remainingTimes > 0 ? ` +${remainingTimes}` : '';
              const summary = [med.name, med.dosage, timeLabel].filter(Boolean).join(' · ');

              return (
                <Button
                  key={med.id}
                  variant={isTaken ? 'contained' : 'outlined'}
                  color="success"
                  size="small"
                  disabled={isMarking}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!isMarking) {
                      handleToggleTaken(med, !isTaken);
                    }
                  }}
                  sx={{
                    minWidth: 220,
                    flex: '0 0 auto',
                    borderRadius: 999,
                    px: 1.5,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 700,
                    justifyContent: 'flex-start',
                    gap: 0.75
                  }}
                >
                  {isMarking ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: 'inherit',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}
                    >
                      {summary || 'Medication'}
                      {timesSuffix && ` ${timesSuffix}`}
                    </Typography>
                  )}
                </Button>
              );
            })}
          </Box>
        </>
      )}

      {!loading && !error && medications.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          No meds scheduled for today.
        </Typography>
      )}

      <Box sx={{ mt: 1.25 }}>
        <MedicationRecentView child={child} variant="inline" />
      </Box>

      {/* Medication Management - Drawer on mobile, Dialog on desktop */}
      {isMobile ? (
        <MedicationDrawer
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            fetchData(); // Refresh medications list when drawer closes
          }}
          child={child}
        />
      ) : (
        <MedicationManagementDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            fetchData(); // Refresh medications list when dialog closes
          }}
          child={child}
        />
      )}
    </Box>
  );
};

export default TodaysMedications;

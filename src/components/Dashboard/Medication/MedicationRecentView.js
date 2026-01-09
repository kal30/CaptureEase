import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Button, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MedicationIcon from '@mui/icons-material/Medication';
import { db } from '../../../services/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import useIsMobile from '../../../hooks/useIsMobile';

/**
 * MedicationRecentView - Displays recent medication logs from unified logs table
 * Queries logs where type === "medication"
 */
const MedicationRecentView = ({ child, variant = 'card' }) => {
  const [recentMeds, setRecentMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchRecentMeds = async () => {
      if (!child?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const logsRef = collection(db, 'logs');
        const q = query(
          logsRef,
          where('childId', '==', child.id),
          where('type', '==', 'medication'),
          orderBy('timeStart', 'desc'),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        const meds = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(med => med.status !== 'deleted' && med.status !== 'archived');

        setRecentMeds(meds);
      } catch (err) {
        console.error('[MedicationRecentView] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMeds();
  }, [child?.id]);

  // Don't show if no medications
  if (!loading && recentMeds.length === 0) return null;

  return (
    <Box
      sx={{
        mb: variant === 'inline' ? 0 : 1.5,
        px: variant === 'inline' ? 0 : isMobile ? 1.25 : 1.5,
        py: variant === 'inline' ? 0 : isMobile ? 0.75 : 1,
        bgcolor: variant === 'inline' ? 'transparent' : 'background.paper',
        border: variant === 'inline' ? 'none' : '1px solid',
        borderColor: 'divider',
        borderRadius: variant === 'inline' ? 0 : 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <MedicationIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Recent meds
        </Typography>

        {loading && <CircularProgress size={16} />}

        {error && (
          <Typography variant="caption" color="error">
            Error loading medications
          </Typography>
        )}

        {!loading && !error && recentMeds[0] && (() => {
          const med = recentMeds[0];
          const timeAgo = med.timeStart?.toDate
            ? formatDistanceToNow(med.timeStart.toDate(), { addSuffix: true })
            : 'Unknown time';
          return (
            <>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                {med.subType || 'Medication'}
              </Typography>
              {med.meta?.dosage && (
                <Chip
                  label={med.meta.dosage}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {timeAgo}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {med.note}
              </Typography>
              {recentMeds.length > 1 && (
                <Typography variant="caption" color="text.secondary">
                  +{recentMeds.length - 1} more
                </Typography>
              )}
            </>
          );
        })()}

        {variant !== 'inline' && (
          <Button size="small" onClick={() => navigate('/medical-log')} sx={{ ml: 'auto' }}>
            View all
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default MedicationRecentView;

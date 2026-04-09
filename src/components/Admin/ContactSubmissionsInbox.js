import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';

const formatDate = (value) => {
  if (!value) return 'Unknown';
  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
};

const SubmissionCard = ({ submission }) => {
  const { senderName, senderEmail, subject, message, status, emailStatus, createdAt, updatedAt } = submission;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {subject || 'No subject'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {senderName || 'Unknown sender'} · {senderEmail || 'No email'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
            {status && <Chip size="small" label={status} />}
            {emailStatus && <Chip size="small" variant="outlined" label={`email: ${emailStatus}`} />}
          </Stack>
        </Stack>

        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
          {message || 'No message'}
        </Typography>

        <Divider />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
          <Stack direction="row" spacing={0.75} alignItems="center">
            <PersonOutlineIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {senderEmail || 'No email'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Sent {formatDate(createdAt)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <MailOutlineIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Updated {formatDate(updatedAt)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

const ContactSubmissionsInbox = ({ visible = true }) => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    setError('');

    try {
      const submissionsRef = collection(db, 'contactSubmissions');
      const submissionsQuery = query(
        submissionsRef,
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(submissionsQuery);
      setSubmissions(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    } catch (err) {
      console.error('Error loading contact submissions:', err);
      setError(err?.message || 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadSubmissions();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom={false}>
            Contact Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Private contact submissions saved in Firestore and emailed to the support inbox.
          </Typography>
        </Box>

        <IconButton onClick={loadSubmissions} disabled={loading} aria-label="Refresh submissions">
          <RefreshIcon />
        </IconButton>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!error && submissions.length === 0 && !loading && (
        <Alert severity="info">
          No contact submissions found yet.
        </Alert>
      )}

      <List disablePadding sx={{ display: 'grid', gap: 2 }}>
        {submissions.map((submission) => (
          <ListItem key={submission.id} disablePadding sx={{ display: 'block' }}>
            <SubmissionCard submission={submission} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ContactSubmissionsInbox;

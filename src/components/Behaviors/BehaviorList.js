
import React, { useState, useEffect } from 'react';
import { getBehaviors } from '../../services/behaviorService';
import {
  Typography,
  Paper,
  CircularProgress,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';

// Import all necessary icons
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ToysIcon from '@mui/icons-material/Toys';
import SocialDistanceIcon from '@mui/icons-material/SocialDistance';
import PanToolIcon from '@mui/icons-material/PanTool';

// Map icon names to actual components
const iconMap = {
  TrackChangesIcon: TrackChangesIcon,
  TouchAppIcon: TouchAppIcon,
  RecordVoiceOverIcon: RecordVoiceOverIcon,
  VisibilityIcon: VisibilityIcon,
  ToysIcon: ToysIcon,
  SocialDistanceIcon: SocialDistanceIcon,
  PanToolIcon: PanToolIcon,
};

const BehaviorList = ({ childId, refreshTrigger }) => {
  const [behaviors, setBehaviors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBehaviors = async () => {
      try {
        setLoading(true);
        const fetchedBehaviors = await getBehaviors(childId);
        // Sort behaviors by date, most recent first
        const sortedBehaviors = fetchedBehaviors.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
        setBehaviors(sortedBehaviors);
        setError(null);
      } catch (err) {
        setError('Failed to fetch behaviors. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchBehaviors();
    }
  }, [childId, refreshTrigger]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Paper elevation={0} sx={{ p: 2, background: 'transparent' }}>
      {behaviors.length === 0 ? (
        <Typography>No behaviors recorded yet. Click the button above to add one.</Typography>
      ) : (
        <Grid container spacing={2}>
          {behaviors.map((behavior) => {
            const IconComponent = iconMap[behavior.iconName] || TrackChangesIcon; // Default to TrackChangesIcon
            return (
            <Grid item xs={12} key={behavior.id}>
                <Card sx={{ display: 'flex', alignItems: 'center', p: 2, boxShadow: 3 }}>
                    <IconComponent color="primary" sx={{ fontSize: 48, mr: 2 }} />
                    <CardContent sx={{ flex: '1 0 auto', p: '0 !important' }}>
                        <Typography component="div" variant="h6">
                            {behavior.name}
                        </Typography>
                        <Chip
                            label={`Goal: ${behavior.goal}`}
                            size="small"
                            color="secondary"
                            sx={{ mt: 0.5, mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                            Recorded on: {dayjs(behavior.createdAt.toDate()).format('MMM D, YYYY h:mm A')}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
          )})}
        </Grid>
      )}
    </Paper>
  );
};

export default BehaviorList;

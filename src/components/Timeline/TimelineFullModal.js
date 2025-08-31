import React from 'react';
import {
  Modal,
  Paper,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import TimelineCalendar from './TimelineCalendar';

/**
 * TimelineFullModal - Full timeline modal view
 * Extracted from TimelineWidget for better organization
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {Function} props.onClose - Close modal callback
 * @param {Object} props.child - Child object
 * @param {Array} props.entries - Timeline entries
 * @param {Function} props.onDayClick - Day click callback
 */
const TimelineFullModal = ({
  open,
  onClose,
  child,
  entries = [],
  onDayClick
}) => {

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        sx={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: 800,
          overflow: 'hidden',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider' 
        }}>
          <Box>
            <Typography variant="h6">
              Timeline for {child?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete activity history and calendar view
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                backgroundColor: 'action.hover'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <TimelineCalendar
            entries={entries}
            onDayClick={onDayClick}
            filters={{}}
          />
        </Box>
      </Paper>
    </Modal>
  );
};

export default TimelineFullModal;
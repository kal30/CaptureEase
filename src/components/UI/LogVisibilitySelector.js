import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  LOG_VISIBILITY, 
  VISIBILITY_DISPLAY, 
  getAvailableVisibilityOptions,
  USER_ROLES 
} from '../../constants/roles';

/**
 * Log Visibility Selector Component
 * KISS: Compact dropdown for setting log visibility with smart defaults
 * 
 * @param {string} value - Current visibility value
 * @param {function} onChange - Change handler
 * @param {string} userRole - User's role (determines available options)
 * @param {boolean} compact - Whether to show compact version (collapsed by default)
 * @param {boolean} prominent - Whether to show prominently (always expanded)
 * @param {boolean} disabled - Whether the selector is disabled
 */
const LogVisibilitySelector = ({
  value = LOG_VISIBILITY.EVERYONE,
  onChange,
  userRole = USER_ROLES.CARE_PARTNER,
  compact = false,
  prominent = false,
  disabled = false
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(prominent);
  
  // Get available options for this user role
  const availableOptions = getAvailableVisibilityOptions(userRole);
  
  // If user only has one option, don't show selector
  if (availableOptions.length <= 1) {
    return null;
  }
  
  // Get display info for current value
  const currentDisplay = VISIBILITY_DISPLAY[value] || VISIBILITY_DISPLAY[LOG_VISIBILITY.EVERYONE];
  
  const handleChange = (event) => {
    onChange?.(event.target.value);
  };
  
  const toggleExpanded = () => {
    if (!prominent) {
      setExpanded(!expanded);
    }
  };

  // Compact version - just show current selection with expand option
  if (compact && !expanded) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: alpha(currentDisplay.color, 0.05),
          border: `1px solid ${alpha(currentDisplay.color, 0.2)}`,
          cursor: 'pointer'
        }}
        onClick={toggleExpanded}
      >
        <VisibilityIcon sx={{ fontSize: 16, color: currentDisplay.color }} />
        <Chip
          label={currentDisplay.label}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.75rem',
            bgcolor: alpha(currentDisplay.color, 0.1),
            color: currentDisplay.color,
            border: `1px solid ${alpha(currentDisplay.color, 0.3)}`,
            '& .MuiChip-label': { px: 1 }
          }}
        />
        <IconButton size="small" sx={{ p: 0.5 }}>
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  // Full selector view
  return (
    <Box>
      {/* Header with collapse toggle for compact mode */}
      {compact && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 1,
            cursor: 'pointer'
          }}
          onClick={toggleExpanded}
        >
          <VisibilityIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
            Visibility
          </Typography>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      )}
      
      <Collapse in={expanded || !compact}>
        <FormControl fullWidth size="small" disabled={disabled}>
          {!compact && (
            <InputLabel sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon sx={{ fontSize: 16 }} />
              Who can see this?
            </InputLabel>
          )}
          
          <Select
            value={value}
            onChange={handleChange}
            label={!compact ? "Who can see this?" : undefined}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: compact ? 1 : 2
              }
            }}
            renderValue={(selected) => {
              const display = VISIBILITY_DISPLAY[selected];
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ fontSize: '14px' }}>{display.icon}</span>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {display.label}
                  </Typography>
                </Box>
              );
            }}
          >
            {availableOptions.map((option) => {
              const display = VISIBILITY_DISPLAY[option];
              return (
                <MenuItem key={option} value={option}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ 
                      minWidth: 32, 
                      height: 32, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: 1,
                      bgcolor: alpha(display.color, 0.1)
                    }}>
                      <span style={{ fontSize: '16px' }}>{display.icon}</span>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {display.label}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'block', lineHeight: 1.2 }}
                      >
                        {display.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
          
          {/* Helper text for compact mode */}
          {compact && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mt: 0.5, display: 'block' }}
            >
              {currentDisplay.description}
            </Typography>
          )}
        </FormControl>
      </Collapse>
    </Box>
  );
};

export default LogVisibilitySelector;
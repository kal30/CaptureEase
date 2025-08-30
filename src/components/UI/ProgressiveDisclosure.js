import React, { useState } from 'react';
import {
  Box,
  Typography,
  Popover,
  Paper,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * ProgressiveDisclosure - Reusable component for showing truncated lists with expandable details
 * 
 * @param {Array} items - Array of items to display
 * @param {number} maxVisible - Maximum items to show in header (default: 2)
 * @param {Function} renderItem - Function to render each item in header
 * @param {Function} renderExpandedItem - Function to render each item in popover
 * @param {string} label - Label for the section (e.g., "Team", "Allergies")
 * @param {React.Node} icon - Icon to display next to label
 * @param {Function} onItemAction - Optional action handler (e.g., invite, remove)
 * @param {React.Node} actionButton - Optional action button component
 */
const ProgressiveDisclosure = ({
  items = [],
  maxVisible = 2,
  renderItem,
  renderExpandedItem,
  label,
  icon,
  onItemAction,
  actionButton,
  sx = {},
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const visibleItems = items.slice(0, maxVisible);
  const hiddenCount = Math.max(0, items.length - maxVisible);
  const hasMore = hiddenCount > 0;

  const handleMoreClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 0.5, 
        flexWrap: "wrap",
        ...sx
      }}>
        {/* Icon and Label */}
        {icon}
        <Typography
          variant="caption"
          sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}
        >
          {label} ({items.length}):
        </Typography>
        
        {/* Visible Items */}
        {visibleItems.map((item, index) => renderItem(item, index))}
        
        {/* More Button */}
        {hasMore && (
          <Typography
            variant="caption"
            sx={{ 
              fontSize: "0.7rem", 
              color: theme.palette.primary.main,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={handleMoreClick}
          >
            +{hiddenCount} more
          </Typography>
        )}
        
        {/* Action Button */}
        {actionButton}
      </Box>

      {/* Expanded Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Paper sx={{ 
          p: 2, 
          maxWidth: 300,
          maxHeight: 400,
          overflow: 'auto'
        }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {label} ({items.length})
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Expanded Items */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {items.map((item, index) => (
              <Box key={index}>
                {renderExpandedItem ? renderExpandedItem(item, index) : renderItem(item, index)}
              </Box>
            ))}
          </Box>
          
          {/* Action in Popover */}
          {actionButton && (
            <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderTopColor: 'divider' }}>
              {actionButton}
            </Box>
          )}
        </Paper>
      </Popover>
    </>
  );
};

export default ProgressiveDisclosure;
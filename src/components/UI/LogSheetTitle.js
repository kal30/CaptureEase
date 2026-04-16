import React from 'react';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LogSheetTitle = ({
  title,
  titleBadge,
  subtitle,
  onClose,
  compactTitle = false,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 2,
      mb: { xs: 1.5, md: 1.75 },
    }}
  >
    <Box sx={{ pr: 1, minWidth: 0, flex: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          minWidth: 0,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: compactTitle ? 650 : 800,
            color: '#2f3440',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            fontSize: compactTitle ? { xs: '1.12rem', sm: '1.3rem' } : { xs: '1.7rem', sm: '2rem' },
            minWidth: 0,
          }}
        >
          {title}
        </Typography>
        {titleBadge ? (
          <Chip
            label={titleBadge}
            size="small"
            sx={{
              height: 26,
              borderRadius: '999px',
              bgcolor: '#eef2f7',
              color: '#4b5563',
              fontWeight: 600,
              fontSize: '0.64rem',
              border: '1px solid #dde3eb',
              '& .MuiChip-label': {
                px: 0.75,
              },
            }}
          />
        ) : null}
      </Box>
      {subtitle ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.6, fontSize: { xs: '0.98rem', sm: '1.03rem' } }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>

    {onClose ? (
      <IconButton
        onClick={onClose}
        sx={{
          flexShrink: 0,
          width: { xs: 34, sm: 38 },
          height: { xs: 34, sm: 38 },
          bgcolor: '#eef6f5',
          border: '1px solid #d4e7e4',
          '&:hover': { bgcolor: '#e3f0ee' },
        }}
      >
        <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#6aa7a0' }} />
      </IconButton>
    ) : null}
  </Box>
);

export default LogSheetTitle;

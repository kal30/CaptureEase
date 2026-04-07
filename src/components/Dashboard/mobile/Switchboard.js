import React from 'react';
import { Avatar, Box, Button, ButtonBase, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { getChildAccent } from '../shared/childAccent';
import colors from '../../../assets/theme/colors';

const Switchboard = ({ children = [], onSelectChild, onAddChild }) => (
  <Box
    sx={{
      minHeight: { xs: 'auto', md: 'calc(100vh - 120px)' },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      px: 2,
      py: 4,
    }}
  >
    <Box sx={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          fontSize: '1.9rem',
          color: colors.brand.navy,
          mb: 1,
        }}
      >
        Choose a Profile
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontSize: '1rem',
          mb: 4,
        }}
      >
        Select who you&apos;re logging for.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: { xs: 1.5, sm: 2 },
          mb: 4,
        }}
        >
        {children.map((child) => {
          const accent = getChildAccent(child.id);

          return (
            <ButtonBase
              key={child.id}
              onClick={() => onSelectChild(child.id)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.25,
                p: { xs: 1.75, sm: 2 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: accent.border,
                bgcolor: accent.surface,
                boxShadow: '0 10px 22px rgba(15, 23, 42, 0.04)',
                transition: 'box-shadow 0.18s ease, border-color 0.18s ease',
                '&:hover': {
                  boxShadow: '0 14px 28px rgba(15, 23, 42, 0.06)',
                },
                }}
              >
                <Avatar
                  src={child.profilePhoto}
                  alt={child.name}
                  sx={{
                  width: { xs: 64, sm: 78 },
                  height: { xs: 64, sm: 78 },
                  fontSize: '2rem',
                  fontWeight: 700,
                  bgcolor: accent.strong,
                  boxShadow: `0 0 0 5px ${accent.border}`,
                }}
              >
                {!child.profilePhoto && child.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.96rem', sm: '1rem' },
                  lineHeight: 1.2,
                  color: accent.text,
                  textAlign: 'center',
                }}
              >
                {child.name}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <Button
        fullWidth
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddChild}
        sx={{
          py: 1.3,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 700,
          bgcolor: colors.brand.ink,
          color: colors.brand.navy,
          '&:hover': {
            bgcolor: colors.brand.lightBlue,
          },
        }}
      >
        Add Child
      </Button>
    </Box>
  </Box>
);

export default Switchboard;

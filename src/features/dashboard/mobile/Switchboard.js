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
      px: { xs: 1.25, sm: 2 },
      py: { xs: 2.5, sm: 4 },
    }}
  >
    <Box
      sx={{
        width: '100%',
        maxWidth: 540,
        textAlign: 'center',
        background: `linear-gradient(180deg, ${colors.landing.surface} 0%, ${colors.landing.sageLight} 100%)`,
        border: `1px solid ${colors.landing.borderLight}`,
        borderRadius: { xs: 3, md: 4 },
        boxShadow: `0 14px 32px ${colors.landing.shadowSoft}`,
        px: { xs: 1.5, sm: 2.5, md: 3 },
        py: { xs: 2.5, sm: 3.25, md: 4 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1.55rem', sm: '1.8rem' },
          color: colors.landing.heroText,
          mb: 0.75,
          letterSpacing: '-0.03em',
        }}
      >
        Choose a Profile
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: colors.landing.bodyText,
          fontSize: { xs: '0.95rem', sm: '1rem' },
          lineHeight: 1.6,
          mb: { xs: 2.5, sm: 3.5 },
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
          gap: { xs: 1.2, sm: 1.75 },
          mb: { xs: 2.5, sm: 3.5 },
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
                gap: 1,
                p: { xs: 1.5, sm: 1.9 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: accent.border,
                bgcolor: accent.surface,
                boxShadow: `0 10px 22px ${colors.landing.shadowSoft}`,
                transition: 'box-shadow 0.18s ease, border-color 0.18s ease',
                '&:hover': {
                  boxShadow: `0 14px 28px ${colors.landing.shadowMedium}`,
                },
                }}
              >
                <Avatar
                  src={child.profilePhoto}
                  alt={child.name}
                  sx={{
                  width: { xs: 60, sm: 76 },
                  height: { xs: 60, sm: 76 },
                  fontSize: '2rem',
                  fontWeight: 700,
                  bgcolor: accent.strong,
                  boxShadow: `0 0 0 4px ${accent.border}`,
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
          py: 1.25,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 700,
          bgcolor: colors.brand.ink,
          color: colors.landing.heroText,
          boxShadow: `0 10px 24px ${colors.landing.shadowHero}`,
          '&:hover': {
            bgcolor: colors.brand.navy,
          },
        }}
      >
        Add a new person to track
      </Button>
    </Box>
  </Box>
);

export default Switchboard;

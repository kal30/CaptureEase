import React from 'react';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const RoleSelector = ({ role, setRole, roleOptions, loading }) => {
  const theme = useTheme();
  const { t } = useTranslation('invite');
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        👥 {t('teamRoleLabel')}
      </Typography>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
          {roleOptions.map((option) => (
            <Box key={option.value} sx={{ mb: 2 }}>
              <FormControlLabel
                value={option.value}
                control={<Radio />}
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 2,
                      border: `2px solid ${role === option.value ? option.color : alpha(theme.palette.divider, 0.3)}`,
                      borderRadius: 2,
                      bgcolor: role === option.value ? alpha(option.color, 0.05) : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: option.color, bgcolor: alpha(option.color, 0.02) },
                    }}
                  >
                    <Box sx={{ color: option.color }}>{option.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {option.label}
                        </Typography>
                        <Chip
                          label={option.badge}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: alpha(option.color, 0.15),
                            color: option.color,
                            border: `1px solid ${alpha(option.color, 0.3)}`,
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Box>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default RoleSelector;


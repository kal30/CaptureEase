import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const ScopeSelector = ({
  ownedChildren,
  inviteAllChildren,
  setInviteAllChildren,
  selectedChildIds,
  setSelectedChildIds,
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['invite', 'terms']);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        👨‍👩‍👧‍👦 {t('invite:addToCareTeamFor')}
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={inviteAllChildren}
            onChange={(e) => {
              setInviteAllChildren(e.target.checked);
              if (e.target.checked) setSelectedChildIds(new Set());
            }}
            sx={{
              color: theme.palette.primary.main,
              '&.Mui-checked': { color: theme.palette.primary.main },
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              {t('invite:allProfilesTitle')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('invite:giveAccessAll', {
                count: ownedChildren.length,
                profiles: t('terms:profile', { count: ownedChildren.length }),
              })}
            </Typography>
          </Box>
        }
        sx={{ mb: 2, alignItems: 'flex-start' }}
      />

      {!inviteAllChildren && (
        <Box sx={{ pl: 2, borderLeft: `3px solid ${alpha(theme.palette.divider, 0.3)}`, ml: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
            {t('invite:selectSpecificProfiles')}
          </Typography>
          {ownedChildren.map((child) => (
            <FormControlLabel
              key={child.id}
              control={
                <Checkbox
                  checked={selectedChildIds.has(child.id)}
                  onChange={(e) => {
                    const next = new Set(selectedChildIds);
                    if (e.target.checked) next.add(child.id);
                    else next.delete(child.id);
                    setSelectedChildIds(next);
                  }}
                  sx={{ color: 'success.main', '&.Mui-checked': { color: 'success.main' } }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {child.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('invite:age', { age: child.age })}
                  </Typography>
                </Box>
              }
              sx={{ mb: 1, alignItems: 'flex-start' }}
            />
          ))}

          {selectedChildIds.size > 0 && (
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 500, mt: 1, display: 'block' }}>
              {t('invite:selectedCount', {
                count: selectedChildIds.size,
                profiles: t('terms:profile', { count: selectedChildIds.size }),
              })}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ScopeSelector;


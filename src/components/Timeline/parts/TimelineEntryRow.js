import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { alpha } from '@mui/material/styles';

const buildContextSignals = (contextSignals = []) => {
  if (!Array.isArray(contextSignals)) {
    return [];
  }

  return contextSignals.filter((signal) => signal && signal.present);
};

const TimelineEntryRow = ({
  entryId,
  entryConfig = {},
  isLast = false,
  showActions = false,
  onEditEntry = null,
  onDeleteEntry = null,
  actionMenuDisabled = false,
  isEditing = false,
  editValue = '',
  onEditValueChange = null,
  onSaveEdit = null,
  onCancelEdit = null,
}) => {
  const {
    label = 'Log',
    icon = '•',
    time = null,
    headlineText = '',
    subheaderText = '',
    primaryText = '',
    insight = '',
    contextSignals = [],
    initials = '',
    accentColor = '#64748B',
    metaBadge = null,
    kind = 'generic',
  } = entryConfig;

  const [actionsAnchorEl, setActionsAnchorEl] = React.useState(null);
  const actionsOpen = Boolean(actionsAnchorEl);

  const visibleSignals = buildContextSignals(contextSignals);
  const hasInitials = Boolean(initials);
  const hasMetaBadge = Boolean(metaBadge);

  const renderMetaBadge = () => {
    if (!hasMetaBadge) {
      return null;
    }

    const badgeColor = metaBadge.color || accentColor;
    const badgeBg = metaBadge.bg || alpha(badgeColor, 0.12);
    const badgeText = metaBadge.textColor || badgeColor;

    return (
      <Chip
        label={metaBadge.label}
        size="small"
        sx={{
          height: 22,
          fontSize: '0.62rem',
          fontWeight: 800,
          bgcolor: badgeBg,
          color: badgeText,
          border: `1px solid ${alpha(badgeColor, 0.24)}`,
          maxWidth: 120,
        }}
      />
    );
  };

  return (
    <Box
      id={entryId ? `timeline-entry-${entryId}` : undefined}
      data-entry-id={entryId || undefined}
      role="listitem"
      aria-label={`${label}${time ? ` at ${time}` : ''}`}
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: { xs: 0.9, sm: 1 },
        px: { xs: 0.8, sm: 1.05 },
        py: { xs: 0.8, sm: 0.95 },
        mb: 0.1,
        backgroundColor: '#FFFFFF',
        borderBottom: isLast ? 'none' : '1px solid rgba(226, 232, 240, 0.95)',
        borderLeft: `3px solid ${accentColor}`,
        borderTop: `1px solid ${alpha(accentColor, 0.08)}`,
        borderRight: `1px solid ${alpha(accentColor, 0.08)}`,
        borderRadius: '18px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: 52, sm: 56 },
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.35,
          pt: 0.15,
          minHeight: 44,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2,
            transform: 'translateX(-50%)',
            bgcolor: alpha(accentColor, 0.2),
            borderRadius: 999,
          }}
        />
        {time ? (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.67rem', sm: '0.71rem' },
              fontWeight: 800,
              lineHeight: 1.05,
              whiteSpace: 'nowrap',
            }}
          >
            {time}
          </Typography>
        ) : null}
        <Box
          sx={{
            width: { xs: 24, sm: 26 },
            height: { xs: 24, sm: 26 },
            borderRadius: '9999px',
            border: '2px solid',
            borderColor: accentColor,
            color: accentColor,
            bgcolor: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { xs: '0.76rem', sm: '0.82rem' },
            lineHeight: 1,
            boxShadow: `0 1px 2px ${alpha(accentColor, 0.1)}`,
          }}
        >
          {icon}
        </Box>
      </Box>

      <Box sx={{ minWidth: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 0.45 }}>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={editValue}
            onChange={(event) => onEditValueChange?.(event.target.value)}
            placeholder="Edit note..."
            size="small"
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: '#FFFFFF',
                borderRadius: 2,
              },
            }}
          />
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  flexWrap: 'wrap',
                  minWidth: 0,
                }}
              >
                <Chip
                  label={label}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    bgcolor: alpha(accentColor, 0.12),
                    color: accentColor,
                    border: `1px solid ${alpha(accentColor, 0.18)}`,
                  }}
                />
                {headlineText ? (
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '0.9rem', sm: '0.96rem' },
                      lineHeight: 1.15,
                      color: '#0F172A',
                      minWidth: 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {headlineText}
                  </Typography>
                ) : null}
              </Box>

              <Stack
                direction="row"
                spacing={0.4}
                sx={{
                  flexShrink: 0,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >
                {renderMetaBadge()}
                {hasInitials ? (
                  <Chip
                    label={initials}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      bgcolor: '#FFFFFF',
                      color: 'text.secondary',
                      border: '1px solid',
                      borderColor: 'rgba(203, 213, 225, 0.95)',
                    }}
                  />
                ) : null}
                {showActions ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={(event) => setActionsAnchorEl(event.currentTarget)}
                      disabled={actionMenuDisabled || (!onEditEntry && !onDeleteEntry)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.75,
                        bgcolor: '#FFFFFF',
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'rgba(203, 213, 225, 0.95)',
                      }}
                      aria-label="Entry actions"
                    >
                      <MoreVertIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Menu
                      anchorEl={actionsAnchorEl}
                      open={actionsOpen}
                      onClose={() => setActionsAnchorEl(null)}
                      onClick={() => setActionsAnchorEl(null)}
                    >
                      <MenuItem onClick={onEditEntry} disabled={!onEditEntry || actionMenuDisabled}>
                        <EditIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={onDeleteEntry}
                        disabled={!onDeleteEntry || actionMenuDisabled}
                        sx={{ color: '#B42318' }}
                      >
                        <DeleteIcon sx={{ fontSize: 16, mr: 1 }} />
                        Delete
                      </MenuItem>
                    </Menu>
                  </>
                ) : null}
              </Stack>
            </Box>

            {subheaderText ? (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  lineHeight: 1.2,
                  fontWeight: 700,
                }}
              >
                {subheaderText}
              </Typography>
            ) : null}

            {primaryText ? (
              <Typography
                variant="body2"
                sx={{
                  color: '#0F172A',
                  fontSize: { xs: '0.88rem', sm: '0.92rem' },
                  lineHeight: 1.35,
                  fontWeight: 500,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                {primaryText}
              </Typography>
            ) : null}

            {kind === 'behavior' && insight ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  mt: 0.05,
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 0.5,
                  bgcolor: alpha('#FACC15', 0.16),
                  color: '#7C5C00',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: '0.63rem', sm: '0.66rem' },
                    lineHeight: 1.2,
                    fontStyle: 'italic',
                    color: '#7C5C00',
                  }}
                >
                  {insight}
                </Typography>
              </Box>
            ) : null}

            {kind === 'behavior' && visibleSignals.length > 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 0.55,
                  mt: 0.1,
                }}
              >
                {visibleSignals.map((signal) => (
                  <Box
                    key={`${signal.icon}-${signal.label}`}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.35,
                      px: 0.7,
                      py: 0.2,
                      borderRadius: 999,
                      bgcolor: alpha(accentColor, 0.08),
                      color: '#1F2937',
                      border: `1px solid ${alpha(accentColor, 0.16)}`,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.78rem', lineHeight: 1 }}>{signal.icon}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.62rem', sm: '0.65rem' },
                        lineHeight: 1,
                        fontStyle: 'italic',
                        fontWeight: 700,
                        color: '#374151',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {signal.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : null}
          </>
        )}
      </Box>

      {isEditing ? (
        <Stack direction="row" spacing={0.4} sx={{ flexShrink: 0, alignItems: 'flex-start', mt: 0.1 }}>
          <IconButton
            size="small"
            onClick={onSaveEdit}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.75,
              bgcolor: alpha('#059669', 0.1),
              color: '#059669',
              border: '1px solid',
              borderColor: alpha('#059669', 0.22),
            }}
            aria-label="Save edit"
          >
            <CheckIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={onCancelEdit}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.75,
              bgcolor: '#FFFFFF',
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
            }}
            aria-label="Cancel edit"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      ) : null}
    </Box>
  );
};

export default React.memo(TimelineEntryRow);

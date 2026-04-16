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

const formatDetailValue = (value) => {
  if (value == null) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean).join(' · ');
  }

  return String(value);
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
    subtype = '',
    primaryText = '',
    insight = '',
    triggerSummary = '',
    notesText = '',
    contextFlags = [],
    initials = '',
    accentColor = '#64748B',
    metaBadge = null,
    kind = 'generic',
    detailRows = [],
  } = entryConfig;

  const [actionsAnchorEl, setActionsAnchorEl] = React.useState(null);
  const actionsOpen = Boolean(actionsAnchorEl);
  const hasInitials = Boolean(initials);
  const hasMetaBadge = Boolean(metaBadge);
  const isMedicationRow = kind === 'meds';

  const renderMetaBadge = () => {
    if (!hasMetaBadge) {
      return null;
    }

    const badgeColor = metaBadge.color || accentColor;
    const badgeBg = metaBadge.bg || alpha(badgeColor, 0.12);
    const badgeText = metaBadge.textColor || badgeColor;
    const badgeBorder = metaBadge.border || alpha(badgeColor, 0.24);

    return (
      <Chip
        label={metaBadge.label}
        size="small"
        sx={{
          height: 24,
          fontSize: '0.62rem',
          fontWeight: 900,
          bgcolor: badgeBg,
          color: badgeText,
          border: `1px solid ${badgeBorder}`,
          maxWidth: 150,
        }}
      />
    );
  };

  const renderSubtype = () => {
    if (!subtype || subtype.trim().toLowerCase() === String(label).trim().toLowerCase()) {
      return null;
    }

    if (kind === 'activity') {
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 0.75,
            py: 0.2,
            borderRadius: 999,
            bgcolor: alpha(accentColor, 0.10),
            color: accentColor,
            border: `1px solid ${alpha(accentColor, 0.18)}`,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: '0.625rem',
            fontWeight: 800,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {subtype}
        </Box>
      );
    }

    return (
      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize: '0.68rem',
          lineHeight: 1.15,
          color: 'text.secondary',
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {subtype}
      </Typography>
    );
  };

  const renderDetailRows = () => {
    if (kind === 'behavior' || !detailRows.length) {
      return null;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.45,
        }}
      >
        {detailRows.map((detail, index) => (
          <Box
            key={`${detail.label || 'detail'}-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.64rem',
                lineHeight: 1.2,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'text.secondary',
              }}
            >
              {detail.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.76rem',
                lineHeight: 1.25,
                fontWeight: 700,
                color: '#0F172A',
              }}
            >
              {formatDetailValue(detail.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const renderBehaviorContextFlags = () => {
    if (kind !== 'behavior' || !contextFlags.length) {
      return null;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          mt: 0.4,
        }}
      >
        {contextFlags.map((signal) => (
          <Box
            key={`${signal.icon}-${signal.label}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.4,
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
                fontSize: '0.62rem',
                lineHeight: 1,
                fontStyle: 'italic',
                fontWeight: 800,
                color: '#374151',
                whiteSpace: 'nowrap',
              }}
            >
              {signal.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  const handleMenuOpen = (event) => {
    setActionsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setActionsAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    onEditEntry?.();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    onDeleteEntry?.();
  };

  return (
    <Box
      id={entryId ? `timeline-entry-${entryId}` : undefined}
      data-entry-id={entryId || undefined}
      role="listitem"
      aria-label={`${label}${time ? ` at ${time}` : ''}`}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.9, sm: 1.05 },
        pl: { xs: 1.5, sm: 1.75 },
        pr: { xs: 2, sm: 2.25 },
        py: { xs: 0.6, sm: 0.78 },
        mb: 0,
        backgroundColor: '#FFFFFF',
        borderBottom: isLast ? 'none' : '1px solid rgba(226, 232, 240, 0.95)',
        borderLeft: `2px solid ${accentColor}`,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          flex: '0 0 auto',
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: `2px solid ${accentColor}`,
          color: accentColor,
          bgcolor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.84rem',
          lineHeight: 1,
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.3,
          justifyContent: 'center',
        }}
      >
        {time ? (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.62rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
          >
            {time}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.55,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: isMedicationRow ? '0.84rem' : '0.88rem',
              fontWeight: 800,
              color: '#1F2937',
              lineHeight: 1.15,
            }}
          >
            {label}
          </Typography>
          {renderSubtype()}
          {hasInitials ? (
            <Chip
              label={initials}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.62rem',
                fontWeight: 800,
                bgcolor: '#FFFFFF',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'rgba(203, 213, 225, 0.95)',
              }}
            />
          ) : null}
        </Box>

        {/* Content area */}
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
              mt: 0.1,
              '& .MuiInputBase-root': {
                bgcolor: '#FFFFFF',
                borderRadius: 1.5,
              },
            }}
          />
        ) : (
          <>
            {primaryText ? (
              <Typography
                variant="body2"
                sx={{
                  color: '#475569',
                  fontSize: isMedicationRow ? '0.84rem' : '0.88rem',
                  lineHeight: 1.3,
                  fontWeight: isMedicationRow ? 700 : 600,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: isMedicationRow ? 1 : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {primaryText}
              </Typography>
            ) : null}

            {insight ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  px: 0.7,
                  py: 0.2,
                  borderRadius: 0.5,
                  bgcolor: alpha('#FACC15', 0.18),
                  color: '#7C5C00',
                  maxWidth: '100%',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.7rem',
                    lineHeight: 1.2,
                    fontStyle: 'italic',
                    color: '#94A3B8',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {insight}
                </Typography>
              </Box>
            ) : null}

            {kind === 'behavior' && triggerSummary ? (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: '#94A3B8',
                }}
              >
                Trigger: {triggerSummary}
              </Typography>
            ) : null}

            {/* Notes - show for all entry types if present */}
            {notesText ? (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  lineHeight: 1.2,
                  fontWeight: 700,
                  color: '#94A3B8',
                }}
              >
                {kind === 'behavior' ? 'Notes: ' : ''}{notesText}
              </Typography>
            ) : null}

            {/* Detail rows and context flags */}
            {!isEditing ? (
              <Box
                sx={{
                  mt: 0.15,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.45,
                }}
              >
                {kind === 'behavior' ? renderBehaviorContextFlags() : null}
                {renderDetailRows()}
              </Box>
            ) : null}
          </>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={0.5}
          sx={{
            flex: '0 0 auto',
            alignItems: 'center',
            justifyContent: 'flex-end',
            minWidth: 0,
            ml: 0.75,
          }}
      >
        {renderMetaBadge()}
        {showActions ? (
          <>
            <IconButton
              size="medium"
              onClick={handleMenuOpen}
              disabled={actionMenuDisabled || (!onEditEntry && !onDeleteEntry)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.2,
                bgcolor: 'transparent',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'transparent',
                flexShrink: 0,
                boxShadow: 'none',
                '& .MuiSvgIcon-root': {
                  fontSize: 18,
                },
                '&:hover': {
                  bgcolor: alpha('#64748B', 0.06),
                  borderColor: alpha('#64748B', 0.10),
                },
              }}
              aria-label="Entry actions"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={actionsAnchorEl}
              open={actionsOpen}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
            >
              <MenuItem onClick={handleEditClick} disabled={!onEditEntry || actionMenuDisabled}>
                <EditIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                Edit
              </MenuItem>
              <MenuItem
                onClick={handleDeleteClick}
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

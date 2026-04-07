import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  IconButton,
  MenuItem,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  ForumOutlined as ForumOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  MedicalServicesOutlined as MedicalServicesOutlinedIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
  FileUpload as FileUploadOutlinedIcon,
  SwitchAccount as SwitchAccountIcon,
} from '@mui/icons-material';
import TimelineWidget from '../../UI/TimelineWidget';
import CareTeamDisplay from '../../UI/CareTeamDisplay';
import ChildManagementMenu from '../ChildManagementMenu';
import { getChildAccent } from '../shared/childAccent';
import { getChildCareTeam } from '../../../services/childAccessService';
import { getTrackLogTypes } from '../../../constants/logTypeRegistry';
import colors from '../../../assets/theme/colors';
import { useRole } from '../../../contexts/RoleContext';
import { trackRenderDebug, useMountDebug } from '../../../utils/renderDebug';

const getAllergyNames = (allergies = []) =>
  allergies
    .map((allergy) => {
      if (typeof allergy === 'string') return allergy;
      return allergy?.name || allergy?.label || '';
    })
    .filter(Boolean);

const getDisplayText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(getDisplayText).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    return (
      value.label ||
      value.name ||
      value.title ||
      value.value ||
      value.diagnosis ||
      ''
    );
  }
  return '';
};

const getSupportArea = (child) =>
  getDisplayText(child?.diagnosis) ||
  getDisplayText(child?.concerns?.[0]) ||
  getDisplayText(child?.conditions?.[0]) ||
  '';

const ChildDashboard = ({
  child,
  children = [],
  groupType = 'own',
  quickDataStatus = {},
  allEntries = {},
  recentEntries = {},
  timelineSummary = {},
  incidents = {},
  pauseScrollCollapse = false,
  onQuickEntry,
  onEditChild,
  onInviteTeamMember,
  onDailyReport,
  onTrack,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenMedicalLog,
  onMessages,
  onImportLogs,
  onBack,
  onSwitchChild,
  onAddChildClick,
}) => {
  const [switcherAnchor, setSwitcherAnchor] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isActionPanelOpen, setIsActionPanelOpen] = useState(true);
  const [careTeamCount, setCareTeamCount] = useState(null);
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('md'));
  const { getUserRoleForChild, canAddDataForChild } = useRole();

  useMountDebug('ChildDashboard');
  trackRenderDebug('ChildDashboard', {
    childId: child?.id || 'none',
    switcherOpen: Boolean(switcherAnchor),
    childCount: children.length,
  });

  const accent = getChildAccent(child?.id);
  const otherChildren = useMemo(
    () => children.filter((item) => item.id !== child?.id),
    [children, child?.id]
  );

  useEffect(() => {
    if (!isMobileViewport || pauseScrollCollapse || typeof window === 'undefined') {
      setIsCollapsed(false);
      return undefined;
    }

    // Keep the hero expanded by default to avoid scroll-driven reflow/jitter.
    setIsCollapsed(false);
    return undefined;
  }, [isMobileViewport, pauseScrollCollapse]);

  useEffect(() => {
    let isMounted = true;

    if (!child?.id || !onMessages) {
      setCareTeamCount(null);
      return undefined;
    }

    const loadCareTeamCount = async () => {
      try {
        const members = await getChildCareTeam(child.id);
        if (isMounted) {
          setCareTeamCount(Array.isArray(members) ? members.length : 0);
        }
      } catch (error) {
        if (isMounted) {
          setCareTeamCount(0);
        }
      }
    };

    loadCareTeamCount();

    return () => {
      isMounted = false;
    };
  }, [child?.id, onMessages]);

  if (!child) {
    return null;
  }

  const allergies = getAllergyNames(child.medicalProfile?.foodAllergies);
  const supportArea = getSupportArea(child);
  const hasSupportArea = Boolean(supportArea);
  const streak = timelineSummary[child.id]?.activityStreak || timelineSummary.activityStreak || 0;
  const childEntries = allEntries[child.id] || recentEntries[child.id] || [];
  const childIncidents = incidents[child.id] || [];
  const childStatus = quickDataStatus[child.id] || {};
  const userRole = getUserRoleForChild?.(child.id) || null;
  const canAddData = canAddDataForChild?.(child.id) ?? false;
  const switcherWidth = switcherAnchor?.clientWidth || 220;
  const trackItems = getTrackLogTypes().map((item) => ({
    key: item.category,
    label: item.trackLabel,
    emoji: item.icon,
    palette: item.palette,
    action: item.category === 'medication' ? 'medical' : item.category,
  }));

  const handleRevealDashboard = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.scrollTo(0, 0);
  };

  return (
    <Box sx={{ px: { xs: 1.05, sm: 1.5 }, pb: 13 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.1,
          pt: 0.25,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={(event) => {
            onBack?.();
          }}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            minHeight: 40,
            px: 0,
            borderRadius: 0,
            minWidth: 'unset',
            color: accent.strong,
            fontSize: '0.88rem',
            fontWeight: 800,
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          Profiles
        </Button>

        <Button
          startIcon={<SwitchAccountIcon />}
          endIcon={<KeyboardArrowDownIcon />}
          onClick={(event) => {
            if (otherChildren.length > 0 || onAddChildClick) {
              setSwitcherAnchor(event.currentTarget);
            }
          }}
          sx={{
            minHeight: 40,
            px: 1.2,
            borderRadius: 0.35,
            border: '1px solid rgba(16, 185, 129, 0.18)',
            backgroundColor: 'rgba(236, 253, 245, 0.7)',
            color: 'text.primary',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'none',
            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.04)',
            '& .MuiButton-startIcon': {
              mr: 0.45,
              color: accent.strong,
            },
            '& .MuiButton-endIcon': {
              ml: 0.25,
              color: accent.strong,
            },
            '&:hover': {
              backgroundColor: 'rgba(236, 253, 245, 0.9)',
            },
          }}
        >
          Switch
        </Button>
      </Box>

      <Box
        className={`mobile-dashboard-hero${isCollapsed ? ' is-collapsed' : ''}`}
        sx={{
          position: 'relative',
          p: isCollapsed ? 1 : { xs: 1.2, sm: 1.75 },
          borderRadius: isCollapsed ? 0 : 1,
          background: isCollapsed
            ? colors.landing.surface
            : `linear-gradient(180deg, ${colors.landing.surface} 0%, ${colors.landing.sageLight} 100%)`,
          border: `1px solid ${colors.landing.borderLight}`,
          boxShadow: isCollapsed ? `0 4px 14px ${colors.landing.shadowSoft}` : `0 12px 24px ${colors.landing.shadowHero}`,
          mb: 1.2,
          overflow: 'hidden',
        }}
      >
        <Stack
          spacing={isCollapsed ? 0.45 : 1.05}
          alignItems={isCollapsed ? 'flex-start' : 'center'}
          sx={{
            textAlign: isCollapsed ? 'left' : 'center',
          }}
        >
          <Avatar
            src={child.profilePhoto}
            alt={child.name}
            onClick={isCollapsed ? handleRevealDashboard : undefined}
              sx={{
                width: isCollapsed ? 40 : 92,
                height: isCollapsed ? 40 : 92,
                borderRadius: isCollapsed ? '14px' : '26px',
                boxShadow: `0 10px 22px ${colors.landing.shadowSoft}`,
                bgcolor: accent.strong,
                color: '#fff',
              fontSize: isCollapsed ? '1.05rem' : '2.1rem',
              fontWeight: 800,
              cursor: isCollapsed ? 'pointer' : 'default',
              alignSelf: isCollapsed ? 'flex-start' : 'center',
              ml: isCollapsed ? 0 : 'auto',
              mr: isCollapsed ? 0 : 'auto',
            }}
          >
            {!child.profilePhoto && child.name?.[0]?.toUpperCase()}
          </Avatar>

          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'flex-start' : 'center',
                gap: isCollapsed ? 0.25 : 0.35,
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              <Typography
                sx={{
                  fontSize: isCollapsed ? '0.98rem' : '1.28rem',
                  fontWeight: 800,
                  color: colors.landing.heroText,
                  lineHeight: 1.15,
                }}
              >
                {child.name}
              </Typography>
              <ChildManagementMenu
                child={child}
                userRole={userRole}
                canAddData={canAddData}
                onEditChild={onEditChild}
                onDeleteChild={undefined}
                onInviteTeamMember={onInviteTeamMember}
                onDailyReport={onDailyReport}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: isCollapsed ? 'none' : 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 0.6,
              width: '100%',
            }}
          >
            <Chip
              icon={<WarningAmberRoundedIcon sx={{ fontSize: 16, color: `${colors.brand.deep} !important` }} />}
              label={allergies.length > 0 ? `${allergies.join(', ')} allergy` : 'No allergies listed'}
              sx={{
                height: 30,
                borderRadius: 0.35,
                backgroundColor: colors.landing.panelSoft,
                color: colors.brand.deep,
                border: `1px solid ${colors.landing.borderLight}`,
                fontWeight: 700,
                '& .MuiChip-label': { px: 1.05, fontSize: '0.76rem' },
              }}
            />

            {hasSupportArea ? (
              <Chip
                icon={<MedicalServicesOutlinedIcon sx={{ fontSize: 16 }} />}
                label={`Support area: ${supportArea}`}
                sx={{
                  height: 30,
                  borderRadius: 0.35,
                  backgroundColor: colors.landing.panelSoft,
                  color: colors.brand.deep,
                  border: `1px solid ${colors.landing.borderLight}`,
                  fontWeight: 700,
                  '& .MuiChip-label': { px: 1.05, fontSize: '0.76rem' },
                }}
              />
            ) : null}
          </Box>

          <Box
            sx={{
              display: isCollapsed ? 'none' : 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            <CareTeamDisplay
              child={child}
              userRole={userRole}
              onInviteTeamMember={onInviteTeamMember}
              maxVisible={1}
              compactMobile={true}
              sx={{ mt: 0, p: 0, minWidth: 0, justifyContent: 'center' }}
            />

            {onMessages ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ForumOutlinedIcon sx={{ fontSize: 17 }} />}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (careTeamCount === 0) return;
                    onMessages?.(child);
                  }}
                  disabled={careTeamCount === 0}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 1.15,
                    py: 0.5,
                    minHeight: 34,
                    whiteSpace: 'nowrap',
                    color: careTeamCount === 0 ? 'text.disabled' : accent.strong,
                    borderColor: careTeamCount === 0 ? colors.landing.borderLight : colors.landing.borderFocus,
                    backgroundColor: careTeamCount === 0 ? colors.landing.surface : colors.landing.surface,
                    '& .MuiButton-startIcon': {
                      color: careTeamCount === 0 ? 'text.disabled' : accent.strong,
                      mr: 0.45,
                    },
                    '&:hover': {
                      backgroundColor: careTeamCount === 0 ? colors.landing.surface : colors.landing.sageLight,
                    },
                  }}
                  aria-label={careTeamCount === 0 ? 'No care team yet' : 'Open child chat'}
                >
                  Start Chat
                </Button>

                {careTeamCount === 0 ? (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    No care team yet
                  </Typography>
                ) : null}
              </>
            ) : null}
          </Box>

          <Box
            sx={{
              display: isCollapsed ? 'flex' : 'none',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              mt: 0.25,
              mb: -0.25,
            }}
          >
            <IconButton
              size="small"
              onClick={handleRevealDashboard}
              sx={{
                width: 26,
                height: 26,
                border: `1px solid ${colors.landing.borderLight}`,
                backgroundColor: colors.landing.surface,
                color: colors.landing.bodyText,
                boxShadow: `0 4px 10px ${colors.landing.shadowSoft}`,
                '&:hover': {
                  backgroundColor: colors.landing.sageLight,
                },
              }}
            >
              <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {!isCollapsed ? (
            <Box
              sx={{
                width: '100%',
                mt: 0.5,
                p: { xs: 0.85, sm: 1 },
                borderRadius: 1,
                backgroundColor: colors.landing.surface,
                border: `1px solid ${colors.landing.borderLight}`,
                boxShadow: `0 6px 14px ${colors.landing.shadowSoft}`,
              }}
            >
              <Box
                sx={{
                  height: 0,
                  mb: isActionPanelOpen ? 0.75 : 0,
                  cursor: 'pointer',
                }}
                onClick={() => setIsActionPanelOpen((value) => !value)}
              />

              {isActionPanelOpen ? (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{
                      width: '100%',
                      px: { xs: 0.5, sm: 0.65 },
                      py: 0.55,
                      borderRadius: 1,
                      backgroundColor: colors.landing.surface,
                      border: `1px solid ${colors.landing.borderLight}`,
                      boxShadow: `0 6px 14px ${colors.landing.shadowSoft}`,
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 0.6,
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                    }}
                  >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1,
                        bgcolor: colors.landing.panelSoft,
                        border: `1px solid ${colors.landing.borderLight}`,
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AutoAwesomeOutlinedIcon sx={{ fontSize: 15, color: colors.brand.deep }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: colors.landing.heroText, lineHeight: 1.05 }}>
                        Prep for Therapy
                      </Typography>
                      <Typography sx={{ fontSize: '0.66rem', color: colors.landing.bodyText, mt: 0.1, lineHeight: 1.15 }}>
                        Review patterns and key moments before your session.
                      </Typography>
                    </Box>
                  </Box>

                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDailyReport?.(child);
                      }}
                    sx={{
                      minWidth: 62,
                      minHeight: 32,
                      borderRadius: 1,
                      px: 1.05,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      color: colors.landing.heroText,
                      background: `linear-gradient(135deg, ${colors.brand.ink} 0%, ${colors.brand.navy} 100%)`,
                      boxShadow: `0 8px 18px ${colors.landing.shadowHero}`,
                      justifySelf: 'end',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${colors.brand.navy} 0%, ${colors.brand.deep} 100%)`,
                      },
                    }}
                  >
                      Start
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: { xs: 0.55, sm: 0.75 },
                    }}
                  >
                  <Button
                    variant="contained"
                    onClick={(e) => onQuickEntry(child, 'quick_note', e)}
                    sx={{
                      minHeight: 92,
                      borderRadius: 1.1,
                      textTransform: 'none',
                      fontWeight: 800,
                      color: colors.landing.heroText,
                      background: `linear-gradient(180deg, ${colors.landing.surface} 0%, ${colors.landing.sageLight} 100%)`,
                      border: `1px solid ${colors.landing.borderLight}`,
                        boxShadow: `0 10px 22px ${colors.landing.shadowSoft}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.35,
                        justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      pb: 1.8,
                      '&:hover': {
                        background: `linear-gradient(180deg, ${colors.landing.sageLight} 0%, ${colors.landing.panelSoft} 100%)`,
                      },
                    }}
                  >
                    <Box sx={{ fontSize: '1.9rem', lineHeight: 1, mb: 0.05 }}>＋</Box>
                    <Box sx={{ fontSize: '0.98rem', lineHeight: 1.05 }}>Log Entry</Box>
                    {streak > 0 ? (
                      <Box
                        sx={{
                          position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 10,
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                          color: colors.landing.textMuted,
                          lineHeight: 1.1,
                        }}
                      >
                        🔥 {streak} day streak
                      </Box>
                    ) : null}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImportLogs?.(child);
                    }}
                    sx={{
                      minHeight: 92,
                      borderRadius: 1.1,
                      textTransform: 'none',
                      fontWeight: 800,
                      color: colors.landing.heroText,
                      backgroundColor: colors.landing.surface,
                      borderColor: colors.landing.borderLight,
                      boxShadow: `0 10px 22px ${colors.landing.shadowSoft}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.45,
                      '&:hover': {
                        backgroundColor: colors.landing.sageLight,
                        borderColor: colors.landing.borderMedium,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${colors.landing.borderLight}`,
                        backgroundColor: colors.landing.panelSoft,
                        color: colors.landing.bodyText,
                      }}
                    >
                      <FileUploadOutlinedIcon sx={{ fontSize: 17 }} />
                    </Box>
                    <Box sx={{ fontSize: '0.98rem', lineHeight: 1.05 }}>Import</Box>
                    <Box sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary' }}>
                      .xlsx or .docx
                    </Box>
                  </Button>
                  </Box>

                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.35,
                    }}
                  >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: '100%',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      '&::-webkit-scrollbar': {
                        display: 'none',
                      },
                      pb: 0.2,
                      pr: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        width: 'max-content',
                        maxWidth: 'none',
                        alignItems: 'center',
                        gap: 0.35,
                        bgcolor: 'rgba(248, 250, 252, 0.72)',
                        borderRadius: 1.25,
                        px: 0.35,
                        py: 0.65,
                        boxSizing: 'border-box',
                      }}
                    >
                      {trackItems.map((item) => (
                        <Button
                          key={item.key}
                          variant="outlined"
                          onClick={(e) => {
                          e.stopPropagation();
                          if (item.action === 'medical') {
                            onOpenMedicalLog?.(child);
                            return;
                          }
                          if (item.key === 'sleep') {
                            onOpenSleepLog?.(child);
                            return;
                          }
                          if (item.key === 'food') {
                            onOpenFoodLog?.(child);
                            return;
                          }
                          onTrack?.(child, item.key);
                          }}
                          sx={{
                            minHeight: 54,
                            height: 54,
                            flex: '0 0 auto',
                            minWidth: 154,
                            width: 'auto',
                            px: 2.05,
                            borderRadius: 0.55,
                            textTransform: 'none',
                            fontWeight: 900,
                            fontSize: '0.86rem',
                            color: item.palette?.text || 'text.primary',
                            backgroundColor: item.palette?.bg || 'rgba(255,255,255,0.96)',
                            borderColor: item.palette?.border || 'rgba(100, 116, 139, 0.12)',
                            boxShadow: 'none',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            backdropFilter: 'blur(6px)',
                            letterSpacing: '0.005em',
                            '&:hover': {
                              backgroundColor: item.palette?.bg || 'rgba(255,255,255,1)',
                              borderColor: item.palette?.border || 'rgba(100, 116, 139, 0.22)',
                              boxShadow: 'none',
                            },
                          }}
                          >
                          <Box component="span" sx={{ mr: 0.45, fontSize: '1.05rem', lineHeight: 1 }}>
                            {item.emoji}
                          </Box>
                          <Box component="span" sx={{ fontWeight: 900 }}>
                            {item.label}
                          </Box>
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Box>
                </Box>
              ) : null}
            </Box>
          ) : null}
        </Stack>
      </Box>

      <TimelineWidget
        child={child}
        entries={childEntries}
        incidents={childIncidents}
        dailyCareStatus={childStatus}
        onQuickEntry={(_child, type, event) => onQuickEntry(child, type, event)}
        defaultExpanded={true}
        expanded={true}
        variant="full"
        showUnifiedLog={true}
        forceMobileLayout={true}
      />

      <Popper
        open={Boolean(switcherAnchor)}
        anchorEl={switcherAnchor}
        placement="bottom-end"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 4],
            },
          },
        ]}
        sx={{ zIndex: 1400 }}
      >
        <ClickAwayListener onClickAway={() => setSwitcherAnchor(null)}>
          <Paper
            elevation={8}
            sx={{
              mt: 0,
              borderRadius: 0.5,
              minWidth: Math.max(switcherWidth, 280),
              maxWidth: 320,
              overflow: 'hidden',
            }}
          >
            {otherChildren.map((option) => (
              <MenuItem
                key={option.id}
                onClick={() => {
                  onSwitchChild(option.id);
                  setSwitcherAnchor(null);
                }}
                sx={{ gap: 1, py: 1.05 }}
              >
                <Avatar
                  src={option.profilePhoto}
                  alt={option.name}
                  sx={{ width: 30, height: 30, fontSize: '0.9rem', bgcolor: getChildAccent(option.id).strong }}
                >
                  {!option.profilePhoto && option.name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {option.name}
                </Typography>
              </MenuItem>
            ))}
            {onAddChildClick ? (
              <MenuItem
                onClick={() => {
                  setSwitcherAnchor(null);
                  onAddChildClick();
                }}
                sx={{ gap: 1, py: 1.05 }}
              >
                <Avatar sx={{ width: 30, height: 30, bgcolor: accent.strong }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>Add Child</Typography>
              </MenuItem>
            ) : null}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default ChildDashboard;

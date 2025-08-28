import React from 'react';
import {
  Box,
  Card,
  Avatar,
  Typography,
  Chip,
  Button,
  IconButton,
  Badge,
  Collapse,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useRole } from '../../contexts/RoleContext';
import ActionGroup from './ActionGroup';
import RoleIndicator from '../UI/RoleIndicator';
import ChildManagementMenu from './ChildManagementMenu';
import MedicalInfoRow from './ChildCard/MedicalInfoRow'; // Corrected Import
import QuickEntrySection from './QuickEntrySection';
import { TimelineWidget } from '../UI';

const ChildCard = ({
  child,
  groupType,
  status = {},
  recentEntries = [],
  isExpanded,
  onToggleExpanded,
  onQuickEntry,
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onDailyReport,
  getActionGroups,
  handleGroupActionClick,
  highlightedActions = {},
  expandedCategories = {},
  setExpandedCategories,
  getTypeConfig,
  formatTimeAgo,
}) => {
  const theme = useTheme();
  const {
    getUserRoleForChild,
    canAddDataForChild,
    USER_ROLES,
  } = useRole();

  const completedToday = status.mood && status.sleep;
  const userRole = getUserRoleForChild ? getUserRoleForChild(child.id) : null;
  const canAddData = canAddDataForChild ? canAddDataForChild(child.id) : true;
  
  // Hover state for Quick Entry ↔ Daily Care highlighting
  const [hoveredQuickAction, setHoveredQuickAction] = React.useState(null);

  // Group-specific styling
  const getGroupStyling = () => {
    switch (groupType) {
      case "own":
        return {
          borderColor: alpha(theme.palette.primary.main, 0.4),
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
          hoverShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
        };
      case "family":
        return {
          borderColor: alpha(theme.palette.calendar.accent, 0.4),
          backgroundColor: alpha(theme.palette.calendar.accent, 0.03),
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.calendar.accent, 0.12)} 0%, ${alpha(theme.palette.calendar.accent, 0.06)} 100%)`,
          hoverShadow: `0 8px 32px ${alpha(theme.palette.calendar.accent, 0.15)}`,
        };
      case "professional":
        return {
          borderColor: alpha(theme.palette.tertiary.dark, 0.3),
          backgroundColor: alpha(theme.palette.tertiary.dark, 0.02),
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.tertiary.dark, 0.08)} 0%, ${alpha(theme.palette.tertiary.dark, 0.04)} 100%)`,
          hoverShadow: `0 8px 32px ${alpha(theme.palette.tertiary.dark, 0.1)}`,
        };
      default:
        return {
          borderColor: theme.palette.divider,
          backgroundColor: "background.paper",
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          hoverShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
        };
    }
  };

  const groupStyle = getGroupStyling();

  const isActionHighlighted = (childId, actionKey) => {
    return highlightedActions[`${childId}-${actionKey}`] || false;
  };

  const isCategoryExpanded = (childId, category) => {
    return expandedCategories[`${childId}-${category}`] || false;
  };

  // Quick Entry hover handlers
  const handleQuickActionHover = (actionKey, childId) => {
    setHoveredQuickAction(actionKey);
  };

  const handleQuickActionLeave = (childId) => {
    setHoveredQuickAction(null);
  };

  // Daily Care action hover handlers (reverse direction)
  const handleDailyCareActionHover = (actionKey, childId) => {
    setHoveredQuickAction(actionKey);
  };

  const handleDailyCareActionLeave = (childId) => {
    setHoveredQuickAction(null);
  };

  // Enhanced highlighted actions that includes hover state
  const enhancedHighlightedActions = React.useMemo(() => {
    const enhanced = { ...highlightedActions };
    
    // Add hover highlighting for Daily Care actions
    // ActionGroup expects just the action key, not childId-actionKey
    if (hoveredQuickAction) {
      enhanced[hoveredQuickAction] = true;
    }
    
    return enhanced;
  }, [highlightedActions, hoveredQuickAction]);

  return (
    <Card
      key={child.id}
      elevation={0}
      onClick={(e) => {
        e.stopPropagation();
        onToggleExpanded();
      }}
      sx={{
        // ELEGANT ROLE-BASED STYLING
        border:
          userRole === "therapist"
            ? "1px solid #E3F2FD"
            : userRole === "caregiver"
              ? "1px solid #FFF3E0"
              : userRole && userRole.includes("parent")
                ? "1px solid #E8F5E8"
                : "1px solid #f0f0f0",
        borderLeft:
          userRole === "therapist"
            ? "6px solid #1976D2"
            : userRole === "caregiver"
              ? "6px solid #F57C00"
              : userRole && userRole.includes("parent")
                ? "6px solid #388E3C"
                : "4px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor:
          userRole === "therapist"
            ? "#FAFCFF"
            : userRole === "caregiver"
              ? "#FFFDF9"
              : userRole && userRole.includes("parent")
                ? "#FAFFFE"
                : "#fafafa",
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative",
        boxShadow:
          userRole === "therapist"
            ? "0 2px 8px rgba(25,118,210,0.08)"
            : userRole === "caregiver"
              ? "0 2px 8px rgba(245,124,0,0.08)"
              : userRole && userRole.includes("parent")
                ? "0 2px 8px rgba(56,142,60,0.08)"
                : "0 1px 3px rgba(0,0,0,0.05)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            userRole === "therapist"
              ? "0 4px 16px rgba(25,118,210,0.15)"
              : userRole === "caregiver"
                ? "0 4px 16px rgba(245,124,0,0.15)"
                : userRole && userRole.includes("parent")
                  ? "0 4px 16px rgba(56,142,60,0.15)"
                  : "0 2px 8px rgba(0,0,0,0.1)",
          borderColor:
            userRole === "therapist"
              ? "#BBDEFB"
              : userRole === "caregiver"
                ? "#FFCC80"
                : userRole && userRole.includes("parent")
                  ? "#C8E6C9"
                  : "#ddd",
        },
      }}
    >
      {/* ROLE INDICATOR */}
      <RoleIndicator 
        role={userRole === "therapist" ? "therapist" 
            : userRole === "caregiver" ? "caregiver"
            : userRole && userRole.includes("parent") ? "primary_parent"
            : "unknown"} 
        variant="header" 
        childName={child.name} 
      />

      {/* Responsive Layout */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          background: completedToday
            ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
            : groupStyle.headerGradient,
          position: "relative",
          cursor: "pointer",
          flexWrap: { xs: "wrap", md: "nowrap" },
          gap: { xs: 1, md: 0 },
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          },
        }}
      >

        {/* Left: Avatar & Basic Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            minWidth: 0,
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Badge
            badgeContent={recentEntries.length}
            color="primary"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "1.1rem",
                minWidth: "16px",
                height: "16px",
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: completedToday
                  ? theme.palette.success.main
                  : theme.palette.primary.main,
                width: 40,
                height: 40,
                fontSize: "1.2rem",
                fontWeight: 700,
                borderRadius: 1,
              }}
            >
              {child.name[0]}
            </Avatar>
          </Badge>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, fontSize: "1.4rem" }}
              >
                {child.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "1.2rem" }}
              >
                Age {child.age}
              </Typography>
              
              {/* Child Management Menu Component */}
              <ChildManagementMenu
                child={child}
                userRole={userRole}
                onEditChild={onEditChild}
                onInviteTeamMember={onInviteTeamMember}
                onDeleteChild={onDeleteChild}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Role Badge - Compact */}
              {userRole && (
                <Chip
                  label={(() => {
                    switch (userRole) {
                      case USER_ROLES.PRIMARY_PARENT:
                        return "👑 Primary Parent";
                      case USER_ROLES.CO_PARENT:
                        return "👨‍👩‍👧‍👦 Co-Parent";
                      case USER_ROLES.FAMILY_MEMBER:
                        return "👵 Family";
                      case USER_ROLES.CAREGIVER:
                        return "🤱 Caregiver";
                      case USER_ROLES.THERAPIST:
                        return "👩‍⚕️ Therapist";
                      default:
                        return userRole;
                    }
                  })()}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.95rem",
                    bgcolor:
                      userRole === USER_ROLES.PRIMARY_PARENT
                        ? alpha(theme.palette.primary.main, 0.2)
                        : userRole === USER_ROLES.CO_PARENT
                          ? alpha(theme.palette.primary.main, 0.15)
                          : userRole === USER_ROLES.THERAPIST
                            ? alpha("#FF6B6B", 0.15)
                            : alpha("#10B981", 0.15),
                    color:
                      userRole === USER_ROLES.PRIMARY_PARENT
                        ? theme.palette.primary.main
                        : userRole === USER_ROLES.CO_PARENT
                          ? theme.palette.primary.main
                          : userRole === USER_ROLES.THERAPIST
                            ? "#FF6B6B"
                            : "#10B981",
                    fontWeight: 600,
                  }}
                />
              )}

              {/* Care Team Count */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <HospitalIcon sx={{ color: theme.palette.secondary.main, fontSize: 14 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "1.05rem",
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {(() => {
                    const coParents = child.users?.co_parents?.length || 0;
                    const family = child.users?.family_members?.length || 0;
                    const caregivers = child.users?.caregivers?.length || 0;
                    const therapists = child.users?.therapists?.length || 0;
                    const totalMembers = coParents + family + caregivers + therapists;
                    return `${totalMembers} team`;
                  })()}
                </Typography>
              </Box>

            </Box>
          </Box>
        </Box>

        {/* Quick Entry Section with Daily Report */}
        <QuickEntrySection
          child={child}
          status={status}
          userRole={userRole}
          completedToday={completedToday}
          onQuickEntry={onQuickEntry}
          onDailyReport={onDailyReport}
          onHoverAction={handleQuickActionHover}
          onLeaveAction={handleQuickActionLeave}
          externalHoveredAction={hoveredQuickAction}
        />

        {/* Right: Progress & Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            alignSelf: "stretch",
            pt: { xs: 0, md: 1.5 },
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "center", md: "flex-end" },
            order: { xs: 2, md: 0 }
          }}
        >
          {/* Action Buttons */}
          <Box
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: 1, 
              mt: { xs: 0, md: 0.5 },
              width: { xs: "100%", md: "auto" }
            }}
          >
            {userRole === USER_ROLES.THERAPIST ? (
              // Professional tools for therapists
              <>
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card expansion
                    // TODO: Navigate to analytics/insights page
                    console.log("View Analytics for child:", child.id);
                  }}
                  sx={{
                    py: 0.5,
                    px: 1.5,
                    fontSize: "1.2rem",
                    minWidth: "auto",
                    borderRadius: 1,
                    background:
                      "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
                    color: "white",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #64748B 0%, #475569 100%)",
                    },
                  }}
                >
                  📊 Analytics
                </Button>
              </>
            ) : (
              // No additional buttons for other roles since Daily Report is now in top-right corner
              null
            )}
          </Box>
        </Box>
      </Box>

      {/* Medical Info Row */}
      <MedicalInfoRow
        diagnosis={child.diagnosis}
        allergies={child.medicalProfile?.foodAllergies}
        groupType={groupType}
      />

      {/* Expandable Content */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >

          {/* Care Team Details */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
            >
              <HospitalIcon sx={{ color: theme.palette.secondary.main, fontSize: 16 }} />
              <Typography
                variant="body2"
                sx={{ fontSize: "0.8rem", fontWeight: 600, color: theme.palette.secondary.main }}
              >
                Care Team
              </Typography>
              {/* Only show + button for parents */}
              {(userRole === "primary_parent" ||
                userRole === "co_parent") && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInviteTeamMember(child.id);
                  }}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 1,
                    bgcolor: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: 12, color: "white" }} />
                </IconButton>
              )}
            </Box>

            {/* Team members display */}
            {(() => {
              const members = [
                ...(child.users?.co_parents?.map((parent) => ({
                  ...parent,
                  role: "Co-Parent",
                })) || []),
                ...(child.users?.family_members?.map((member) => ({
                  ...member,
                  role: "Family Member",
                })) || []),
                ...(child.users?.caregivers?.map((caregiver) => ({
                  ...caregiver,
                  role: "Caregiver",
                })) || []),
                ...(child.users?.therapists?.map((therapist) => ({
                  ...therapist,
                  role: "Therapist",
                })) || []),
              ];
              return (
                members.length > 0 && (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.8rem",
                        color: theme.palette.text.secondary,
                        mb: 1,
                        pl: 2,
                      }}
                    >
                      Team Members ({members.length})
                    </Typography>
                    {members.slice(0, 3).map((member, index) => {
                      const roleColor =
                        member.role === "Therapist"
                          ? "#FF6B6B"
                          : member.role === "Caregiver"
                            ? "#4ECDC4"
                            : member.role === "Co-Parent"
                              ? "#45B7D1"
                              : "#EB684A";

                      return (
                        <Chip
                          key={index}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Box
                                component="span"
                                sx={{ fontSize: "0.95rem" }}
                              >
                                {member.role === "Therapist"
                                  ? "🩺"
                                  : member.role === "Caregiver"
                                    ? "🤱"
                                    : member.role === "Co-Parent"
                                      ? "👨‍👩‍👧‍👦"
                                      : member.role === "Family Member"
                                        ? "👵"
                                        : "👤"}
                              </Box>
                              <Box component="span">
                                {member.name || member.displayName}
                              </Box>
                            </Box>
                          }
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: "0.95rem",
                            borderRadius: 1,
                            bgcolor: alpha(roleColor, 0.15),
                            color: roleColor,
                            fontWeight: 500,
                            mb: 0.5,
                            mr: 0.5,
                          }}
                        />
                      );
                    })}
                    {members.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.95rem",
                          color: theme.palette.text.secondary,
                          ml: 0.5,
                        }}
                      >
                        +{members.length - 3} more
                      </Typography>
                    )}
                  </Box>
                )
              );
            })()}
          </Box>

          {/* Action Groups Display */}
          {getActionGroups && handleGroupActionClick && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.8rem", fontWeight: 600, color: theme.palette.secondary.main }}
                >
                  Quick Actions
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                {getActionGroups(getUserRoleForChild?.(child.id)).map((group) => {
                  const expandedKey = `${child.id}-actions-${group.title}`;
                  const isGroupExpanded = expandedCategories[expandedKey];
                  
                  return (
                    <ActionGroup 
                      key={group.title}
                      group={group} 
                      child={child}
                      isExpanded={isGroupExpanded}
                      onToggleExpanded={() => {
                        setExpandedCategories(prev => ({
                          ...prev,
                          [expandedKey]: !prev[expandedKey]
                        }));
                      }}
                      onActionClick={handleGroupActionClick} 
                      completionStatus={status}
                      highlightedActions={enhancedHighlightedActions}
                      onActionHover={handleDailyCareActionHover}
                      onActionLeave={handleDailyCareActionLeave}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Timeline Widget - Enhanced Recent Activity with Progress Visualization */}
          <TimelineWidget
            child={child}
            entries={recentEntries}
            dailyCareStatus={status}
            defaultExpanded={false}
            variant="full"
          />
        </Box>
      </Collapse>
    </Card>
  );
};

export default ChildCard;

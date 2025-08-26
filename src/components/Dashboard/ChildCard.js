import React, { useState } from 'react';
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
  MedicalInformation as DiagnosisIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useRole } from '../../contexts/RoleContext';
import ActionGroup from './ActionGroup';

const ChildCard = ({
  child,
  groupType,
  status = {},
  recentEntries = [],
  isExpanded,
  onToggleExpanded,
  onQuickEntry,
  onEditChild,
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

  const completedToday = status.mood && status.sleep && status.energy;
  const userRole = getUserRoleForChild ? getUserRoleForChild(child.id) : null;
  const canAddData = canAddDataForChild ? canAddDataForChild(child.id) : true;

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
      {/* ELEGANT ROLE INDICATOR */}
      <Box
        style={{
          background:
            userRole === "therapist"
              ? "linear-gradient(90deg, #E3F2FD 0%, #BBDEFB 100%)"
              : userRole === "caregiver"
                ? "linear-gradient(90deg, #FFF3E0 0%, #FFCC80 100%)"
                : userRole && userRole.includes("parent")
                  ? "linear-gradient(90deg, #E8F5E8 0%, #C8E6C9 100%)"
                  : "linear-gradient(90deg, #f5f5f5 0%, #eeeeee 100%)",
          color:
            userRole === "therapist"
              ? "#1565C0"
              : userRole === "caregiver"
                ? "#EF6C00"
                : userRole && userRole.includes("parent")
                  ? "#2E7D32"
                  : "#666",
          padding: "12px 20px",
          fontSize: "16px",
          fontWeight: "600",
          textAlign: "left",
          borderBottom:
            userRole === "therapist"
              ? "2px solid #E3F2FD"
              : userRole === "caregiver"
                ? "2px solid #FFF3E0"
                : userRole && userRole.includes("parent")
                  ? "2px solid #E8F5E8"
                  : "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Box component="span" style={{ fontSize: "20px" }}>
          {userRole === "therapist"
            ? "🩺"
            : userRole === "caregiver"
              ? "🤗"
              : userRole && userRole.includes("parent")
                ? "👑"
                : "👤"}
        </Box>
        <Box component="span" style={{ flex: 1 }}>
          {userRole === "therapist"
            ? "Clinical Therapist"
            : userRole === "caregiver"
              ? "Caregiver"
              : userRole && userRole.includes("parent")
                ? "Parent/Guardian"
                : "Team Member"}
        </Box>
        <Box
          component="span"
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color:
              userRole === "therapist"
                ? "#0D47A1"
                : userRole === "caregiver"
                  ? "#BF360C"
                  : userRole && userRole.includes("parent")
                    ? "#1B5E20"
                    : "#424242",
          }}
        >
          {child.name}
        </Box>
      </Box>

      {/* Compact Horizontal Layout */}
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
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          },
        }}
      >
        {/* Status Indicators & Expand Icon */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 8,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {/* Individual completion indicators */}
          <Box
            sx={{
              display: "flex",
              gap: 0.25,
            }}
          >
            {status.mood && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#6D28D9", // Daily Care color
                }}
              />
            )}
            {status.sleep && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#6D28D9", // Daily Care color
                }}
              />
            )}
            {status.energy && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#6D28D9", // Daily Care color
                }}
              />
            )}
          </Box>

          {/* Subtle interaction hint */}
          <Box
            sx={{
              ml: 1,
              width: 4,
              height: 20,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              transition: "all 0.2s ease",
              opacity: 0.7,
            }}
          />
        </Box>

        {/* Left: Avatar & Basic Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            minWidth: 0,
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
              
              {/* Edit Button - Right next to child name for easy access */}
              {(userRole === "primary_parent" || userRole === "co_parent") && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditChild(child);
                  }}
                  sx={{
                    ml: 1,
                    width: 28,
                    height: 28,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
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
                <HospitalIcon sx={{ color: "#9B59B6", fontSize: 14 }} />
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

        {/* Quick Entry Circles OR Status Display */}
        <Box sx={{ display: "flex", gap: 1, px: 2 }}>
          {userRole === USER_ROLES.THERAPIST ? (
            // Read-only status display for therapists
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                px: 2,
                borderRadius: 2,
                bgcolor: alpha("#94A3B8", 0.1),
                border: `1px solid ${alpha("#94A3B8", 0.3)}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#94A3B8",
                }}
              >
                Today's Status:
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[
                  { key: "mood", emoji: "😊", color: "#6D28D9" }, // Daily Care color
                  { key: "sleep", emoji: "😴", color: "#6D28D9" }, // Daily Care color
                  { key: "energy", emoji: "⚡", color: "#6D28D9" }, // Daily Care color
                ].map((item) => (
                  <Box
                    key={item.key}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: `1px solid ${status[item.key] ? item.color : theme.palette.divider}`,
                      bgcolor: status[item.key]
                        ? alpha(item.color, 0.1)
                        : "background.paper",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "1.2rem" }}>
                      {status[item.key] ? "✓" : item.emoji}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            // Interactive quick entry circles for other roles - matching Daily Care colors
            [
              { key: "mood", emoji: "😊", color: "#6D28D9", label: "Mood", description: "Quick mood check" }, 
              { key: "sleep", emoji: "😴", color: "#6D28D9", label: "Sleep", description: "Last night's sleep" }, 
              {
                key: "energy",
                emoji: "⚡",
                color: "#6D28D9", 
                label: "Energy",
                description: "Current energy level",
              },
            ].map((item) => (
              <Box
                key={item.key}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card expansion
                  onQuickEntry(child, item.key, e);
                }}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: `2px solid #6D28D9`, // Always purple outline
                  bgcolor: status[item.key]
                    ? alpha('#6D28D9', 0.1) // Purple background when completed
                    : "background.paper",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: '#6D28D9', // Purple on hover
                    bgcolor: alpha('#6D28D9', 0.1), // Purple background on hover
                    transform: "scale(1.1)",
                  },
                }}
                title={`${item.description} - Click for quick entry`}
              >
                <Typography sx={{ fontSize: "1.2rem" }}>
                  {status[item.key] ? "✓" : item.emoji}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        {/* Right: Progress & Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            alignSelf: "stretch",
            pt: 1.5,
          }}
        >
          {/* Action Buttons */}
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}
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
              // Interactive buttons for other roles
              <>
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card expansion
                    onDailyReport(child);
                  }}
                  sx={{
                    py: 0.5,
                    px: 1.5,
                    fontSize: "1.1rem",
                    minWidth: "auto",
                    borderRadius: 1,
                    background: completedToday
                      ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  }}
                  title="View today's daily care summary with timestamps and edit options"
                >
                  Daily Report
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Expandable Content */}
      <Collapse in={isExpanded}>
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}
        >
          {/* Diagnosis Chips */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
            >
              <DiagnosisIcon sx={{ color: "#FF6B6B", fontSize: 16 }} />
              <Typography
                variant="body2"
                sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#FF6B6B" }}
              >
                Diagnosis
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, pl: 2 }}>
              {child.concerns?.map((concern, index) => (
                <Chip
                  key={index}
                  label={concern.label || concern}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.95rem",
                    borderRadius: 1,
                    bgcolor: alpha("#FF6B6B", 0.15),
                    color: "#FF6B6B",
                    fontWeight: 600,
                  }}
                />
              )) ||
                [
                  { name: "Autism Spectrum", color: "#FF6B6B" },
                  { name: "ADHD", color: "#4ECDC4" },
                ].map((diagnosis, index) => (
                  <Chip
                    key={index}
                    label={diagnosis.name}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.95rem",
                      borderRadius: 1,
                      bgcolor: alpha(diagnosis.color, 0.15),
                      color: diagnosis.color,
                      fontWeight: 600,
                    }}
                  />
                ))}
            </Box>
          </Box>

          {/* Care Team Details */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
            >
              <HospitalIcon sx={{ color: "#9B59B6", fontSize: 16 }} />
              <Typography
                variant="body2"
                sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#9B59B6" }}
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
                  sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#9B59B6" }}
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
                      highlightedActions={highlightedActions}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Recent Activity Preview */}
          {getTypeConfig && formatTimeAgo && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#9B59B6" }}
                >
                  Recent Activity
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.95rem", color: theme.palette.text.secondary }}
                >
                  Last 3 days
                </Typography>
              </Box>

              {recentEntries.length > 0 ? (
                <Box sx={{ pl: 2 }}>
                  {recentEntries.slice(0, 3).map((entry, index) => {
                    const typeConfig = getTypeConfig(entry.type);
                    return (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                          p: 0.5,
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor: alpha(typeConfig.color, 0.05),
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: "1rem" }}>
                          {typeConfig.icon}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.95rem",
                            color: typeConfig.color,
                            fontWeight: 600,
                            flex: 1,
                          }}
                        >
                          {typeConfig.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.95rem",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {formatTimeAgo(entry.timestamp)}
                        </Typography>
                      </Box>
                    );
                  })}
                  {recentEntries.length > 3 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.95rem",
                        color: theme.palette.text.secondary,
                        ml: 2,
                      }}
                    >
                      +{recentEntries.length - 3} more entries
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.95rem",
                    color: theme.palette.text.secondary,
                    pl: 2,
                    fontStyle: "italic",
                  }}
                >
                  No recent activity
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default ChildCard;
import React, { useState } from "react";
import {
  Card,
  Menu,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useChildContext } from "../../../contexts/ChildContext";
import useTeamMembers from "../../../hooks/useTeamMembers";
import ChildCardHeader from "./ChildCardHeader";
import ChildCardDetails from "./ChildCardDetails";
import { unassignCaregiver, unassignTherapist } from "../../../services/childService";
import MessageIcon from "@mui/icons-material/Message";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MoodIcon from "@mui/icons-material/Mood";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CategoryIcon from "@mui/icons-material/Category";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const ChildCard = ({
  child,
  expanded,
  onAccordionChange,
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onLogMood,
  onSmartDataTracking,
  userRole,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { setCurrentChildId } = useChildContext();
  const teamMembers = useTeamMembers(child);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    setCurrentChildId(child.id);
    navigate(path);
  };

  const handleUnassign = (member) => {
    if (member.role === "caregiver") {
      unassignCaregiver(child.id, member.id);
    } else if (member.role === "therapist") {
      unassignTherapist(child.id, member.id);
    }
  };

  const rawConcerns =
    child?.primaryConcerns ??
    child?.diagnoses ??
    child?.concerns ??
    child?.primaryConcern ??
    child?.diagnosis ??
    [];

  const toArray = (x) =>
    Array.isArray(x) ? x : typeof x === "string" && x ? [x] : [];

  const getLabel = (item) => {
    if (typeof item === "string") return item;
    if (item?.label) return item.label;
    if (item?.name) return item.name;
    if (item?.value) return String(item.value);
    return "";
  };

  const concernsArr = toArray(rawConcerns);
  const concernLabels = concernsArr.map(getLabel).filter(Boolean);

  // Role-specific quick actions
  const getQuickActionsByRole = (role) => {
    const baseActions = [
      {
        icon: <MessageIcon />,
        label: "Messages",
        action: () => handleNavigate("/messages"),
        color: "primary",
      }
    ];

    if (role === "therapist") {
      return [
        ...baseActions,
        {
          icon: <AssignmentIcon />,
          label: "Session Notes",
          action: () => handleNavigate("/therapy-notes"),
          color: "info",
        },
        {
          icon: <TrendingUpIcon />,
          label: "Progress Report",
          action: () => handleNavigate("/progress"),
          color: "success",
        }
      ];
    } else if (role === "caregiver") {
      return [
        ...baseActions,
        {
          icon: <MoodIcon />,
          label: "Quick Check-in",
          action: () => onLogMood(child),
          color: "secondary",
        },
        {
          icon: <EventNoteIcon />,
          label: "Daily Notes",
          action: () => handleNavigate("/daily-log"),
          color: "warning",
        }
      ];
    } else {
      // Parent actions
      return [
        ...baseActions,
        {
          icon: <MoodIcon />,
          label: "Log Mood",
          action: () => onLogMood(child),
          color: "secondary",
        },
      ];
    }
  };

  const quickActions = getQuickActionsByRole(userRole);

  // Role-specific expanded actions
  const getAllActionsByRole = (role) => {
    const baseActions = [
      {
        icon: <ListAltIcon />,
        label: "View Timeline",
        action: () => handleNavigate("/log"),
        color: "#5B8C51",
      }
    ];

    if (role === "therapist") {
      return [
        ...baseActions,
        {
          icon: <AssignmentIcon />,
          label: "Therapy Plans",
          action: () => handleNavigate("/therapy-plans"),
          color: "#2196F3",
        },
        {
          icon: <TrendingUpIcon />,
          label: "Assessment Tools",
          action: () => handleNavigate("/assessments"),
          color: "#4CAF50",
        },
      ];
    } else if (role === "caregiver") {
      return [
        ...baseActions,
        {
          icon: <EventNoteIcon />,
          label: "Care Log",
          action: () => handleNavigate("/care-log"),
          color: "#FF9800",
        },
        {
          icon: <MedicalServicesIcon />,
          label: "Medical Info",
          action: () => handleNavigate("/medical"),
          color: "#F44336",
        },
      ];
    } else {
      // Parent actions (full access)
      return [
        ...baseActions,
        {
          icon: <MedicalServicesIcon />,
          label: "Medical Log",
          action: () => handleNavigate("/medical"),
          color: "#F44336",
        },
        {
          icon: <CategoryIcon />,
          label: "Manage Care",
          action: () => handleNavigate("/manage"),
          color: "#9C27B0",
        },
      ];
    }
  };

  const allActions = getAllActionsByRole(userRole);

  // Debug logging
  console.log('ChildCard received userRole:', userRole);

  // Determine role type for styling (more robust)
  const isTherapist = userRole && (userRole.includes('therapist') || userRole === 'therapist');
  const isParent = userRole && (userRole.includes('parent') || userRole === 'parent');
  const isCaregiver = userRole && (userRole.includes('caregiver') || userRole === 'caregiver');
  
  // Fallback: if no specific role detected, alternate between styles for demo
  let roleType = 'parent'; // default
  if (isTherapist) roleType = 'therapist';
  else if (isCaregiver) roleType = 'caregiver';
  else if (isParent) roleType = 'parent';
  
  // Real role data is available, no need for demo fallback

  console.log('ChildCard determined roleType:', roleType, { isTherapist, isParent, isCaregiver });

  return (
    <Card
      elevation={0}
      style={{
        borderRadius: '12px',
        border: roleType === "therapist"
          ? "6px solid #2196F3"
          : roleType === "caregiver"
          ? "6px solid #FF9800"
          : "6px solid #4CAF50",
        borderLeft: roleType === "therapist" 
          ? "20px solid #1976D2"
          : roleType === "caregiver"
          ? "20px solid #FF6F00"
          : "20px solid #388E3C",
        borderTop: roleType === "therapist"
          ? "10px solid #1976D2"
          : roleType === "parent"
          ? "10px solid #388E3C"
          : "10px solid #FF6F00",
        transition: "all 0.3s ease",
        cursor: "pointer",
        backgroundColor: roleType === "therapist"
          ? "#BBDEFB"
          : roleType === "caregiver"
          ? "#FFCC80"
          : "#C8E6C9",
      }}
      sx={{
        position: "relative",
        "&:before": {
          content: roleType === "therapist" ? '"🩺"' : roleType === "parent" ? '"👨‍👩‍👧‍👦"' : '""',
          position: "absolute",
          top: 8,
          right: 12,
          fontSize: "1.5rem",
          zIndex: 10,
        },
        "&:after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: roleType === "therapist"
            ? "0 50px 50px 0"
            : roleType === "caregiver"
            ? "0 40px 40px 0"
            : "0 50px 50px 0",
          borderColor: roleType === "therapist"
            ? "transparent #2196F3 transparent transparent"
            : roleType === "caregiver"
            ? "transparent #FF9800 transparent transparent"
            : "transparent #4CAF50 transparent transparent",
        },
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: roleType === "therapist"
            ? "0 16px 50px rgba(21,101,192,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
            : roleType === "caregiver"
            ? "0 12px 40px rgba(255,152,0,0.25)"
            : "0 16px 50px rgba(46,125,50,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
          borderColor: roleType === "therapist"
            ? "#0D47A1"
            : roleType === "caregiver"
            ? "#F57C00"
            : "#1B5E20",
        },
      }}
      onClick={onAccordionChange}
    >
      <ChildCardHeader
        child={child}
        expanded={expanded}
        onAccordionChange={onAccordionChange}
        onEditChild={onEditChild}
        handleMenuOpen={handleMenuOpen}
        quickActions={quickActions}
        concernLabels={concernLabels}
        userRole={roleType}
      />
      <ChildCardDetails
        expanded={expanded}
        teamMembers={teamMembers}
        userRole={roleType}
        onInviteTeamMember={onInviteTeamMember}
        handleUnassign={handleUnassign}
        allActions={allActions}
        child={child}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(event) => event.stopPropagation()}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: 160,
          },
        }}
      >
        {userRole === "therapist" ? (
          <>
            <MenuItem
              onClick={() => {
                handleNavigate("/therapy-schedule");
                handleMenuClose();
              }}
              sx={{ py: 1.5 }}
            >
              <AssignmentIcon sx={{ mr: 2, fontSize: 18, color: "text.secondary" }} />
              Schedule Session
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleNavigate("/therapy-goals");
                handleMenuClose();
              }}
              sx={{ py: 1.5 }}
            >
              <TrendingUpIcon sx={{ mr: 2, fontSize: 18, color: "text.secondary" }} />
              Update Goals
            </MenuItem>
          </>
        ) : userRole === "caregiver" ? (
          <>
            <MenuItem
              onClick={() => {
                handleNavigate("/daily-report");
                handleMenuClose();
              }}
              sx={{ py: 1.5 }}
            >
              <EventNoteIcon sx={{ mr: 2, fontSize: 18, color: "text.secondary" }} />
              Daily Report
            </MenuItem>
            <MenuItem
              onClick={() => {
                onLogMood(child);
                handleMenuClose();
              }}
              sx={{ py: 1.5 }}
            >
              <MoodIcon sx={{ mr: 2, fontSize: 18, color: "text.secondary" }} />
              Log Mood
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              onClick={() => {
                onEditChild(child);
                handleMenuClose();
              }}
              sx={{ py: 1.5 }}
            >
              <EditIcon sx={{ mr: 2, fontSize: 18, color: "text.secondary" }} />
              Edit Child
            </MenuItem>
            {onDeleteChild && (
              <MenuItem
                onClick={() => {
                  onDeleteChild(child);
                  handleMenuClose();
                }}
                sx={{ py: 1.5, color: "error.main" }}
              >
                <DeleteIcon sx={{ mr: 2, fontSize: 18 }} />
                Delete Child
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </Card>
  );
};

export default ChildCard;

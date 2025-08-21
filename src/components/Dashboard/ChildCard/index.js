import React, { useState } from "react";
import {
  Card,
  Menu,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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

const ChildCard = ({
  child,
  expanded,
  onAccordionChange,
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onLogMood,
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

  const quickActions = [
    {
      icon: <MessageIcon />,
      label: "Messages",
      action: () => handleNavigate("/messages"),
      color: "primary",
    },
    {
      icon: <MoodIcon />,
      label: "Log Mood",
      action: () => onLogMood(child),
      color: "secondary",
    },
  ];

  const allActions = [
    {
      icon: <ListAltIcon />,
      label: "Child Log",
      action: () => handleNavigate("/log"),
      color: "#5B8C51",
    },
    {
      icon: <MedicalServicesIcon />,
      label: "Medical Log",
      action: () => handleNavigate("/medical"),
      color: "#CB6318",
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha("#000", 0.08)}`,
        transition: "all 0.2s ease",
        cursor: "pointer",
        bgcolor: "background.paper",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          borderColor: alpha("#5B8C51", 0.2),
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
        userRole={userRole}
      />
      <ChildCardDetails
        expanded={expanded}
        teamMembers={teamMembers}
        userRole={userRole}
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
      </Menu>
    </Card>
  );
};

export default ChildCard;

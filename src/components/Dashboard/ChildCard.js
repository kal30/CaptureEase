import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import MessageIcon from "@mui/icons-material/Message";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MoodIcon from "@mui/icons-material/Mood";

import CategoryIcon from "@mui/icons-material/Category";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  unassignCaregiver,
  unassignTherapist,
} from "../../services/childService";
import { useChildContext } from "../../contexts/ChildContext";

const ChildCard = ({
  child,
  expanded,
  onAccordionChange,
  onEditChild,
  onDeleteChild,
  onUnlinkCaregiver,
  onAssignCaregiver,
  onInviteTherapist,
  onLogMood,
  userRole,
  compact = false,
  iconSpacing = 1.5,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [assignedCaregivers, setAssignedCaregivers] = useState([]);
  const [assignedTherapists, setAssignedTherapists] = useState([]);
  const navigate = useNavigate();
  const { setCurrentChildId } = useChildContext();

  useEffect(() => {
    const fetchUsers = async () => {
      if (child.users) {
        const caregiverDocs = await Promise.all(
          (child.users.caregivers || []).map((id) =>
            getDoc(doc(db, "users", id))
          )
        );
        const therapistDocs = await Promise.all(
          (child.users.therapists || []).map((id) =>
            getDoc(doc(db, "users", id))
          )
        );
        const caregiversData = caregiverDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const therapistsData = therapistDocs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssignedCaregivers(caregiversData);
        setAssignedTherapists(therapistsData);
      }
    };
    fetchUsers();
  }, [child]);

  // Handle opening the action menu
  const handleMenuOpen = (event) => {
    event.stopPropagation(); // Prevent accordion from expanding
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the action menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle navigation with child context
  const handleNavigate = (path) => {
    setCurrentChildId(child.id);
    navigate(path);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange}
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        background: "background.paper",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: "16px 0" },
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
      }}
    >
      <AccordionSummary
        sx={{
          backgroundColor: "background.paper",
          padding: compact ? "16px 20px" : "24px",
          minHeight: compact ? "72px" : "80px",
          "&.Mui-expanded": { minHeight: compact ? "72px" : "80px" },
          // subtle hover cue for clickability
          "&:hover": { backgroundColor: "rgba(245, 227, 86, 0.06)" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Avatar
              src={child.photoURL || `https://i.pravatar.cc/150?u=${child.id}`}
              alt={child.name}
              sx={{
                width: compact ? 56 : 72,
                height: compact ? 56 : 72,
                mr: 2,
                background: "secondary.main",
                fontSize: "1.8rem",
                fontWeight: 600,
                border: "3px solid #FFFFFF",
                boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                color: "#FFFFFF",
              }}
            >
              {!child.photoURL && child.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  mb: 0.5,
                }}
              >
                {child.name}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                }}
              >
                Age: {child.age}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: iconSpacing,
              ml: "40px",
              justifyContent: "flex-end",
              alignSelf: "flex-start",
            }}
          >
            <Tooltip title="Log Mood">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onLogMood(child);
                }}
                sx={{
                  color: "secondary.main",
                  "&:hover": {
                    backgroundColor: "rgba(245, 227, 86, 0.15)",
                    color: "primary.main",
                  },
                  transition: "background-color 120ms ease, color 120ms ease",
                }}
              >
                <MoodIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Manage Templates">
              <IconButton
                onClick={() => handleNavigate("/templates")}
                sx={{
                  color: "secondary.main",
                  "&:hover": {
                    backgroundColor: "rgba(245, 227, 86, 0.15)",
                    color: "primary.main",
                  },
                  transition: "background-color 120ms ease, color 120ms ease",
                }}
              >
                <CategoryIcon />
              </IconButton>
            </Tooltip>
            {userRole === "parent" && (
              <>
                <Tooltip title="Invite CareTeam">
                  <IconButton
                    onClick={onInviteTherapist}
                    sx={{
                      color: "secondary.main",
                      "&:hover": {
                        backgroundColor: "rgba(245, 227, 86, 0.15)",
                        color: "primary.main",
                      },
                      transition:
                        "background-color 120ms ease, color 120ms ease",
                    }}
                  >
                    <MedicalServicesIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton
              onClick={handleMenuOpen}
              onFocus={(e) => e.stopPropagation()}
              sx={{
                color: "secondary.main",
                "&:hover": {
                  backgroundColor: "rgba(245, 227, 86, 0.15)",
                  color: "primary.main",
                },
                transition: "background-color 120ms ease, color 120ms ease",
              }}
            >
              <MoreVertIcon />
            </IconButton>
            {compact && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: iconSpacing,
                  ml: 1,
                }}
              >
                <Tooltip title="Messages">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate("/messages");
                    }}
                    sx={{
                      color: "primary.main",
                      "&:hover": { bgcolor: "rgba(245, 227, 86, 0.15)" },
                    }}
                  >
                    <MessageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Daily Log">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate("/daily-log");
                    }}
                    sx={{
                      color: "primary.main",
                      "&:hover": { bgcolor: "rgba(245, 227, 86, 0.15)" },
                    }}
                  >
                    <AssignmentIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Medical Log">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate("/medical");
                    }}
                    sx={{
                      color: "secondary.main",
                      "&:hover": { bgcolor: "rgba(245, 227, 86, 0.15)" },
                    }}
                  >
                    <MedicalServicesIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(event) => event.stopPropagation()}
            PaperProps={{
              sx: {
                borderRadius: "12px",
                boxShadow: "0 8px 16px rgba(17,24,39,0.08)",
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                onEditChild(child);
                handleMenuClose();
              }}
              sx={{
                borderRadius: "8px",
                margin: "4px 8px",
                "&:hover": {
                  backgroundColor: "rgba(245, 227, 86, 0.15)",
                },
              }}
            >
              <EditIcon sx={{ mr: 1, color: "primary.main" }} /> Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDeleteChild(child);
                handleMenuClose();
              }}
              sx={{
                borderRadius: "8px",
                margin: "4px 8px",
                "&:hover": {
                  backgroundColor: "rgba(245, 227, 86, 0.15)",
                },
              }}
            >
              <DeleteIcon sx={{ mr: 1, color: "primary.main" }} /> Delete
            </MenuItem>
            {child.caregiver && (
              <MenuItem
                onClick={() => {
                  onUnlinkCaregiver(child);
                  handleMenuClose();
                }}
                sx={{
                  borderRadius: "8px",
                  margin: "4px 8px",
                  "&:hover": {
                    backgroundColor: "rgba(245, 227, 86, 0.15)",
                  },
                }}
              >
                <LinkOffIcon sx={{ mr: 1, color: "secondary.main" }} /> Unlink
                Caregiver
              </MenuItem>
            )}
          </Menu>
        </Box>
      </AccordionSummary>

      {!compact && (
        <AccordionDetails
          sx={{
            backgroundColor: "background.paper",
            p: "24px",
          }}
        >
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                mb: 1.5,
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: ".06em",
              }}
            >
              Caregivers
            </Typography>
            {assignedCaregivers.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {assignedCaregivers.map((caregiver) => (
                  <Chip
                    key={caregiver.id}
                    label={`${caregiver.name} (${caregiver.email})`}
                    onDelete={() => unassignCaregiver(child.id, caregiver.id)}
                    sx={{
                      backgroundColor: "rgba(77,133,189,0.08)",
                      color: "info.main",
                      fontWeight: 600,
                      "& .MuiChip-deleteIcon": {
                        color: "info.main",
                        "&:hover": { color: "primary.main" },
                      },
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontStyle: "italic" }}
              >
                No caregivers assigned.
              </Typography>
            )}
          </Box>

          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                mb: 1.5,
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: ".06em",
              }}
            >
              Therapists
            </Typography>
            {assignedTherapists.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {assignedTherapists.map((therapist) => (
                  <Chip
                    key={therapist.id}
                    label={`${therapist.name} (${therapist.specialization})`}
                    onDelete={() => unassignTherapist(child.id, therapist.id)}
                    sx={{
                      backgroundColor: "rgba(77,133,189,0.08)",
                      color: "info.main",
                      fontWeight: 600,
                      "& .MuiChip-deleteIcon": {
                        color: "info.main",
                        "&:hover": { color: "primary.main" },
                      },
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontStyle: "italic" }}
              >
                No therapists assigned.
              </Typography>
            )}
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              fontSize: "0.9rem",
              mt: 2,
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Choose an option for {child.name}:
          </Typography>

          <List sx={{ padding: 0 }}>
            <ListItemButton
              onClick={() => handleNavigate("/messages")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                backgroundColor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: "rgba(245, 227, 86, 0.12)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                },
                transition: "background-color 120ms ease",
              }}
            >
              <ListItemIcon>
                <MessageIcon sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Messages"
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate("/log")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                backgroundColor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: "rgba(245, 227, 86, 0.12)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                },
                transition: "background-color 120ms ease",
              }}
            >
              <ListItemIcon>
                <AssignmentIcon sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Child Log"
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate("/daily-log")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                backgroundColor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: "rgba(245, 227, 86, 0.12)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                },
                transition: "background-color 120ms ease",
              }}
            >
              <ListItemIcon>
                <AssignmentIcon sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Daily Log"
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate("/medical")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                backgroundColor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: "rgba(245, 227, 86, 0.12)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                },
                transition: "background-color 120ms ease",
              }}
            >
              <ListItemIcon>
                <MedicalServicesIcon sx={{ color: "secondary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Medical Log"
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate("/daily-activities")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                backgroundColor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: "rgba(245, 227, 86, 0.12)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                },
                transition: "background-color 120ms ease",
              }}
            >
              <ListItemIcon>
                <AssignmentIcon sx={{ color: "secondary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Daily Activities"
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              />
            </ListItemButton>
          </List>
        </AccordionDetails>
      )}
    </Accordion>
  );
};

export default ChildCard;

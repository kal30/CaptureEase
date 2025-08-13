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
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import MessageIcon from "@mui/icons-material/Message";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MoodIcon from "@mui/icons-material/Mood";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CategoryIcon from "@mui/icons-material/Category";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
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
  const [teamMembers, setTeamMembers] = useState([]);
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
        // Combine all into single array, no role label needed for display
        setTeamMembers([...caregiversData, ...therapistsData]);
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

  // --- Begin diagnosis/concerns normalization utilities ---
  // Normalise concerns/diagnoses structure once
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
  const firstConcernLabel = concernLabels[0] || "";
  // --- End diagnosis/concerns normalization utilities ---

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange}
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        bgcolor: "background.paper",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: "16px 0" },
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
      }}
    >
      <AccordionSummary
        sx={{
          bgcolor: "background.paper",
          padding: compact ? "16px 20px" : "24px",
          minHeight: compact ? "84px" : "120px",
          "&.Mui-expanded": { minHeight: compact ? "84px" : "120px" },
          // subtle hover cue for clickability
          "&:hover": {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
          },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            my: 0,
          },
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
                bgcolor: "secondary.main",
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
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                Diagnosis:{" "}
                {concernLabels.length ? (
                  concernLabels.join(", ")
                ) : (
                  <>
                    <span style={{ color: "rgba(0,0,0,0.36)" }}>Not set</span>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddAlt1Icon />}
                      sx={{
                        backgroundColor: (theme) =>
                          alpha(theme.palette.success.main, 0.08),
                        color: "success.main",
                        borderRadius: "999px",
                        fontWeight: 600,
                        px: 2,
                        py: 0.5,
                        minHeight: "24px",
                        textTransform: "none",
                        boxShadow: "none",
                        fontSize: "0.8rem",
                        ml: 1,
                        transition:
                          "background-color 120ms ease, color 120ms ease",
                        "&:hover": {
                          backgroundColor: (theme) =>
                            alpha(theme.palette.success.main, 0.15),
                          color: "success.main",
                          boxShadow: "none",
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof onEditChild === "function")
                          onEditChild(child);
                      }}
                    >
                      Add
                    </Button>
                  </>
                )}
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
                aria-label="Log mood"
                onClick={(e) => {
                  e.stopPropagation();
                  onLogMood(child);
                }}
                sx={{
                  color: "secondary.main",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.15),
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
                aria-label="Manage templates"
                onClick={() => handleNavigate("/templates")}
                sx={{
                  color: "secondary.main",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.15),
                    color: "primary.main",
                  },
                  transition: "background-color 120ms ease, color 120ms ease",
                }}
              >
                <CategoryIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="Open actions"
              onClick={handleMenuOpen}
              onFocus={(e) => e.stopPropagation()}
              sx={{
                color: "secondary.main",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.15),
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
                    aria-label="Messages"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate("/messages");
                    }}
                    sx={{
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.15),
                      },
                    }}
                  >
                    <MessageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Daily Log">
                  <IconButton
                    aria-label="Daily log"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate("/daily-log");
                    }}
                    sx={{
                      color: "primary.main",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.15),
                      },
                    }}
                  >
                    <AssignmentIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Medical Log">
                  <IconButton
                    aria-label="Medical log"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate("/medical");
                    }}
                    sx={{
                      color: "secondary.main",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.15),
                      },
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
                if (typeof onEditChild === "function") onEditChild(child);
                handleMenuClose();
              }}
              sx={{
                borderRadius: "8px",
                margin: "4px 8px",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              <EditIcon sx={{ mr: 1, color: "primary.main" }} /> Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (typeof onDeleteChild === "function") onDeleteChild(child);
                handleMenuClose();
              }}
              sx={{
                borderRadius: "8px",
                margin: "4px 8px",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.15),
                },
              }}
            >
              <DeleteIcon sx={{ mr: 1, color: "primary.main" }} /> Delete
            </MenuItem>
            {child.caregiver && (
              <MenuItem
                onClick={() => {
                  if (typeof onUnlinkCaregiver === "function")
                    onUnlinkCaregiver(child);
                  handleMenuClose();
                }}
                sx={{
                  borderRadius: "8px",
                  margin: "4px 8px",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.15),
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
            bgcolor: "background.paper",
            p: "20px 24px",
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                mb: 1,
                textTransform: "uppercase",
                fontSize: "0.78rem",
                letterSpacing: ".06em",
              }}
            >
              Team Members
            </Typography>
            {teamMembers.length > 0 ? (
              <>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}
                >
                  {teamMembers.map((member) => (
                    <Chip
                      key={member.id}
                      label={member.name}
                      size="small"
                      onDelete={() => {
                        // Try both unassign functions for compatibility
                        if (child.users?.caregivers?.includes(member.id)) {
                          unassignCaregiver(child.id, member.id);
                        } else if (
                          child.users?.therapists?.includes(member.id)
                        ) {
                          unassignTherapist(child.id, member.id);
                        }
                      }}
                      sx={{
                        backgroundColor: (theme) =>
                          alpha(theme.palette.info.main, 0.08),
                        color: "info.main",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        "& .MuiChip-deleteIcon": {
                          color: "info.main",
                        },
                        mb: 0.5,
                      }}
                    />
                  ))}
                </Box>
                {userRole === "parent" && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PersonAddAlt1Icon />}
                    sx={{
                      mt: 0,
                      backgroundColor: (theme) =>
                        alpha(theme.palette.success.main, 0.08),
                      color: "success.main",
                      borderRadius: "999px",
                      fontWeight: 600,
                      px: 2,
                      py: 0.5,
                      minHeight: "24px",
                      textTransform: "none",
                      boxShadow: "none",
                      fontSize: "0.8rem",
                      transition:
                        "background-color 120ms ease, color 120ms ease",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.success.main, 0.15),
                        color: "success.main",
                        boxShadow: "none",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onAssignCaregiver === "function")
                        onAssignCaregiver(child);
                    }}
                  >
                    Add to Team
                  </Button>
                )}
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontStyle: "italic",
                    fontSize: "0.92rem",
                  }}
                >
                  No team members yet.
                </Typography>
                {userRole === "parent" && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PersonAddAlt1Icon />}
                    sx={{
                      backgroundColor: (theme) =>
                        alpha(theme.palette.success.main, 0.08),
                      color: "success.main",
                      borderRadius: "999px",
                      fontWeight: 600,
                      px: 2,
                      py: 0.5,
                      minHeight: "24px",
                      textTransform: "none",
                      boxShadow: "none",
                      fontSize: "0.8rem",
                      transition:
                        "background-color 120ms ease, color 120ms ease",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.success.main, 0.15),
                        color: "success.main",
                        boxShadow: "none",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onAssignCaregiver === "function")
                        onAssignCaregiver(child);
                    }}
                  >
                    Add to Team
                  </Button>
                )}
              </Box>
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
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.12),
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
                slotProps={{
                  primary: { sx: { fontWeight: 600, color: "text.primary" } },
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate("/log")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.12),
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
                slotProps={{
                  primary: { sx: { fontWeight: 600, color: "text.primary" } },
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate("/daily-log")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.12),
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
                slotProps={{
                  primary: { sx: { fontWeight: 600, color: "text.primary" } },
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate("/medical")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.12),
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
                slotProps={{
                  primary: { sx: { fontWeight: 600, color: "text.primary" } },
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate("/daily-activities")}
              sx={{
                borderRadius: "10px",
                mb: 1,
                bgcolor: "background.paper",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.12),
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
                slotProps={{
                  primary: { sx: { fontWeight: 600, color: "text.primary" } },
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

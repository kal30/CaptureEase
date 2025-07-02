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
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles"; // Import theme
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  unassignCaregiver,
  unassignTherapist,
} from "../../services/childService";

const ChildCard = ({
  child,
  expanded,
  onAccordionChange,
  onEditChild,
  onDeleteChild,
  onUnlinkCaregiver,
  onAssignCaregiver,
  onAssignTherapist,
  allCaregivers,
  allTherapists,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [assignedCaregivers, setAssignedCaregivers] = useState([]);
  const [assignedTherapists, setAssignedTherapists] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme(); // Access the theme

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

  const handleAssignCaregiverClick = (e) => {
    e.stopPropagation();
    if (allCaregivers.length === 0) {
      navigate("/care-team", { state: { activeTab: 0 } });
    } else {
      onAssignCaregiver(child);
    }
  };

  const handleAssignTherapistClick = (e) => {
    e.stopPropagation();
    if (allTherapists.length === 0) {
      navigate("/care-team", { state: { activeTab: 1 } });
    } else {
      onAssignTherapist(child);
    }
  };

  return (
    <Accordion expanded={expanded} onChange={onAccordionChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: theme.palette.background.default,
          padding: "8px",
        }} // Theme colors
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={child.photoURL || ""}
              alt={child.name}
              sx={{
                width: 80,
                height: 80,
                mr: 2,
                backgroundColor: theme.palette.primary.main,
              }} // Default background for avatars without photos
            >
              {!child.photoURL && child.name.charAt(0)}{" "}
              {/* Show the first letter of the child's name */}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              {/* Child Name */}
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                {child.name}
              </Typography>

              {/* Child Age */}
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary, fontSize: "1rem" }}
              >
                Age: {child.age}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Assign Caregiver">
              <IconButton onClick={handleAssignCaregiverClick}>
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Assign Therapist">
              <IconButton onClick={handleAssignTherapistClick}>
                <MedicalServicesIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={handleMenuOpen}
              onFocus={(e) => e.stopPropagation()}
              sx={{
                padding: "6px",
                fontSize: "22px",
                color: theme.palette.primary.dark, // Use theme colors
                backgroundColor: theme.palette.background.paper,
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: theme.palette.primary.light,
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={(event) => event.stopPropagation()} // Prevent accordion from expanding when clicking the menu
          >
            <MenuItem
              onClick={() => {
                onEditChild(child);
                handleMenuClose();
              }}
            >
              <EditIcon sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDeleteChild(child);
                handleMenuClose();
              }}
            >
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </MenuItem>
            {child.caregiver && (
              <MenuItem
                onClick={() => {
                  onUnlinkCaregiver(child);
                  handleMenuClose();
                }}
              >
                <LinkOffIcon sx={{ mr: 1 }} /> Unlink Caregiver
              </MenuItem>
            )}
          </Menu>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{
          backgroundColor: theme.palette.background.default, // Slightly darker background for expansion
          borderLeft: `4px solid ${theme.palette.primary.dark}`, // Subtle border for emphasis
          padding: "16px",
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)", // Add subtle shadow for a modern look
        }}
      >
        <Box>
          <Typography variant="h6">Caregivers</Typography>
          {assignedCaregivers.length > 0 ? (
            <>
              {assignedCaregivers.map((caregiver) => (
                <Chip
                  key={caregiver.id}
                  label={`${caregiver.name} (${caregiver.email})`}
                  onDelete={() => unassignCaregiver(child.id, caregiver.id)}
                  sx={{
                    mr: 1,
                    mb: 1,
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  }}
                />
              ))}
            </>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                No caregivers assigned.
              </Typography>
            </>
          )}
        </Box>
        <Box mt={2}>
          <Typography variant="h6">Therapists</Typography>
          {assignedTherapists.length > 0 ? (
            <>
              {assignedTherapists.map((therapist) => (
                <Chip
                  key={therapist.id}
                  label={`${therapist.name} (${therapist.specialization})`}
                  onDelete={() => unassignTherapist(child.id, therapist.id)}
                  sx={{
                    mr: 1,
                    mb: 1,
                    backgroundColor: theme.palette.secondary.light,
                    color: theme.palette.secondary.contrastText,
                  }}
                />
              ))}
            </>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                No therapists assigned.
              </Typography>
            </>
          )}
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.primary.main, // Bolder color for the heading
            fontSize: "18px",
            fontWeight: "bold",
            mb: 2,
            mt: 4,
          }}
        >
          Choose an option for {child.name}:
        </Typography>

        <List>
          <ListItemButton onClick={() => navigate("/messages")}>
            <ListItemIcon>
              <MessageIcon />
            </ListItemIcon>
            <ListItemText primary="Messages" />
          </ListItemButton>

          <ListItemButton
            onClick={() => navigate(`/child/${child.id}/sensory`)}
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Sensory" />
          </ListItemButton>

          <ListItemButton onClick={() => navigate("/daily-activities")}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Daily Activities" />
          </ListItemButton>

          <ListItemButton onClick={() => navigate("/mood-tracker")}>
            <ListItemIcon>
              <MoodIcon />
            </ListItemIcon>
            <ListItemText primary="Mood Tracker" />
          </ListItemButton>

          <ListItemButton onClick={() => navigate("/health-info")}>
            <ListItemIcon>
              <HealthAndSafetyIcon />
            </ListItemIcon>
            <ListItemText primary="Health Information" />
          </ListItemButton>

          <ListItemButton
            onClick={() => navigate(`/child/${child.id}/journal`)}
          >
            <ListItemIcon>
              <MessageIcon />
            </ListItemIcon>
            <ListItemText primary="Journal" />
          </ListItemButton>
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChildCard;

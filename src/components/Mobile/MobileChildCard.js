import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  ListAlt as ListAltIcon,
  MedicalServices as MedicalServicesIcon,
  Message as MessageIcon,
  Mood as MoodIcon
} from "@mui/icons-material";
import StyledButton from "../UI/StyledButton";
import { alpha, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useChildContext } from "../../contexts/ChildContext";
import useTeamMembers from "../../hooks/useTeamMembers";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`child-tabpanel-${index}`}
      aria-labelledby={`child-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

const MobileChildCard = ({
  child,
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onLogMood,
  userRole,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
      color: theme.palette.primary.main,
    },
    {
      icon: <MoodIcon />,
      label: "Log Mood",
      action: () => onLogMood(child),
      color: theme.palette.secondary.main,
    },
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
      color: "#5B8C51",
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        mb: 2,
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 48,
                height: 48,
                fontSize: '1.25rem',
                fontWeight: 600
              }}
            >
              {child.name[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {child.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Age: {child.age} • {child.gender}
              </Typography>
              {concernLabels.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {concernLabels.slice(0, 2).map((concern, index) => (
                    <Chip
                      key={index}
                      label={concern}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main
                      }}
                    />
                  ))}
                  {concernLabels.length > 2 && (
                    <Chip
                      label={`+${concernLabels.length - 2}`}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        color: theme.palette.grey[600]
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={handleMenuOpen}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </CardContent>

      {/* Mobile Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none'
            }
          }}
        >
          <Tab 
            icon={<PersonIcon fontSize="small" />} 
            label="Actions" 
            iconPosition="start"
          />
          <Tab 
            icon={<GroupIcon fontSize="small" />} 
            label="Team" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <CardContent sx={{ pt: 0 }}>
        <TabPanel value={tabValue} index={0}>
          {/* Quick Actions */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
            QUICK ACTIONS
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            {quickActions.map((action, index) => (
              <StyledButton
                key={index}
                variant="outlined"
                startIcon={action.icon}
                onClick={(e) => {
                  e.stopPropagation();
                  action.action();
                }}
                sx={{
                  borderColor: alpha(action.color, 0.3),
                  color: action.color,
                  fontSize: '0.75rem',
                  py: 1.5,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: alpha(action.color, 0.05)
                  }
                }}
              >
                {action.label}
              </StyledButton>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Team Members */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
            CARE TEAM
          </Typography>
          
          {teamMembers.length > 0 ? (
            <List dense sx={{ p: 0 }}>
              {teamMembers.map((member) => (
                <ListItem
                  key={member.id}
                  sx={{
                    px: 0,
                    py: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                      {member.name[0]}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={member.name}
                    secondary={member.role}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{
                      variant: "caption"
                    }}
                  />
                  <Chip
                    label={member.role}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" sx={{ color: "text.disabled", mb: 2, textAlign: 'center', py: 2 }}>
              No team members yet
            </Typography>
          )}
          
          {userRole === "parent" && (
            <StyledButton
              fullWidth
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              onClick={(e) => {
                e.stopPropagation();
                onInviteTeamMember(child);
              }}
              sx={{
                mt: 2,
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Add Team Member
            </StyledButton>
          )}
        </TabPanel>
      </CardContent>

      {/* Menu */}
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

export default MobileChildCard;
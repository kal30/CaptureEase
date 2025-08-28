import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Psychology as InsightsIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import StyledButton from "../UI/StyledButton";
import { alpha, useTheme } from "@mui/material/styles";
import TimelineCalendar from "../Timeline/TimelineCalendar";
import TimelineEntry from "../Timeline/TimelineEntry";
import TimelineFilters from "../Timeline/TimelineFilters";
import PrintableTimelineCalendar from "../Timeline/PrintableTimelineCalendar";
import DayDetailModal from "../Timeline/DayDetailModal";
import { getTimelineEntries, filterTimelineEntries } from "../../services/timelineService";
import CorrelationDashboard from "../Analytics/CorrelationDashboard";

const DataDrivenChildCard = ({
  child,
  onQuickDataEntry,
  onEditChild,
  onDeleteChild,
  hasDataToday = false,
  dataCompleteness = 0,
  recentInsights = [],
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [filters, setFilters] = useState({
    types: [],
    startDate: null,
    endDate: null,
    searchText: '',
    author: ''
  });
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'timeline'
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const getDataCompletenessColor = () => {
    if (dataCompleteness >= 80) return "success";
    if (dataCompleteness >= 50) return "warning";
    return "error";
  };

  const getDataCompletenessMessage = () => {
    if (dataCompleteness >= 80) return "Great data collection! 🎯";
    if (dataCompleteness >= 50) return "Good progress, keep it up! 📈";
    return "More data = better insights 💡";
  };

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Load timeline entries for this child
  useEffect(() => {
    if (!child?.id) return;

    const unsubscribe = getTimelineEntries(child.id, (timelineEntries) => {
      setEntries(timelineEntries);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [child?.id]);

  // Apply filters whenever entries or filters change
  useEffect(() => {
    const filtered = filterTimelineEntries(entries, filters);
    setFilteredEntries(filtered);
  }, [entries, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDayClick = (day, dayEntries) => {
    setSelectedDay(day);
    setSelectedDayEntries(dayEntries);
  };

  const handleCloseDayModal = () => {
    setSelectedDay(null);
    setSelectedDayEntries(null);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.startDate || filters.endDate) count++;
    if (filters.searchText) count++;
    if (filters.author) count++;
    return count;
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          mb: 2,
          bgcolor: hasDataToday
            ? alpha(theme.palette.success.main, 0.02)
            : "background.paper",
        }}
      >
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{ bgcolor: theme.palette.info.main, width: 48, height: 48 }}
              >
                {child.name[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {child.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age: {child.age}
                </Typography>
                {hasDataToday && (
                  <Chip
                    label="✓ Data logged today"
                    size="small"
                    color="success"
                    sx={{ mt: 0.5, fontSize: "0.7rem", height: 20 }}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {(onEditChild || onDeleteChild) && (
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{ mr: 0.5 }}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>{" "}
          </Box>

          {/* Data Collection Progress */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Weekly Data Collection
              </Typography>
              <Typography
                variant="caption"
                color={`${getDataCompletenessColor()}.main`}
              >
                {Math.round(dataCompleteness)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={dataCompleteness}
              color={getDataCompletenessColor()}
              sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              {getDataCompletenessMessage()}
            </Typography>
          </Box>

          {/* Primary Actions */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {!hasDataToday ? (
              <StyledButton
                variant="text"
                color="primary"
                onClick={() => onQuickDataEntry(child)}
                sx={{
                  flex: 1,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: !hasDataToday ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: !hasDataToday ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                📊 Quick Data Entry
              </StyledButton>
            ) : (
              <StyledButton
                variant="text"
                color="primary"
                onClick={() => onQuickDataEntry(child)}
                sx={{
                  flex: 1,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: hasDataToday ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: hasDataToday ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                📝 Add More Data
              </StyledButton>
            )}

            <StyledButton
              variant="text"
              color="primary"
              startIcon={<InsightsIcon />}
              onClick={() => {
                setExpanded(true);
              }}
              sx={{
                flex: 1,
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              View Insights
            </StyledButton>
          </Box>

          {/* Recent Insights Preview */}
          {recentInsights.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <TrendingUpIcon sx={{ fontSize: 16, color: "info.main" }} />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "info.main" }}
                >
                  LATEST INSIGHT
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                {recentInsights[0]?.finding ||
                  "Keep logging data to discover patterns!"}
              </Typography>
            </Box>
          )}

          {/* Expandable Details */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Data Collection Status
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
                {[
                  { label: "Mood", collected: hasDataToday, color: "primary" },
                  {
                    label: "Sleep",
                    collected: hasDataToday,
                    color: "secondary",
                  },
                  {
                    label: "Food",
                    collected: Math.random() > 0.5,
                    color: "warning",
                  },
                  {
                    label: "Activities",
                    collected: Math.random() > 0.3,
                    color: "info",
                  },
                  {
                    label: "Behavior",
                    collected: Math.random() > 0.7,
                    color: "success",
                  },
                ].map((item) => (
                  <Chip
                    key={item.label}
                    label={item.label}
                    size="small"
                    variant={item.collected ? "filled" : "outlined"}
                    color={item.collected ? item.color : "default"}
                    sx={{ fontSize: "0.7rem" }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, newViewMode) => {
                    if (newViewMode !== null) {
                      setViewMode(newViewMode);
                    }
                  }}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: 'text.primary',
                      borderColor: 'divider',
                      '&.Mui-selected': {
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark
                        }
                      }
                    }
                  }}
                >
                  <ToggleButton value="calendar" aria-label="calendar view">
                    <CalendarIcon sx={{ mr: 1 }} />
                    Calendar
                  </ToggleButton>
                  <ToggleButton value="timeline" aria-label="timeline view">
                    <TimelineIcon sx={{ mr: 1 }} />
                    Timeline
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Content based on viewMode */}
              {viewMode === 'calendar' && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    📅 {child.name}'s Activity Calendar
                  </Typography>
                  <PrintableTimelineCalendar
                    entries={entries}
                    onDayClick={handleDayClick}
                    filters={filters}
                  />
                </Box>
              )}

              {viewMode === 'timeline' && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  {/* Timeline Header with Filters Toggle */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1 
                  }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600 }}
                    >
                      📜 Activity Timeline
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {filteredEntries.length} entries
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{
                          p: 0.5,
                          bgcolor: getActiveFiltersCount() > 0 ? theme.palette.primary.main : 'transparent',
                          color: getActiveFiltersCount() > 0 ? 'white' : 'text.secondary',
                          '&:hover': {
                            bgcolor: getActiveFiltersCount() > 0 ? theme.palette.primary.dark : 'action.hover',
                          }
                        }}
                      >
                        <FilterIcon sx={{ fontSize: 16 }} />
                        {getActiveFiltersCount() > 0 && (
                          <Typography sx={{ fontSize: '0.6rem', ml: 0.5 }}>
                            {getActiveFiltersCount()}
                          </Typography>
                        )}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Collapsible Filters */}
                  <Collapse in={showFilters} timeout="auto">
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <TimelineFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        totalEntries={entries.length}
                        filteredEntries={filteredEntries.length}
                      />
                    </Box>
                  </Collapse>

                  {/* Timeline Content */}
                  {filteredEntries.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 3, 
                      color: 'text.secondary' 
                    }}>
                      <SearchIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
                      <Typography variant="body2">
                        No entries match your filters
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      position: 'relative',
                      '& > *': { mb: 0.5 },
                      '& > *:last-child': { mb: 0 }
                    }}>
                      {filteredEntries.map((entry, index) => (
                        <TimelineEntry
                          key={`${entry.type}-${entry.id}`}
                          entry={entry}
                          isFirst={index === 0}
                          isLast={index === filteredEntries.length - 1}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* Day Detail Modal */}
              <DayDetailModal
                open={!!selectedDay}
                onClose={handleCloseDayModal}
                day={selectedDay}
                dayEntries={selectedDayEntries}
                currentDate={new Date()} // Assuming currentDate is needed and can be new Date()
              />
            </Box>
          </Collapse>
        </CardContent>

        {/* Edit/Delete Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(event) => event.stopPropagation()}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                minWidth: 160,
              },
            }
          }}
        >
          {onEditChild && (
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
          )}
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
    </>
  );
};

export default DataDrivenChildCard;
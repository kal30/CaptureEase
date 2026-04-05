import React, { useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Drawer,
  CircularProgress,
  Fade,
  Button,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

// Hooks and Services
import { usePanelDashboard } from "../hooks/usePanelDashboard";
import { getActionGroups } from "../constants/actionGroups";

// Components
import MobileDashboardFlow from "../components/Dashboard/MobileDashboardFlow";
import DesktopDashboardOverview from "../components/Dashboard/DesktopDashboardOverview";
import QuickCheckIn from "../components/Mobile/QuickCheckIn";
import AddChildModal from "../components/Dashboard/AddChildModal";
import EditChildModal from "../components/Dashboard/EditChildModal";
import DailyCareModal from "../components/DailyCare/DailyCareModal";
import DailyReportModal from "../components/DailyCare/DailyReportModal";
import SleepLogSheet from "../components/Sleep/SleepLogSheet";
import FoodLogSheet from "../components/Dashboard/FoodLogSheet";
import BathroomLogSheet from "../components/Dashboard/BathroomLogSheet";
import { IncidentLoggingModal, IncidentFollowUpModal } from "../components/Dashboard/Incidents";
import PatternSuggestionModal from "../components/Dashboard/PatternSuggestionModal";
import DailyHabitsModal from "../components/Dashboard/DailyHabitsModal";
import MedicationsLogTab from "./MedicalLog/MedicationsLogTab";
import { ImportLogsModal, extractTextFromImportFile, parseImportedLogs } from "../components/Dashboard/ImportLogs";
import DailyCareReport from "../components/Reports/DailyCareReport";
import { DashboardViewProvider } from "../components/Dashboard/shared/DashboardViewContext";
import RenderDebugOverlay from "../components/Dashboard/shared/RenderDebugOverlay";
import { trackRenderDebug, useMountDebug } from "../utils/renderDebug";

const PanelDashboard = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('xl'));
  const isMobile = !isDesktop;
  const hook = usePanelDashboard({ activeChildOnly: isMobile });
  const actionGroups = getActionGroups(hook.theme);
  const importFileInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importInitialChildId, setImportInitialChildId] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [showMedicalLogPanel, setShowMedicalLogPanel] = useState(false);
  const [medicalLogChild, setMedicalLogChild] = useState(null);
  useMountDebug('PanelDashboard');
  trackRenderDebug('PanelDashboard', {
    isMobile,
    isDesktop,
    loading: hook.loading,
    childCount: hook.children.length,
    currentChildId: hook.currentChildId || 'none',
  });

  const handleImportLogsClick = (child) => {
    setImportInitialChildId(child?.id || hook.currentChildId || hook.children[0]?.id || '');
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
      importFileInputRef.current.click();
    }
  };

  const handleViewImportedCalendar = (child) => {
    const childId = child?.id || importInitialChildId;
    requestAnimationFrame(() => {
      document.getElementById(`timeline-widget-${childId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleViewImportedPrep = (child) => {
    if (child) {
      hook.handleShowCareReport(child);
    }
  };

  const handleOpenMedicalLog = (child) => {
    if (!child) {
      return;
    }

    hook.setCurrentChildId(child.id);
    setMedicalLogChild(child);
    setShowMedicalLogPanel(true);
  };

  const handleCloseMedicalLog = () => {
    setShowMedicalLogPanel(false);
    setMedicalLogChild(null);
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setImportLoading(true);
      setImportError('');

      const extractedText = await extractTextFromImportFile(file);
      const parsed = await parseImportedLogs(extractedText);

      if (parsed?.error) {
        throw new Error(parsed.error);
      }

      const entries = parsed?.entries || [];
      if (!entries.length) {
        throw new Error("We couldn't read that file. Try a simpler format.");
      }

      setImportRows(entries);
      setShowImportModal(true);
    } catch (error) {
      setImportError(error.message || "We couldn't read that file. Try a simpler format.");
    } finally {
      setImportLoading(false);
    }
  };

  if (hook.loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Fade in={true}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 3,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress
                size={60}
                thickness={4}
                sx={{
                  color: 'primary.main',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  fontSize: '2rem',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 0.7,
                      transform: 'scale(1)',
                    },
                    '50%': {
                      opacity: 1,
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                🏠
              </Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textAlign: 'center',
                fontFamily: '"Lancelot", serif',
              }}
            >
              Loading your dashboard...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                opacity: 0.7,
                textAlign: 'center',
                maxWidth: 300,
              }}
            >
              Getting your children's information and care updates ready
            </Typography>
          </Box>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 3, md: 4 } }}>
      <RenderDebugOverlay />
      {hook.children.length === 0 ? (
        <Box
          sx={{
            minHeight: '55vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
          }}
        >
          <Box
            sx={{
              maxWidth: 520,
              width: '100%',
              textAlign: 'center',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 5 },
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
                fontSize: { xs: '1.75rem', md: '2.1rem' },
              }}
            >
              Welcome to CaptureEz — let&apos;s add your first child
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => hook.setShowAddChildModal(true)}
              sx={{
                px: 3.5,
                py: 1.4,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              + Add Child
            </Button>
          </Box>
        </Box>
      ) : (
        <DashboardViewProvider
          childOptions={hook.children}
          initialActiveChildId={hook.currentChildId || hook.children[0]?.id || null}
          onActiveChildChange={hook.setCurrentChildId}
        >
          {isMobile ? (
            <MobileDashboardFlow
              children={hook.children}
              getUserRoleForChild={hook.getUserRoleForChild}
              USER_ROLES={hook.USER_ROLES}
              quickDataStatus={hook.quickDataStatus}
              allEntries={hook.allEntries}
              recentEntries={hook.recentEntries}
              timelineSummary={hook.timelineSummary}
              incidents={hook.incidents}
              onQuickEntry={hook.handleQuickDataEntry}
              onEditChild={hook.handleEditChild}
              onInviteTeamMember={hook.handleInviteTeamMember}
              onDailyReport={hook.handleShowCareReport}
              onTrack={hook.handleTrack}
              onOpenSleepLog={hook.handleOpenSleepLog}
              onOpenFoodLog={hook.handleOpenFoodLog}
              onOpenBathroomLog={hook.handleOpenBathroomLog}
              onOpenMedicalLog={handleOpenMedicalLog}
              onMessages={hook.handleMessages}
              onImportLogs={handleImportLogsClick}
              onAddChildClick={() => hook.setShowAddChildModal(true)}
              showSleepLogSheet={
                hook.showSleepLogSheet
                || hook.showFoodLogSheet
                || hook.showBathroomLogSheet
                || hook.showDailyCareModal
                || hook.showDailyHabitsModal
                || hook.showQuickEntry
                || hook.showDailyReportModal
                || hook.showIncidentModal
                || hook.showFollowUpModal
                || hook.showPatternSuggestionModal
                || hook.showFoodLogSheet
                || showImportModal
                || showMedicalLogPanel
              }
              showFoodLogSheet={hook.showFoodLogSheet}
              showBathroomLogSheet={hook.showBathroomLogSheet}
            />
          ) : (
            <DesktopDashboardOverview
              hook={hook}
              actionGroups={actionGroups}
              onAddChildClick={() => hook.setShowAddChildModal(true)}
              onImportLogs={handleImportLogsClick}
              onTrack={hook.handleTrack}
              onOpenFoodLog={hook.handleOpenFoodLog}
              onOpenBathroomLog={hook.handleOpenBathroomLog}
              onOpenMedicalLog={handleOpenMedicalLog}
            />
          )}
        </DashboardViewProvider>
      )}

      <input
        ref={importFileInputRef}
        type="file"
        accept=".xlsx,.docx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleImportFileChange}
        style={{ display: 'none' }}
      />

      {/* Modals */}
      <Modal
        open={hook.showQuickEntry}
        onClose={hook.handleQuickEntrySkip}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Box sx={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
          {hook.selectedChild && hook.entryType === "micro" && (
            <div>Micro data collection not available</div>
          )}
          {hook.selectedChild && hook.entryType === "full" && (
            <QuickCheckIn
              child={hook.selectedChild}
              onComplete={hook.handleQuickEntryComplete}
              onSkip={hook.handleQuickEntrySkip}
              initialStep={hook.quickEntryStep}
            />
          )}
        </Box>
      </Modal>


      <AddChildModal
        open={hook.showAddChildModal}
        onClose={() => hook.setShowAddChildModal(false)}
        onSuccess={hook.handleAddChildSuccess}
      />

      <EditChildModal
        open={hook.showEditChildModal}
        child={hook.selectedChildForEdit}
        userRole={hook.selectedChildForEdit ? hook.getUserRoleForChild?.(hook.selectedChildForEdit.id) : null}
        onClose={() => {
          hook.setShowEditChildModal(false);
          hook.setSelectedChildForEdit(null);
        }}
        onSuccess={hook.handleEditChildSuccess}
      />

      <DailyCareModal
        open={hook.showDailyCareModal}
        onClose={hook.handleCloseDailyCareModal}
        child={hook.dailyCareChild}
        actionType={hook.dailyCareAction}
        onComplete={hook.handleDailyCareComplete}
      />

      <SleepLogSheet
        open={hook.showSleepLogSheet}
        onClose={hook.handleCloseSleepLogSheet}
        child={hook.sleepLogChild}
      />

      <FoodLogSheet
        open={hook.showFoodLogSheet}
        onClose={hook.handleCloseFoodLogSheet}
        child={hook.foodLogChild}
      />

      <BathroomLogSheet
        open={hook.showBathroomLogSheet}
        onClose={hook.handleCloseBathroomLogSheet}
        child={hook.bathroomLogChild}
      />

      <DailyReportModal
        open={hook.showDailyReportModal}
        onClose={hook.handleCloseDailyReportModal}
        child={hook.dailyReportChild}
        onEditAction={hook.handleDailyReportEdit}
      />

      <IncidentLoggingModal
        open={hook.showIncidentModal}
        onClose={hook.handleCloseIncidentModal}
        childId={hook.incidentChild?.id}
        childName={hook.incidentChild?.name}
      />

      <IncidentFollowUpModal
        open={hook.showFollowUpModal}
        onClose={hook.handleCloseFollowUpModal}
        incident={hook.followUpIncident}
        childName={hook.children.find(c => c.id === hook.followUpIncident?.childId)?.name}
      />

      <PatternSuggestionModal
        open={hook.showPatternSuggestionModal}
        onClose={hook.handleClosePatternSuggestionModal}
        suggestions={hook.patternSuggestions}
        childName={hook.children.find(c => c.id === hook.suggestionsChildId)?.name}
        onCreateCategory={hook.handleCreateCustomCategories}
      />

      <DailyHabitsModal
        open={hook.showDailyHabitsModal}
        onClose={hook.handleCloseDailyHabitsModal}
        childId={hook.dailyHabitsChild?.id}
        childName={hook.dailyHabitsChild?.name}
        initialCategoryId={hook.dailyHabitsInitialCategoryId}
        onHabitSaved={hook.refreshDailyCareStatus}
      />

      <DailyCareReport
        open={hook.showCareReportModal}
        onClose={hook.handleCloseCareReportModal}
        child={hook.careReportChild}
        childId={hook.careReportChild?.id}
        childName={hook.careReportChild?.name}
        onLogSomething={(child) => {
          hook.handleCloseCareReportModal();
          hook.handleQuickDataEntry(child, "quick_note");
        }}
      />

      <ImportLogsModal
        open={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportRows([]);
        }}
        entries={importRows}
        children={hook.children}
        initialChildId={importInitialChildId}
        onImported={() => {}}
        onViewCalendar={(child) => {
          setShowImportModal(false);
          setImportRows([]);
          handleViewImportedCalendar(child);
        }}
        onViewPrepForTherapy={(child) => {
          setShowImportModal(false);
          setImportRows([]);
          handleViewImportedPrep(child);
        }}
      />

      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={showMedicalLogPanel}
          onClose={handleCloseMedicalLog}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              maxHeight: '92vh',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {medicalLogChild?.name ? `${medicalLogChild.name}'s Medications` : 'Medications'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Child-specific medication list and dose logging
              </Typography>
            </Box>
            <IconButton onClick={handleCloseMedicalLog} aria-label="close medical log">
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 2, overflowY: 'auto' }}>
            <MedicationsLogTab childId={medicalLogChild?.id || hook.currentChildId} />
          </Box>
        </Drawer>
      ) : (
        <Dialog
          open={showMedicalLogPanel}
          onClose={handleCloseMedicalLog}
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              borderRadius: 3,
              minHeight: '70vh',
            },
          }}
        >
          <DialogTitle sx={{ pr: 6 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {medicalLogChild?.name ? `${medicalLogChild.name}'s Medications` : 'Medications'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Child-specific medication list and dose logging
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseMedicalLog}
              aria-label="close medical log"
              sx={{ position: 'absolute', right: 16, top: 16 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 0, pb: 3 }}>
            <MedicationsLogTab childId={medicalLogChild?.id || hook.currentChildId} />
          </DialogContent>
        </Dialog>
      )}

      <Modal
        open={importLoading}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            px: 3,
            py: 3,
            minWidth: 280,
            textAlign: "center",
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Reading your logs…
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Extracting and parsing the file safely on your behalf.
          </Typography>
        </Box>
      </Modal>

      <Snackbar
        open={Boolean(importError)}
        autoHideDuration={6000}
        onClose={() => setImportError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setImportError('')} severity="error" variant="filled" sx={{ width: '100%' }}>
          {importError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PanelDashboard;

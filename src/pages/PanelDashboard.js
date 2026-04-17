import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Modal,
  SwipeableDrawer,
  CircularProgress,
  Fade,
  Button,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";

// Hooks and Services
import { usePanelDashboard } from "../hooks/usePanelDashboard";

// Components
import MobileDashboardFlow from "../components/Dashboard/MobileDashboardFlow";
import DesktopDashboardWorkspace from "../components/Dashboard/DesktopDashboardWorkspace";
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
import {
  ImportLogsModal,
  MAX_IMPORT_TEXT_LENGTH,
  extractTextFromImportFile,
  parseImportedLogs,
} from "../components/Dashboard/ImportLogs";
import BulkMedicationLogDialog from "./MedicalLog/components/BulkMedicationLogDialog";
import DailyCareReport from "../components/Reports/DailyCareReport";
import { DashboardViewProvider } from "../components/Dashboard/shared/DashboardViewContext";
import RenderDebugOverlay from "../components/Dashboard/shared/RenderDebugOverlay";
import { trackRenderDebug, useMountDebug } from "../utils/renderDebug";
import colors from "../assets/theme/colors";
import { PRODUCT_NAME_TITLE } from "../constants/config";

const PanelDashboard = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:1023.95px)');
  const isDesktop = !isMobile;
  const hook = usePanelDashboard({ activeChildOnly: isMobile });
  const dashboardChildren = hook.children;
  const dashboardSelectedChild = hook.selectedChild;
  const dashboardSetCurrentChildId = hook.setCurrentChildId;
  const dashboardHandleEditChild = hook.handleEditChild;
  const dashboardHandleDeleteChild = hook.handleDeleteChild;
  const dashboardHandleInviteTeamMember = hook.handleInviteTeamMember;
  const dashboardHandleMessages = hook.handleMessages;
  const dashboardHandleShowCareReport = hook.handleShowCareReport;
  const dashboardSetShowAddChildModal = hook.setShowAddChildModal;
  const importFileInputRef = useRef(null);
  const [showImportStartModal, setShowImportStartModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importInitialChildId, setImportInitialChildId] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [showMedicalLogPanel, setShowMedicalLogPanel] = useState(false);
  const [medicalLogChild, setMedicalLogChild] = useState(null);
  const [editChildInitialStep, setEditChildInitialStep] = useState(1);
  const [careToastOpen, setCareToastOpen] = useState(false);
  const [careToastMessage, setCareToastMessage] = useState('');
  useMountDebug('PanelDashboard');
  trackRenderDebug('PanelDashboard', {
    isMobile,
    isDesktop,
    loading: hook.loading,
    childCount: hook.children.length,
    currentChildId: hook.currentChildId || 'none',
  });

  const handleImportLogsClick = useCallback((child) => {
    setImportInitialChildId(child?.id || hook.currentChildId || hook.children[0]?.id || '');
    setShowImportStartModal(true);
  }, [hook.children, hook.currentChildId]);

  const handleLaunchImportPicker = useCallback(() => {
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
      importFileInputRef.current.click();
    }
  }, []);

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

  useEffect(() => {
    const requestedChildId = location.state?.openChildMedicationManager?.childId;
    if (!requestedChildId || !dashboardChildren.length) {
      return;
    }

    const requestedChild = dashboardChildren.find((child) => child.id === requestedChildId);
    if (!requestedChild) {
      return;
    }

    dashboardSetCurrentChildId(requestedChild.id);
    setEditChildInitialStep(3);
    dashboardHandleEditChild(requestedChild);

    navigate(location.pathname, { replace: true, state: null });
  }, [
    dashboardChildren,
    dashboardSetCurrentChildId,
    dashboardHandleEditChild,
    location.pathname,
    location.state,
    navigate,
  ]);

  useEffect(() => {
    const handleDashboardAction = (event) => {
      const action = event?.detail?.action;
      const childId = event?.detail?.childId;
      const child = dashboardChildren.find((item) => item.id === childId) || dashboardSelectedChild || dashboardChildren[0] || null;

      if (!action) {
        return;
      }

      switch (action) {
        case "add-child":
          dashboardSetShowAddChildModal(true);
          break;
        case "view-care-team":
          navigate('/care-team');
          break;
        case "invite-caregiver":
          if (child) {
            dashboardHandleInviteTeamMember(child.id);
          }
          break;
        case "start-chat":
          if (child) {
            dashboardHandleMessages(child);
          }
          break;
        case "prep-for-therapy":
          if (child) {
            dashboardHandleShowCareReport(child);
          }
          break;
        case "import-logs":
          handleImportLogsClick(child);
          break;
        case "edit-child":
          if (child) {
            dashboardHandleEditChild(child);
          }
          break;
        case "delete-child":
          if (child) {
            dashboardHandleDeleteChild(child);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("captureez:dashboard-action", handleDashboardAction);

    return () => {
      window.removeEventListener("captureez:dashboard-action", handleDashboardAction);
    };
  }, [
    dashboardChildren,
    dashboardHandleDeleteChild,
    dashboardHandleEditChild,
    dashboardHandleInviteTeamMember,
    dashboardHandleMessages,
    dashboardHandleShowCareReport,
    dashboardSelectedChild,
    dashboardSetShowAddChildModal,
    navigate,
    handleImportLogsClick,
  ]);

  useEffect(() => {
    const handleDailyCareSaved = (event) => {
      const message = event?.detail?.message;
      if (!message) {
        return;
      }

      setCareToastMessage(message);
      setCareToastOpen(true);
    };

    window.addEventListener('captureez:daily-care-saved', handleDailyCareSaved);

    return () => {
      window.removeEventListener('captureez:daily-care-saved', handleDailyCareSaved);
    };
  }, []);

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setShowImportStartModal(false);

    try {
      setImportLoading(true);
      setImportError('');

      const extractedText = await extractTextFromImportFile(file);
      if (extractedText.length > MAX_IMPORT_TEXT_LENGTH) {
        throw new Error('That file is too large to import. Please split it into a smaller file and try again.');
      }

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
      const rawMessage = String(error?.message || '').trim();
      const normalizedMessage = rawMessage.toLowerCase();
      const isInternalCallableFailure =
        error?.code === 'internal' ||
        error?.code === 'deadline-exceeded' ||
        normalizedMessage === 'internal' ||
        normalizedMessage.includes('504') ||
        normalizedMessage.includes('gateway timeout') ||
        normalizedMessage.includes('failed to load resource') ||
        normalizedMessage.includes('net::err_failed');

      if (isInternalCallableFailure) {
        setImportError(
          'That file took too long to import. Please split it into a smaller file or try again with fewer rows.'
        );
      } else {
        setImportError(rawMessage || "We couldn't read that file. Try a simpler format.");
      }
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
                  color: colors.brand.ink,
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
              Welcome to {PRODUCT_NAME_TITLE} — let&apos;s add your first child
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
              onRefreshDashboard={hook.refreshDashboard}
              onQuickEntry={hook.handleQuickDataEntry}
              onEditChild={hook.handleEditChild}
              onDeleteChild={hook.handleDeleteChild}
              onInviteTeamMember={hook.handleInviteTeamMember}
              onGoToCareTeam={() => navigate('/care-team')}
              onDailyReport={hook.handleShowCareReport}
              onTrack={hook.handleTrack}
              onOpenSleepLog={hook.handleOpenSleepLog}
              onOpenFoodLog={hook.handleOpenFoodLog}
              onOpenBathroomLog={hook.handleOpenBathroomLog}
              onOpenMedicalLog={handleOpenMedicalLog}
              onMessages={hook.handleMessages}
              onImportLogs={handleImportLogsClick}
              onAddChildClick={() => hook.setShowAddChildModal(true)}
              onRefreshRoles={hook.refreshRoles}
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
            <DesktopDashboardWorkspace
              hook={hook}
              onQuickEntry={hook.handleQuickDataEntry}
              onDailyReport={hook.handleShowCareReport}
              onOpenSleepLog={hook.handleOpenSleepLog}
              onOpenFoodLog={hook.handleOpenFoodLog}
              onOpenBathroomLog={hook.handleOpenBathroomLog}
              onOpenMedicalLog={handleOpenMedicalLog}
              onImportLogs={handleImportLogsClick}
              onGoToCareTeam={() => navigate('/care-team')}
              onAddChildClick={() => hook.setShowAddChildModal(true)}
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
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={hook.showQuickEntry}
          onOpen={() => {}}
          onClose={hook.handleQuickEntrySkip}
          disableBackdropTransition
          disableDiscovery
          PaperProps={{
            sx: {
              borderRadius: '20px 20px 0 0',
              bgcolor: colors.landing.surface,
              borderTop: `1px solid ${colors.landing.borderLight}`,
              boxShadow: `0 -18px 48px ${colors.landing.shadowPanel}`,
              maxHeight: '92vh',
              pb: 'env(safe-area-inset-bottom)',
              overflow: 'hidden',
            },
          }}
        >
          <Box sx={{ px: 1.25, pt: 0.75, pb: 1.25, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 4,
                  borderRadius: 9999,
                  bgcolor: colors.landing.borderLight,
                }}
              />
            </Box>
            {hook.selectedChild && hook.entryType === "micro" && (
              <div>Micro data collection not available</div>
            )}
            {hook.selectedChild && hook.entryType === "full" && (
              <QuickCheckIn
                child={hook.selectedChild}
                onComplete={hook.handleQuickEntryComplete}
                onSkip={hook.handleQuickEntrySkip}
                initialStep={hook.quickEntryStep}
                initialDate={hook.quickEntryDate}
              />
            )}
          </Box>
        </SwipeableDrawer>
      ) : (
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
                initialDate={hook.quickEntryDate}
              />
            )}
          </Box>
        </Modal>
      )}


      <AddChildModal
        open={hook.showAddChildModal}
        onClose={() => hook.setShowAddChildModal(false)}
        onViewTodayMedications={(childId) => {
          hook.setShowAddChildModal(false);
          if (childId) {
            handleOpenMedicalLog({ id: childId });
          }
        }}
        onSuccess={hook.handleAddChildSuccess}
      />

      <EditChildModal
        open={hook.showEditChildModal}
        child={hook.selectedChildForEdit}
        userRole={hook.selectedChildForEdit ? hook.getUserRoleForChild?.(hook.selectedChildForEdit.id) : null}
        initialStep={editChildInitialStep}
        onViewTodayMedications={(child) => {
          hook.setShowEditChildModal(false);
          hook.setSelectedChildForEdit(null);
          if (child) {
            handleOpenMedicalLog(child);
          }
        }}
        onClose={() => {
          setEditChildInitialStep(1);
          hook.setShowEditChildModal(false);
          hook.setSelectedChildForEdit(null);
        }}
        onSuccess={() => {
          setEditChildInitialStep(1);
          hook.handleEditChildSuccess();
        }}
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

      <Modal
        open={showImportStartModal}
        onClose={() => setShowImportStartModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            px: 3,
            py: 3,
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.14)',
            textAlign: 'left',
          }}
        >
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: colors.landing.heroText, mb: 0.75 }}>
            Import Past Data
          </Typography>
          <Typography sx={{ fontSize: '0.92rem', lineHeight: 1.6, color: colors.landing.textMuted, mb: 2.5 }}>
            Upload logs from Excel or documents to get started.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              variant="text"
              onClick={() => setShowImportStartModal(false)}
              sx={{ px: 1.5 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleLaunchImportPicker}
              sx={{ px: 2.2 }}
            >
              Upload File
            </Button>
          </Box>
        </Box>
      </Modal>

      <BulkMedicationLogDialog
        open={showMedicalLogPanel}
        childId={medicalLogChild?.id || hook.currentChildId}
        childName={medicalLogChild?.name || ''}
        onClose={handleCloseMedicalLog}
      />

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
        onClose={() => setImportError('')}
        anchorOrigin={isMobile ? { vertical: 'top', horizontal: 'center' } : { vertical: 'bottom', horizontal: 'center' }}
        sx={{ width: '100%' }}
      >
        <Alert
          onClose={() => setImportError('')}
          severity="error"
          variant="filled"
          sx={{
            width: { xs: 'calc(100vw - 24px)', sm: 'auto' },
            maxWidth: { xs: 'calc(100vw - 24px)', sm: 560 },
            alignItems: 'flex-start',
          }}
        >
          {importError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={careToastOpen}
        autoHideDuration={1800}
        onClose={() => setCareToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCareToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {careToastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PanelDashboard;

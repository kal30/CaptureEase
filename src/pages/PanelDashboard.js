import React from "react";
import {
  Box,
  Container,
  Typography,
  Modal,
} from "@mui/material";

// Hooks and Services
import { usePanelDashboard } from "../hooks/usePanelDashboard";
import { getActionGroups } from "../constants/actionGroups";

// Components
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import ChildGroup from "../components/Dashboard/ChildGroup";
import QuickCheckIn from "../components/Mobile/QuickCheckIn";
import MicroDataCollector from "../components/Mobile/MicroDataCollector";
import InviteTeamMemberModal from "../components/InviteTeamMemberModal";
import AddChildModal from "../components/Dashboard/AddChildModal";
import EditChildModal from "../components/Dashboard/EditChildModal";
import DailyCareModal from "../components/DailyCare/DailyCareModal";
import DailyReportModal from "../components/DailyCare/DailyReportModal";
import { IncidentLoggingModal, IncidentFollowUpModal } from "../components/Dashboard/Incidents";
import PatternSuggestionModal from "../components/Dashboard/PatternSuggestionModal";
import DailyHabitsModal from "../components/Dashboard/DailyHabitsModal";
import { NotificationPermissionPrompt } from "../components/UI";

const PanelDashboard = () => {
  const hook = usePanelDashboard();
  const actionGroups = getActionGroups(hook.theme);

  const commonChildGroupProps = {
    quickDataStatus: hook.quickDataStatus,
    recentEntries: hook.recentEntries,
    incidents: hook.incidents,
    isCardExpanded: hook.isCardExpanded,
    onToggleExpanded: hook.toggleCard,
    onQuickEntry: hook.handleQuickDataEntry,
    onEditChild: hook.handleEditChild,
    onInviteTeamMember: hook.handleInviteTeamMember,
    onDailyReport: hook.handleDailyReport,
    getActionGroups: actionGroups,
    handleGroupActionClick: hook.handleGroupActionClick,
    highlightedActions: hook.highlightedActions,
    expandedCategories: hook.expandedCategories,
    setExpandedCategories: hook.setExpandedCategories,
    getTypeConfig: hook.getTypeConfig,
    formatTimeAgo: hook.formatTimeAgo,
  };

  if (hook.loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <DashboardHeader
        user={hook.user}
        children={hook.children}
        isReadOnlyForChild={hook.isReadOnlyForChild}
        getUserRoleForChild={hook.getUserRoleForChild}
        USER_ROLES={hook.USER_ROLES}
        onInviteClick={() => hook.setShowInviteModal(true)}
        onAddChildClick={() => hook.setShowAddChildModal(true)}
      />

      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt 
        onPermissionGranted={() => {
          console.log('🎉 Notification permission granted! Follow-ups will now send reminders.');
        }}
        onDismiss={() => {
          console.log('ℹ️ Notification permission prompt dismissed');
        }}
      />

      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <ChildGroup
          title="In Your Full Care"
          groupType="own"
          children={hook.ownChildren}
          {...commonChildGroupProps}
        />
        <ChildGroup
          title="Family Children"
          groupType="family"
          children={hook.familyChildren}
          {...commonChildGroupProps}
        />
        <ChildGroup
          title="Professional Assignments"
          groupType="professional"
          children={hook.professionalChildren}
          {...commonChildGroupProps}
        />
      </Box>

      {/* Modals */}
      <Modal
        open={hook.showQuickEntry}
        onClose={hook.handleQuickEntrySkip}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Box sx={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
          {hook.selectedChild && hook.entryType === "micro" && (
            <MicroDataCollector
              child={hook.selectedChild}
              onComplete={hook.handleQuickEntryComplete}
              onSkip={hook.handleQuickEntrySkip}
            />
          )}
          {hook.selectedChild && hook.entryType === "full" && (
            <QuickCheckIn
              child={hook.selectedChild}
              onComplete={hook.handleQuickEntryComplete}
              onSkip={hook.handleQuickEntrySkip}
            />
          )}
        </Box>
      </Modal>

      <InviteTeamMemberModal
        open={hook.showInviteModal}
        onClose={hook.handleCloseInviteModal}
        children={hook.children}
        selectedChildId={hook.inviteChildId}
        onInviteSuccess={hook.handleInviteSuccess}
      />

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
        onHabitSaved={hook.refreshDailyCareStatus}
      />
    </Container>
  );
};

export default PanelDashboard;
import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import BreadcrumbsComponent from "../components/UI/BreadcrumbsComponent";
import Login from "../pages/Login";
import Register from "../pages/Register";
import About from "../pages/About";
import PanelDashboard from "../pages/PanelDashboard";
import LandingPage from "../pages/LandingPage";
import HealthInfoPage from "../pages/HealthInforPage";
import DailyActivitiesPage from "../pages/DailyActivitiesPage";

import ProgressNotesPage from "../pages/ProgressNotesPage";
import SensoryPage from "../pages/SensoryPage";
import CareTeamPage from "../pages/CareTeamPage";
import TemplateLibraryPage from "../pages/TemplateLibraryPage";
import MedicalLogPage from "../pages/MedicalLog/MedicalLogPage";
import ProfilePage from "../pages/ProfilePage";
import InvitationPage from "../pages/InvitationPage";
import AcceptInvite from "../pages/AcceptInvite";
import DailyLogPage from "../pages/DailyLogPage";
import MessagesPage from "../pages/MessagesPage";
import AdminPage from "../pages/AdminPage";
import InviteCaregiverPage from "../pages/InviteCaregiverPage";
import InviteCarePartnerPage from "../pages/InviteCarePartnerPage";
import InviteTherapistPage from "../pages/InviteTherapistPage";
import InviteRoleSelectionPage from "../pages/InviteRoleSelectionPage";
import InviteSuccessPage from "../pages/InviteSuccessPage";

//When you update here update breadcrumbscomponent.js

const AppRoutes = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      {!isLandingPage && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            bgcolor: "background.default",
            boxShadow: "none",
          }}
        >
          <BreadcrumbsComponent />
        </Box>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<PanelDashboard />} />
        <Route path="/care-team" element={<CareTeamPage />} />
        <Route path="/daily-activities" element={<DailyActivitiesPage />} />
        <Route path="/health-info" element={<HealthInfoPage />} />
        <Route path="/progress-notes" element={<ProgressNotesPage />} />
        <Route path="/sensory" element={<SensoryPage />} />
        <Route path="/log" element={<DailyLogPage />} />
        <Route path="/templates" element={<TemplateLibraryPage />} />
        <Route path="/medical" element={<MedicalLogPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/invitation/:invitationId" element={<InvitationPage />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/invite" element={<InviteRoleSelectionPage />} />
        <Route path="/invite/caregiver" element={<InviteCaregiverPage />} />
        <Route path="/invite/carepartner" element={<InviteCarePartnerPage />} />
        <Route path="/invite/therapist" element={<InviteTherapistPage />} />
        <Route path="/invite/success" element={<InviteSuccessPage />} />
      </Routes>
    </>
  );
};

export default AppRoutes;

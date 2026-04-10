import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import BreadcrumbsComponent from "../components/UI/BreadcrumbsComponent";
import { useDeviceType } from "../utils/deviceDetection";
import { isInstallContext } from "../utils/installDetection";
import Login from "../pages/Login";
import InstallAppPage from "../pages/InstallAppPage";
import Register from "../pages/Register";
import About from "../pages/About";
import ContactUs from "../pages/ContactUs";
import DashboardPage from "../features/dashboard";
import LandingPage from "../pages/LandingPage";

// ProgressNotesPage removed - feature deprecated
import SensoryPage from "../pages/SensoryPage";
import CareTeamPage from "../features/care-team";
import TemplateLibraryPage from "../pages/TemplateLibraryPage";
import MedicalLogPage from "../pages/MedicalLog/MedicalLogPage";
import ProfilePage from "../pages/ProfilePage";
import InvitationPage from "../pages/InvitationPage";
import AcceptInvite from "../pages/AcceptInvite";
import TherapyNotesPage from "../pages/TherapyNotesPage";
import MessagesPage from "../features/messaging";
import AdminPage from "../pages/AdminPage";
import InviteCaregiverPage from "../pages/InviteCaregiverPage";
import InviteCarePartnerPage from "../pages/InviteCarePartnerPage";
import InviteTherapistPage from "../pages/InviteTherapistPage";
import InviteRoleSelectionPage from "../pages/InviteRoleSelectionPage";
import InviteSuccessPage from "../pages/InviteSuccessPage";

//When you update here update breadcrumbscomponent.js

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const { isMobileDevice, isTabletDevice, isTouchDevice } = useDeviceType();
  const shouldShowInstallFirst = !isStandaloneMode() && isInstallContext() && (isMobileDevice || (isTabletDevice && isTouchDevice));
  const isLandingPage = location.pathname === "/";
  const shouldShowBreadcrumbs = !isLandingPage && !shouldShowInstallFirst;
  const isInstallRoute = location.pathname.startsWith("/install");
  const isAuthBypassRoute =
    location.pathname.startsWith("/accept-invite") ||
    location.pathname.startsWith("/invitation/");
  const shouldGateToInstall =
    shouldShowInstallFirst && !isInstallRoute && !isAuthBypassRoute;

  if (shouldGateToInstall) {
    const nextPath =
      location.pathname === "/"
        ? "/login"
        : `${location.pathname}${location.search}${location.hash}`;

    return <Navigate to={`/install?next=${encodeURIComponent(nextPath)}`} replace />;
  }

  return (
    <>
      {shouldShowBreadcrumbs && (
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
        <Route
          path="/"
          element={shouldShowInstallFirst ? <Navigate to="/install?next=%2Flogin" replace /> : <LandingPage />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/install" element={<InstallAppPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/care-team" element={<CareTeamPage />} />
        {/* /progress-notes route removed - feature deprecated */}
        <Route path="/sensory" element={<SensoryPage />} />
        <Route path="/log" element={<Navigate to="/dashboard" replace />} />
        <Route path="/therapy-notes" element={<TherapyNotesPage />} />
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

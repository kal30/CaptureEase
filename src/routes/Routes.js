import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import BreadcrumbsComponent from "../components/UI/BreadcrumbsComponent";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import LandingPage from "../pages/LandingPage";
import HealthInfoPage from "../pages/HealthInforPage";
import DailyActivitiesPage from "../pages/DailyActivitiesPage";

import TwitterThread from "../pages/TwitterThread";
import ProgressNotesPage from "../pages/ProgressNotesPage";
import SensoryPage from "../pages/SensoryPage";
import CareTeamPage from "../pages/CareTeamPage";
import ChildLogPage from "../pages/ChildLog/ChildLogPage";
import TemplateLibraryPage from "../pages/TemplateLibraryPage";
import MedicalLogPage from "../pages/MedicalLog/MedicalLogPage";
import ProfilePage from "../pages/ProfilePage";
import InvitationPage from "../pages/InvitationPage";
import DailyLogPage from "../pages/DailyLogPage";

//When you update here update breadcrumbscomponent.js

const AppRoutes = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      {!isLandingPage && (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <BreadcrumbsComponent />
        </div>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/care-team" element={<CareTeamPage />} />
        <Route path="/messages" element={<TwitterThread />} />
        <Route path="/daily-activities" element={<DailyActivitiesPage />} />
        <Route path="/health-info" element={<HealthInfoPage />} />
        <Route path="/progress-notes" element={<ProgressNotesPage />} />
        <Route path="/sensory" element={<SensoryPage />} />
        <Route path="/log" element={<ChildLogPage />} />
        <Route path="/templates" element={<TemplateLibraryPage />} />
        <Route path="/daily-log" element={<DailyLogPage />} />
        <Route path="/medical" element={<MedicalLogPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/invitation/:invitationId" element={<InvitationPage />} />
        <Route path="/test" element={<div>Test Page</div>} />
      </Routes>
    </>
  );
};

export default AppRoutes;

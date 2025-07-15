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
        <Route path="/child/:childId/progress-notes" element={<ProgressNotesPage />} />
        <Route path="/child/:childId/sensory" element={<SensoryPage />} />
        <Route path="/child/:childId/log" element={<ChildLogPage />} />
        <Route path="/child/:childId/templates" element={<TemplateLibraryPage />} />
        <Route path="/child/:childId/medical" element={<MedicalLogPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/test" element={<div>Test Page</div>} />
      </Routes>
    </>
  );
};

export default AppRoutes;

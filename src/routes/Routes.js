import React from "react";
import { Routes, Route } from "react-router-dom";
import BreadcrumbsComponent from "../components/UI/BreadcrumbsComponent";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import LandingPage from "../pages/LandingPage";
import RecordEntry from "../pages/RecordEntry";
import HealthInfoPage from "../pages/HealthInforPage";
import DailyActivitiesPage from "../pages/DailyActivitiesPage";
import MoodTrackerPage from "../pages/MoodTracker";
import TwitterThread from "../pages/TwitterThread";
import JournalPage from "../pages/JournalPage";
import SensoryPage from "../pages/SensoryPage";

const AppRoutes = () => {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <BreadcrumbsComponent />
      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<TwitterThread />} />
        <Route path="/daily-activities" element={<DailyActivitiesPage />} />
        <Route path="/mood-tracker" element={<MoodTrackerPage />} />
        <Route path="/health-info" element={<HealthInfoPage />} />
        <Route path="/child/:childId/journal" element={<JournalPage />} />
        <Route path="/child/:childId/sensory" element={<SensoryPage />} />
        <Route path="/test" element={<div>Test Page</div>} />
      </Routes>
    </>
  );
};

export default AppRoutes;

{
  /* <Route path="/record-entry" element={<RecordEntry />} />   
      <Route path="/twitterThread" element={<TwitterThread />} />  */
}

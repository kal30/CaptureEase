import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import RecordEntry from '../pages/RecordEntry';  // Import the RecordEntry component

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/record-entry" element={<RecordEntry />} />    
      {/* Add a test route for troubleshooting */}
      <Route path="/test" element={<div>Test Page</div>} />
      </Routes>
  );
};

export default AppRoutes;
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import RecordEntry from '../pages/RecordEntry';  
import TwitterThread from '../pages/TwitterThread'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/record-entry" element={<RecordEntry />} />   
      <Route path="/twitterThread" element={<TwitterThread />} /> 
      <Route path="/test" element={<div>Test Page</div>} />
      </Routes>
  );
};

export default AppRoutes;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Departments from '../pages/Departments';
import Maintenance from '../pages/Maintenance';
import Store from '../pages/Store';
import { useAuth } from '../context/AuthContext';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/departments" element={user ? <Departments /> : <Navigate to="/login" />} />
      <Route path="/maintenance" element={user ? <Maintenance /> : <Navigate to="/login" />} />
      <Route path="/store" element={user ? <Store /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
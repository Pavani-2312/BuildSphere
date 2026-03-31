import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { WeekProvider } from './context/WeekContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SectionPage from './pages/SectionPage';
import './index.css'; // Import global styles

function App() {
  return (
    <AuthProvider>
      <WeekProvider>
        <SocketProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/section/:sectionName"
                element={
                  <ProtectedRoute>
                    <SectionPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </WeekProvider>
    </AuthProvider>
  );
}

export default App;

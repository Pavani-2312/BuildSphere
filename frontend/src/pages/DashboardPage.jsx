import React, { useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { WeekContext } from '../context/WeekContext';
import { Link, useNavigate } from 'react-router-dom';
import { SECTIONS } from '../utils/sectionConfig';
import './DashboardPage.css'; // Import the CSS file

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { activeWeek, loading } = useContext(WeekContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="loading-indicator">Loading...</div>; // Added class for loading

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="welcome-card">
        <h2>Welcome, {user.name}</h2>
        <p>Role: {user.role} | Department: {user.department}</p>
        {activeWeek ? (
          <>
            <p><strong>Active Week:</strong> {activeWeek.weekLabel}</p>
            <p><strong>Period:</strong> {new Date(activeWeek.startDate).toLocaleDateString()} - {new Date(activeWeek.endDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {activeWeek.status}</p>
          </>
        ) : (
          <p>No active week found</p>
        )}
      </div>

      <h2>Report Sections</h2>
      <div className="section-grid">
        {Object.entries(SECTIONS).map(([key, section]) => (
          <Link
            key={key}
            to={`/section/${key}`}
            className="section-card"
          >
            <h3>{section.displayName}</h3>
            <p>{section.description || 'Click to manage entries'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;

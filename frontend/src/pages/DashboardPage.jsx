import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeek } from '../context/WeekContext';
import weekService from '../services/week.service';
import toast from 'react-hot-toast';

const SECTIONS = [
  'general_points', 'faculty_joined_relieved', 'faculty_achievements',
  'student_achievements', 'department_achievements', 'faculty_events_conducted',
  'student_events_conducted', 'non_technical_events', 'industry_college_visits',
  'hackathon_participation', 'faculty_fdp_certifications', 'faculty_visits',
  'patents_published', 'vedic_programs', 'placements', 'mous_signed',
  'skill_development_programs'
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeWeek, refreshWeek } = useWeek();
  const [sectionStatuses, setSectionStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWeek) {
      loadSectionStatuses();
    }
  }, [activeWeek]);

  const loadSectionStatuses = async () => {
    try {
      const data = await weekService.getSectionStatuses(activeWeek._id);
      setSectionStatuses(data);
    } catch (error) {
      toast.error('Failed to load section statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatSectionName = (section) => {
    return section.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>;
  };

  if (!activeWeek) {
    return (
      <div className="container">
        <div className="card">
          <h2>No Active Week</h2>
          <p>Please contact your coordinator to create an active week.</p>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>BuildSphere Dashboard</h1>
          <p>Welcome, {user?.name} ({user?.role})</p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </div>

      <div className="card">
        <h2>{activeWeek.weekLabel}</h2>
        <p><strong>Department:</strong> {activeWeek.department}</p>
        <p><strong>Period:</strong> {new Date(activeWeek.startDate).toLocaleDateString()} - {new Date(activeWeek.endDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {getStatusBadge(activeWeek.status)}</p>
        <p><strong>Total Entries:</strong> {activeWeek.totalEntries}</p>
      </div>

      <div className="card">
        <h3>Sections</h3>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Section</th>
                <th>Status</th>
                <th>Entries</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((section, index) => {
                const status = sectionStatuses.find(s => s.section === section);
                return (
                  <tr key={section}>
                    <td>{index + 1}</td>
                    <td>{formatSectionName(section)}</td>
                    <td>{status ? getStatusBadge(status.status) : getStatusBadge('pending')}</td>
                    <td>{status?.entryCount || 0}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/section/${section}`)}
                        className="btn btn-primary"
                        style={{ padding: '5px 15px', fontSize: '14px' }}
                        disabled={activeWeek.status !== 'active'}
                      >
                        {activeWeek.status === 'active' ? 'Manage' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {user?.role === 'coordinator' && activeWeek.status === 'active' && (
        <div className="card">
          <h3>Coordinator Actions</h3>
          <button
            onClick={async () => {
              if (window.confirm('Submit this week? This will lock all entries.')) {
                try {
                  await weekService.submitWeek(activeWeek._id);
                  toast.success('Week submitted successfully');
                  refreshWeek();
                } catch (error) {
                  toast.error('Failed to submit week');
                }
              }
            }}
            className="btn btn-success"
          >
            Submit Week
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

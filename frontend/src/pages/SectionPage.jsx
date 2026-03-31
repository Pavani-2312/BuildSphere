import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeek } from '../context/WeekContext';
import UniversalForm from '../components/forms/UniversalForm';
import entryService from '../services/entry.service';
import toast from 'react-hot-toast';

const SectionPage = () => {
  const { sectionName } = useParams();
  const navigate = useNavigate();
  const { activeWeek } = useWeek();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWeek) {
      loadEntries();
    }
  }, [activeWeek, sectionName]);

  const loadEntries = async () => {
    try {
      const data = await entryService.getEntriesBySection(activeWeek._id, sectionName);
      setEntries(data);
    } catch (error) {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await entryService.createEntry({
        weekId: activeWeek._id,
        section: sectionName,
        data: formData
      });
      toast.success('Entry added successfully');
      loadEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add entry');
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await entryService.deleteEntry(entryId);
      toast.success('Entry deleted');
      loadEntries();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  if (!activeWeek) {
    return <div className="container"><div className="loading">No active week found</div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{sectionName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h1>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
      </div>

      <div className="card">
        <h3>Week: {activeWeek.weekLabel}</h3>
        <p>{new Date(activeWeek.startDate).toLocaleDateString()} - {new Date(activeWeek.endDate).toLocaleDateString()}</p>
      </div>

      <UniversalForm
        section={sectionName}
        onSubmit={handleSubmit}
        weekDates={{ startDate: activeWeek.startDate, endDate: activeWeek.endDate }}
      />

      <div className="card">
        <h3>Existing Entries ({entries.length})</h3>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : entries.length === 0 ? (
          <p>No entries yet</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Details</th>
                <th>Entered By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry._id}>
                  <td>{index + 1}</td>
                  <td>
                    {Object.entries(entry.data).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value instanceof Date ? value.toLocaleDateString() : String(value)}
                      </div>
                    ))}
                  </td>
                  <td>{entry.enteredByName}</td>
                  <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(entry._id)} className="btn btn-danger" style={{padding: '5px 10px', fontSize: '12px'}}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SectionPage;

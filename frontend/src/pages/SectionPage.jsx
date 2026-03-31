import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { SECTIONS } from '../utils/sectionConfig';
import { WeekContext } from '../context/WeekContext';
import toast from 'react-hot-toast';
import './SectionPage.css'; // Import the CSS file

const SectionPage = () => {
  const { sectionName } = useParams();
  const { activeWeek, isWeekSubmitted } = useContext(WeekContext);
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const section = SECTIONS[sectionName];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock entry creation - replace with API call when backend is ready
    const newEntry = {
      _id: Date.now().toString(),
      data: formData,
      enteredByName: 'Current User',
      createdAt: new Date().toISOString()
    };
    
    setEntries([...entries, newEntry]);
    toast.success('Entry added successfully');
    setFormData({});
    setLoading(false);
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Delete this entry?')) return;
    setEntries(entries.filter(e => e._id !== entryId));
    toast.success('Entry deleted');
  };

  if (!section) return <div className="section-page-container">Section not found</div>;
  if (!activeWeek) return <div className="section-page-container">No active week</div>;

  return (
    <div className="section-page-container">
      <h1>{section.displayName}</h1>
      
      {isWeekSubmitted && (
        <div className="warning-banner">
          This week has been submitted. Entries are locked.
        </div>
      )}

      <div className="section-content-grid">
        {!isWeekSubmitted && (
          <div className="add-entry-form-card">
            <h2>Add Entry</h2>
            <form onSubmit={handleSubmit}>
              {section.fields.map((field) => (
                <div key={field.key} className="form-group">
                  <label>
                    {field.label} {field.required && <span className="required-asterisk">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Adding...' : 'Add Entry'}
              </button>
            </form>
          </div>
        )}

        <div className="entries-table-card">
          <h2>Entries ({entries.length})</h2>
          {entries.length === 0 ? (
            <p className="no-entries">No entries yet</p>
          ) : (
            <div className="entries-table-wrapper">
              <table className="entries-table">
                <thead>
                  <tr>
                    {section.fields.map((field) => (
                      <th key={field.key}>
                        {field.label}
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry._id}>
                      {section.fields.map((field) => (
                        <td key={field.key}>
                          {field.type === 'date' 
                            ? new Date(entry.data[field.key]).toLocaleDateString()
                            : entry.data[field.key]}
                        </td>
                      ))}
                      <td>
                        {!isWeekSubmitted && (
                          <button
                            onClick={() => handleDelete(entry._id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionPage;

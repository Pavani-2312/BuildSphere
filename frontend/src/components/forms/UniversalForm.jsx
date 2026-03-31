import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SECTION_FIELDS = {
  general_points: [
    { name: 'pointType', label: 'Point Type', type: 'select', options: ['parent_teacher_meeting', 'department_meeting', 'announcement', 'other'], required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true }
  ],
  faculty_joined_relieved: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['joined', 'relieved'], required: true },
    { name: 'date', label: 'Date', type: 'date', required: true }
  ],
  faculty_achievements: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'achievementType', label: 'Achievement Type', type: 'select', options: ['award', 'guest_lecture', 'reviewer', 'jury', 'other'], required: true },
    { name: 'details', label: 'Details', type: 'textarea', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true }
  ],
  student_achievements: [
    { name: 'studentName', label: 'Student Name', type: 'text', required: true },
    { name: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
    { name: 'achievementDetails', label: 'Achievement Details', type: 'textarea', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true }
  ],
  department_achievements: [
    { name: 'details', label: 'Details', type: 'textarea', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true }
  ],
  faculty_events_conducted: [
    { name: 'eventName', label: 'Event Name', type: 'text', required: true },
    { name: 'eventType', label: 'Event Type', type: 'select', options: ['FDP', 'Workshop', 'STTP', 'Orientation', 'Other'], required: true },
    { name: 'resourcePersonDetails', label: 'Resource Person Details', type: 'textarea', required: true },
    { name: 'coordinatorName', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'facultyParticipated', label: 'Faculty Participated', type: 'number', required: true },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true }
  ],
  student_events_conducted: [
    { name: 'eventName', label: 'Event Name', type: 'text', required: true },
    { name: 'eventType', label: 'Event Type', type: 'select', options: ['Workshop', 'Guest_Lecture', 'Technical_Event', 'Other'], required: true },
    { name: 'resourcePersonDetails', label: 'Resource Person Details', type: 'textarea', required: true },
    { name: 'coordinatorName', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'studentsParticipated', label: 'Students Participated', type: 'number', required: true },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true }
  ],
  non_technical_events: [
    { name: 'eventName', label: 'Event Name', type: 'text', required: true },
    { name: 'resourcePersonDetails', label: 'Resource Person Details', type: 'textarea', required: false },
    { name: 'coordinatorName', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'studentsParticipated', label: 'Students Participated', type: 'number', required: true },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true }
  ],
  industry_college_visits: [
    { name: 'institutionName', label: 'Institution Name', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'coordinatorName', label: 'Coordinator Name', type: 'text', required: true },
    { name: 'studentsParticipated', label: 'Students Participated', type: 'number', required: true },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true }
  ],
  hackathon_participation: [
    { name: 'eventName', label: 'Event Name', type: 'text', required: true },
    { name: 'conductedBy', label: 'Conducted By', type: 'text', required: true },
    { name: 'mentorDetails', label: 'Mentor Details', type: 'text', required: false },
    { name: 'studentsParticipated', label: 'Students Participated', type: 'number', required: true },
    { name: 'studentRollNumbers', label: 'Student Roll Numbers', type: 'text', required: false },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true }
  ],
  faculty_fdp_certifications: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'certificationName', label: 'Certification Name', type: 'text', required: true },
    { name: 'platform', label: 'Platform', type: 'select', options: ['NPTEL', 'Coursera', 'EDX', 'Industry', 'Other'], required: true },
    { name: 'organizedBy', label: 'Organized By', type: 'text', required: true },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true }
  ],
  faculty_visits: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'institutionVisited', label: 'Institution Visited', type: 'text', required: true },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true }
  ],
  patents_published: [
    { name: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { name: 'patentTitle', label: 'Patent Title', type: 'text', required: true },
    { name: 'applicationNumber', label: 'Application Number', type: 'text', required: true },
    { name: 'publicationDate', label: 'Publication Date', type: 'date', required: true }
  ],
  vedic_programs: [
    { name: 'programName', label: 'Program Name', type: 'text', required: true },
    { name: 'participantType', label: 'Participant Type', type: 'select', options: ['student', 'faculty'], required: true },
    { name: 'centre', label: 'Centre', type: 'select', options: ['Hyderabad', 'Bangalore'], required: true },
    { name: 'participantsCount', label: 'Participants Count', type: 'number', required: true },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true }
  ],
  placements: [
    { name: 'companyName', label: 'Company Name', type: 'text', required: true },
    { name: 'studentsPlaced', label: 'Students Placed', type: 'number', required: true },
    { name: 'packageLPA', label: 'Package (LPA)', type: 'number', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true }
  ],
  mous_signed: [
    { name: 'organizationName', label: 'Organization Name', type: 'text', required: true },
    { name: 'signingDate', label: 'Signing Date', type: 'date', required: true },
    { name: 'validityPeriod', label: 'Validity Period', type: 'text', required: true },
    { name: 'purpose', label: 'Purpose', type: 'textarea', required: true }
  ],
  skill_development_programs: [
    { name: 'programName', label: 'Program Name', type: 'text', required: true },
    { name: 'facultyCoordinator', label: 'Faculty Coordinator', type: 'text', required: true },
    { name: 'topicsCovered', label: 'Topics Covered', type: 'textarea', required: true },
    { name: 'studentsCount', label: 'Students Count', type: 'number', required: true },
    { name: 'batchYear', label: 'Batch Year', type: 'text', required: false },
    { name: 'sessionsCount', label: 'Sessions Count', type: 'number', required: true }
  ]
};

const UniversalForm = ({ section, onSubmit, initialData = null, weekDates }) => {
  const fields = SECTION_FIELDS[section] || [];
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      {fields.map(field => (
        <div key={field.name} className="form-group">
          <label>{field.label} {field.required && <span style={{color: 'red'}}>*</span>}</label>
          
          {field.type === 'text' && (
            <input
              type="text"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          )}
          
          {field.type === 'number' && (
            <input
              type="number"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              min="0"
            />
          )}
          
          {field.type === 'textarea' && (
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            />
          )}
          
          {field.type === 'select' && (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
              ))}
            </select>
          )}
          
          {field.type === 'date' && (
            <DatePicker
              selected={formData[field.name] ? new Date(formData[field.name]) : null}
              onChange={(date) => handleChange(field.name, date)}
              dateFormat="yyyy-MM-dd"
              minDate={weekDates?.startDate ? new Date(weekDates.startDate) : null}
              maxDate={weekDates?.endDate ? new Date(weekDates.endDate) : null}
              required={field.required}
              className="form-control"
            />
          )}
        </div>
      ))}
      
      <button type="submit" className="btn btn-primary">
        {initialData ? 'Update Entry' : 'Add Entry'}
      </button>
    </form>
  );
};

export default UniversalForm;

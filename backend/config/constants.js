const SECTIONS = [
  'general_points',
  'faculty_joined_relieved',
  'faculty_achievements',
  'student_achievements',
  'department_achievements',
  'faculty_events_conducted',
  'student_events_conducted',
  'non_technical_events',
  'industry_college_visits',
  'hackathon_participation',
  'faculty_fdp_certifications',
  'faculty_visits',
  'patents_published',
  'vedic_programs',
  'placements',
  'mous_signed',
  'skill_development_programs'
];

const ROLES = {
  FACULTY: 'faculty',
  COORDINATOR: 'coordinator',
  ADMIN: 'admin'
};

const WEEK_STATUS = {
  ACTIVE: 'active',
  SUBMITTED: 'submitted',
  ARCHIVED: 'archived'
};

const SECTION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

module.exports = {
  SECTIONS,
  ROLES,
  WEEK_STATUS,
  SECTION_STATUS
};

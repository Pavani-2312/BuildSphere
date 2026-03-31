export const SECTIONS = {
  general_points: {
    displayName: 'General Points',
    description: 'Department meetings, announcements, and general updates',
    fields: [
      { key: 'pointType', label: 'Point Type', type: 'select', required: true, options: ['parent_teacher_meeting', 'department_meeting', 'announcement', 'other'] },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  faculty_joined_relieved: {
    displayName: 'Faculty Joined / Relieved',
    description: 'Track faculty joining and leaving the department',
    fields: [
      { key: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
      { key: 'designation', label: 'Designation', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', required: true, options: ['joined', 'relieved'] },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  faculty_achievements: {
    displayName: 'Faculty Achievements',
    description: 'Faculty awards, publications, and recognitions',
    fields: [
      { key: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
      { key: 'achievementType', label: 'Achievement Type', type: 'select', required: true, options: ['award', 'publication', 'patent', 'recognition', 'other'] },
      { key: 'details', label: 'Details', type: 'textarea', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  student_achievements: {
    displayName: 'Student Achievements',
    description: 'Student awards, competitions, and recognitions',
    fields: [
      { key: 'studentName', label: 'Student Name', type: 'text', required: true },
      { key: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
      { key: 'achievementDetails', label: 'Achievement Details', type: 'textarea', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  department_achievements: {
    displayName: 'Department Achievements',
    description: 'Department-level awards and recognitions',
    fields: [
      { key: 'achievementTitle', label: 'Achievement Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  faculty_events_conducted: {
    displayName: 'Faculty Events Conducted',
    description: 'Workshops, seminars, and training by faculty',
    fields: [
      { key: 'eventName', label: 'Event Name', type: 'text', required: true },
      { key: 'conductedBy', label: 'Conducted By', type: 'text', required: true },
      { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  student_events_conducted: {
    displayName: 'Student Events Conducted',
    description: 'Technical events organized by students',
    fields: [
      { key: 'eventName', label: 'Event Name', type: 'text', required: true },
      { key: 'organizers', label: 'Organizers', type: 'text', required: true },
      { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  non_technical_events: {
    displayName: 'Non-Technical Events',
    description: 'Cultural, sports, and other non-technical activities',
    fields: [
      { key: 'eventName', label: 'Event Name', type: 'text', required: true },
      { key: 'eventType', label: 'Event Type', type: 'select', required: true, options: ['cultural', 'sports', 'social', 'other'] },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  industry_college_visits: {
    displayName: 'Industry/College Visits',
    description: 'Industrial visits and college collaborations',
    fields: [
      { key: 'visitTo', label: 'Visit To', type: 'text', required: true },
      { key: 'purpose', label: 'Purpose', type: 'textarea', required: true },
      { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  hackathon_participation: {
    displayName: 'Hackathon Participation',
    description: 'Student participation in hackathons',
    fields: [
      { key: 'hackathonName', label: 'Hackathon Name', type: 'text', required: true },
      { key: 'teamMembers', label: 'Team Members', type: 'text', required: true },
      { key: 'result', label: 'Result/Achievement', type: 'text', required: false },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  faculty_fdp_certifications: {
    displayName: 'Faculty FDP/Certifications',
    description: 'Faculty development programs and certifications',
    fields: [
      { key: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
      { key: 'programName', label: 'Program/Certification Name', type: 'text', required: true },
      { key: 'organizer', label: 'Organized By', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  faculty_visits: {
    displayName: 'Faculty Visits',
    description: 'Guest lectures and expert visits',
    fields: [
      { key: 'visitorName', label: 'Visitor Name', type: 'text', required: true },
      { key: 'organization', label: 'Organization', type: 'text', required: true },
      { key: 'purpose', label: 'Purpose', type: 'textarea', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  patents_published: {
    displayName: 'Patents Published',
    description: 'Patents filed or published',
    fields: [
      { key: 'patentTitle', label: 'Patent Title', type: 'text', required: true },
      { key: 'inventors', label: 'Inventors', type: 'text', required: true },
      { key: 'status', label: 'Status', type: 'select', required: true, options: ['filed', 'published', 'granted'] },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  vedic_programs: {
    displayName: 'Vedic Programs',
    description: 'Vedic mathematics and related programs',
    fields: [
      { key: 'programName', label: 'Program Name', type: 'text', required: true },
      { key: 'conductedBy', label: 'Conducted By', type: 'text', required: true },
      { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  placements: {
    displayName: 'Placements',
    description: 'Student placement details',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text', required: true },
      { key: 'studentsPlaced', label: 'Students Placed', type: 'number', required: true },
      { key: 'packageLPA', label: 'Package (LPA)', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  mous_signed: {
    displayName: 'MOUs Signed',
    description: 'Memorandums of Understanding with organizations',
    fields: [
      { key: 'organizationName', label: 'Organization Name', type: 'text', required: true },
      { key: 'purpose', label: 'Purpose', type: 'textarea', required: true },
      { key: 'duration', label: 'Duration (Years)', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  skill_development_programs: {
    displayName: 'Skill Development Programs',
    description: 'Training programs for skill enhancement',
    fields: [
      { key: 'programName', label: 'Program Name', type: 'text', required: true },
      { key: 'skillArea', label: 'Skill Area', type: 'text', required: true },
      { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  }
};

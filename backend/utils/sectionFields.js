const SECTION_FIELDS = {
  general_points: [
    { key: 'pointType', label: 'Point Type', type: 'select', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  faculty_joined_relieved: [
    { key: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { key: 'designation', label: 'Designation', type: 'text', required: true },
    { key: 'type', label: 'Type', type: 'select', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  faculty_achievements: [
    { key: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { key: 'achievementType', label: 'Achievement Type', type: 'select', required: true },
    { key: 'details', label: 'Details', type: 'textarea', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  student_achievements: [
    { key: 'studentName', label: 'Student Name', type: 'text', required: true },
    { key: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
    { key: 'achievementDetails', label: 'Achievement Details', type: 'textarea', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  department_achievements: [
    { key: 'achievementTitle', label: 'Achievement Title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  faculty_events_conducted: [
    { key: 'eventName', label: 'Event Name', type: 'text', required: true },
    { key: 'conductedBy', label: 'Conducted By', type: 'text', required: true },
    { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  student_events_conducted: [
    { key: 'eventName', label: 'Event Name', type: 'text', required: true },
    { key: 'organizers', label: 'Organizers', type: 'text', required: true },
    { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  non_technical_events: [
    { key: 'eventName', label: 'Event Name', type: 'text', required: true },
    { key: 'eventType', label: 'Event Type', type: 'select', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  industry_college_visits: [
    { key: 'visitTo', label: 'Visit To', type: 'text', required: true },
    { key: 'purpose', label: 'Purpose', type: 'textarea', required: true },
    { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  hackathon_participation: [
    { key: 'hackathonName', label: 'Hackathon Name', type: 'text', required: true },
    { key: 'teamMembers', label: 'Team Members', type: 'text', required: true },
    { key: 'result', label: 'Result/Achievement', type: 'text', required: false },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  faculty_fdp_certifications: [
    { key: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
    { key: 'programName', label: 'Program/Certification Name', type: 'text', required: true },
    { key: 'organizer', label: 'Organized By', type: 'text', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  faculty_visits: [
    { key: 'visitorName', label: 'Visitor Name', type: 'text', required: true },
    { key: 'organization', label: 'Organization', type: 'text', required: true },
    { key: 'purpose', label: 'Purpose', type: 'textarea', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  patents_published: [
    { key: 'patentTitle', label: 'Patent Title', type: 'text', required: true },
    { key: 'inventors', label: 'Inventors', type: 'text', required: true },
    { key: 'status', label: 'Status', type: 'select', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  vedic_programs: [
    { key: 'programName', label: 'Program Name', type: 'text', required: true },
    { key: 'conductedBy', label: 'Conducted By', type: 'text', required: true },
    { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  placements: [
    { key: 'companyName', label: 'Company Name', type: 'text', required: true },
    { key: 'studentsPlaced', label: 'Students Placed', type: 'number', required: true },
    { key: 'packageLPA', label: 'Package (LPA)', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  mous_signed: [
    { key: 'organizationName', label: 'Organization Name', type: 'text', required: true },
    { key: 'purpose', label: 'Purpose', type: 'textarea', required: true },
    { key: 'duration', label: 'Duration (Years)', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  skill_development_programs: [
    { key: 'programName', label: 'Program Name', type: 'text', required: true },
    { key: 'skillArea', label: 'Skill Area', type: 'text', required: true },
    { key: 'participants', label: 'Number of Participants', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ]
};

module.exports = SECTION_FIELDS;

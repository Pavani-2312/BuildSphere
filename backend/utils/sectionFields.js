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
  student_achievements: [
    { key: 'studentName', label: 'Student Name', type: 'text', required: true },
    { key: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
    { key: 'achievementDetails', label: 'Achievement Details', type: 'textarea', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ],
  placements: [
    { key: 'companyName', label: 'Company Name', type: 'text', required: true },
    { key: 'studentsPlaced', label: 'Students Placed', type: 'number', required: true },
    { key: 'packageLPA', label: 'Package (LPA)', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true }
  ]
};

module.exports = SECTION_FIELDS;

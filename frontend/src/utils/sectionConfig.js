export const SECTIONS = {
  general_points: {
    displayName: 'General Points',
    fields: [
      { key: 'pointType', label: 'Point Type', type: 'select', required: true, options: ['parent_teacher_meeting', 'department_meeting', 'announcement', 'other'] },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  faculty_joined_relieved: {
    displayName: 'Faculty Joined / Relieved',
    fields: [
      { key: 'facultyName', label: 'Faculty Name', type: 'text', required: true },
      { key: 'designation', label: 'Designation', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', required: true, options: ['joined', 'relieved'] },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  student_achievements: {
    displayName: 'Student Achievements',
    fields: [
      { key: 'studentName', label: 'Student Name', type: 'text', required: true },
      { key: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
      { key: 'achievementDetails', label: 'Achievement Details', type: 'textarea', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  },
  placements: {
    displayName: 'Placements',
    fields: [
      { key: 'companyName', label: 'Company Name', type: 'text', required: true },
      { key: 'studentsPlaced', label: 'Students Placed', type: 'number', required: true },
      { key: 'packageLPA', label: 'Package (LPA)', type: 'number', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true }
    ]
  }
};

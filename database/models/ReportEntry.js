const mongoose = require('mongoose');

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

const reportEntrySchema = new mongoose.Schema({
  weekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week',
    required: [true, 'Week ID is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: {
      values: SECTIONS,
      message: '{VALUE} is not a valid section'
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Entry data is required']
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enteredByName: {
    type: String,
    required: true
  },
  enteredByRole: {
    type: String,
    required: true
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastEditedByName: {
    type: String
  },
  lastEditedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

reportEntrySchema.index({ weekId: 1, section: 1, isDeleted: 1 });
reportEntrySchema.index({ weekId: 1, department: 1, isDeleted: 1 });
reportEntrySchema.index({ enteredBy: 1 });
reportEntrySchema.index({ weekId: 1, enteredBy: 1 });
reportEntrySchema.index({ isDeleted: 1, createdAt: -1 });

module.exports = mongoose.model('ReportEntry', reportEntrySchema);

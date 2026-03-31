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

const sectionStatusSchema = new mongoose.Schema({
  weekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Week',
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    enum: {
      values: SECTIONS,
      message: '{VALUE} is not a valid section'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'in_progress', 'complete'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  entryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedByName: {
    type: String
  },
  lastUpdatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

sectionStatusSchema.index({ weekId: 1, department: 1, section: 1 }, { unique: true });
sectionStatusSchema.index({ weekId: 1, department: 1 });

module.exports = mongoose.model('SectionStatus', sectionStatusSchema);

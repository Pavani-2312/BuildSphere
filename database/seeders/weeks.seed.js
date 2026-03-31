require('dotenv').config();
const mongoose = require('mongoose');
const Week = require('../models/Week');
const SectionStatus = require('../models/SectionStatus');
const User = require('../models/User');

const DEPARTMENTS = ['EEE', 'ECE', 'CSE', 'AIML', 'IT'];

const SECTIONS = [
  'general_points', 'faculty_joined_relieved', 'faculty_achievements',
  'student_achievements', 'department_achievements', 'faculty_events_conducted',
  'student_events_conducted', 'non_technical_events', 'industry_college_visits',
  'hackathon_participation', 'faculty_fdp_certifications', 'faculty_visits',
  'patents_published', 'vedic_programs', 'placements', 'mous_signed',
  'skill_development_programs'
];

const seedWeeks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'bvrit_report_db' });
    console.log('Connected to MongoDB\n');

    const admin = await User.findOne({ role: 'admin' });
    const today = new Date();

    // Create active week for each department
    for (const dept of DEPARTMENTS) {
      const existing = await Week.findOne({ department: dept, status: 'active' });
      
      if (!existing) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const week = await Week.create({
          weekLabel: `Week ${Math.ceil(today.getDate() / 7)} - ${today.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          startDate,
          endDate,
          department: dept,
          status: 'active',
          createdBy: admin._id,
          createdByName: admin.name,
          totalEntries: 0
        });

        // Create 17 section statuses
        const sectionStatuses = SECTIONS.map(section => ({
          weekId: week._id,
          department: dept,
          section,
          status: 'pending',
          entryCount: 0
        }));

        await SectionStatus.insertMany(sectionStatuses);
        console.log(`Created active week for ${dept}`);
      }
    }

    // Create 2 past weeks for AIML (for testing history)
    const aimlWeeks = await Week.find({ department: 'AIML' }).sort({ startDate: -1 });
    
    if (aimlWeeks.length < 3) {
      for (let i = 1; i <= 2; i++) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - (i * 7));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const week = await Week.create({
          weekLabel: `Week ${Math.ceil(startDate.getDate() / 7)} - ${startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          startDate,
          endDate,
          department: 'AIML',
          status: i === 1 ? 'submitted' : 'archived',
          createdBy: admin._id,
          createdByName: admin.name,
          submittedBy: admin._id,
          submittedByName: admin.name,
          submittedAt: endDate,
          totalEntries: 0
        });

        const sectionStatuses = SECTIONS.map(section => ({
          weekId: week._id,
          department: 'AIML',
          section,
          status: 'complete',
          entryCount: 0
        }));

        await SectionStatus.insertMany(sectionStatuses);
        console.log(`Created past week ${i} for AIML (${week.status})`);
      }
    }

    console.log('\nWeek seeding complete!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seedWeeks();

require('dotenv').config();
const mongoose = require('mongoose');
const ReportEntry = require('../models/ReportEntry');
const SectionStatus = require('../models/SectionStatus');
const Week = require('../models/Week');
const User = require('../models/User');

const seedEntries = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'bvrit_report_db' });
    console.log('Connected to MongoDB\n');

    const aimlWeek = await Week.findOne({ department: 'AIML', status: 'active' });
    const faculty = await User.findOne({ role: 'faculty', department: 'AIML' });

    if (!aimlWeek || !faculty) {
      console.log('Run users and weeks seeders first');
      return;
    }

    const existingEntries = await ReportEntry.countDocuments({ weekId: aimlWeek._id });
    if (existingEntries > 0) {
      console.log('Sample entries already exist');
      return;
    }

    const entries = [
      {
        section: 'student_achievements',
        data: {
          studentName: 'Rajesh Kumar',
          rollNumber: '22WH1A6601',
          achievementDetails: 'Won first prize in National Level Hackathon',
          date: new Date()
        }
      },
      {
        section: 'student_achievements',
        data: {
          studentName: 'Priya Sharma',
          rollNumber: '22WH1A6602',
          achievementDetails: 'Published research paper in IEEE conference',
          date: new Date()
        }
      },
      {
        section: 'faculty_achievements',
        data: {
          facultyName: 'Dr. Suresh Reddy',
          achievementType: 'award',
          details: 'Received Best Faculty Award 2026',
          date: new Date()
        }
      },
      {
        section: 'placements',
        data: {
          companyName: 'Google',
          studentsPlaced: 5,
          packageLPA: 45,
          date: new Date()
        }
      },
      {
        section: 'placements',
        data: {
          companyName: 'Microsoft',
          studentsPlaced: 3,
          packageLPA: 42,
          date: new Date()
        }
      },
      {
        section: 'faculty_events_conducted',
        data: {
          eventName: 'Machine Learning Workshop',
          eventType: 'Workshop',
          resourcePersonDetails: 'Dr. John Smith, MIT',
          coordinatorName: 'Dr. Suresh Reddy',
          facultyParticipated: 25,
          fromDate: new Date(),
          toDate: new Date()
        }
      },
      {
        section: 'student_events_conducted',
        data: {
          eventName: 'AI/ML Bootcamp',
          eventType: 'Workshop',
          resourcePersonDetails: 'Industry Expert from Amazon',
          coordinatorName: 'Prof. Ramesh',
          studentsParticipated: 120,
          fromDate: new Date(),
          toDate: new Date()
        }
      },
      {
        section: 'hackathon_participation',
        data: {
          eventName: 'Smart India Hackathon 2026',
          conductedBy: 'Government of India',
          mentorDetails: 'Dr. Suresh Reddy',
          studentsParticipated: 6,
          studentRollNumbers: '22WH1A6601, 22WH1A6602, 22WH1A6603',
          fromDate: new Date(),
          toDate: new Date()
        }
      },
      {
        section: 'mous_signed',
        data: {
          organizationName: 'Amazon Web Services',
          signingDate: new Date(),
          validityPeriod: '3 years',
          purpose: 'Cloud computing training and certification'
        }
      },
      {
        section: 'general_points',
        data: {
          pointType: 'department_meeting',
          description: 'Monthly department meeting conducted to discuss curriculum updates',
          date: new Date()
        }
      }
    ];

    for (const entry of entries) {
      await ReportEntry.create({
        weekId: aimlWeek._id,
        department: 'AIML',
        section: entry.section,
        data: entry.data,
        enteredBy: faculty._id,
        enteredByName: faculty.name,
        enteredByRole: faculty.role
      });

      await SectionStatus.findOneAndUpdate(
        { weekId: aimlWeek._id, section: entry.section },
        {
          $inc: { entryCount: 1 },
          status: 'in_progress',
          lastUpdatedBy: faculty._id,
          lastUpdatedByName: faculty.name,
          lastUpdatedAt: new Date()
        }
      );

      console.log(`Created entry for ${entry.section}`);
    }

    await Week.findByIdAndUpdate(aimlWeek._id, { totalEntries: entries.length });

    console.log(`\nCreated ${entries.length} sample entries for AIML department`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seedEntries();

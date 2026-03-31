require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Week = require('./models/Week');
const SectionStatus = require('./models/SectionStatus');

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

const run = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('Error: MONGODB_URI not found in .env file');
    console.log('\nCreate a .env file with:');
    console.log('MONGODB_URI=your_connection_string');
    console.log('ADMIN_PASSWORD=your_secure_password');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'bvrit_report_db'
    });
    console.log('Connected to MongoDB');

    // Create admin user
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin already exists. Skipping...');
    } else {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
      
      const admin = await User.create({
        name: 'System Administrator',
        email: '24wh1a05z1@bvrithyderabad.edu.in',
        password: hashedPassword,
        role: 'admin',
        department: 'Administration',
        isActive: true,
        refreshTokenVersion: 0
      });

      console.log('Admin user created');
      console.log('  Email: 24wh1a05z1@bvrithyderabad.edu.in');
      console.log('  Password:', process.env.ADMIN_PASSWORD || 'Admin@123');
    }

    // Create sample week
    const admin = await User.findOne({ role: 'admin' });
    const department = 'CSE(AI&ML)';
    
    const existingWeek = await Week.findOne({ 
      department, 
      status: 'active' 
    });

    if (existingWeek) {
      console.log('Active week already exists. Skipping...');
    } else {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const week = await Week.create({
        weekLabel: `Week ${Math.ceil(today.getDate() / 7)} - ${today.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        startDate,
        endDate,
        department,
        status: 'active',
        createdBy: admin._id,
        createdByName: admin.name,
        totalEntries: 0
      });

      // Create 17 section statuses
      const sectionStatuses = SECTIONS.map(section => ({
        weekId: week._id,
        department,
        section,
        status: 'pending',
        entryCount: 0
      }));

      await SectionStatus.insertMany(sectionStatuses);

      console.log('Sample week created');
      console.log('  Week:', week.weekLabel);
      console.log('  Department:', department);
      console.log('17 section statuses initialized');
    }

    console.log('\nDatabase initialization complete!');
    console.log('\nCollections created:');
    console.log('  - users');
    console.log('  - weeks');
    console.log('  - reportentries');
    console.log('  - sectionstatuses');
    console.log('  - auditlogs');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 8000) {
      console.log('\nTip: Check your MONGODB_URI connection string');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
};

run();

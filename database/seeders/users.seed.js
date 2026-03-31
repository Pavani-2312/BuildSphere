require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const DEPARTMENTS = ['EEE', 'ECE', 'CSE', 'AIML', 'IT'];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'bvrit_report_db' });
    console.log('Connected to MongoDB\n');

    // Get admin for createdBy reference
    const admin = await User.findOne({ role: 'admin' });

    // Create second admin
    const existingSecondAdmin = await User.findOne({ email: 'admin2@bvrithyderabad.edu.in' });
    if (!existingSecondAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
      await User.create({
        name: 'Secondary Administrator',
        email: 'admin2@bvrithyderabad.edu.in',
        password: hashedPassword,
        role: 'admin',
        department: 'Administration',
        isActive: true,
        refreshTokenVersion: 0,
        createdBy: admin._id
      });
      console.log('Created: admin2@bvrithyderabad.edu.in');
    }

    // Create coordinators for each department
    for (const dept of DEPARTMENTS) {
      const email = `coordinator.${dept.toLowerCase()}@bvrithyderabad.edu.in`;
      const existing = await User.findOne({ email });
      
      if (!existing) {
        const hashedPassword = await bcrypt.hash('Coordinator@123', 12);
        await User.create({
          name: `${dept} Coordinator`,
          email,
          password: hashedPassword,
          role: 'coordinator',
          department: dept,
          employeeId: `COORD${dept}001`,
          phoneNumber: '9876543210',
          isActive: true,
          refreshTokenVersion: 0,
          createdBy: admin._id
        });
        console.log(`Created: ${email}`);
      }
    }

    // Create 2 faculty members per department
    for (const dept of DEPARTMENTS) {
      for (let i = 1; i <= 2; i++) {
        const email = `faculty${i}.${dept.toLowerCase()}@bvrithyderabad.edu.in`;
        const existing = await User.findOne({ email });
        
        if (!existing) {
          const hashedPassword = await bcrypt.hash('Faculty@123', 12);
          await User.create({
            name: `${dept} Faculty ${i}`,
            email,
            password: hashedPassword,
            role: 'faculty',
            department: dept,
            employeeId: `FAC${dept}00${i}`,
            phoneNumber: `987654321${i}`,
            isActive: true,
            refreshTokenVersion: 0,
            createdBy: admin._id
          });
          console.log(`Created: ${email}`);
        }
      }
    }

    console.log('\nUser seeding complete!');
    console.log('\nDefault Passwords:');
    console.log('  Admin: Admin@123');
    console.log('  Coordinators: Coordinator@123');
    console.log('  Faculty: Faculty@123');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

seedUsers();

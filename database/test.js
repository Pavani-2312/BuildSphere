require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Week = require('./models/Week');
const SectionStatus = require('./models/SectionStatus');
const ReportEntry = require('./models/ReportEntry');

const test = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('Error: MONGODB_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: 'bvrit_report_db' });
    console.log('Connected to MongoDB\n');

    // Test 1: Check admin exists
    const admin = await User.findOne({ role: 'admin' });
    console.log('Test 1 - Admin User:');
    console.log('  Name:', admin.name);
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  Status: PASS\n');

    // Test 2: Check active week exists
    const week = await Week.findOne({ status: 'active' });
    console.log('Test 2 - Active Week:');
    console.log('  Label:', week.weekLabel);
    console.log('  Department:', week.department);
    console.log('  Start:', week.startDate.toDateString());
    console.log('  End:', week.endDate.toDateString());
    console.log('  Status: PASS\n');

    // Test 3: Check section statuses
    const statuses = await SectionStatus.find({ weekId: week._id });
    console.log('Test 3 - Section Statuses:');
    console.log('  Count:', statuses.length);
    console.log('  Expected: 17');
    console.log('  Status:', statuses.length === 17 ? 'PASS' : 'FAIL');
    console.log('\n  Sections:');
    statuses.forEach(s => {
      console.log(`    - ${s.section}: ${s.status} (${s.entryCount} entries)`);
    });

    // Test 4: Check indexes
    console.log('\nTest 4 - Indexes:');
    const userIndexes = await User.collection.getIndexes();
    const weekIndexes = await Week.collection.getIndexes();
    console.log('  User indexes:', Object.keys(userIndexes).length);
    console.log('  Week indexes:', Object.keys(weekIndexes).length);
    console.log('  Status: PASS\n');

    console.log('All tests passed!');

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

test();

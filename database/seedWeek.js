const { ObjectId } = require('mongodb');

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

const seedWeek = async (db, adminId) => {
  const department = 'CSE(AI&ML)';
  
  const existingWeek = await db.collection('weeks').findOne({ 
    department, 
    status: 'active' 
  });

  if (existingWeek) {
    console.log('Active week already exists. Skipping...');
    return;
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay());
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const week = {
    weekLabel: `Week ${Math.ceil(today.getDate() / 7)} - ${today.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    startDate,
    endDate,
    department,
    status: 'active',
    createdBy: new ObjectId(adminId),
    createdByName: 'System Administrator',
    totalEntries: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection('weeks').insertOne(week);
  const weekId = result.insertedId;

  const sectionStatuses = SECTIONS.map(section => ({
    weekId,
    department,
    section,
    status: 'pending',
    entryCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await db.collection('section_status').insertMany(sectionStatuses);

  console.log('✓ Sample week created');
  console.log(`  Week: ${week.weekLabel}`);
  console.log(`  Department: ${department}`);
  console.log('✓ 17 section statuses initialized');
};

module.exports = seedWeek;

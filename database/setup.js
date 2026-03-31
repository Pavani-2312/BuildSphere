// MongoDB Database Setup Script
// Run this after connecting to MongoDB to create indexes

const setupDatabase = async (db) => {
  console.log('Setting up database indexes...');

  // Users collection indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1, department: 1 });
  console.log('✓ Users indexes created');

  // Weeks collection indexes
  await db.collection('weeks').createIndex(
    { department: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'active' } }
  );
  await db.collection('weeks').createIndex({ startDate: -1 });
  await db.collection('weeks').createIndex({ department: 1 });
  console.log('✓ Weeks indexes created');

  // Report entries collection indexes
  await db.collection('report_entries').createIndex({ weekId: 1, section: 1, isDeleted: 1 });
  await db.collection('report_entries').createIndex({ weekId: 1, department: 1, isDeleted: 1 });
  await db.collection('report_entries').createIndex({ enteredBy: 1 });
  await db.collection('report_entries').createIndex({ weekId: 1, enteredBy: 1 });
  await db.collection('report_entries').createIndex({ isDeleted: 1, createdAt: -1 });
  console.log('✓ Report entries indexes created');

  // Section status collection indexes
  await db.collection('section_status').createIndex(
    { weekId: 1, department: 1, section: 1 },
    { unique: true }
  );
  await db.collection('section_status').createIndex({ weekId: 1, department: 1 });
  console.log('✓ Section status indexes created');

  // Audit logs collection indexes
  await db.collection('audit_logs').createIndex({ weekId: 1, timestamp: -1 });
  await db.collection('audit_logs').createIndex({ performedBy: 1, timestamp: -1 });
  await db.collection('audit_logs').createIndex({ timestamp: 1 });
  console.log('✓ Audit logs indexes created');

  console.log('Database setup complete!');
};

module.exports = setupDatabase;

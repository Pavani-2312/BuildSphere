require('dotenv').config();
const { MongoClient } = require('mongodb');
const setupDatabase = require('./setup');
const seedAdmin = require('./seedAdmin');
const seedWeek = require('./seedWeek');

const run = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('Error: MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('bvrit_report_db');

    await setupDatabase(db);
    await seedAdmin(db);
    
    const admin = await db.collection('users').findOne({ role: 'admin' });
    if (admin) {
      await seedWeek(db, admin._id.toString());
    }

    console.log('\n✅ Database initialization complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
};

run();

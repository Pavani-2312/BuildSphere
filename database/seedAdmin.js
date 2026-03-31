const bcrypt = require('bcrypt');

const seedAdmin = async (db) => {
  const existingAdmin = await db.collection('users').findOne({ role: 'admin' });
  
  if (existingAdmin) {
    console.log('Admin already exists. Skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);

  const admin = {
    name: 'System Administrator',
    email: 'admin@bvrithyderabad.edu.in',
    password: hashedPassword,
    role: 'admin',
    department: 'Administration',
    isActive: true,
    refreshTokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('users').insertOne(admin);
  console.log('✓ Admin user created');
  console.log('  Email: admin@bvrithyderabad.edu.in');
  console.log('  Password:', process.env.ADMIN_PASSWORD || 'Admin@123');
};

module.exports = seedAdmin;

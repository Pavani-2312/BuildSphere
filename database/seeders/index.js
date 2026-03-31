require('dotenv').config();
const mongoose = require('mongoose');

const runSeeders = async () => {
  console.log('Starting database seeding...\n');
  
  try {
    // Run seeders in order
    console.log('=== Seeding Users ===');
    await require('./users.seed');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== Seeding Weeks ===');
    await require('./weeks.seed');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== Seeding Sample Entries ===');
    await require('./entries.seed');

    console.log('\n=== All Seeders Complete ===');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  }
};

runSeeders();

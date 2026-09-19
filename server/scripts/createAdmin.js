/**
 * Script to create or promote an admin user in MongoDB.
 * Usage: node scripts/createAdmin.js [name] [email] [password] [phone]
 * Example: node scripts/createAdmin.js "Admin User" admin@agrirent.com AdminPass123! 9998887777
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const createAdmin = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI or MONGODB_URI not found in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const name = process.argv[2] || 'Platform Admin';
    const email = (process.argv[3] || 'admin@agrirent.com').toLowerCase().trim();
    const password = process.argv[4] || 'Admin@123456';
    const phone = process.argv[5] || '9876543210';

    let user = await User.findOne({ email });

    if (user) {
      console.log(`User with email "${email}" already exists. Updating role to "admin"...`);
      user.role = 'admin';
      user.verified = true;
      if (process.argv[4]) {
        user.password = password; // Pre-save hook will hash
      }
      await user.save();
      console.log(`Successfully promoted "${email}" to admin role!`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'admin',
        verified: true,
      });
      console.log(`Successfully created new admin user: "${email}"`);
    }

    console.log('-------------------------------------------');
    console.log(`Admin Details:`);
    console.log(`  Name:     ${user.name}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Role:     ${user.role}`);
    console.log(`  Verified: ${user.verified}`);
    console.log('-------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  }
};

createAdmin();

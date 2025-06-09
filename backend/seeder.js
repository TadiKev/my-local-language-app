// backend/seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function seedAdmin() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Define your admin credentials here
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      preferredLanguage: 'en',
      role: 'admin',
      password: 'AdminPassword123', // virtual setter on User model will hash this
    };

    // 3. Check if an admin with this email already exists
    const existing = await User.findOne({ email: adminData.email });
    if (existing) {
      // If you want to overwrite it instead of skipping, uncomment the next two lines:
      // await User.deleteOne({ email: adminData.email });
      // console.log(`Deleted existing admin with email ${adminData.email}`);
      console.log(`✔️  Admin with email "${adminData.email}" already exists. Skipping creation.`);
      process.exit(0);
    }

    // 4. Create a new User document; the virtual `password` setter will hash it
    const user = new User({
      name: adminData.name,
      email: adminData.email.toLowerCase().trim(),
      preferredLanguage: adminData.preferredLanguage,
      role: adminData.role,
    });
    user.password = adminData.password; // triggers virtual setter → hashes

    await user.save();
    console.log(`✅  Admin user created:
    • name:   ${adminData.name}
    • email:  ${adminData.email}
    • role:   ${adminData.role}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Farmer = require('../models/Farmer');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: './.env' });

// 2. The main seeder function
const seedData = async () => {
  try {
    // 3. Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in your .env file!');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // 4. Clear any existing data
    await Farmer.deleteMany({});
    console.log('Existing farmers cleared.');

    // 5. Insert the new sample data
    await Farmer.create({
      name: 'Sample Farmer',
      cellNumber: '+1234567890',
      nationalId: '23456',
      season: 'Long',
      farmLocation: { lat: 0, lng: 0 },
      weighStation: 'Station1'
    });
    console.log('Sample farmer seeded successfully!');

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ocms.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ $or: [{ username: adminUsername }, { email: adminEmail }, { role: 'admin' }] });
    if (!existingAdmin) {
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        name: process.env.ADMIN_NAME || 'Administrator',
        role: 'admin'
      });
      console.log(`Admin seeded: ${adminUsername} / ${adminEmail}`);
    } else {
      console.log('Admin already exists; skipping admin seed.');
    }

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    // 7. Disconnect from the database
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit();
  }
};

// 8. Run the seeder function
seedData();
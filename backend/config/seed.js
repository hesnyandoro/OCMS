const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Farmer = require('../models/Farmer'); // Make sure this path is correct

// 1. Load environment variables from the parent directory's .env file
dotenv.config({ path: '../.env' });

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
      season: 'long',
      farmLocation: { lat: 0, lng: 0 },
      weighStation: 'Station1'
    });
    console.log('Sample farmer seeded successfully!');

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
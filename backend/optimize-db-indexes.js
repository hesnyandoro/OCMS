/**
 * Database Index Optimization Script
 * Run this once to add indexes for faster queries
 * Usage: node optimize-db-indexes.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Delivery = require('./models/Delivery');
const Payment = require('./models/Payment');
const Farmer = require('./models/Farmer');
const User = require('./models/User');

async function optimizeIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to MongoDB\n');

    console.log(' Creating indexes for optimized queries...\n');

    // Delivery indexes
    console.log(' Optimizing Delivery collection...');
    await Delivery.collection.createIndex({ date: -1 }); // Sort by date
    await Delivery.collection.createIndex({ farmer: 1, date: -1 }); // Farmer's deliveries
    await Delivery.collection.createIndex({ type: 1 }); // Filter by type
    await Delivery.collection.createIndex({ payment: 1 }); // Already exists, but ensure it
    await Delivery.collection.createIndex({ farmer: 1, type: 1 }); // Farmer + type queries
    console.log('  ✓ Delivery indexes created');

    // Payment indexes
    console.log(' Optimizing Payment collection...');
    await Payment.collection.createIndex({ date: -1 }); // Sort by date
    await Payment.collection.createIndex({ status: 1 }); // Filter by status
    await Payment.collection.createIndex({ farmer: 1, date: -1 }); // Farmer's payments
    await Payment.collection.createIndex({ deliveries: 1 }); // Lookup by delivery
    await Payment.collection.createIndex({ status: 1, date: -1 }); // Status + date
    console.log('  ✓ Payment indexes created');

    // Farmer indexes
    console.log('👨‍🌾 Optimizing Farmer collection...');
    await Farmer.collection.createIndex({ name: 1 }); // Search by name
    await Farmer.collection.createIndex({ region: 1 }); // Filter by region
    await Farmer.collection.createIndex({ phone: 1 }); // Unique lookup
    console.log('  ✓ Farmer indexes created');

    // User indexes
    console.log('👤 Optimizing User collection...');
    await User.collection.createIndex({ email: 1 }, { unique: true }); // Unique email
    await User.collection.createIndex({ role: 1 }); // Filter by role
    console.log('  ✓ User indexes created');

    console.log('\n All indexes created successfully!');
    console.log('\n Index Statistics:');
    
    const deliveryIndexes = await Delivery.collection.indexes();
    const paymentIndexes = await Payment.collection.indexes();
    const farmerIndexes = await Farmer.collection.indexes();
    const userIndexes = await User.collection.indexes();

    console.log(`  Delivery: ${deliveryIndexes.length} indexes`);
    console.log(`  Payment: ${paymentIndexes.length} indexes`);
    console.log(`  Farmer: ${farmerIndexes.length} indexes`);
    console.log(`  User: ${userIndexes.length} indexes`);

    console.log('\n Database optimized for faster queries!');
    
  } catch (error) {
    console.error(' Error optimizing indexes:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n Disconnected from MongoDB');
    process.exit(0);
  }
}

optimizeIndexes();

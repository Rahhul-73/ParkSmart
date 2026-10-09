/**
 * Database Seeder  (PO11 — Project Management: Demo data for testing)
 *
 * Populates the database with sample parking slots and an admin user.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/parking_system';

const zones = ['A', 'B', 'C', 'D', 'E'];
const types = ['car', 'car', 'car', 'bike', 'ev', 'truck', 'handicapped'];
const featureOptions = ['covered', 'ev-charging', 'cctv', 'valet', 'near-exit', 'wide'];

const generateSlots = () => {
  const slots = [];
  let counter = 1;

  for (const zone of zones) {
    for (let floor = 0; floor <= 2; floor++) {
      const slotsPerFloor = Math.floor(Math.random() * 5) + 5; // 5-9 slots
      for (let i = 0; i < slotsPerFloor; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const numFeatures = Math.floor(Math.random() * 3);
        const features = [];
        for (let f = 0; f < numFeatures; f++) {
          const feat = featureOptions[Math.floor(Math.random() * featureOptions.length)];
          if (!features.includes(feat)) features.push(feat);
        }
        if (type === 'ev') features.push('ev-charging');

        slots.push({
          slotNumber: `${zone}${floor}-${String(counter).padStart(3, '0')}`,
          floor,
          zone,
          type,
          status: 'available',
          pricePerHour: type === 'bike' ? 20 : type === 'ev' ? 60 : type === 'truck' ? 80 : 40,
          isActive: true,
          features: [...new Set(features)],
          location: { building: 'Main', description: `Zone ${zone}, Floor ${floor}` },
        });
        counter++;
      }
    }
  }
  return slots;
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await ParkingSlot.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@parksmart.io',
      password: 'admin123',
      role: 'admin',
      phone: '+91-9876543210',
      vehicleNumber: 'KA-01-AB-1234',
      vehicleType: 'car',
    });
    console.log(`👤 Admin created: ${admin.email} / admin123`);

    // Create demo user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      role: 'user',
      phone: '+91-9876543211',
      vehicleNumber: 'KA-02-CD-5678',
      vehicleType: 'car',
    });
    console.log(`👤 User created: ${user.email} / user123`);

    // Create parking slots
    const slots = generateSlots();
    await ParkingSlot.insertMany(slots);
    console.log(`🅿️  Created ${slots.length} parking slots`);

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seed();

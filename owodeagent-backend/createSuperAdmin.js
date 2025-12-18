require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Agent = require('./models/Agent');

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await Agent.findOne({ email: 'info@owodealajo.com' });
    if (existingAdmin) {
      console.log('Super admin already exists');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash('Clement7#', 10);

    // Create super admin
    const superAdmin = new Agent({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'info@owodealajo.com',
      phone: '+1234567890', // placeholder
      passwordHash,
      status: 'approved',
      role: 'super-admin'
    });

    await superAdmin.save();
    console.log('Super admin created successfully!');
    console.log('Email: info@owodealajo.com');
    console.log('Password: Clement7#');

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSuperAdmin();
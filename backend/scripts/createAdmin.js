const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './backend/.env' }); // Explicitly specify path

const createAdmin = async () => {
  try {
    // Debug: Log MONGODB_URI
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin with email admin@example.com already exists');
      mongoose.connection.close();
      return;
    }

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Admin123!', // Will be hashed by UserSchema.pre('save')
      role: 'admin'
    });

    console.log('Admin created successfully:', {
      email: admin.email,
      role: admin.role,
      id: admin._id
    });
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createAdmin();
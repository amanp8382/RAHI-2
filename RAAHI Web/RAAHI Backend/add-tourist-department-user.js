const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function addTouristDepartmentUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {});
    
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'tourist.department.up@gmail.com' });
    
    if (existingUser) {
      console.log('❌ Tourist department user already exists:', {
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role,
        location: existingUser.location
      });
      await mongoose.connection.close();
      return;
    }
    
    // Create new tourist department user
    const touristDeptUser = new User({
      firstName: 'Tourist',
      lastName: 'Department',
      email: 'tourist.department.up@gmail.com',
      password: 'aniket1234',
      role: 'tourist_department',
      location: 'Uttar Pradesh',
      phone: '',
      isEmailVerified: true,
      isActive: true
    });
    
    // Save the user (password will be hashed automatically by the pre-save middleware)
    await touristDeptUser.save();
    
    console.log('✅ Tourist Department user created successfully!');
    console.log('📋 User Details:', {
      id: touristDeptUser._id,
      firstName: touristDeptUser.firstName,
      lastName: touristDeptUser.lastName,
      email: touristDeptUser.email,
      role: touristDeptUser.role,
      location: touristDeptUser.location,
      createdAt: touristDeptUser.createdAt
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('❌ Error creating tourist department user:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

addTouristDepartmentUser();
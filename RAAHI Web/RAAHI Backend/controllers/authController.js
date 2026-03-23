const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1d' }
  );
};

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Password is required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already exists. Please use a different email or login instead.',
        action: 'login'
      });
    }

    // Don't hash password here - User model pre-save hook will do it
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Let the model handle hashing
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully! You are now logged in.',
      token: generateToken(newUser),
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Register Error:', err.message);
    
    // Handle MongoDB duplicate key errors more gracefully
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({ 
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different ${field}.`,
        action: 'login'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Password is required' 
      });
    }

    // Need to explicitly select password field since it's excluded by default
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User does not exist. Please register first.',
        action: 'register'
      });
    }

    // Use the model's password comparison method
    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials. Please check your password.',
        action: 'retry'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get Me Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this endpoint
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await user.correctPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Let the model's pre-save hook handle hashing
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Change Password Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGOUT USER
exports.logout = async (req, res) => {
  try {
    // For JWT, logout is typically handled on the client side
    // by removing the token. Here we just confirm the logout.
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (err) {
    console.error('Logout Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// TOURIST DEPARTMENT LOGIN (State + Password)
exports.touristDepartmentLogin = async (req, res) => {
  try {
    const { state, password } = req.body;

    if (!state || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'State and password are required' 
      });
    }

    if (typeof password !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid password format' 
      });
    }

    // Normalize state name (remove extra spaces, convert to title case)
    const normalizedState = state.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // State mapping for tourist departments
    const stateMapping = {
      'uttar pradesh': 'tourist.department.up@gmail.com',
      'up': 'tourist.department.up@gmail.com',
      'maharashtra': 'tourist.department.mh@gmail.com',
      'mh': 'tourist.department.mh@gmail.com',
      'rajasthan': 'tourist.department.rj@gmail.com',
      'rj': 'tourist.department.rj@gmail.com',
      'kerala': 'tourist.department.kl@gmail.com',
      'kl': 'tourist.department.kl@gmail.com',
      'goa': 'tourist.department.ga@gmail.com',
      'ga': 'tourist.department.ga@gmail.com',
      'himachal pradesh': 'tourist.department.hp@gmail.com',
      'hp': 'tourist.department.hp@gmail.com',
      'tamil nadu': 'tourist.department.tn@gmail.com',
      'tn': 'tourist.department.tn@gmail.com',
      'karnataka': 'tourist.department.ka@gmail.com',
      'ka': 'tourist.department.ka@gmail.com',
      'west bengal': 'tourist.department.wb@gmail.com',
      'wb': 'tourist.department.wb@gmail.com',
      'gujarat': 'tourist.department.gj@gmail.com',
      'gj': 'tourist.department.gj@gmail.com'
    };

    const email = stateMapping[normalizedState];
    if (!email) {
      return res.status(404).json({ 
        success: false,
        message: `Tourist department not found for state: ${state}. Please contact administrator.`,
        availableStates: Object.keys(stateMapping).filter(key => !key.includes('.')).map(s => 
          s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        )
      });
    }

    // Find user by email and role
    const user = await User.findOne({ 
      email: email,
      role: 'tourist_department',
      isActive: true 
    }).select('+password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: `Tourist department account not found for ${state}. Please contact administrator.`
      });
    }

    // Verify password
    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials. Please check your password.',
        action: 'retry'
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    res.json({
      success: true,
      message: `Welcome, ${user.location} Tourism Department!`,
      token: generateToken(user),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (err) {
    console.error('Tourist Department Login Error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
};

// VERIFY FIREBASE TOKEN
exports.verifyFirebaseToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Firebase token is required' });
    }
    
    // TODO: Add Firebase Admin SDK verification logic here
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Firebase token verification endpoint - implementation pending'
    });
  } catch (err) {
    console.error('Verify Firebase Token Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

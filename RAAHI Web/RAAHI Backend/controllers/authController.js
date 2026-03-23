const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET || 'secretkey',
  { expiresIn: '1d' }
);

const serializeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  travelPreferences: user.travelPreferences || [],
  profilePhoto: user.profilePhoto?.dataUrl ? user.profilePhoto : null,
  location: user.location,
  isEmailVerified: user.isEmailVerified,
  isActive: user.isActive
});

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

    const newUser = new User({
      firstName,
      lastName,
      email,
      password
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Complete your profile to continue.',
      token: generateToken(newUser),
      user: serializeUser(newUser)
    });
  } catch (err) {
    console.error('Register Error:', err.message);

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different ${field}.`,
        action: 'login'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist. Please register first.',
        action: 'register'
      });
    }

    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your password.',
        action: 'retry'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    return res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user),
      user: serializeUser(user)
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (err) {
    console.error('Get Me Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.isEmailVerified;
    delete updates.isActive;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: serializeUser(user)
    });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.correctPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Change Password Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (err) {
    console.error('Logout Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

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

    const normalizedState = state.trim().toLowerCase().replace(/\s+/g, ' ');
    const stateMapping = {
      'uttar pradesh': 'tourist.department.up@gmail.com',
      up: 'tourist.department.up@gmail.com',
      maharashtra: 'tourist.department.mh@gmail.com',
      mh: 'tourist.department.mh@gmail.com',
      rajasthan: 'tourist.department.rj@gmail.com',
      rj: 'tourist.department.rj@gmail.com',
      kerala: 'tourist.department.kl@gmail.com',
      kl: 'tourist.department.kl@gmail.com',
      goa: 'tourist.department.ga@gmail.com',
      ga: 'tourist.department.ga@gmail.com',
      'himachal pradesh': 'tourist.department.hp@gmail.com',
      hp: 'tourist.department.hp@gmail.com',
      'tamil nadu': 'tourist.department.tn@gmail.com',
      tn: 'tourist.department.tn@gmail.com',
      karnataka: 'tourist.department.ka@gmail.com',
      ka: 'tourist.department.ka@gmail.com',
      'west bengal': 'tourist.department.wb@gmail.com',
      wb: 'tourist.department.wb@gmail.com',
      gujarat: 'tourist.department.gj@gmail.com',
      gj: 'tourist.department.gj@gmail.com'
    };

    const email = stateMapping[normalizedState];
    if (!email) {
      return res.status(404).json({
        success: false,
        message: `Tourist department not found for state: ${state}. Please contact administrator.`
      });
    }

    const user = await User.findOne({
      email,
      role: 'tourist_department',
      isActive: true
    }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Tourist department account not found for ${state}. Please contact administrator.`
      });
    }

    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your password.',
        action: 'retry'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    return res.json({
      success: true,
      message: `Welcome, ${user.location} Tourism Department!`,
      token: generateToken(user),
      user: serializeUser(user)
    });
  } catch (err) {
    console.error('Tourist Department Login Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

exports.verifyFirebaseToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Firebase token is required' });
    }

    return res.json({
      success: true,
      message: 'Firebase token verification endpoint - implementation pending'
    });
  } catch (err) {
    console.error('Verify Firebase Token Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

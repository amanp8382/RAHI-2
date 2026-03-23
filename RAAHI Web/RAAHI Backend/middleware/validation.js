const validator = require('validator');

const allowedTravelPreferences = [
  'Adventure',
  'Culture',
  'Beaches',
  'Mountains',
  'History',
  'Food',
  'Nature'
];

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!validator.isEmail(email)) return 'Please provide a valid email address';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (typeof password !== 'string') return 'Password must be a string';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number';
  return null;
};

const validateName = (name, fieldName) => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters long`;
  if (name.length > 50) return `${fieldName} must not exceed 50 characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} can only contain letters, spaces, apostrophes, and hyphens`;
  return null;
};

const validatePhone = (phone) => {
  if (!phone) return null;
  const normalized = phone.replace(/\s+/g, '');
  if (!/^\+?[0-9]{10,15}$/.test(normalized)) return 'Please provide a valid phone number';
  return null;
};

const validateProfilePhoto = (profilePhoto) => {
  if (!profilePhoto) return null;
  if (typeof profilePhoto !== 'object') return 'Profile photo payload is invalid';
  if (!profilePhoto.dataUrl) return 'Profile photo data is required';
  if (typeof profilePhoto.dataUrl !== 'string') return 'Profile photo data is invalid';
  if (!profilePhoto.dataUrl.startsWith('data:image/')) return 'Profile photo must be an image file';
  if (profilePhoto.dataUrl.length > 2_500_000) return 'Profile photo is too large';
  return null;
};

const validateRegistration = (req, res, next) => {
  const errors = [];
  const { email, password, firstName, lastName } = req.body;

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  const firstNameError = validateName(firstName, 'First name');
  if (firstNameError) errors.push(firstNameError);

  const lastNameError = validateName(lastName, 'Last name');
  if (lastNameError) errors.push(lastNameError);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', details: errors });
  }

  req.body.email = validator.normalizeEmail(email);
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  next();
};

const validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', details: errors });
  }

  req.body.email = validator.normalizeEmail(email);
  next();
};

const validateProfileUpdate = (req, res, next) => {
  const errors = [];
  const { firstName, lastName, phone, profilePhoto } = req.body;

  if (firstName !== undefined) {
    const firstNameError = validateName(firstName, 'First name');
    if (firstNameError) errors.push(firstNameError);
    else req.body.firstName = firstName.trim();
  }

  if (lastName !== undefined) {
    const lastNameError = validateName(lastName, 'Last name');
    if (lastNameError) errors.push(lastNameError);
    else req.body.lastName = lastName.trim();
  }

  if (phone !== undefined) {
    const phoneError = validatePhone(phone);
    if (phoneError) errors.push(phoneError);
    else req.body.phone = phone ? phone.trim() : '';
  }

  const profilePhotoError = validateProfilePhoto(profilePhoto);
  if (profilePhotoError) errors.push(profilePhotoError);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', details: errors });
  }

  next();
};

const validateTravelPreferences = (req, res, next) => {
  const { travelPreferences } = req.body;
  if (travelPreferences === undefined) return next();

  if (!Array.isArray(travelPreferences)) {
    return res.status(400).json({
      success: false,
      message: 'Travel preferences must be an array'
    });
  }

  const invalid = travelPreferences.filter((preference) => !allowedTravelPreferences.includes(preference));
  if (invalid.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid travel preferences: ${invalid.join(', ')}`,
      details: [`Allowed values are: ${allowedTravelPreferences.join(', ')}`]
    });
  }

  next();
};

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};
    const skipEscaping = ['password', 'currentPassword', 'newPassword', 'dataUrl'];

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = skipEscaping.includes(key)
          ? value.trim()
          : validator.escape(value.trim());
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) => (
          typeof item === 'string' ? validator.escape(item.trim()) : sanitize(item)
        ));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  };

  req.body = sanitize(req.body);
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateTravelPreferences,
  sanitizeInput,
  allowedTravelPreferences
};

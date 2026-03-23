const validator = require('validator');

// Validation utility functions
const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!validator.isEmail(email)) return 'Please provide a valid email address';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (typeof password !== 'string') return 'Password must be a string';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  if (password.length > 128) return 'Password must not exceed 128 characters';
  return null;
};

const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters long';
  if (username.length > 30) return 'Username must not exceed 30 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
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
  if (!phone) return null; // optional
  if (!validator.isMobilePhone(phone)) return 'Please provide a valid phone number';
  return null;
};

// Middleware
const validateRegistration = (req, res, next) => {
  const errors = [];
  const { email, password, firstName, lastName, phone } = req.body;

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  const firstNameError = validateName(firstName, 'First name');
  if (firstNameError) errors.push(firstNameError);

  const lastNameError = validateName(lastName, 'Last name');
  if (lastNameError) errors.push(lastNameError);

  const phoneError = validatePhone(phone);
  if (phoneError) errors.push(phoneError);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
  }

  // Sanitize
  req.body.email = validator.normalizeEmail(email);
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  if (phone) req.body.phone = phone.trim();

  next();
};

const validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
  }

  req.body.email = validator.normalizeEmail(email);
  next();
};

// Profile update remains mostly the same
const validateProfileUpdate = (req, res, next) => {
  const errors = [];
  const { firstName, lastName, phone, dateOfBirth } = req.body;

  if (firstName) {
    const firstNameError = validateName(firstName, 'First name');
    if (firstNameError) errors.push(firstNameError);
    else req.body.firstName = firstName.trim();
  }

  if (lastName) {
    const lastNameError = validateName(lastName, 'Last name');
    if (lastNameError) errors.push(lastNameError);
    else req.body.lastName = lastName.trim();
  }

  if (phone) {
    const phoneError = validatePhone(phone);
    if (phoneError) errors.push(phoneError);
    else req.body.phone = phone.trim();
  }

  if (dateOfBirth) {
    if (!validator.isDate(dateOfBirth)) errors.push('Please provide a valid date of birth');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
  }

  next();
};

// Travel preferences optional
const validateTravelPreferences = (req, res, next) => {
  const { travelPreferences } = req.body;
  if (!travelPreferences) return next(); // optional

  const errors = [];
  const validInterests = ['adventure','culture','food','nature','history','art','nightlife','shopping','relaxation','photography'];
  const validBudgetRanges = ['budget','mid-range','luxury'];
  const validTravelStyles = ['solo','couple','family','group','business'];
  const validAccommodationTypes = ['hotel','hostel','apartment','resort','guesthouse','camping'];
  const validDietaryRestrictions = ['vegetarian','vegan','halal','kosher','gluten-free','dairy-free','none'];

  if (travelPreferences.interests?.length) {
    const invalid = travelPreferences.interests.filter(i => !validInterests.includes(i));
    if (invalid.length) errors.push(`Invalid interests: ${invalid.join(', ')}`);
  }
  if (travelPreferences.budgetRange && !validBudgetRanges.includes(travelPreferences.budgetRange)) errors.push('Invalid budget range');
  if (travelPreferences.travelStyle && !validTravelStyles.includes(travelPreferences.travelStyle)) errors.push('Invalid travel style');
  if (travelPreferences.accommodationType?.length) {
    const invalid = travelPreferences.accommodationType.filter(i => !validAccommodationTypes.includes(i));
    if (invalid.length) errors.push(`Invalid accommodation types: ${invalid.join(', ')}`);
  }
  if (travelPreferences.dietaryRestrictions?.length) {
    const invalid = travelPreferences.dietaryRestrictions.filter(i => !validDietaryRestrictions.includes(i));
    if (invalid.length) errors.push(`Invalid dietary restrictions: ${invalid.join(', ')}`);
  }

  if (errors.length > 0) return res.status(400).json({ success: false, error: 'Travel preferences validation failed', details: errors });

  next();
};

// Simple input sanitization
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = {};
    const skipEscaping = ['password', 'currentPassword', 'newPassword']; // Don't escape passwords
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (skipEscaping.includes(key)) {
          // Only trim passwords, don't escape them
          sanitized[key] = obj[key].trim();
        } else {
          sanitized[key] = validator.escape(obj[key].trim());
        }
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitize(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  };
  req.body = sanitize(req.body);
  next();
};

module.exports = { validateRegistration, validateLogin, validateProfileUpdate, validateTravelPreferences, sanitizeInput };

import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './styles/auth.css';

const preferenceOptions = ['Adventure', 'Culture', 'Beaches', 'Mountains', 'History', 'Food', 'Nature'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const sanitizeDigits = (value) => value.replace(/\D/g, '');
const normalizeAadhaar = (value) => sanitizeDigits(value).slice(0, 12);

const formatAadhaar = (value) => normalizeAadhaar(value).replace(/(\d{4})(?=\d)/g, '$1 ').trim();

const isValidAadhaar = (value) => /^\d{12}$/.test(normalizeAadhaar(value));

const hasCompletedProfile = (user) => (
  Boolean(
    user?.phone &&
    user?.age &&
    user?.destination &&
    user?.tripDurationDays &&
    user?.bloodGroup &&
    user?.aadhaarVerified
  )
);

const ProfileSetup = () => {
  const { user, isAuthenticated, isLoading, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    age: user?.age || '',
    destination: user?.destination || '',
    tripDurationDays: user?.tripDurationDays || '',
    bloodGroup: user?.bloodGroup || '',
    medicalConditions: user?.medicalConditions || '',
    aadhaarNumber: formatAadhaar(user?.aadhaarNumber || ''),
    travelPreferences: user?.travelPreferences || [],
    profilePhoto: user?.profilePhoto || null
  });
  const [preview, setPreview] = useState(user?.profilePhoto?.dataUrl || '');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '', details: [] });

  const selectedCount = useMemo(() => formData.travelPreferences.length, [formData.travelPreferences]);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'aadhaarNumber' ? formatAadhaar(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePreferenceToggle = (preference) => {
    setFormData((prev) => {
      const exists = prev.travelPreferences.includes(preference);
      return {
        ...prev,
        travelPreferences: exists
          ? prev.travelPreferences.filter((item) => item !== preference)
          : [...prev.travelPreferences, preference]
      };
    });
    setErrors((prev) => ({ ...prev, travelPreferences: '' }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, profilePhoto: 'Please select an image file.' }));
      return;
    }

    if (file.size > 1500000) {
      setErrors((prev) => ({ ...prev, profilePhoto: 'Profile photo must be smaller than 1.5 MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextPhoto = {
        name: file.name,
        type: file.type,
        dataUrl: reader.result
      };

      setFormData((prev) => ({ ...prev, profilePhoto: nextPhoto }));
      setPreview(reader.result);
      setErrors((prev) => ({ ...prev, profilePhoto: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const nextErrors = {};
    const age = Number(formData.age);
    const tripDays = Number(formData.tripDurationDays);
    const phone = formData.phone.trim();

    if (!phone) nextErrors.phone = 'Phone number is required.';
    else if (!/^\+?[0-9\s-]{10,15}$/.test(phone)) nextErrors.phone = 'Enter a valid phone number.';

    if (!formData.age) nextErrors.age = 'Age is required.';
    else if (!Number.isInteger(age) || age < 1 || age > 120) nextErrors.age = 'Enter a valid age.';

    if (!formData.destination.trim()) nextErrors.destination = 'Travel destination is required.';

    if (!formData.tripDurationDays) nextErrors.tripDurationDays = 'Trip duration is required.';
    else if (!Number.isInteger(tripDays) || tripDays < 1 || tripDays > 365) nextErrors.tripDurationDays = 'Trip duration must be between 1 and 365 days.';

    if (!formData.bloodGroup) nextErrors.bloodGroup = 'Blood group is required.';

    if (!isValidAadhaar(formData.aadhaarNumber)) nextErrors.aadhaarNumber = 'Aadhaar number must contain exactly 12 digits.';

    if (formData.travelPreferences.length === 0) nextErrors.travelPreferences = 'Select at least one travel preference.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      phone: formData.phone.trim(),
      age: Number(formData.age),
      destination: formData.destination.trim(),
      tripDurationDays: Number(formData.tripDurationDays),
      bloodGroup: formData.bloodGroup,
      medicalConditions: formData.medicalConditions.trim(),
      aadhaarNumber: normalizeAadhaar(formData.aadhaarNumber),
      aadhaarVerified: isValidAadhaar(formData.aadhaarNumber),
      travelPreferences: formData.travelPreferences,
      profilePhoto: formData.profilePhoto
    };

    const result = await completeProfile(payload);

    if (!result.success) {
      setStatus({
        type: 'error',
        message: result.error || 'Could not save your profile.',
        details: result.details || []
      });
      return;
    }

    setStatus({
      type: 'success',
      message: result.message || 'Traveler information saved successfully.',
      details: []
    });

    setTimeout(() => {
      navigate('/dashboard');
    }, 700);
  };

  if (!isLoading && isAuthenticated && hasCompletedProfile(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-copy">
          <p className="auth-eyebrow">RAAHI Traveler Card</p>
          <h1>Traveler Information</h1>
          <p className="auth-subtitle">Collect the trip and health details needed for rapid verification, emergency support, and QR-based traveler sharing.</p>
          <div className="auth-tip-list">
            <div>Name and trip details for identification</div>
            <div>Health details for emergency response</div>
            <div>Aadhaar format validation before card generation</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form-header">
            <h2>Complete Traveler Profile</h2>
            <p>Welcome{user?.firstName ? `, ${user.firstName}` : ''}. This information will be used to create your traveler QR card.</p>
          </div>

          {status.message && (
            <div className={`auth-alert auth-alert-${status.type}`}>
              <p>{status.message}</p>
              {status.details?.length > 0 && (
                <ul>
                  {status.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} disabled={isLoading} />
              {errors.phone && <span className="auth-error">{errors.phone}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="age">Age</label>
              <input id="age" name="age" type="number" min="1" max="120" value={formData.age} onChange={handleChange} disabled={isLoading} />
              {errors.age && <span className="auth-error">{errors.age}</span>}
            </div>
          </div>

          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="destination">Where Are You Travelling?</label>
              <input id="destination" name="destination" placeholder="Jaipur, Rajasthan" value={formData.destination} onChange={handleChange} disabled={isLoading} />
              {errors.destination && <span className="auth-error">{errors.destination}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="tripDurationDays">For How Many Days?</label>
              <input id="tripDurationDays" name="tripDurationDays" type="number" min="1" max="365" placeholder="5" value={formData.tripDurationDays} onChange={handleChange} disabled={isLoading} />
              {errors.tripDurationDays && <span className="auth-error">{errors.tripDurationDays}</span>}
            </div>
          </div>

          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="bloodGroup">Blood Group</label>
              <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} disabled={isLoading}>
                <option value="">Select blood group</option>
                {bloodGroupOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {errors.bloodGroup && <span className="auth-error">{errors.bloodGroup}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="aadhaarNumber">Aadhaar Number</label>
              <input id="aadhaarNumber" name="aadhaarNumber" inputMode="numeric" maxLength="14" placeholder="1234 5678 9012" value={formData.aadhaarNumber} onChange={handleChange} disabled={isLoading} />
              {errors.aadhaarNumber && <span className="auth-error">{errors.aadhaarNumber}</span>}
              {!errors.aadhaarNumber && formData.aadhaarNumber && isValidAadhaar(formData.aadhaarNumber) && (
                <span className="auth-success">Aadhaar format verified.</span>
              )}
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="medicalConditions">Health Details / Diseases</label>
            <textarea id="medicalConditions" name="medicalConditions" rows="3" placeholder="Blood pressure, diabetes, asthma, allergies, or write None" value={formData.medicalConditions} onChange={handleChange} disabled={isLoading} />
          </div>

          <div className="auth-field">
            <div className="auth-field-header">
              <label>Travel Preferences</label>
              <span>{selectedCount} selected</span>
            </div>
            <div className="preference-grid">
              {preferenceOptions.map((option) => (
                <label key={option} className={`preference-chip ${formData.travelPreferences.includes(option) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.travelPreferences.includes(option)}
                    onChange={() => handlePreferenceToggle(option)}
                    disabled={isLoading}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors.travelPreferences && <span className="auth-error">{errors.travelPreferences}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="profilePhoto">Profile Photo</label>
            <input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" onChange={handlePhotoChange} disabled={isLoading} />
            {errors.profilePhoto && <span className="auth-error">{errors.profilePhoto}</span>}
            <div className="photo-preview">
              {preview ? <img src={preview} alt="Profile preview" /> : <span>No photo selected</span>}
            </div>
          </div>

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Generating traveler card...' : 'Save and generate QR card'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

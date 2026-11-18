module.exports = user => ({
  id: user._id.toString(), firstName: user.firstName, lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`.trim(), email: user.email,
  role: user.role, userType: user.role === 'police' ? 'police' : user.role === 'tourist_department' ? 'department' : 'tourist',
  phone: user.phone || '', age: user.age || '', destination: user.destination || '',
  tripDurationDays: user.tripDurationDays || '', bloodGroup: user.bloodGroup || '',
  medicalConditions: user.medicalConditions || '', aadhaarMasked: user.aadhaarMasked || '',
  aadhaarVerified: Boolean(user.aadhaarVerified), stationName: user.stationName,
  travelerId: user.travelerId, credentialHash: user.credentialHash,
  credentialIssuedAt: user.createdAt, issuedAt: user.createdAt, updatedAt: user.updatedAt,
  publicCardPath: `/traveler/${user.travelerId}`, liveLocation: user.liveLocation,
  travelPreferences: user.travelPreferences || [], profilePhoto: user.profilePhoto?.dataUrl ? user.profilePhoto : null,
  location: user.location, isEmailVerified: user.isEmailVerified, isActive: user.isActive,
  verificationStatus: 'Record stored in MongoDB'
});

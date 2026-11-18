// Initialize the two police identities already supported by the login screen.
// Never overwrite an existing account or reset a stored password.
const User = require('../models/User');
module.exports = async () => {
  const accounts = [
    { pincode: '110001', firstName: 'Delhi Police', lastName: 'Control Room', email: 'police@raahi.local', stationName: 'Connaught Place Police Station' },
    { pincode: '110006', firstName: 'North Delhi', lastName: 'Police', email: 'north.police@raahi.local', stationName: 'Red Fort Police Post' }
  ];
  for (const account of accounts) {
    const existing = await User.exists({ role: 'police', pincode: account.pincode });
    if (!existing) await User.create({ ...account, role: 'police', password: process.env.INITIAL_POLICE_PASSWORD || 'police123' });
  }
};

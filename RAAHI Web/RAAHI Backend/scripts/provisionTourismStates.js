require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { states } = require('../config/tourismStates');
async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, family: 4 });
  const accounts = [];
  for (const state of states) {
    const existing = await User.findOne({ email: state.email }).select('+password');
    if (existing && (existing.role !== 'tourist_department' || existing.location !== state.name)) throw new Error(`Account conflict for ${state.name}`);
    const duplicate = await User.findOne({ role: 'tourist_department', location: state.name, email: { $ne: state.email } });
    if (duplicate) throw new Error(`Multiple accounts for ${state.name}; review required`);
    accounts.push({ state, existing });
  }
  for (const { state, existing } of accounts) {
    const password = state.slug.replace(/-/g, '') + '123';
    const user = existing || new User({ firstName: state.name, lastName: 'Tourism Department', email: state.email, role: 'tourist_department', location: state.name });
    user.isActive = true;
    if (!existing || !(await user.correctPassword(password, user.password))) user.password = password;
    await user.save();
  }
  console.log(`Configured ${accounts.length} state department accounts.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());

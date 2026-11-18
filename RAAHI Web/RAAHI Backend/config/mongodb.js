const mongoose = require('mongoose');
let pending;
module.exports = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!pending) {
    pending = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000, connectTimeoutMS: 10000,
      autoIndex: false, family: 4
    }).finally(() => { pending = null; });
  }
  await pending;
  return mongoose.connection;
};

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI (or MONGODB_URI) is not defined in environment variables');
    }
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary MongoDB connection notice: ${error.message}`);
    // If Atlas failed (e.g. IP whitelist / network issue), fallback to local MongoDB instance
    try {
      console.log('Connecting to local MongoDB (mongodb://127.0.0.1:27017/agrirent)...');
      const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/agrirent', { serverSelectionTimeoutMS: 3000 });
      console.log(`Fallback connected to local MongoDB: ${localConn.connection.host}`);
    } catch (localErr) {
      console.error(`Local MongoDB fallback notice: ${localErr.message}`);
    }
  }
};

module.exports = connectDB;

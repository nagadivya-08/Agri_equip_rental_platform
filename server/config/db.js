const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGO_URI (or MONGODB_URI) is not defined in environment variables');
    return;
  }

  // Setup connection event listeners
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected from server');
  });

  const connectWithRetry = async (retries = 5, delay = 4000) => {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.warn(`⚠️ MongoDB connection attempt failed: ${error.message}`);

      // If running in local development, attempt local MongoDB fallback
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.log('Attempting local MongoDB fallback (mongodb://127.0.0.1:27017/agrirent)...');
          const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/agrirent', {
            serverSelectionTimeoutMS: 3000,
          });
          console.log(`✅ Fallback connected to local MongoDB: ${localConn.connection.host}`);
          return;
        } catch (localErr) {
          console.error(`Local MongoDB fallback notice: ${localErr.message}`);
        }
      }

      if (retries > 0) {
        console.log(`Retrying MongoDB connection in ${delay / 1000}s... (${retries} attempts left)`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      }
    }
  };

  await connectWithRetry();
};

module.exports = connectDB;

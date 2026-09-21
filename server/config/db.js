const mongoose = require('mongoose');

let retryTimer = null;
let isConnecting = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGO_URI (or MONGODB_URI) is not defined in environment variables');
    return;
  }

  // Setup connection event listeners once
  if (!mongoose.connection._hasRegisteredListeners) {
    mongoose.connection._hasRegisteredListeners = true;

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established successfully');
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Scheduling automatic reconnection...');
      scheduleRetry(1);
    });
  }

  const scheduleRetry = (attempt = 1) => {
    if (retryTimer || mongoose.connection.readyState === 1) return;
    const delay = Math.min(10000, 3000 + attempt * 1000);
    console.log(`⏳ Will attempt MongoDB reconnection in ${delay / 1000}s... (Attempt #${attempt})`);
    retryTimer = setTimeout(async () => {
      retryTimer = null;
      await connectWithRetry(attempt + 1);
    }, delay);
  };

  const connectWithRetry = async (attempt = 1) => {
    if (mongoose.connection.readyState === 1 || isConnecting) {
      return;
    }

    isConnecting = true;
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      isConnecting = false;
    } catch (error) {
      isConnecting = false;
      console.warn(`⚠️ MongoDB connection attempt #${attempt} failed: ${error.message}`);

      // If running in local development on first attempt, try local fallback
      if (process.env.NODE_ENV !== 'production' && attempt === 1) {
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

      // Schedule continuous retry until MongoDB Atlas allows access
      scheduleRetry(attempt);
    }
  };

  await connectWithRetry(1);
};

module.exports = connectDB;

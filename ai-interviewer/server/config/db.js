const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
require("dotenv").config();

let mongod;

const connectDB = async () => {
  try {
    // Try to connect to local MongoDB first
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("MongoDB connected successfully to local instance");
    } catch (localError) {
      console.log("Local MongoDB not available, starting in-memory MongoDB...");
      
      // Start in-memory MongoDB server
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      await mongoose.connect(uri);
      console.log("MongoDB connected successfully to in-memory instance");
      console.log("Note: Data will not persist between server restarts");
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Cleanup function for graceful shutdown
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error("Error closing database:", error);
  }
};

module.exports = connectDB;

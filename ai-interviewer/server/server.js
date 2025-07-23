require("dotenv").config({ path: "./.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
console.log("MONGO_URI in server.js:", process.env.MONGO_URI);
const connectDB = require("./config/db");
const interviewRoutes = require("./routes/interviewRoutes");
const authRoutes = require("./routes/authRoutes");

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow us to accept JSON in the request body

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", interviewRoutes);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'model'],
        required: true
    },
    parts: {
    type: String,
    required: true,
  },
});

const interviewSchema = new mongoose.Schema({
  history: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Interview', interviewSchema);
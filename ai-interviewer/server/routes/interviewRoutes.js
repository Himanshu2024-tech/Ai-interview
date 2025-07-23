const express = require("express");
const router = express.Router();
const { handleChat, getInterviews, getInterview, generateFeedback } = require("../controllers/interviewcontroller");
const auth = require("../middleware/auth");

// POST /api/chat
router.post("/chat", auth, handleChat);

// GET /api/interviews - Get user's interview history
router.get("/interviews", auth, getInterviews);

// GET /api/interviews/:id - Get specific interview
router.get("/interviews/:id", auth, getInterview);

// POST /api/feedback - Generate feedback for interview
router.post("/feedback", auth, generateFeedback);

module.exports = router;

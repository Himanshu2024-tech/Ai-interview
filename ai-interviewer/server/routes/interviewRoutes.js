const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/interviewcontroller");

// POST /api/chat
router.post("/chat", handleChat);

module.exports = router;

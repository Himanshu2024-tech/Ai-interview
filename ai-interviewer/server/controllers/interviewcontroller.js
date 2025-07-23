const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require("../models/Interview");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handleChat = async (req, res) => {
  try {
    const { history, message, interviewId } = req.body;

    const systemInstruction =
      "You are a friendly and professional job interviewer for a software developer role. Your name is Alex. Keep your responses and questions concise.";

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: systemInstruction,
    });

    // Clean the history for the API call
    const firstUserIndex = history.findIndex((msg) => msg.role === "user");
    const validHistoryForAPI =
      firstUserIndex > -1 ? history.slice(firstUserIndex) : [];

    const chat = model.startChat({
      history: validHistoryForAPI,
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const aiResponseText = response.text();

    const aiMessageForAPI = { role: "model", parts: aiResponseText };

    // --- START OF THE FIX ---
    // The history sent from the frontend has parts as an array: [{ text: "..." }]
    // Our DB schema needs `parts` to be a simple string.
    // We re-map the history received from the frontend to fit our DB schema.
    const historyForDB = history.map((msg) => ({
      role: msg.role,
      parts: msg.parts[0].text,
    }));

    // Add the new user message and AI response in the correct format for the DB
    const userMessageForDB = { role: "user", parts: message };
    const aiMessageForDB = { role: "model", parts: aiResponseText };
    const updatedHistoryForDB = [
      ...historyForDB,
      userMessageForDB,
      aiMessageForDB,
    ];
    // --- END OF THE FIX ---

    let currentInterview;
    if (interviewId) {
      currentInterview = await Interview.findByIdAndUpdate(
        interviewId,
        { history: updatedHistoryForDB },
        { new: true }
      );
    } else {
      currentInterview = await Interview.create({
        history: updatedHistoryForDB,
      });
    }

    res.status(200).json({
      aiMessage: aiMessageForAPI,
      interviewId: currentInterview._id,
    });
  } catch (error) {
    console.error("Chat handling error:", error);
    res.status(500).json({ message: "Error processing your request" });
  }
};

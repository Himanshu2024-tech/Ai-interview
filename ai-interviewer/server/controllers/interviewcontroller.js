const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require("../models/Interview");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Role-specific system instructions
const getRoleInstruction = (role) => {
  const instructions = {
    'Frontend Developer': 'You are a friendly and professional job interviewer for a Frontend Developer role. Focus on HTML, CSS, JavaScript, React, and UI/UX concepts. Your name is Alex. Keep your responses and questions concise.',
    'Backend Developer': 'You are a friendly and professional job interviewer for a Backend Developer role. Focus on server-side technologies, databases, APIs, and system design. Your name is Alex. Keep your responses and questions concise.',
    'Full Stack Developer': 'You are a friendly and professional job interviewer for a Full Stack Developer role. Focus on both frontend and backend technologies, system architecture, and end-to-end development. Your name is Alex. Keep your responses and questions concise.',
    'DevOps Engineer': 'You are a friendly and professional job interviewer for a DevOps Engineer role. Focus on CI/CD, cloud platforms, containerization, and infrastructure management. Your name is Alex. Keep your responses and questions concise.',
    'Data Scientist': 'You are a friendly and professional job interviewer for a Data Scientist role. Focus on machine learning, statistics, data analysis, and programming in Python/R. Your name is Alex. Keep your responses and questions concise.'
  };
  
  return instructions[role] || instructions['Full Stack Developer'];
};

exports.handleChat = async (req, res) => {
  try {
    const { history, message, interviewId, role } = req.body;
    const userId = req.user._id;

    const systemInstruction = getRoleInstruction(role || 'Full Stack Developer');

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
        { 
          history: updatedHistoryForDB,
          role: role || 'Full Stack Developer'
        },
        { new: true }
      );
    } else {
      currentInterview = await Interview.create({
        userId,
        role: role || 'Full Stack Developer',
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

// Get user's interview history
exports.getInterviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const interviews = await Interview.find({ userId })
      .select('role createdAt isCompleted feedback')
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ message: 'Error fetching interviews' });
  }
};

// Get specific interview
exports.getInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const interview = await Interview.findOne({ _id: id, userId });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ message: 'Error fetching interview' });
  }
};

// Generate feedback for interview
exports.generateFeedback = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const userId = req.user._id;

    const interview = await Interview.findOne({ _id: interviewId, userId });
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.feedback) {
      return res.json({ feedback: interview.feedback });
    }

    // Create feedback prompt
    const conversationText = interview.history
      .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.parts}`)
      .join('\n');

    const feedbackPrompt = `Based on the following interview transcript for a ${interview.role} position, please provide a concise summary of the candidate's performance. Highlight 2-3 strengths and 1-2 areas for improvement. Keep it professional and constructive.

Interview Transcript:
${conversationText}

Please provide feedback in the following format:
**Overall Performance:** [Brief summary]

**Strengths:**
- [Strength 1]
- [Strength 2]
- [Strength 3 if applicable]

**Areas for Improvement:**
- [Area 1]
- [Area 2 if applicable]

**Recommendation:** [Brief recommendation]`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const result = await model.generateContent(feedbackPrompt);
    const feedback = result.response.text();

    // Save feedback to interview
    interview.feedback = feedback;
    interview.isCompleted = true;
    await interview.save();

    res.json({ feedback });
  } catch (error) {
    console.error('Generate feedback error:', error);
    res.status(500).json({ message: 'Error generating feedback' });
  }
};
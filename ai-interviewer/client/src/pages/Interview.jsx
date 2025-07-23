import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "./Interview.css";

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const role = location.state?.role || 'Full Stack Developer';
  
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: `Hello! I'm your AI interviewer, Alex. I'll be conducting your ${role} interview today. Let's start with your first question. Can you tell me about yourself and your experience with ${role.toLowerCase()} technologies?`,
    },
  ]);
  const [interviewId, setInterviewId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackButton, setShowFeedbackButton] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show feedback button after 3 exchanges (6 messages total including initial)
    if (messages.length >= 6) {
      setShowFeedbackButton(true);
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const historyForAPI = messages.map(({ role, parts }) => ({
      role,
      parts: [{ text: parts }],
    }));

    setMessages((prev) => [...prev, { role: "user", parts: input }]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/chat",
        {
          history: historyForAPI,
          message: currentInput,
          interviewId: interviewId,
          role: role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiMessage = res.data.aiMessage;
      setMessages((prev) => [...prev, aiMessage]);
      if (!interviewId) {
        setInterviewId(res.data.interviewId);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      const errorMessage = {
        role: "model",
        parts: "Sorry, I ran into an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!interviewId || generatingFeedback) return;

    setGeneratingFeedback(true);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/feedback",
        { interviewId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedback(res.data.feedback);
    } catch (error) {
      console.error("Error generating feedback:", error);
      alert("Failed to generate feedback. Please try again.");
    } finally {
      setGeneratingFeedback(false);
    }
  };

  const handleBackToRoles = () => {
    navigate('/role-selection');
  };

  return (
    <div className="interview-container">
      <div className="interview-header">
        <div className="interview-title">
          AI Interviewer - {role}
        </div>
        <button onClick={handleBackToRoles} className="back-button">
          Back to Roles
        </button>
      </div>
      
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.parts}
          </div>
        ))}
        {isLoading && <div className="message model">...</div>}
        <div ref={messagesEndRef} />
      </div>

      {feedback && (
        <div className="feedback-section">
          <h3>Interview Feedback</h3>
          <div className="feedback-content">
            {feedback.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="interview-actions">
        {showFeedbackButton && !feedback && (
          <button
            onClick={handleGetFeedback}
            disabled={generatingFeedback}
            className="feedback-button"
          >
            {generatingFeedback ? "Generating Feedback..." : "Finish Interview & Get Feedback"}
          </button>
        )}
        
        <form className="input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Thinking..." : "Type your answer..."}
            disabled={isLoading || !!feedback}
          />
          <button type="submit" disabled={isLoading || !!feedback}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Interview;
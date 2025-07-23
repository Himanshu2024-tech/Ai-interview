import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chat.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts:
        "Hello! I'm your AI interviewer, Alex. Let's start with your first question. Can you tell me about yourself?",
    },
  ]);
  const [interviewId, setInterviewId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // This is the history of the conversation *before* the user's new message.
    const historyForAPI = messages.map(({ role, parts }) => ({
      role,
      parts: [{ text: parts }],
    }));

    // Optimistically update the UI with the user's new message.
    setMessages((prev) => [...prev, { role: "user", parts: input }]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/api/chat", {
        history: historyForAPI, // Send the history *before* the new message
        message: currentInput, // Send the new message separately
        interviewId: interviewId,
      });

      const aiMessage = res.data.aiMessage;
      setMessages((prev) => [...prev, aiMessage]); // Add the AI's response to the UI
      if (!interviewId) {
        setInterviewId(res.data.interviewId);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = {
        role: "model",
        parts: "Sorry, I ran into an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">AI Interviewer</div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.parts}
          </div>
        ))}
        {isLoading && <div className="message model">...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Thinking..." : "Type your answer..."}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;

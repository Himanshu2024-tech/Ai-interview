import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <h1>AI Interviewer</h1>
          <p className="hero-subtitle">
            Practice your technical interviews with our AI-powered interviewer
          </p>
          <p className="hero-description">
            Get personalized feedback, practice with different roles, and improve your interview skills
            with realistic AI-driven conversations.
          </p>
          
          {isAuthenticated ? (
            <div className="cta-buttons">
              <Link to="/role-selection" className="cta-primary">
                Start New Interview
              </Link>
              <Link to="/history" className="cta-secondary">
                View My History
              </Link>
            </div>
          ) : (
            <div className="cta-buttons">
              <Link to="/register" className="cta-primary">
                Get Started
              </Link>
              <Link to="/login" className="cta-secondary">
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Role-Specific Interviews</h3>
              <p>Choose from Frontend, Backend, Full Stack, DevOps, and Data Science roles</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Conversations</h3>
              <p>Natural, intelligent conversations powered by Google's Gemini AI</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Detailed Feedback</h3>
              <p>Get comprehensive feedback on your performance with strengths and improvement areas</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Interview History</h3>
              <p>Track your progress and review past interviews anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './InterviewDetail.css';

const InterviewDetail = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const fetchInterview = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/interviews/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInterview(response.data);
    } catch (error) {
      console.error('Error fetching interview:', error);
      setError('Failed to load interview details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="interview-detail-container">
        <div className="loading">Loading interview details...</div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="interview-detail-container">
        <div className="error">{error || 'Interview not found'}</div>
        <Link to="/history" className="back-link">← Back to History</Link>
      </div>
    );
  }

  return (
    <div className="interview-detail-container">
      <div className="interview-detail-header">
        <Link to="/history" className="back-link">← Back to History</Link>
        <div className="interview-info">
          <h1>{interview.role} Interview</h1>
          <p className="interview-date">{formatDate(interview.createdAt)}</p>
          <span className={`status ${interview.isCompleted ? 'completed' : 'in-progress'}`}>
            {interview.isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      <div className="interview-content">
        <div className="conversation-section">
          <h2>Conversation</h2>
          <div className="messages-container">
            {interview.history.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-header">
                  {message.role === 'user' ? 'You' : 'AI Interviewer'}
                </div>
                <div className="message-content">
                  {message.parts}
                </div>
              </div>
            ))}
          </div>
        </div>

        {interview.feedback && (
          <div className="feedback-section">
            <h2>Interview Feedback</h2>
            <div className="feedback-content">
              {interview.feedback.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDetail;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './History.css';

const History = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/interviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setError('Failed to load interview history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">Loading your interview history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>My Interview History</h1>
        <Link to="/role-selection" className="new-interview-btn">
          Start New Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="no-interviews">
          <p>You haven't completed any interviews yet.</p>
          <Link to="/role-selection" className="start-first-btn">
            Start Your First Interview
          </Link>
        </div>
      ) : (
        <div className="interviews-grid">
          {interviews.map((interview) => (
            <div key={interview._id} className="interview-card">
              <div className="interview-header-card">
                <h3>{interview.role}</h3>
                <span className={`status ${interview.isCompleted ? 'completed' : 'in-progress'}`}>
                  {interview.isCompleted ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="interview-date">
                {formatDate(interview.createdAt)}
              </div>
              
              {interview.feedback && (
                <div className="has-feedback">
                  ✅ Feedback Available
                </div>
              )}
              
              <Link 
                to={`/interview/${interview._id}`} 
                className="view-interview-btn"
              >
                View Interview
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
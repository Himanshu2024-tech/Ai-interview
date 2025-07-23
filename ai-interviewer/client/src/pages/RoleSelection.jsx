import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  const roles = [
    {
      id: 'Frontend Developer',
      title: 'Frontend Developer',
      description: 'HTML, CSS, JavaScript, React, UI/UX',
      icon: '🎨'
    },
    {
      id: 'Backend Developer',
      title: 'Backend Developer',
      description: 'Server-side, Databases, APIs, System Design',
      icon: '⚙️'
    },
    {
      id: 'Full Stack Developer',
      title: 'Full Stack Developer',
      description: 'Frontend + Backend, End-to-end Development',
      icon: '🚀'
    },
    {
      id: 'DevOps Engineer',
      title: 'DevOps Engineer',
      description: 'CI/CD, Cloud, Containers, Infrastructure',
      icon: '☁️'
    },
    {
      id: 'Data Scientist',
      title: 'Data Scientist',
      description: 'Machine Learning, Statistics, Python/R',
      icon: '📊'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleStartInterview = () => {
    if (selectedRole) {
      navigate('/interview', { state: { role: selectedRole } });
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <h1>Select Your Interview Role</h1>
        <p>Choose the position you'd like to be interviewed for:</p>
        
        <div className="roles-grid">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <div className="role-icon">{role.icon}</div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>
          ))}
        </div>
        
        <button
          className="start-interview-btn"
          onClick={handleStartInterview}
          disabled={!selectedRole}
        >
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
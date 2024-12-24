import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './ProtectedContent.css';

export const ProtectedContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="user-info-page">
        <div className="user-info">
          <p>No user information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-page">
      <h2>User Information</h2>
      <div className="user-info">
        <div className="info-grid">
          <div className="info-item">
            <label>User ID</label>
            <span>{user.id}</span>
          </div>
          <div className="info-item">
            <label>Email</label>
            <span>{user.email}</span>
          </div>
          <div className="info-item">
            <label>Access Status</label>
            <span className={user.accessGranted ? 'granted' : 'denied'}>
              {user.accessGranted ? 'Access Granted' : 'Access Denied'}
            </span>
          </div>
          {user.groups && user.groups.length > 0 && (
            <div className="info-item groups">
              <label>Groups</label>
              <ul>
                {user.groups.map((group, index) => (
                  <li key={index}>{group}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="token-info">
          <h3>Session Status</h3>
          <p className={`status-text ${user.accessGranted ? 'active' : ''}`}>
            {user.accessGranted ? '● Active Session' : '○ Session Inactive'}
          </p>
        </div>
      </div>
    </div>
  );
}; 
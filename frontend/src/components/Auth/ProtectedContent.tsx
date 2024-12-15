import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const ProtectedContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2>Protected Content</h2>
      <p>Welcome {user?.email}</p>
      {/* Add your protected content here */}
    </div>
  );
};

export default ProtectedContent; 
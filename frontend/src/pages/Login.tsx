import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const navigate = useNavigate();

        const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Add your authentication logic here
        // If authentication is successful, navigate to the dashboard
        navigate('/dashboard');
    };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className='login-form' onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" />
        </div>
        <button type="submit">Login</button>
        <button type="submit">Login With SSO</button>
      </form>
    </div>
  );
}

export default Login;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import DevLogin from '../components/Auth/DevLogin';
import SamlLogin from '../components/Auth/SamlLogin';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Add your authentication logic here
        // If authentication is successful, navigate to the dashboard
        navigate('/dashboard');
    };

    const handleSSOLogin = () => {
        // Redirect to SAML login endpoint
        window.location.href = '/api/auth/login';
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
                {/* <button type="button" onClick={handleSSOLogin}>Login With SSO</button> */}
                <DevLogin />
                <SamlLogin />
            </form>
        </div>
    );
}

export default Login;
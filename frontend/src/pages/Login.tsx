import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import DevLogin from '../components/Auth/DevLogin';
import SamlLogin from '../components/Auth/SamlLogin';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.loginWithCredentials(email, password);
            if (response.token) {
                authService.setToken(response.token);
                navigate('/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await authService.register({ email, password, name });
            // After successful registration, switch to login tab
            setActiveTab('login');
            setError('');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveTab('login')}
                >
                    Login
                </button>
                <button 
                    className={`tab ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                >
                    Register
                </button>
            </div>

            {activeTab === 'login' ? (
                <form className='login-form' onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={isLoading ? 'loading' : ''}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    
                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <DevLogin />
                    <SamlLogin />
                </form>
            ) : (
                <form className='login-form' onSubmit={handleRegister}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label htmlFor="register-name">Name:</label>
                        <input 
                            type="text" 
                            id="register-name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-email">Email:</label>
                        <input 
                            type="email" 
                            id="register-email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="register-password">Password:</label>
                        <input 
                            type="password" 
                            id="register-password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password:</label>
                        <input 
                            type="password" 
                            id="confirm-password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={isLoading ? 'loading' : ''}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default Login;
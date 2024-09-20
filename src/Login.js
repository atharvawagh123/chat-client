import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import useAuth to use the login function
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();
    const { login } = useAuth(); // Destructure the login function from useAuth

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Reset error message before new attempt
        setLoading(true); // Start loading
        try {
            console.log('Sending login request with:', { email, password });
            localStorage.setItem('email', email);
            const response = await axios.post('https://chat-server-ybac.onrender.com/api/auth/login', {
                email,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response:', response);
            const userData = response.data; // Assuming the API returns user data including token
            login(userData); // Use the login function from context to set the user
            navigate('/main'); // Navigate to the main page after successful login
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className='login-page'>
            <h2 className='title-login'>Login</h2>
            <form onSubmit={handleLogin} className='form-login'>
                <label className='label-1'>E-mail</label>
                <input
                    className='input-element'
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label className='label-1'>Password</label>
                <input
                    className='input-element'
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className='login-button' type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p className='to-register'>Don't have an account? <Link to='/register'>Register</Link></p>
        </div>
    );
}

export default Login;

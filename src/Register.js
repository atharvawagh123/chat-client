import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';


function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://chat-server-ybac.onrender.com/api/auth/register', {
                username,
                email,
                password,
            });
            setSuccess('Registration successful');
            setError('');
            
            navigate('/main');
        } catch (err) {
            setError('Registration failed. User might already exist.');
            setSuccess('');
        }
    };

    return (
        <div className='login-page'>
            <h2 className='title-login'>Create Your Account</h2>
            <form onSubmit={handleRegister} className='form-login'>
                <label className='label-1'>Username</label>
                <input
                    className='input-element'
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label className='label-1'>Email Address</label>
                <input
                    className='input-element'
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label className='label-1'>Password</label>
                <input
                    className='input-element'
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className='login-button'>Sign Up</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <p className='to-register'>
                Already have an account? <Link to='/login'>Log in</Link>
            </p>
        </div>

    );
}

export default Register;

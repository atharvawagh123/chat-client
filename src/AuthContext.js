import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log('Token found:', token); // Debugging

            // Optionally validate token with the server here
            setUser({ token });
        } else {
            console.log('No token found'); // Debugging
            navigate('/login');
        }
    }, [navigate]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('token', userData.token);       
        console.log('User logged in:', userData); // Debugging
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
        console.log('User logged out'); // Debugging
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Component from './Component';
import { AuthProvider, useAuth } from './AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/main" element={<Component /> } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

const ProtectedRoute = () => {
  const { user } = useAuth();

  console.log('ProtectedRoute user:', user); // Debugging

  return user ? <Component /> : <Navigate to="/login" />;
};

export default App;

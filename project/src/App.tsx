import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthRequired } from './components/AuthRequired';
import { AdminRequired } from './components/AdminRequired';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/admin"
            element={
              <AuthRequired>
                <AdminRequired>
                  <AdminDashboard />
                </AdminRequired>
              </AuthRequired>
            }
          />
          <Route
            path="/"
            element={
              <AuthRequired>
                <ChatInterface />
              </AuthRequired>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
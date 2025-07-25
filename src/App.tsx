import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import UserDashboard from './components/Dashboard/UserDashboard';
import PetProfileForm from './components/Dashboard/PetProfileForm';
import AdminDashboard from './components/Admin/AdminDashboard';
import PublicProfilePage from './components/PublicProfile/PublicProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/mascota/:profileUrl" element={<PublicProfilePage />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />


            <Route path="/mascota/nueva" element={
              <ProtectedRoute>
                <PetProfileForm />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresClient?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresClient = false,
  adminOnly = false 
}) => {
  const { currentUser, currentClient } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiresClient && !currentClient) {
    return <Navigate to="/perfil" replace />;
  }

  if (adminOnly && currentClient?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
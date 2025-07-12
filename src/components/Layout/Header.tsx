import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, currentClient, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-hope-green-500 to-soft-blue-500 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-poppins">PetCode</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </Link>

          {/* Navigation */}
          {currentUser && (
            <div className="flex items-center space-x-4">
              {currentClient?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-hope-green-600 hover:bg-gray-50 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
              
              <Link
                to="/perfil"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-hope-green-600 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </Link>

              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{currentClient?.firstName || currentUser.displayName}</p>
                  <p className="text-gray-500 text-xs">{currentUser.email}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Heart, Shield, Smartphone, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { currentUser, signInWithGoogleRedirect, loading } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hope-green-50 via-white to-soft-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hope-green-500"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogleRedirect();
      // Navigation will be handled by the auth state change
    } catch (error) {
      console.error('Error en autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hope-green-50 via-white to-soft-blue-50">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-hope-green-500 to-soft-blue-500 p-3 sm:p-4 rounded-2xl inline-block mb-4 sm:mb-6">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins mb-2">PetCode</h1>
            <p className="text-sm sm:text-base text-gray-600">Dashboard</p>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-6 sm:mb-8 max-w-sm sm:max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 font-poppins">
              Protege a tu mascota con códigos QR de emergencia
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Crea perfiles digitales para tus mascotas y genera códigos QR que ayuden a cualquier persona a contactarte si se pierden.
            </p>
          </div>

          {/* Features */}
          <div className="mb-6 sm:mb-8 max-w-sm">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-hope-green-100 p-2 rounded-lg flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-hope-green-600" />
                </div>
                <span className="text-sm sm:text-base text-gray-700">Perfiles de emergencia seguros</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-soft-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-soft-blue-600" />
                </div>
                <span className="text-sm sm:text-base text-gray-700">Códigos QR optimizados para móviles</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <span className="text-sm sm:text-base text-gray-700">Acceso público sin necesidad de apps</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="w-full max-w-sm">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm touch-manipulation"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-hope-green-500"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-medium">Continuar con Google</span>
                </>
              )}
            </button>

            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
              <p>
                Al continuar, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Hecho con amor para proteger a tus mascotas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
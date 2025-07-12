import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Heart, Shield, Smartphone, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hope-green-50 via-white to-soft-blue-50">
      <div className="flex min-h-screen">
        {/* Left Panel - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-hope-green-500 to-soft-blue-600 p-12 items-center justify-center">
          <div className="max-w-md text-white">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-white/20 p-3 rounded-xl">
                <Heart className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-poppins">PetCode</h1>
                <p className="text-white/80">Dashboard</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 font-poppins">
              Protege a tu mascota con códigos QR de emergencia
            </h2>
            
            <p className="text-xl text-white/90 mb-8">
              Crea perfiles digitales para tus mascotas y genera códigos QR que ayuden a cualquier persona a contactarte si se pierden.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-white/80" />
                <span>Perfiles de emergencia seguros</span>
              </div>
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-white/80" />
                <span>Códigos QR optimizados para móviles</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-white/80" />
                <span>Acceso público sin necesidad de apps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-hope-green-500 to-soft-blue-500 p-3 rounded-xl">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-poppins">PetCode</h1>
                  <p className="text-gray-500">Dashboard</p>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3 font-poppins">
                Bienvenido de vuelta
              </h2>
              <p className="text-gray-600">
                Accede a tu dashboard para gestionar los perfiles de tus mascotas
              </p>
            </div>

            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-hope-green-500"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                Al continuar, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
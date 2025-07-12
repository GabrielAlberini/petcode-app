import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Heart, AlertTriangle, MapPin, User } from 'lucide-react';
import { getPublicProfile } from '../../services/firestoreService';
import { PublicProfile } from '../../types';

const PublicProfilePage: React.FC = () => {
  const { profileUrl } = useParams<{ profileUrl: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileUrl) return;
      try {
        const profileData = await getPublicProfile(profileUrl);
        if (profileData) {
          setProfile(profileData);
        } else {
          setError('Perfil no encontrado');
        }
      } catch (error) {
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [profileUrl]);

  const handleCall = () => {
    if (profile?.contactPhone) {
      // Limpiar el número de teléfono (remover espacios, guiones, etc.)
      const cleanPhone = profile.contactPhone.replace(/[\s\-\(\)]/g, '');

      // Intentar hacer la llamada
      try {
        window.location.href = `tel:${cleanPhone}`;
      } catch (error) {
        // Fallback: copiar al portapapeles si la llamada falla
        navigator.clipboard.writeText(profile.contactPhone);
        alert(`Número copiado al portapapeles: ${profile.contactPhone}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Perfil no encontrado</h1>
          <p className="text-gray-600">El perfil que buscas no existe o ha sido desactivado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Banner de Emergencia - Solo si está perdida */}
        {profile.isLost && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-4 shadow-lg text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <AlertTriangle className="h-6 w-6" />
                <h1 className="text-xl font-bold">¡MASCOTA PERDIDA!</h1>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <p className="text-sm">Por favor contacta inmediatamente al dueño</p>
            </div>
          </div>
        )}

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
          {/* Foto y Nombre */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 ${profile.isLost ? 'border-red-400' : 'border-green-400'} overflow-hidden mx-auto mb-4 shadow-lg`}>
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.petName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                )}
              </div>
              {profile.isLost && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  PERDIDA
                </div>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.petName}</h2>
          </div>

          {/* Mensaje del Dueño - Solo si está perdida */}
          {profile.isLost && profile.ownerMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-700 mb-1">Mensaje del Dueño</h3>
                  <p className="text-gray-800 text-sm leading-relaxed">{profile.ownerMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información de la Mascota */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Heart className="h-5 w-5 text-pink-500 mr-2" />
              Información de la Mascota
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Raza:</span>
                <span className="font-medium">{profile.breed}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Edad:</span>
                <span className="font-medium">{profile.age}</span>
              </div>
              {profile.vaccinations && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Vacunas:</span>
                  <span className="font-medium text-sm">{profile.vaccinations}</span>
                </div>
              )}
              {profile.observations && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Observaciones:</span>
                  <span className="font-medium text-sm">{profile.observations}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              Información de Contacto
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Dueño:</span>
                <span className="font-medium">{profile.ownerName}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium">{profile.contactPhone}</span>
              </div>
            </div>
          </div>

          {/* Botón de Llamada */}
          <button
            onClick={handleCall}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>Llamar al Dueño</span>
          </button>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <h4 className="font-semibold text-blue-900 mb-2">¿Encontraste esta mascota?</h4>
          <p className="text-sm text-blue-800">
            Llama al número de arriba para contactar directamente con el dueño.
            Mantén a la mascota segura hasta que llegue la ayuda.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Heart className="h-4 w-4" />
            <span className="text-sm">Generado por PetCode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
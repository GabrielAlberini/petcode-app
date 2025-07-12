import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, User, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createClient, updateClient } from '../../services/firestoreService';
import { Client } from '../../types';

type ClientFormData = Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

const ClientProfileForm: React.FC = () => {
  const { currentUser, currentClient, refreshClient } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ClientFormData>();

  useEffect(() => {
    if (currentClient) {
      setValue('email', currentClient.email);
      setValue('firstName', currentClient.firstName);
      setValue('lastName', currentClient.lastName);
      setValue('phone', currentClient.phone);
      setValue('address', currentClient.address);
      setValue('city', currentClient.city);
      setValue('postalCode', currentClient.postalCode);
      setValue('country', currentClient.country);
      setValue('role', currentClient.role);
    } else if (currentUser) {
      setValue('email', currentUser.email);
      setValue('role', 'user');
    }
  }, [currentClient, currentUser, setValue]);

  const onSubmit = async (data: ClientFormData) => {
    if (!currentUser) return;

    try {
      setLoading(true);

      if (currentClient) {
        // Update existing client
        await updateClient(currentClient.id, data);
      } else {
        // Create new client
        await createClient({
          ...data,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      await refreshClient();
      navigate('/');
    } catch (error) {
      console.error('Error saving client profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-hope-green-500 to-soft-blue-500 p-2 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 font-poppins">
                  {currentClient ? 'Editar Perfil' : 'Completar Perfil'}
                </h1>
                <p className="text-xs text-gray-500">
                  {currentClient
                    ? 'Actualiza tu información personal'
                    : 'Completa tu información para crear perfiles de mascotas'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-hope-green-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-hope-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    {...register('firstName', { required: 'El nombre es obligatorio' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    placeholder="Tu nombre"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    {...register('lastName', { required: 'El apellido es obligatorio' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    placeholder="Tu apellido"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    {...register('phone', { required: 'El teléfono es obligatorio' })}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    placeholder="Tu número de teléfono"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Dirección</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    {...register('address', { required: 'La dirección es obligatoria' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    placeholder="Calle y número"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    {...register('city', { required: 'La ciudad es obligatoria' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    placeholder="Tu ciudad"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      {...register('postalCode', { required: 'El código postal es obligatorio' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                      placeholder="CP"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      País *
                    </label>
                    <input
                      {...register('country', { required: 'El país es obligatorio' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                      placeholder="Tu país"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-hope-green-500 to-hope-green-600 text-white rounded-xl font-medium hover:from-hope-green-600 hover:to-hope-green-700 focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{loading ? 'Guardando...' : 'Guardar Perfil'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileForm;
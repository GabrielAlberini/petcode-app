import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins">
                  {currentClient ? 'Editar Perfil' : 'Completar Perfil'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {currentClient
                    ? 'Actualiza tu información personal'
                    : 'Completa tu información para crear perfiles de mascotas'
                  }
                </p>
              </div>
              {currentClient && (
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors self-start sm:self-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    {...register('firstName', { required: 'El nombre es obligatorio' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    {...register('lastName', { required: 'El apellido es obligatorio' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    {...register('phone', { required: 'El teléfono es obligatorio' })}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    {...register('address', { required: 'La dirección es obligatoria' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      {...register('city', { required: 'La ciudad es obligatoria' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      {...register('postalCode', { required: 'El código postal es obligatorio' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      País *
                    </label>
                    <input
                      {...register('country', { required: 'El país es obligatorio' })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-hope-green-500 to-hope-green-600 text-white rounded-md hover:from-hope-green-600 hover:to-hope-green-700 focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
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
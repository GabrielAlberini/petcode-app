import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, ArrowLeft, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createPetProfile, createQROrder } from '../../services/firestoreService';
import { uploadPetPhoto } from '../../services/cloudinaryService';
import { generateProfileUrl } from '../../utils/profileUtils';
import { PetProfile } from '../../types';

type PetFormData = Pick<PetProfile, 'petName' | 'breed' | 'age' | 'vaccinations' | 'observations'>;

const PetProfileForm: React.FC = () => {
  const { currentClient } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<PetFormData>();

  const petName = watch('petName');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PetFormData) => {
    if (!currentClient) return;

    try {
      setLoading(true);

      let photoUrl = '';
      let photoOptimizedUrl = '';

      if (photoFile) {
        const uploadResult = await uploadPetPhoto(photoFile);
        photoUrl = uploadResult.url;
        photoOptimizedUrl = uploadResult.optimizedUrl;
      }

      const profileUrl = generateProfileUrl(data.petName);

      const petData: Omit<PetProfile, 'id'> = {
        clientId: currentClient.id,
        petName: data.petName,
        breed: data.breed,
        age: data.age,
        vaccinations: data.vaccinations,
        observations: data.observations,
        photo: photoUrl,
        photoOptimized: photoOptimizedUrl,
        profileUrl,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const petId = await createPetProfile(petData);

      // Create QR order automatically
      await createQROrder({
        clientId: currentClient.id,
        petProfileId: petId,
        clientEmail: currentClient.email,
        clientFirstName: currentClient.firstName,
        clientLastName: currentClient.lastName,
        clientAddress: `${currentClient.address}, ${currentClient.city}, ${currentClient.postalCode}`,
        clientPhone: currentClient.phone,
        petName: data.petName,
        profileUrl,
        status: 'pendiente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating pet profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">Nueva Mascota</h1>
                <p className="text-gray-600 mt-1">
                  Crea un perfil completo para tu mascota y genera su código QR de emergencia
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Form Section */}
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la mascota *
                      </label>
                      <input
                        {...register('petName', { required: 'El nombre es obligatorio' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                      />
                      {errors.petName && (
                        <p className="text-red-500 text-sm mt-1">{errors.petName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                        Raza *
                      </label>
                      <input
                        {...register('breed', { required: 'La raza es obligatoria' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                      />
                      {errors.breed && (
                        <p className="text-red-500 text-sm mt-1">{errors.breed.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                        Edad *
                      </label>
                      <input
                        {...register('age', { required: 'La edad es obligatoria' })}
                        type="text"
                        placeholder="Ej: 3 años, 6 meses"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                      />
                      {errors.age && (
                        <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subir foto de la mascota
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                          <Upload className="h-4 w-4" />
                          <span>Seleccionar foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                        {photoFile && (
                          <span className="text-sm text-gray-600">{photoFile.name}</span>
                        )}
                      </div>
                      {photoPreview && (
                        <div className="mt-4">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Médica</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="vaccinations" className="block text-sm font-medium text-gray-700 mb-1">
                        Vacunas *
                      </label>
                      <textarea
                        {...register('vaccinations', { required: 'La información de vacunas es obligatoria' })}
                        rows={3}
                        placeholder="Lista las vacunas aplicadas y fechas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                      />
                      {errors.vaccinations && (
                        <p className="text-red-500 text-sm mt-1">{errors.vaccinations.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones médicas
                      </label>
                      <textarea
                        {...register('observations')}
                        rows={3}
                        placeholder="Alergias, condiciones especiales, medicamentos, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-hope-green-500 to-hope-green-600 text-white rounded-md hover:from-hope-green-600 hover:to-hope-green-700 focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>{loading ? 'Creando...' : 'Crear Perfil'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Vista Previa del Perfil Público</span>
              </h3>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
                {/* Emergency Header */}
                <div className="text-center mb-6">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg inline-block mb-2">
                    <h2 className="text-xl font-bold">¡!</h2>
                  </div>
                  <p className="text-red-700 font-medium">Por favor contacta inmediatamente</p>
                </div>

                {/* Pet Photo */}
                <div className="text-center mb-6">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Mascota"
                      className="h-40 w-40 object-cover rounded-full mx-auto border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-40 w-40 bg-gray-200 rounded-full mx-auto border-4 border-white shadow-lg flex items-center justify-center">
                      <span className="text-gray-500">Sin foto</span>
                    </div>
                  )}
                </div>

                {/* Pet Information */}
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {petName || 'Nombre de la mascota'}
                    </h3>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div><strong>Raza:</strong> <span className="text-gray-600">Información pendiente</span></div>
                    <div><strong>Edad:</strong> <span className="text-gray-600">Información pendiente</span></div>
                    <div><strong>Dueño:</strong> {currentClient ? `${currentClient.firstName} ${currentClient.lastName}` : 'Tu nombre'}</div>
                  </div>

                  {/* Contact Button */}
                  <div className="text-center">
                    <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg w-full">
                      📞 Llamar: {currentClient?.phone || 'Tu teléfono'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>Este será el perfil público que verán las personas al escanear el código QR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfileForm;
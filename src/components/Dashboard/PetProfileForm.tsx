import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, ArrowLeft, Heart, Camera, FileText, Stethoscope } from 'lucide-react';
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
  const [photoError, setPhotoError] = useState<string>('');
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
      // Limpiar errores y debug previos
      setPhotoError('');

      // Mostrar información del archivo en la UI
      const fileInfo = `📱 Archivo: ${file.name} | Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB | Tipo: ${file.type}`;

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const errorMsg = `El archivo es demasiado grande. Máximo 10MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
        setPhotoError(errorMsg);
        return;
      }

      // Validar tipo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = `Tipo de archivo no soportado: ${file.type}. Usa JPEG, PNG o WebP.`;
        setPhotoError(errorMsg);
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();

      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };

      reader.onerror = (error) => {
        const errorMsg = `Error al leer el archivo: ${error instanceof Error ? error.message : 'Error de FileReader'}`;
        setPhotoError(errorMsg);
      };

      reader.onabort = () => {
        setPhotoError('Lectura del archivo cancelada');
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
        try {
          const uploadResult = await uploadPetPhoto(photoFile);
          photoUrl = uploadResult.url;
          photoOptimizedUrl = uploadResult.optimizedUrl;
        } catch (error) {
          const errorMsg = `Error al subir foto: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          setPhotoError(errorMsg);
          // Continuar sin foto si falla la subida
          photoUrl = '';
          photoOptimizedUrl = '';
        }
      }

      const profileUrl = generateProfileUrl();

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
        isLost: false,
        ownerMessage: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const petId = await createPetProfile(petData);

      await createQROrder({
        clientId: currentClient.id,
        petProfileId: petId,
        clientEmail: currentClient.email,
        clientFirstName: currentClient.firstName,
        clientLastName: currentClient.lastName,
        clientAddress: currentClient.address,
        clientCity: currentClient.city,
        clientPostalCode: currentClient.postalCode,
        clientCountry: currentClient.country,
        clientPhone: currentClient.phone,
        petName: data.petName,
        profileUrl,
        status: 'pendiente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      navigate('/');
    } catch (error) {
      const errorMsg = `Error creating pet profile: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      console.error(errorMsg);
      setPhotoError(errorMsg);
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
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 font-poppins">Nueva Mascota</h1>
                <p className="text-xs text-gray-500">Crea un perfil completo para tu mascota</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-hope-green-100 p-2 rounded-lg">
                  <Heart className="h-5 w-5 text-hope-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la mascota *
                  </label>
                  <input
                    {...register('petName', { required: 'El nombre es obligatorio' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    placeholder="Nombre de tu mascota"
                  />
                  {errors.petName && (
                    <p className="text-red-500 text-sm mt-1">{errors.petName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                    Raza *
                  </label>
                  <input
                    {...register('breed', { required: 'La raza es obligatoria' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                    placeholder="Raza de tu mascota"
                  />
                  {errors.breed && (
                    <p className="text-red-500 text-sm mt-1">{errors.breed.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Edad *
                  </label>
                  <input
                    {...register('age', { required: 'La edad es obligatoria' })}
                    type="text"
                    placeholder="Ej: 3 años, 6 meses"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Camera className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Foto</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Subir foto de la mascota
                  </label>

                  {photoPreview ? (
                    <div className="text-center">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-xl mx-auto border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview('');
                          setPhotoError('');
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Cambiar foto
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Haz clic para subir una foto</p>
                        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP - Máx. 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {photoError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{photoError}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información Médica</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="vaccinations" className="block text-sm font-medium text-gray-700 mb-2">
                    Vacunas *
                  </label>
                  <textarea
                    {...register('vaccinations', { required: 'La información de vacunas es obligatoria' })}
                    rows={3}
                    placeholder="Lista las vacunas aplicadas y fechas"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent resize-none"
                  />
                  {errors.vaccinations && (
                    <p className="text-red-500 text-sm mt-1">{errors.vaccinations.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones médicas
                  </label>
                  <textarea
                    {...register('observations')}
                    rows={3}
                    placeholder="Alergias, condiciones especiales, medicamentos, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent resize-none"
                  />
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
                <span>{loading ? 'Creando...' : 'Crear Perfil'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PetProfileForm;
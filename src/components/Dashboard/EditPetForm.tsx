import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, ArrowLeft, X, Phone } from 'lucide-react';
import { updatePetProfile } from '../../services/firestoreService';
import { uploadPetPhoto } from '../../services/cloudinaryService';
import { PetProfile } from '../../types';

type EditPetFormData = Pick<PetProfile, 'petName' | 'breed' | 'age' | 'vaccinations' | 'observations' | 'ownerMessage'>;

interface EditPetFormProps {
  pet: PetProfile;
  onClose: () => void;
  onUpdate: () => void;
}

const EditPetForm: React.FC<EditPetFormProps> = ({ pet, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(pet.photoOptimized || pet.photo);
  const [photoError, setPhotoError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EditPetFormData>({
    defaultValues: {
      petName: pet.petName,
      breed: pet.breed,
      age: pet.age,
      vaccinations: pet.vaccinations,
      observations: pet.observations,
      ownerMessage: pet.ownerMessage || ''
    }
  });

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

  const onSubmit = async (data: EditPetFormData) => {
    try {
      setLoading(true);

      let photoUrl = pet.photo;
      let photoOptimizedUrl = pet.photoOptimized;

      if (photoFile) {
        try {
          const uploadResult = await uploadPetPhoto(photoFile);
          photoUrl = uploadResult.url;
          photoOptimizedUrl = uploadResult.optimizedUrl;
        } catch (error) {
          const errorMsg = `Error al subir foto: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          setPhotoError(errorMsg);
          // Continuar con las fotos existentes si falla la subida
        }
      }

      await updatePetProfile(pet.id, {
        petName: data.petName,
        breed: data.breed,
        age: data.age,
        vaccinations: data.vaccinations,
        observations: data.observations,
        ownerMessage: data.ownerMessage,
        photo: photoUrl,
        photoOptimized: photoOptimizedUrl
      });

      onUpdate();
      onClose();
    } catch (error) {
      const errorMsg = `Error updating pet profile: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      console.error(errorMsg);
      setPhotoError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-6 border w-full max-w-2xl shadow-2xl rounded-xl bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-medium text-gray-900">Editar Mascota</h3>
              <p className="text-sm text-gray-600 mt-1">Modifica la información de {pet.petName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 touch-manipulation"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Pet Name (Now Editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Mascota *
              </label>
              <input
                type="text"
                {...register('petName', { required: 'El nombre es obligatorio' })}
                className={`w-full px-3 sm:px-3 py-2 sm:py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 text-base touch-manipulation ${errors.petName ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Nombre de tu mascota"
              />
              {errors.petName && (
                <p className="text-red-500 text-xs mt-1">{errors.petName.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                El nombre se puede modificar sin afectar el URL del perfil público
              </p>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de la Mascota
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={pet.petName}
                      className="h-20 w-20 object-cover rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Sin foto</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-hope-green-50 file:text-hope-green-700 hover:file:bg-hope-green-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: JPEG, PNG, WebP. Máximo 10MB
                  </p>

                  {photoError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs text-red-600">{photoError}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raza *
              </label>
              <input
                type="text"
                {...register('breed', { required: 'La raza es obligatoria' })}
                className={`w-full px-3 sm:px-3 py-2 sm:py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 text-base touch-manipulation ${errors.breed ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Ej: Golden Retriever"
              />
              {errors.breed && (
                <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad *
              </label>
              <input
                type="text"
                {...register('age', { required: 'La edad es obligatoria' })}
                className={`w-full px-3 sm:px-3 py-2 sm:py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 text-base touch-manipulation ${errors.age ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Ej: 3 años"
              />
              {errors.age && (
                <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>
              )}
            </div>

            {/* Vaccinations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vacunas
              </label>
              <textarea
                {...register('vaccinations')}
                rows={3}
                className="w-full px-3 sm:px-3 py-2 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 text-base touch-manipulation"
                placeholder="Lista las vacunas que tiene tu mascota..."
              />
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Médicas
              </label>
              <textarea
                {...register('observations')}
                rows={3}
                className="w-full px-3 sm:px-3 py-2 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 text-base touch-manipulation"
                placeholder="Información médica importante, alergias, tratamientos..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-hope-green-500 to-hope-green-600 text-white rounded-lg hover:from-hope-green-600 hover:to-hope-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2 touch-manipulation"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 touch-manipulation"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPetForm; 
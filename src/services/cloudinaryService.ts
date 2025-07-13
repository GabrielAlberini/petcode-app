// Mock Cloudinary service - En producción usar la API real de Cloudinary
export const uploadPetPhoto = async (file: File): Promise<{ url: string, optimizedUrl: string }> => {
  return new Promise((resolve, reject) => {
    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      reject(new Error('El archivo es demasiado grande. Máximo 10MB.'));
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Tipo de archivo no soportado. Usa JPEG, PNG o WebP.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const url = e.target?.result as string;
        // En producción, aquí subirías a Cloudinary y obtendrías URLs reales
        resolve({
          url: url,
          optimizedUrl: url // En producción, esto sería una URL optimizada de Cloudinary
        });
      } catch (error) {
        reject(new Error('Error al procesar la imagen.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo.'));
    };

    // Usar readAsDataURL para compatibilidad móvil
    reader.readAsDataURL(file);
  });
};

export const optimizeImage = async (
  url: string,
  options: { width?: number, height?: number, quality?: string }
): Promise<string> => {
  // En producción, usar transformaciones de Cloudinary
  return url;
};

export const deleteImage = async (publicId: string): Promise<void> => {
  // En producción, eliminar de Cloudinary
  console.log('Deleting image:', publicId);
};
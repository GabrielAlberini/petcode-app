// Mock Cloudinary service - En producción usar la API real de Cloudinary
export const uploadPetPhoto = async (file: File): Promise<{ url: string, optimizedUrl: string }> => {
  return new Promise((resolve, reject) => {
    console.log('📸 Iniciando subida de foto:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const errorMsg = `El archivo es demasiado grande. Máximo 10MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
      console.error('❌ Error de tamaño:', errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = `Tipo de archivo no soportado: ${file.type}. Usa JPEG, PNG o WebP.`;
      console.error('❌ Error de tipo:', errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    console.log('✅ Validaciones pasadas, iniciando FileReader...');

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        console.log('📖 FileReader completado, procesando resultado...');
        const url = e.target?.result as string;
        console.log('✅ URL generada, longitud:', url.length);

        // En producción, aquí subirías a Cloudinary y obtendrías URLs reales
        resolve({
          url: url,
          optimizedUrl: url // En producción, esto sería una URL optimizada de Cloudinary
        });
      } catch (error) {
        console.error('❌ Error al procesar la imagen:', error);
        reject(new Error(`Error al procesar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`));
      }
    };

    reader.onerror = (error) => {
      console.error('❌ Error en FileReader:', error);
      reject(new Error(`Error al leer el archivo: ${error instanceof Error ? error.message : 'Error de FileReader'}`));
    };

    reader.onabort = () => {
      console.error('❌ FileReader abortado');
      reject(new Error('Lectura del archivo cancelada'));
    };

    console.log('🔄 Iniciando readAsDataURL...');
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
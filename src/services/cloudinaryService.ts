// Configuración de Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dvvr2l5l1';

// Servicio de Cloudinary usando la API REST
export const uploadPetPhoto = async (file: File): Promise<{ url: string, optimizedUrl: string }> => {
  return new Promise((resolve, reject) => {
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

    // Convertir archivo a base64 para subida directa
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const base64Data = e.target?.result as string;

        // Extraer solo la parte base64 (sin el prefijo data:image/...)
        const base64Image = base64Data.split(',')[1];

        // Crear FormData para la subida
        const formData = new FormData();
        formData.append('file', `data:${file.type};base64,${base64Image}`);
        formData.append('upload_preset', 'petcode'); // Usar el preset correcto

        // Subir a Cloudinary usando fetch
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Imagen subida exitosamente a Cloudinary:', data.public_id);

        // Generar URL optimizada
        const optimizedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_400,h_400,c_fill/${data.public_id}`;

        resolve({
          url: data.secure_url,
          optimizedUrl: optimizedUrl
        });
      } catch (error) {
        console.error('❌ Error al subir a Cloudinary:', error);
        reject(new Error(`Error al subir a Cloudinary: ${error instanceof Error ? error.message : 'Error desconocido'}`));
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
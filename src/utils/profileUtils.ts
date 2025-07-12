export const generateProfileUrl = (): string => {
  // Generar una URL completamente aleatoria
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'impreso':
      return 'bg-blue-100 text-blue-800';
    case 'enviado':
      return 'bg-green-100 text-green-800';
    case 'cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'pendiente':
      return 'Pendiente';
    case 'impreso':
      return 'Impreso';
    case 'enviado':
      return 'Enviado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
};
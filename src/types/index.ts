export interface Client {
  id: string;
  userId: string; // Firebase Auth UID
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface PetProfile {
  id: string;
  clientId: string;
  petName: string;
  breed: string;
  age: string;
  vaccinations: string;
  observations: string;
  photo: string;
  photoOptimized: string;
  profileUrl: string;
  isActive: boolean;
  isLost: boolean;
  ownerMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface QROrder {
  id?: string;
  clientId: string;
  petProfileId: string;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  clientAddress: string;
  clientCity: string;
  clientPostalCode: string;
  clientCountry: string;
  clientPhone: string;
  petName: string;
  profileUrl: string;
  status: 'pendiente' | 'impreso' | 'enviado' | 'cancelado';
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfile {
  petName: string;
  breed: string;
  age: string;
  photo: string;
  contactPhone: string;
  ownerName: string;
  emergencyMessage: string;
  vaccinations: string;
  observations: string;
  isLost: boolean;
  ownerMessage: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
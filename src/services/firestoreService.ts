import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Client, PetProfile, QROrder, PublicProfile } from '../types';
import { generateProfileUrl } from '../utils/profileUtils';

// Client Services
export const createClient = async (clientData: Omit<Client, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'clientes'), {
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

export const getClient = async (userId: string): Promise<Client | null> => {
  try {
    // Handle case where db is null (Firebase not configured)
    if (!db) {
      console.warn('Firestore not available, returning null client');
      return null;
    }

    const q = query(collection(db, 'clientes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Client;
  } catch (error) {
    console.error('Error getting client:', error);
    return null; // Return null instead of throwing to prevent crashes
  }
};

export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<void> => {
  try {
    const clientRef = doc(db, 'clientes', clientId);
    await updateDoc(clientRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

// Pet Profile Services
export const createPetProfile = async (petData: Omit<PetProfile, 'id'>): Promise<string> => {
  try {
    console.log('🔥 Creando perfil en Firestore:', {
      petName: petData.petName,
      photoLength: petData.photo?.length || 0,
      photoOptimizedLength: petData.photoOptimized?.length || 0
    });

    const docRef = await addDoc(collection(db, 'mascotas'), {
      ...petData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Perfil creado exitosamente en Firestore, ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating pet profile in Firestore:', error);
    throw error;
  }
};

export const getClientPets = async (clientId: string): Promise<PetProfile[]> => {
  try {
    // Primero intentamos con la consulta optimizada
    try {
      const q = query(
        collection(db, 'mascotas'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PetProfile[];
    } catch (indexError) {
      console.warn('Index not available, falling back to client-side sorting:', indexError);

      // Fallback: obtener todas las mascotas del cliente y ordenar en el cliente
      const q = query(
        collection(db, 'mascotas'),
        where('clientId', '==', clientId)
      );
      const querySnapshot = await getDocs(q);

      const pets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PetProfile[];

      // Ordenar por fecha de creación (más reciente primero)
      return pets.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }
  } catch (error) {
    console.error('Error getting client pets:', error);
    throw error;
  }
};

export const updatePetProfile = async (petId: string, updates: Partial<PetProfile>): Promise<void> => {
  try {
    const petRef = doc(db, 'mascotas', petId);
    await updateDoc(petRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Si se actualiza el nombre de la mascota, actualizarlo también en los pedidos QR relacionados
    if (updates.petName) {
      const q = query(collection(db, 'pedidosQR'), where('petProfileId', '==', petId));
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(docSnap =>
        updateDoc(docSnap.ref, {
          petName: updates.petName,
          updatedAt: new Date().toISOString()
        })
      );
      await Promise.all(updatePromises);
    }
  } catch (error) {
    console.error('Error updating pet profile:', error);
    throw error;
  }
};

export const togglePetLostStatus = async (petId: string, isLost: boolean): Promise<void> => {
  try {
    const petRef = doc(db, 'mascotas', petId);
    await updateDoc(petRef, {
      isLost,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling pet lost status:', error);
    throw error;
  }
};

export const migrateExistingPets = async (): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'mascotas'));

    const updatePromises = querySnapshot.docs.map(doc => {
      const petData = doc.data();
      const updates: any = {};

      if (petData.isLost === undefined) {
        updates.isLost = false;
      }

      if (petData.ownerMessage === undefined) {
        updates.ownerMessage = '';
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date().toISOString();
        return updateDoc(doc.ref, updates);
      }

      return Promise.resolve();
    });

    await Promise.all(updatePromises);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error migrating existing pets:', error);
    throw error;
  }
};

export const migratePetUrls = async (): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'mascotas'));

    const updatePromises = querySnapshot.docs.map(doc => {
      const petData = doc.data();
      // Solo actualizar si la URL actual contiene el nombre de la mascota (formato antiguo)
      if (petData.profileUrl && petData.profileUrl.includes(petData.petName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'))) {
        const newProfileUrl = generateProfileUrl();
        return updateDoc(doc.ref, {
          profileUrl: newProfileUrl,
          updatedAt: new Date().toISOString()
        });
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
    console.log('URL migration completed successfully');
  } catch (error) {
    console.error('Error migrating pet URLs:', error);
    throw error;
  }
};

export const getPublicProfile = async (profileUrl: string): Promise<PublicProfile | null> => {
  try {
    const q = query(collection(db, 'mascotas'), where('profileUrl', '==', profileUrl));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const petDoc = querySnapshot.docs[0];
    const petData = petDoc.data() as PetProfile;

    // Get client data
    const clientDoc = await getDoc(doc(db, 'clientes', petData.clientId));
    const clientData = clientDoc.data() as Client;

    return {
      petName: petData.petName,
      breed: petData.breed,
      age: petData.age,
      photo: petData.photoOptimized || petData.photo,
      contactPhone: clientData.phone,
      ownerName: `${clientData.firstName} ${clientData.lastName}`,
      emergencyMessage: petData.isLost ? `¡${petData.petName} se perdió! Por favor contacta inmediatamente.` : '',
      vaccinations: petData.vaccinations,
      observations: petData.observations,
      isLost: petData.isLost,
      ownerMessage: petData.ownerMessage || ''
    };
  } catch (error) {
    console.error('Error getting public profile:', error);
    throw error;
  }
};

// QR Order Services
export const createQROrder = async (orderData: Omit<QROrder, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'pedidosQR'), {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating QR order:', error);
    throw error;
  }
};

export const getClientOrders = async (clientId: string): Promise<QROrder[]> => {
  try {
    // Primero intentamos con la consulta optimizada
    try {
      const q = query(
        collection(db, 'pedidosQR'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QROrder[];
    } catch (indexError) {
      console.warn('Index not available, falling back to client-side sorting:', indexError);

      // Fallback: obtener todos los pedidos del cliente y ordenar en el cliente
      const q = query(
        collection(db, 'pedidosQR'),
        where('clientId', '==', clientId)
      );
      const querySnapshot = await getDocs(q);

      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QROrder[];

      // Ordenar por fecha de creación (más reciente primero)
      return orders.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }
  } catch (error) {
    console.error('Error getting client orders:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<QROrder[]> => {
  try {
    const q = query(collection(db, 'pedidosQR'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QROrder[];
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: QROrder['status']): Promise<void> => {
  try {
    const orderRef = doc(db, 'pedidosQR', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updateOrderAddress = async (orderId: string, address: string, city: string, postalCode: string, country: string): Promise<void> => {
  try {
    const orderRef = doc(db, 'pedidosQR', orderId);
    await updateDoc(orderRef, {
      clientAddress: address,
      clientCity: city,
      clientPostalCode: postalCode,
      clientCountry: country,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating order address:', error);
    throw error;
  }
};
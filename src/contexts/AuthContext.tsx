import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { getClient, createClient } from '../services/firestoreService';
import { AuthUser, Client } from '../types';

// Check if Firebase is properly configured
let auth: any = null;
let googleProvider: any = null;
let firebaseConfigured = false;

try {
  const firebaseConfig = await import('../config/firebase');
  auth = firebaseConfig.auth;
  googleProvider = firebaseConfig.googleProvider;
  firebaseConfigured = !!(auth && googleProvider);
} catch (error) {
  console.warn('Firebase configuration error, using mock authentication:', error);
  firebaseConfigured = false;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  currentClient: Client | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  refreshClient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock authentication functions for when Firebase is not configured
  const mockSignIn = async () => {
    const mockUser = {
      uid: 'mock-user-123',
      email: 'usuario@ejemplo.com',
      displayName: 'Usuario de Prueba',
      photoURL: 'https://via.placeholder.com/150'
    };
    
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    
    // Try to load client data for mock user
    try {
      const client = await getClient(mockUser.uid);
      setCurrentClient(client);
    } catch (error) {
      console.error('Error loading mock client:', error);
      setCurrentClient(null);
    }
  };

  const mockSignOut = async () => {
    localStorage.removeItem('mockUser');
    setCurrentUser(null);
    setCurrentClient(null);
  };

  const signInWithGoogle = async () => {
    try {
      if (firebaseConfigured && auth && googleProvider) {
        await signInWithPopup(auth, googleProvider);
      } else {
        await mockSignIn();
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // Fallback to mock authentication
      await mockSignIn();
    }
  };

  const signInWithGoogleRedirect = async () => {
    try {
      if (firebaseConfigured && auth && googleProvider) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await mockSignIn();
      }
    } catch (error) {
      console.error('Error with redirect sign in:', error);
      // Fallback to mock authentication
      await mockSignIn();
    }
  };

  const logout = async () => {
    try {
      if (firebaseConfigured && auth) {
        await signOut(auth);
      } else {
        await mockSignOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback to mock sign out
      await mockSignOut();
    }
  };

  const refreshClient = async () => {
    if (currentUser) {
      try {
        if (firebaseConfigured) {
          // Use Firestore when Firebase is configured
          let client = await getClient(currentUser.uid);
          
          // Si no existe el cliente, crearlo automáticamente
          if (!client) {
            const newClientData = {
              userId: currentUser.uid,
              email: currentUser.email,
              firstName: currentUser.displayName?.split(' ')[0] || '',
              lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
              phone: '',
              address: '',
              city: '',
              postalCode: '',
              country: '',
              role: 'user' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            const clientId = await createClient(newClientData);
            client = { id: clientId, ...newClientData };
          }
          
          setCurrentClient(client);
        } else {
          // Use mock client data when Firebase is not configured
          const mockClientData = {
            id: `mock-client-${currentUser.uid}`,
            userId: currentUser.uid,
            email: currentUser.email,
            firstName: currentUser.displayName?.split(' ')[0] || 'Usuario',
            lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || 'de Prueba',
            phone: '',
            address: '',
            city: '',
            postalCode: '',
            country: '',
            role: 'user' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setCurrentClient(mockClientData);
        }
      } catch (error) {
        console.error('Error refreshing client:', error);
        setCurrentClient(null);
      }
    } else {
      setCurrentClient(null);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (firebaseConfigured && auth) {
      // Use Firebase authentication
      unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
        try {
          if (user) {
            const authUser: AuthUser = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || undefined
            };
            setCurrentUser(authUser);
            
            // Load client data
            try {
              await refreshClient();
            } catch (error) {
              console.error('Error loading client:', error);
              setCurrentClient(null);
            }
          } else {
            setCurrentUser(null);
            setCurrentClient(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setCurrentUser(null);
          setCurrentClient(null);
        } finally {
          setLoading(false);
        }
      });

      // Handle redirect result when user returns from Google sign-in
      const handleRedirectResult = async () => {
        try {
          const result = await getRedirectResult(auth);
          if (result) {
            console.log('User signed in via redirect:', result.user);
          }
        } catch (error) {
          console.error('Error handling redirect result:', error);
        }
      };

      handleRedirectResult();
    } else {
      // Use mock authentication
      const checkMockUser = async () => {
        try {
          const mockUserData = localStorage.getItem('mockUser');
          if (mockUserData) {
            const mockUser = JSON.parse(mockUserData);
            setCurrentUser(mockUser);
          } else {
            setCurrentUser(null);
            setCurrentClient(null);
          }
        } catch (error) {
          console.error('Error checking mock user:', error);
          setCurrentUser(null);
          setCurrentClient(null);
        } finally {
          setLoading(false);
        }
      };

      checkMockUser().then(() => {
        // After setting the mock user, refresh client data
        if (currentUser) {
          refreshClient();
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    currentClient,
    loading,
    signInWithGoogle,
    signInWithGoogleRedirect,
    logout,
    refreshClient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
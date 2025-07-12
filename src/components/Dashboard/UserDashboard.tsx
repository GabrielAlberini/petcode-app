import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ExternalLink, Edit, QrCode, Heart, Phone, Save, X, Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle, Search, Megaphone, MapPin, Menu, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getClientPets, getClientOrders, updateOrderAddress, togglePetLostStatus, updatePetProfile } from '../../services/firestoreService';
import { getStatusColor, getStatusText, formatDate } from '../../utils/profileUtils';
import { PetProfile, QROrder } from '../../types';
import EditPetForm from './EditPetForm';

const UserDashboard: React.FC = () => {
  const { currentUser, currentClient, logout } = useAuth();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [orders, setOrders] = useState<QROrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('');
  const [postalCodeInput, setPostalCodeInput] = useState<string>('');
  const [countryInput, setCountryInput] = useState<string>('');
  const [isUpdatingLostStatus, setIsUpdatingLostStatus] = useState(false);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [editingOwnerMessage, setEditingOwnerMessage] = useState<{ [key: string]: string }>({});
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (!currentClient) {
        setLoading(false);
        return;
      }

      try {
        const [petsData, ordersData] = await Promise.all([
          getClientPets(currentClient.id),
          getClientOrders(currentClient.id)
        ]);

        setPets(petsData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentClient]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleEditAddress = (order: QROrder) => {
    setEditingAddress(order.id!);
    setAddressInput(order.clientAddress);
    setCityInput(order.clientCity);
    setPostalCodeInput(order.clientPostalCode);
    setCountryInput(order.clientCountry);
  };

  const handleSaveAddress = async (orderId: string) => {
    try {
      await updateOrderAddress(orderId, addressInput, cityInput, postalCodeInput, countryInput);
      // Reload data
      if (currentClient) {
        const [petsData, ordersData] = await Promise.all([
          getClientPets(currentClient.id),
          getClientOrders(currentClient.id)
        ]);
        setPets(petsData);
        setOrders(ordersData);
      }
      setEditingAddress(null);
      setAddressInput('');
      setCityInput('');
      setPostalCodeInput('');
      setCountryInput('');
    } catch (error) {
      console.error('Error updating order address:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    setAddressInput('');
    setCityInput('');
    setPostalCodeInput('');
    setCountryInput('');
  };

  const handleToggleLostStatus = async (petId: string, currentStatus: boolean) => {
    try {
      setIsUpdatingLostStatus(true);
      await togglePetLostStatus(petId, !currentStatus);

      // Reload pets data
      if (currentClient) {
        const petsData = await getClientPets(currentClient.id);
        setPets(petsData);
      }
    } catch (error) {
      console.error('Error toggling pet lost status:', error);
    } finally {
      setIsUpdatingLostStatus(false);
    }
  };

  const handleEditPet = (pet: PetProfile) => {
    setEditingPet(pet);
  };

  const handleCloseEdit = () => {
    setEditingPet(null);
  };

  const handlePetUpdated = async () => {
    if (currentClient) {
      const petsData = await getClientPets(currentClient.id);
      setPets(petsData);
    }
  };

  const handleEditOwnerMessage = (petId: string, currentMessage: string) => {
    setEditingOwnerMessage(prev => ({ ...prev, [petId]: currentMessage }));
  };

  const handleSaveOwnerMessage = async (petId: string) => {
    try {
      setIsSavingMessage(true);
      await updatePetProfile(petId, { ownerMessage: editingOwnerMessage[petId] || '' });

      // Reload pets data
      if (currentClient) {
        const petsData = await getClientPets(currentClient.id);
        setPets(petsData);
      }

      setEditingOwnerMessage(prev => {
        const newState = { ...prev };
        delete newState[petId];
        return newState;
      });
    } catch (error) {
      console.error('Error updating owner message:', error);
    } finally {
      setIsSavingMessage(false);
    }
  };

  const handleCancelEditMessage = (petId: string) => {
    setEditingOwnerMessage(prev => {
      const newState = { ...prev };
      delete newState[petId];
      return newState;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hope-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-hope-green-500 to-soft-blue-500 p-2 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 font-poppins">PetCode</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              {currentClient?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Shield className="h-4 w-4" />
                  <span>Panel Admin</span>
                </Link>
              )}

              <Link
                to="/perfil"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>

              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="text-sm mb-2">
                  <p className="font-medium text-gray-900">{currentClient?.firstName || currentUser?.displayName}</p>
                  <p className="text-gray-500 text-xs">{currentUser?.email}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">
            ¡Hola, {currentClient?.firstName}!
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona tus mascotas y códigos QR
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-hope-green-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Mascotas</p>
                <p className="text-xl font-bold text-gray-900">{pets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <QrCode className="h-6 w-6 text-soft-blue-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Pedidos</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lost Pets Alert */}
        {pets.filter(pet => pet.isLost).length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-700">
                  {pets.filter(pet => pet.isLost).length} mascota{pets.filter(pet => pet.isLost).length > 1 ? 's' : ''} perdida{pets.filter(pet => pet.isLost).length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-600">Revisa los perfiles marcados como perdidos</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Pet Button */}
        <div className="mb-6">
          <Link
            to="/mascota/nueva"
            className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-hope-green-500 to-hope-green-600 text-white py-4 px-6 rounded-xl font-medium shadow-lg hover:from-hope-green-600 hover:to-hope-green-700 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Nueva Mascota</span>
          </Link>
        </div>

        {/* Pets Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Mis Mascotas</h3>

          {pets.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No tienes mascotas registradas</h4>
              <p className="text-gray-600 mb-4">Registra tu primera mascota para crear su perfil y código QR</p>
              <Link
                to="/mascota/nueva"
                className="inline-flex items-center space-x-2 bg-hope-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-hope-green-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Mascota</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pets
                .sort((a, b) => {
                  // Primero las mascotas perdidas
                  if (a.isLost && !b.isLost) return -1;
                  if (!a.isLost && b.isLost) return 1;
                  // Si ambas tienen el mismo estado, ordenar por fecha de creación (más reciente primero)
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                })
                .map((pet) => (
                  <div key={pet.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Lost Status Banner */}
                    {pet.isLost && (
                      <div className="bg-red-500 text-white px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">¡{pet.petName} está PERDIDA!</span>
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {pet.photo ? (
                          <img
                            src={pet.photoOptimized || pet.photo}
                            alt={pet.petName}
                            className="h-12 w-12 object-cover rounded-full border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Heart className="h-6 w-6 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{pet.petName}</h4>
                          <p className="text-sm text-gray-500">{pet.breed} • {pet.age}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditPet(pet)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleLostStatus(pet.id, pet.isLost)}
                          disabled={isUpdatingLostStatus}
                          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${pet.isLost
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                        >
                          {pet.isLost ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Encontrada</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4" />
                              <span>Marcar Perdida</span>
                            </>
                          )}
                        </button>

                        <Link
                          to={`/mascota/${pet.profileUrl}`}
                          target="_blank"
                          className="flex items-center justify-center space-x-2 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Ver</span>
                        </Link>
                      </div>

                      {/* Owner Message for Lost Pets */}
                      {pet.isLost && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-start space-x-2">
                            <Megaphone className="h-4 w-4 text-red-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">
                                {pet.ownerMessage || 'Sin mensaje personalizado'}
                              </p>
                              <button
                                onClick={() => handleEditOwnerMessage(pet.id, pet.ownerMessage || '')}
                                className="text-xs text-red-600 hover:text-red-700 mt-1"
                              >
                                {pet.ownerMessage ? 'Editar mensaje' : 'Agregar mensaje'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Orders Section */}
        {orders.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos de Códigos QR</h3>
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{order.petName}</h4>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Pedido #{order.id?.slice(-8)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Pet Modal */}
      {editingPet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <EditPetForm
              pet={editingPet}
              onClose={handleCloseEdit}
              onUpdate={handlePetUpdated}
            />
          </div>
        </div>
      )}

      {/* Edit Owner Message Modal */}
      {Object.keys(editingOwnerMessage).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mensaje de Emergencia</h3>
            <textarea
              value={editingOwnerMessage[Object.keys(editingOwnerMessage)[0]] || ''}
              onChange={(e) => setEditingOwnerMessage(prev => ({ ...prev, [Object.keys(editingOwnerMessage)[0]]: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent"
              placeholder="Escribe un mensaje importante para quien encuentre tu mascota..."
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => handleSaveOwnerMessage(Object.keys(editingOwnerMessage)[0])}
                disabled={isSavingMessage}
                className="flex-1 bg-hope-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-hope-green-600 disabled:opacity-50 transition-colors"
              >
                {isSavingMessage ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => handleCancelEditMessage(Object.keys(editingOwnerMessage)[0])}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ExternalLink, Edit, QrCode, Heart, Phone, Save, X, Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle, Search, Megaphone, MapPin, Menu, LogOut, Shield } from 'lucide-react';
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
  const [editingOrder, setEditingOrder] = useState<QROrder | null>(null);
  const [addressInput, setAddressInput] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('');
  const [postalCodeInput, setPostalCodeInput] = useState<string>('');
  const [countryInput, setCountryInput] = useState<string>('');
  const [isUpdatingLostStatus, setIsUpdatingLostStatus] = useState(false);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [editingOwnerMessage, setEditingOwnerMessage] = useState<{ [key: string]: string }>({});
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const navigate = useNavigate();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

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
        // Set empty arrays on error to prevent crashes
        setPets([]);
        setOrders([]);
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
    setEditingOrder(order);
    setAddressInput(order.clientAddress);
    setCityInput(order.clientCity);
    setPostalCodeInput(order.clientPostalCode);
    setCountryInput(order.clientCountry);
  };

  const handleSaveAddress = async () => {
    if (!editingOrder) return;

    try {
      await updateOrderAddress(editingOrder.id!, addressInput, cityInput, postalCodeInput, countryInput);
      // Reload data
      if (currentClient) {
        const [petsData, ordersData] = await Promise.all([
          getClientPets(currentClient.id),
          getClientOrders(currentClient.id)
        ]);
        setPets(petsData);
        setOrders(ordersData);
      }
      handleCloseAddressEdit();
    } catch (error) {
      console.error('Error updating order address:', error);
    }
  };

  const handleCloseAddressEdit = () => {
    setEditingOrder(null);
    setAddressInput('');
    setCityInput('');
    setPostalCodeInput('');
    setCountryInput('');
  };

  const handleToggleLostStatus = async (petId: string, currentStatus: boolean) => {
    try {
      setIsUpdatingLostStatus(true);
      await togglePetLostStatus(petId, !currentStatus);
      showToast('success', !currentStatus ? 'Mascota marcada como perdida' : 'Mascota marcada como encontrada');

      // Reload pets data
      if (currentClient) {
        const petsData = await getClientPets(currentClient.id);
        setPets(petsData);
      }
    } catch (error) {
      showToast('error', 'Error al cambiar el estado de la mascota');
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-hope-green-500 to-soft-blue-500 p-2 rounded-lg flex-shrink-0">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-poppins truncate">PetCode</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors touch-manipulation"
                aria-label="Menú"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="border-t border-gray-200 bg-white sm:hidden">
            <div className="px-4 py-3 space-y-2">
              {currentClient?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
                  onClick={() => setShowMenu(false)}
                >
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Panel Admin</span>
                </Link>
              )}


              <div className="px-3 py-3 border-t border-gray-200 mt-2">
                <div className="text-sm mb-3">
                  <p className="font-semibold text-gray-900 truncate">{currentClient?.firstName || currentUser?.displayName}</p>
                  <p className="text-gray-500 text-xs truncate">{currentUser?.email}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        {/* Saludo y resumen del perfil */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins">
            ¡Hola, {currentClient?.firstName}!
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base mb-4">
            Gestiona tus mascotas y códigos QR
          </p>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-hope-green-500 flex-shrink-0" />
                <div className="ml-3 min-w-0">
                  <p className="text-xs font-medium text-gray-500">Mascotas</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{pets.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center">
                <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-soft-blue-500 flex-shrink-0" />
                <div className="ml-3 min-w-0">
                  <p className="text-xs font-medium text-gray-500">Pedidos</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Alerta de mascotas perdidas debajo del saludo y resumen */}
        {pets.filter(pet => pet.isLost).length > 0 && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-red-700 text-sm sm:text-base">
                  {pets.filter(pet => pet.isLost).length} mascota{pets.filter(pet => pet.isLost).length > 1 ? 's' : ''} perdida{pets.filter(pet => pet.isLost).length > 1 ? 's' : ''}
                </p>
                <p className="text-xs sm:text-sm text-red-600 mt-1">Revisa los perfiles marcados como perdidos</p>
              </div>
            </div>
          </div>
        )}
        {/* Sección de Mascotas Destacada */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-poppins mb-6 text-center">
            Mis Mascotas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {pets.length === 0 && (
              <div className="col-span-full text-center text-gray-500 text-lg mt-8 animate-fade-in">
                <Heart className="h-10 w-10 text-hope-green-300 mx-auto mb-2" />
                <p className="font-bold text-gray-700">¡Bienvenido! Aún no tienes mascotas registradas.</p>
                <p className="text-sm text-gray-500 mb-4">Agrega tu primera mascota para comenzar a usar PetCode.</p>
                <button
                  onClick={() => navigate('/mascota/nueva')}
                  className="mt-2 bg-hope-green-500 hover:bg-hope-green-600 text-white px-6 py-2 rounded-full font-medium shadow-md transition"
                  aria-label="Agregar mascota"
                >
                  <Plus className="h-5 w-5 inline-block mr-2" />Agregar Mascota
                </button>
              </div>
            )}
            {pets.length > 0 && (
              <>
                {pets.map((pet) => (
                  <div key={pet.id} className="relative bg-white shadow-xl rounded-2xl p-6 w-full max-w-xs flex flex-col items-center border border-gray-100 transition-transform duration-300 ease-in-out hover:scale-105 animate-fade-in">
                    <div className={`w-28 h-28 mb-4 rounded-full overflow-hidden border-4 shadow-md ${pet.isLost ? 'border-red-500' : 'border-hope-green-500'}`}>
                      <img src={pet.photoOptimized || pet.photo || '/default-pet.png'} alt={pet.petName} className="object-cover w-full h-full" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">{pet.petName}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${pet.isLost ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{pet.isLost ? 'Perdido' : 'En casa'}</span>
                    {/* Mensaje de emergencia editable si la mascota está perdida */}
                    {pet.isLost && (
                      <div className="w-full mt-2 flex items-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                        <span className="text-xs text-gray-700 flex-1 truncate">
                          {pet.ownerMessage
                            ? <>Mensaje: <span className="font-medium">{pet.ownerMessage}</span></>
                            : <span className="text-gray-400">Sin mensaje de emergencia</span>
                          }
                        </span>
                        <button
                          onClick={() => handleEditOwnerMessage(pet.id, pet.ownerMessage || '')}
                          className="ml-2 p-1 rounded hover:bg-red-100 transition"
                          title={pet.ownerMessage ? 'Editar mensaje' : 'Agregar mensaje'}
                        >
                          <Edit className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    )}
                    <div className="flex space-x-3 mt-2">
                      <button onClick={() => handleEditPet(pet)} className="p-2 rounded-full bg-soft-blue-100 hover:bg-soft-blue-200 text-soft-blue-700" title="Editar">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleToggleLostStatus(pet.id, pet.isLost)} className={`p-2 rounded-full flex items-center justify-center ${pet.isLost ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-red-100 hover:bg-red-200 text-red-700'}`} title={pet.isLost ? 'Marcar como encontrado' : 'Marcar como perdido'} disabled={isUpdatingLostStatus}>
                        {isUpdatingLostStatus ? (
                          <span className="flex items-center justify-center w-5 h-5">
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          </span>
                        ) : pet.isLost ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                      </button>
                      <Link to={`/mascota/${pet.profileUrl}`} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700" title="Ver perfil público">
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          {/* Botón flotante para agregar mascota */}
          <button
            onClick={() => navigate('/mascota/nueva')}
            className="fixed bottom-8 right-8 z-50 bg-hope-green-500 hover:bg-hope-green-600 text-white rounded-full shadow-lg p-5 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hope-green-400 sm:p-5 p-4"
            style={{ width: '56px', height: '56px' }}
            title="Agregar mascota"
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>
        {/* Sección secundaria: Órdenes, perfil, etc. */}
        <div className="mt-12">
          {/* Aquí irían las órdenes, perfil, mensajes, etc., en tarjetas más pequeñas o acordeón */}
          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-poppins">
              ¡Hola, {currentClient?.firstName}!
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Gestiona tus mascotas y códigos QR
            </p>
          </div>

          {/* Orders Section */}
          {orders.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700">Pedidos de Códigos QR</h3>
                <div className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-medium">
                  {orders.length} pedido{orders.length > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-soft-blue-500" />
                        <span className="font-semibold text-gray-800 text-sm">{order.petName}</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${order.status === 'pendiente' ? 'bg-yellow-400' : order.status === 'impreso' ? 'bg-blue-400' : order.status === 'enviado' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-gray-100 text-gray-700">{getStatusText(order.status)}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>#{order.id?.slice(-8)}</span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt)}</span>
                      <span>•</span>
                      <span>{order.clientCity}, {order.clientCountry}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      {order.status === 'pendiente' ? (
                        <button
                          onClick={() => handleEditAddress(order)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-soft-blue-100 text-soft-blue-700 rounded-md font-medium hover:bg-soft-blue-200 transition-colors text-xs"
                        >
                          <Edit className="h-4 w-4" />
                          Editar dirección
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-gray-200 text-gray-500 rounded-md font-medium border border-gray-200 text-xs">
                          <Package className="h-4 w-4" />
                          Dirección bloqueada
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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

      {/* Edit Address Modal */}
      {editingOrder && editingOrder.status === 'pendiente' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Editar Dirección de Envío</h3>
              <button
                onClick={handleCloseAddressEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  id="address"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent touch-manipulation"
                  placeholder="Calle y número"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="city"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent touch-manipulation"
                  placeholder="Nombre de la ciudad"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={postalCodeInput}
                    onChange={(e) => setPostalCodeInput(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent touch-manipulation"
                    placeholder="CP"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 py-3 sm:py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent touch-manipulation"
                    placeholder="País"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                onClick={handleSaveAddress}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-hope-green-500 text-white rounded-lg font-medium hover:bg-hope-green-600 transition-colors touch-manipulation"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Dirección</span>
              </button>
              <button
                onClick={handleCloseAddressEdit}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors touch-manipulation"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-transparent text-base touch-manipulation"
              placeholder="Escribe un mensaje importante para quien encuentre tu mascota..."
            />
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
              <button
                onClick={() => handleSaveOwnerMessage(Object.keys(editingOwnerMessage)[0])}
                disabled={isSavingMessage}
                className="flex-1 bg-hope-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-hope-green-600 disabled:opacity-50 transition-colors touch-manipulation"
              >
                {isSavingMessage ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => handleCancelEditMessage(Object.keys(editingOwnerMessage)[0])}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors touch-manipulation"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${toast.type === 'success' ? 'bg-hope-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
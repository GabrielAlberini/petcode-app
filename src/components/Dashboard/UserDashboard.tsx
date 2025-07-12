import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, Edit, QrCode, Heart, Phone, Save, X, Package, Truck, CheckCircle, XCircle, Clock, AlertTriangle, Search, Megaphone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getClientPets, getClientOrders, updateOrderAddress, togglePetLostStatus, migrateExistingPets, migratePetUrls, updatePetProfile } from '../../services/firestoreService';
import { getStatusColor, getStatusText, formatDate } from '../../utils/profileUtils';
import { PetProfile, QROrder } from '../../types';
import EditPetForm from './EditPetForm';

const UserDashboard: React.FC = () => {
  const { currentClient } = useAuth();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [orders, setOrders] = useState<QROrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('');
  const [postalCodeInput, setPostalCodeInput] = useState<string>('');
  const [countryInput, setCountryInput] = useState<string>('');
  const [isUpdatingLostStatus, setIsUpdatingLostStatus] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [urlMigrationCompleted, setUrlMigrationCompleted] = useState(false);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [editingOwnerMessage, setEditingOwnerMessage] = useState<{ [key: string]: string }>({});
  const [isSavingMessage, setIsSavingMessage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!currentClient) {
        setLoading(false);
        return;
      }

      try {
        // Run migrations once
        if (!migrationCompleted) {
          await migrateExistingPets();
          setMigrationCompleted(true);
        }

        if (!urlMigrationCompleted) {
          await migratePetUrls();
          setUrlMigrationCompleted(true);
        }

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
  }, [currentClient, migrationCompleted, urlMigrationCompleted]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">
            Bienvenido, {currentClient?.firstName}
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona los perfiles de tus mascotas y sus códigos QR de emergencia
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-hope-green-500" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Mascotas Registradas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{pets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Mascotas Perdidas</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{pets.filter(pet => pet.isLost).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-soft-blue-500" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Pedidos Totales</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">QRs Enviados</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {orders.filter(order => order.status === 'enviado').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Pets Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Mis Mascotas</h2>
                <Link
                  to="/mascota/nueva"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-hope-green-500 to-hope-green-600 text-white rounded-md hover:from-hope-green-600 hover:to-hope-green-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Mascota</span>
                </Link>
              </div>
            </div>

            <div className="p-6">
              {pets.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes mascotas registradas</h3>
                  <p className="text-gray-600 mb-4">Registra tu primera mascota para crear su perfil y código QR de emergencia</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pets
                    .sort((a, b) => {
                      // Primero las mascotas perdidas
                      if (a.isLost && !b.isLost) return -1;
                      if (!a.isLost && b.isLost) return 1;
                      // Si ambas tienen el mismo estado, ordenar por fecha de creación (más reciente primero)
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((pet) => (
                      <div key={pet.id} className="border border-gray-200 rounded-lg p-4 hover:border-hope-green-300 transition-colors">
                        {/* Lost Status Banner - High Priority */}
                        {pet.isLost && (
                          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              <span className="text-red-700 font-medium">¡{pet.petName} está marcada como PERDIDA!</span>
                            </div>
                            <p className="text-red-600 text-sm mt-1">
                              El perfil público muestra un banner de emergencia. Marca como "Encontrada" cuando la recuperes.
                            </p>

                            {/* Quick Owner Message Edit */}
                            <div className="mt-4 pt-4 border-t border-red-200">
                              <label className="block text-sm font-medium text-red-700 mb-3 flex items-center">
                                <Megaphone className="h-4 w-4 mr-2" />
                                Mensaje para quien encuentre a {pet.petName}
                              </label>

                              {editingOwnerMessage.hasOwnProperty(pet.id) ? (
                                <div className="space-y-4">
                                  <div className="relative">
                                    <textarea
                                      value={editingOwnerMessage[pet.id] || ''}
                                      onChange={(e) => setEditingOwnerMessage(prev => ({ ...prev, [pet.id]: e.target.value }))}
                                      rows={4}
                                      className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white shadow-sm transition-all duration-200 resize-none"
                                      placeholder="Escribe un mensaje importante para quien encuentre tu mascota..."
                                    />
                                    <div className="absolute top-2 right-2">
                                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => handleSaveOwnerMessage(pet.id)}
                                      disabled={isSavingMessage}
                                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none flex items-center"
                                    >
                                      <Save className="h-4 w-4 mr-2" />
                                      {isSavingMessage ? 'Guardando...' : 'Guardar Mensaje'}
                                    </button>
                                    <button
                                      onClick={() => handleCancelEditMessage(pet.id)}
                                      className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start space-x-3">
                                      <div className="flex-shrink-0 mt-1">
                                        <Megaphone className="h-5 w-5 text-red-500" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {pet.ownerMessage || 'No hay mensaje configurado'}
                                        </p>
                                        {!pet.ownerMessage && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Agrega información importante para quien encuentre a {pet.petName}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleEditOwnerMessage(pet.id, pet.ownerMessage || '')}
                                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {pet.ownerMessage ? 'Editar Mensaje' : 'Agregar Mensaje'}
                                  </button>
                                </div>
                              )}

                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-700 flex items-start">
                                  <AlertTriangle className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                                  Este mensaje se muestra destacado en el perfil público para ayudar a encontrar a {pet.petName}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          {pet.photo ? (
                            <img
                              src={pet.photoOptimized || pet.photo}
                              alt={pet.petName}
                              className="h-16 w-16 object-cover rounded-full border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                              <Heart className="h-8 w-8 text-gray-400" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{pet.petName}</h3>
                            <p className="text-gray-600">{pet.breed} • {pet.age}</p>
                            <p className="text-sm text-gray-500">Creado el {formatDate(pet.createdAt)}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <a
                              href={`/mascota/${pet.profileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-soft-blue-600 transition-colors"
                              title="Ver perfil público"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleEditPet(pet)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Editar mascota"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Lost Status Toggle Button - High Priority */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {pet.isLost ? (
                            <button
                              onClick={() => handleToggleLostStatus(pet.id, pet.isLost)}
                              disabled={isUpdatingLostStatus}
                              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              <CheckCircle className="h-5 w-5" />
                              <span>{pet.petName} ENCONTRADA</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleLostStatus(pet.id, pet.isLost)}
                              disabled={isUpdatingLostStatus}
                              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-pulse"
                            >
                              <AlertTriangle className="h-5 w-5" />
                              <span>MARCAR COMO PERDIDA</span>
                            </button>
                          )}
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            {pet.isLost
                              ? "Al marcar como encontrada, se ocultará el banner de emergencia"
                              : "Al marcar como perdida, se mostrará un banner de emergencia en el perfil público"
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Pedidos de Códigos QR</h2>
            </div>

            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos de códigos QR</h3>
                  <p className="text-gray-600">Los pedidos se crean automáticamente cuando registras una mascota</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .sort((a, b) => {
                      // Definir el orden de prioridad: pendiente > impreso > enviado > cancelado
                      const statusPriority = {
                        'pendiente': 1,
                        'impreso': 2,
                        'enviado': 3,
                        'cancelado': 4
                      };

                      const priorityA = statusPriority[a.status] || 5;
                      const priorityB = statusPriority[b.status] || 5;

                      // Si tienen la misma prioridad, ordenar por fecha de creación (más reciente primero)
                      if (priorityA === priorityB) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      }

                      return priorityA - priorityB;
                    })
                    .map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:border-hope-green-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-gray-900">{order.petName}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                              {order.status === 'pendiente' && <Clock className="h-3 w-3" />}
                              {order.status === 'impreso' && <Package className="h-3 w-3" />}
                              {order.status === 'enviado' && <Truck className="h-3 w-3" />}
                              {order.status === 'cancelado' && <XCircle className="h-3 w-3" />}
                              <span>{getStatusText(order.status)}</span>
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-2">
                          <p className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-400" />
                            Pedido realizado: {formatDate(order.createdAt)}
                          </p>

                          <div>
                            <p className="flex items-start">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400 mt-0.5" />
                              <span>
                                Dirección: {[order.clientAddress, order.clientCity, order.clientPostalCode, order.clientCountry]
                                  .filter(Boolean)
                                  .join(', ')}

                                {order.status === 'pendiente' &&
                                  [order.clientAddress, order.clientCity, order.clientPostalCode, order.clientCountry].some(Boolean) && (
                                    <button
                                      onClick={() => handleEditAddress(order)}
                                      className="ml-2 text-blue-600 hover:text-blue-900"
                                      title="Editar dirección"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                  )}
                              </span>
                            </p>

                            {order.status === 'pendiente' && (
                              <p className="text-xs text-blue-600 mt-1 flex items-center">
                                Puedes modificar la dirección de envío mientras el pedido esté pendiente
                              </p>
                            )}
                          </div>

                          {/* Status-specific messages */}
                          {order.status === 'pendiente' && (
                            <p className="text-yellow-600 font-medium flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Tu código QR está siendo procesado
                            </p>
                          )}

                          {order.status === 'impreso' && (
                            <p className="text-blue-600 font-medium flex items-center">
                              <Package className="h-3 w-3 mr-1" />
                              Tu código QR está impreso y listo para envío
                            </p>
                          )}

                          {order.status === 'enviado' && (
                            <p className="text-green-600 font-medium flex items-center">
                              <Truck className="h-3 w-3 mr-1" />
                              Tu código QR fue enviado a tu dirección
                            </p>
                          )}

                          {order.status === 'cancelado' && (
                            <p className="text-red-600 font-medium flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              Pedido cancelado
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Edit Modal */}
      {editingAddress && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Editar Dirección de Envío</h3>
                  <p className="text-sm text-blue-600 mt-1">Actualiza la dirección donde recibirás tu código QR</p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calle y número *
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 ${addressInput.trim() === '' ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Calle y número"
                  />
                  {addressInput.trim() === '' && (
                    <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 ${cityInput.trim() === '' ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Ciudad"
                  />
                  {cityInput.trim() === '' && (
                    <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    value={postalCodeInput}
                    onChange={(e) => setPostalCodeInput(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 ${postalCodeInput.trim() === '' ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Código postal"
                  />
                  {postalCodeInput.trim() === '' && (
                    <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País *
                  </label>
                  <input
                    type="text"
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-hope-green-500 ${countryInput.trim() === '' ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="País"
                  />
                  {countryInput.trim() === '' && (
                    <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-6">
                  <button
                    onClick={() => handleSaveAddress(editingAddress)}
                    disabled={!addressInput.trim() || !cityInput.trim() || !postalCodeInput.trim() || !countryInput.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-hope-green-500 to-hope-green-600 text-white rounded-lg hover:from-hope-green-600 hover:to-hope-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Pet Modal */}
      {editingPet && (
        <EditPetForm
          pet={editingPet}
          onClose={handleCloseEdit}
          onUpdate={handlePetUpdated}
        />
      )}
    </div>
  );
};

export default UserDashboard;
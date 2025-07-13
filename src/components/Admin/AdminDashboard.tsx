import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Eye, Package, Truck, CheckCircle, XCircle, ChevronDown, Menu, ArrowLeft, Shield, LogOut, Clock, User, MapPin, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../../services/firestoreService';
import { getStatusColor, getStatusText, formatDate } from '../../utils/profileUtils';
import { QROrder } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [orders, setOrders] = useState<QROrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<QROrder | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: QROrder['status']) => {
    try {
      setUpdatingStatus(orderId);
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const downloadQR = (order: QROrder) => {
    const element = document.getElementById(`qr-${order.id}`);
    if (element && element instanceof SVGElement) {
      // Convertir SVG a string
      const svgData = new XMLSerializer().serializeToString(element);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Crear enlace de descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${order.petName.toLowerCase().replace(/\s+/g, '-')}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Limpiar URL
      URL.revokeObjectURL(url);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pendiente: orders.filter(o => o.status === 'pendiente').length,
    impreso: orders.filter(o => o.status === 'impreso').length,
    enviado: orders.filter(o => o.status === 'enviado').length,
    cancelado: orders.filter(o => o.status === 'cancelado').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hope-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 font-poppins">Panel Admin</h1>
                  <p className="text-xs text-gray-500">Gestiona pedidos de códigos QR</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors touch-manipulation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="border-t border-gray-200 bg-white w-full">
            <div className="px-2 sm:px-4 py-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6 w-full">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-gray-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Pendiente</p>
                <p className="text-xl font-bold text-yellow-600">{stats.pendiente}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Impreso</p>
                <p className="text-xl font-bold text-blue-600">{stats.impreso}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-500">Enviado</p>
                <p className="text-xl font-bold text-green-600">{stats.enviado}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 w-full">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {['all', 'pendiente', 'impreso', 'enviado', 'cancelado'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${filter === status
                  ? 'bg-hope-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                {status === 'all' ? 'Todos' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Pedidos ({filteredOrders.length})
            </h3>
            <div className="text-sm text-gray-500">
              {filteredOrders.length === 1 ? '1 pedido encontrado' : `${filteredOrders.length} pedidos encontrados`}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay pedidos</h4>
              <p className="text-sm sm:text-base text-gray-600">No se encontraron pedidos con el filtro seleccionado</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 w-full">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 w-full">
                  {/* Header con estado prominente */}
                  <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {order.status === 'pendiente' && <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />}
                          {order.status === 'impreso' && <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />}
                          {order.status === 'enviado' && <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />}
                          {order.status === 'cancelado' && <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{order.petName}</h4>
                          <p className="text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center sm:space-x-1 space-y-1 sm:space-y-0">
                            <span>Pedido #{order.id?.slice(-8)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${order.status === 'pendiente' ? 'bg-yellow-500' :
                            order.status === 'impreso' ? 'bg-blue-500' :
                              order.status === 'enviado' ? 'bg-green-500' :
                                'bg-red-500'
                            }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                    {/* Barra de progreso del estado */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-2">
                        <span>Progreso del pedido</span>
                        <span className="font-medium">
                          {order.status === 'pendiente' ? '25%' :
                            order.status === 'impreso' ? '50%' :
                              order.status === 'enviado' ? '100%' : '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${order.status === 'pendiente' ? 'bg-yellow-500 w-1/4' :
                          order.status === 'impreso' ? 'bg-blue-500 w-1/2' :
                            order.status === 'enviado' ? 'bg-green-500 w-full' :
                              'bg-red-500 w-0'
                          }`}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                      <div>
                        <h5 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 flex items-center space-x-2">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          <span>Información del Cliente</span>
                        </h5>
                        <div className="space-y-2 text-sm sm:text-base text-gray-600">
                          <p className="font-semibold text-gray-900">{order.clientFirstName} {order.clientLastName}</p>
                          <p className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{order.clientEmail}</span>
                          </p>
                          <p className="flex items-center space-x-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                            <span>{order.clientPhone}</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 flex items-center space-x-2">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          <span>Dirección de Envío</span>
                        </h5>
                        <div className="space-y-2 text-sm sm:text-base text-gray-600">
                          <p className="font-medium">{order.clientAddress || 'No especificada'}</p>
                          <p>{order.clientCity}, {order.clientPostalCode}</p>
                          <p>{order.clientCountry}</p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 sm:space-x-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 sm:py-4 px-3 sm:px-4 lg:px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
                      >
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Ver Detalles</span>
                      </button>

                      <div className="flex-shrink-0 w-full lg:w-auto">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id!, e.target.value as QROrder['status'])}
                            disabled={updatingStatus === order.id}
                            className={`appearance-none bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-hope-green-500 transition-all duration-200 touch-manipulation shadow-sm ${updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-gray-400'}`}
                          >
                            <option value="pendiente" className="bg-white text-gray-900">Pendiente</option>
                            <option value="impreso" className="bg-white text-gray-900">Impreso</option>
                            <option value="enviado" className="bg-white text-gray-900">Enviado</option>
                            <option value="cancelado" className="bg-white text-gray-900">Cancelado</option>
                          </select>

                          {/* Icono de dropdown */}
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

                          {/* Indicador de carga */}
                          {updatingStatus === order.id && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-hope-green-500"></div>
                            </div>
                          )}
                        </div>

                        {/* Label descriptivo */}
                        <div className="mt-2 text-xs text-gray-500 text-center">
                          Estado
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Pedido</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedOrder.petName}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Cliente:</strong> {selectedOrder.clientFirstName} {selectedOrder.clientLastName}</p>
                    <p><strong>Email:</strong> {selectedOrder.clientEmail}</p>
                    <p><strong>Teléfono:</strong> {selectedOrder.clientPhone}</p>
                    <p><strong>Pedido:</strong> #{selectedOrder.id?.slice(-8)}</p>
                    <p><strong>Fecha:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <div className="flex items-center space-x-2">
                      <span><strong>Estado:</strong></span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${selectedOrder.status === 'pendiente' ? 'bg-yellow-500' :
                        selectedOrder.status === 'impreso' ? 'bg-blue-500' :
                          selectedOrder.status === 'enviado' ? 'bg-green-500' :
                            'bg-red-500'
                        }`}></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Dirección de Envío</h5>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
                      <p className="text-sm text-gray-900">{selectedOrder.clientAddress || 'No especificada'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Ciudad</label>
                      <p className="text-sm text-gray-900">{selectedOrder.clientCity || 'No especificada'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Código Postal</label>
                        <p className="text-sm text-gray-900">{selectedOrder.clientPostalCode || 'No especificado'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">País</label>
                        <p className="text-sm text-gray-900">{selectedOrder.clientCountry || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  {/* Cambiar estado desde modal */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h5 className="font-medium text-gray-900 mb-3">Cambiar Estado del Pedido</h5>
                    <div className="flex items-center justify-center space-x-3">
                      <div className="relative">
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleStatusUpdate(selectedOrder.id!, e.target.value as QROrder['status'])}
                          disabled={updatingStatus === selectedOrder.id}
                          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-hope-green-500 transition-all duration-200 touch-manipulation shadow-sm"
                        >
                          <option value="pendiente" className="bg-white text-gray-900">Pendiente</option>
                          <option value="impreso" className="bg-white text-gray-900">Impreso</option>
                          <option value="enviado" className="bg-white text-gray-900">Enviado</option>
                          <option value="cancelado" className="bg-white text-gray-900">Cancelado</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      {updatingStatus === selectedOrder.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-hope-green-500"></div>
                      )}
                    </div>
                  </div>

                  <h5 className="font-medium text-gray-900 mb-3">Código QR</h5>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                    <QRCodeSVG
                      id={`qr-${selectedOrder.id}`}
                      value={`${window.location.origin}/mascota/${selectedOrder.profileUrl}`}
                      size={200}
                      level="M"
                    />
                  </div>
                  <button
                    onClick={() => downloadQR(selectedOrder)}
                    className="mt-3 flex items-center justify-center space-x-2 w-full bg-hope-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-hope-green-600 transition-colors touch-manipulation"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar QR</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
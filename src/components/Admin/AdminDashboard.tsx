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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
            <div className="px-4 py-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pendiente', 'impreso', 'enviado', 'cancelado'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pedidos ({filteredOrders.length})
          </h3>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h4>
              <p className="text-gray-600">No se encontraron pedidos con el filtro seleccionado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  {/* Header con estado prominente */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {order.status === 'pendiente' && <Clock className="h-5 w-5 text-yellow-500" />}
                          {order.status === 'impreso' && <Package className="h-5 w-5 text-blue-500" />}
                          {order.status === 'enviado' && <Truck className="h-5 w-5 text-green-500" />}
                          {order.status === 'cancelado' && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{order.petName}</h4>
                          <p className="text-sm text-gray-500 flex items-center space-x-1">
                            <span>Pedido #{order.id?.slice(-8)}</span>
                            <span>•</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <div className="px-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>Información del Cliente</span>
                        </h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>{order.clientFirstName} {order.clientLastName}</strong></p>
                          <p className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{order.clientEmail}</span>
                          </p>
                          <p className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{order.clientPhone}</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>Dirección de Envío</span>
                        </h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{order.clientAddress || 'No especificada'}</p>
                          <p>{order.clientCity}, {order.clientPostalCode}</p>
                          <p>{order.clientCountry}</p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver Detalles Completos</span>
                      </button>

                      <div className="relative flex-shrink-0">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id!, e.target.value as QROrder['status'])}
                          disabled={updatingStatus === order.id}
                          className={`appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-hope-green-500 transition-colors ${updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="impreso">Impreso</option>
                          <option value="enviado">Enviado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Pedido</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
                    <p><strong>Estado:</strong> {getStatusText(selectedOrder.status)}</p>
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
                    className="mt-3 flex items-center justify-center space-x-2 w-full bg-hope-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-hope-green-600 transition-colors"
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
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Eye, Package, Truck, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../../services/firestoreService';
import { getStatusColor, getStatusText, formatDate } from '../../utils/profileUtils';
import { QROrder } from '../../types';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<QROrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<QROrder | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);


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



  const downloadQR = (order: QROrder) => {
    const canvas = document.getElementById(`qr-${order.id}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${order.petName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona pedidos de códigos QR y actualiza estados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendiente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendiente}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Impreso</p>
                <p className="text-2xl font-bold text-blue-600">{stats.impreso}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Enviado</p>
                <p className="text-2xl font-bold text-green-600">{stats.enviado}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cancelado</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelado}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['all', 'pendiente', 'impreso', 'enviado', 'cancelado'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === status
                  ? 'bg-hope-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                {status === 'all' ? 'Todos' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pedidos de Códigos QR ({filteredOrders.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mascota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.petName}</div>
                        <div className="text-sm text-gray-500">ID: {order.petProfileId.slice(-8)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.clientFirstName} {order.clientLastName}
                        </div>
                        <div className="text-sm text-gray-500">{order.clientEmail}</div>
                        <div className="text-sm text-gray-500">{order.clientPhone}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="text-gray-600">
                            {order.clientAddress}, {order.clientCity}, {order.clientPostalCode}, {order.clientCountry}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-soft-blue-600 hover:text-soft-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Status Selector */}
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id!, e.target.value as QROrder['status'])}
                            disabled={updatingStatus === order.id}
                            className={`appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-hope-green-500 focus:border-hope-green-500 ${updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
                              }`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="impreso">Impreso</option>
                            <option value="enviado">Enviado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detalles del Pedido</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedOrder.petName}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.clientFirstName} {selectedOrder.clientLastName}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Dirección de envío:</h5>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.clientAddress}, {selectedOrder.clientCity}, {selectedOrder.clientPostalCode}, {selectedOrder.clientCountry}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Código QR:</h5>
                    <div className="flex justify-center">
                      <QRCodeSVG
                        id={`qr-${selectedOrder.id}`}
                        value={`${window.location.origin}/mascota/${selectedOrder.profileUrl}`}
                        size={200}
                        level="M"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadQR(selectedOrder)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-soft-blue-500 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar QR</span>
                    </button>

                    <a
                      href={`/mascota/${selectedOrder.profileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-hope-green-500 text-white rounded-md hover:bg-hope-green-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver Perfil</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
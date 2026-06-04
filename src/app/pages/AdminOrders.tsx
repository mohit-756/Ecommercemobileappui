import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { orderService } from '../services/orderService';
import { toast } from 'sonner';

const STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    orderService.getAllOrders({ limit: 100, status: statusFilter || undefined })
      .then(res => setOrders(res.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      await orderService.updateOrderStatus(id, status, `Order ${label}`);
      toast.success(`Order updated to ${label}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update order');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white px-6 pt-12 pb-4 md:pt-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none appearance-none pr-8 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No orders found</p>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-6).toUpperCase()}</p>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    order.status === 'shipped' || order.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">₹{order.total?.toFixed(2)} · {order.items?.length || 0} items</p>
                <p className="text-xs text-gray-400 mb-1">{order.user?.name || 'User'} · {order.paymentMethod}</p>
                <p className="text-xs text-gray-400 mb-3">{formatDate(order.createdAt)}</p>

                <div className="relative">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none appearance-none focus:ring-2 focus:ring-blue-200"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

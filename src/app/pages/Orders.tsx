import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Package, ChevronRight } from 'lucide-react';
import { orderService } from '../services/orderService';
import { cn, formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { hapticService } from '../services/hapticService';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-600',
  confirmed: 'bg-blue-50 text-blue-600',
  processing: 'bg-indigo-50 text-indigo-600',
  shipped: 'bg-purple-50 text-purple-600',
  out_for_delivery: 'bg-amber-50 text-amber-600',
  delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchOrders(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await orderService.getUserOrders({ limit: 50 });
      setOrders(res.data.orders);
      if (isRefresh) hapticService.impact();
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    (window as any)._startYOrders = touch.screenY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const startY = (window as any)._startYOrders || 0;
    const diff = touch.screenY - startY;

    if (diff > 150 && window.scrollY === 0) {
      fetchOrders(true);
    }
  };

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div
      className="min-h-full flex flex-col bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {refreshing && (
        <div className="absolute top-20 left-0 w-full flex justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white shadow-md rounded-full p-2"
          >
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        </div>
      )}
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-0 border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">My Orders</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={36} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">Your orders will appear here</p>
            <button onClick={() => navigate('/home')} className="bg-blue-600 text-white font-semibold rounded-xl py-3 px-8 hover:bg-blue-700 transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          orders.map((order: any) => (
            <div
              key={order._id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-600 transition-colors"
              onClick={() => navigate(`/tracking?orderId=${order._id}`)}
            >
              <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">#ORD-{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide",
                  statusStyles[order.status] || 'bg-gray-50 text-gray-600'
                )}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.items?.length || 0} Item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{formatPrice(order.total || 0)}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                  Track <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

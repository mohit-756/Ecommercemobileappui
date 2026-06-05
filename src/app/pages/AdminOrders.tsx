import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronDown, CheckSquare, Square, Package, ClipboardList } from 'lucide-react';
import { orderService } from '../services/orderService';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [packingOrderId, setPackingOrderId] = useState<string | null>(null);
  const [packingItems, setPackingItems] = useState<Record<string, boolean>>({});

  const fetchOrders = () => {
    setLoading(true);
    // In queue mode, show orders that need action
    const filter = activeTab === 'queue' ? 'pending,confirmed,processing,packed' : (statusFilter || undefined);
    orderService.getAllOrders({ limit: 100, status: filter })
      .then(res => setOrders(res.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, activeTab]);

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

  const startPacking = (order: any) => {
    setPackingOrderId(order._id);
    const items: Record<string, boolean> = {};
    order.items.forEach((item: any) => {
      items[item._id] = false;
    });
    setPackingItems(items);
    // Move to processing if it's currently confirmed
    if (order.status === 'confirmed') {
      updateStatus(order._id, 'processing');
    }
  };

  const toggleItem = (itemId: string) => {
    setPackingItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const finishPacking = async (orderId: string) => {
    await updateStatus(orderId, 'packed');
    setPackingOrderId(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <div className="bg-white px-6 pt-12 pb-2 md:pt-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
          </div>
          {activeTab === 'history' && (
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none appearance-none pr-8 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All History</option>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
              activeTab === 'queue' ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-100 text-gray-500"
            )}
          >
            Live Queue
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-xl transition-all",
              activeTab === 'history' ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-100 text-gray-500"
            )}
          >
            History
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">No orders in {activeTab}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isPacking = packingOrderId === order._id;
              return (
                <div key={order._id} className={cn(
                  "bg-white rounded-2xl shadow-sm border transition-all overflow-hidden",
                  isPacking ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-100"
                )}>
                  <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400 font-mono mb-1">#{order._id.slice(-6).toUpperCase()}</p>
                      <h3 className="font-bold text-gray-900">{order.user?.name || 'Customer'}</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{order.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-blue-50 text-blue-700'
                      )}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <p className="text-sm font-black text-gray-900 mt-1">₹{order.total?.toFixed(2)}</p>
                    </div>
                  </div>

                  {isPacking ? (
                    <div className="p-4 bg-blue-50/30">
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-blue-900 uppercase">Picking Checklist</span>
                      </div>
                      <div className="space-y-3 mb-4">
                        {order.items.map((item: any) => (
                          <div
                            key={item._id}
                            onClick={() => toggleItem(item._id)}
                            className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-blue-100 cursor-pointer"
                          >
                            {packingItems[item._id] ? (
                              <CheckSquare size={20} className="text-blue-600" />
                            ) : (
                              <Square size={20} className="text-gray-300" />
                            )}
                            <div className="flex-1">
                              <p className={cn("text-xs font-bold", packingItems[item._id] ? "text-gray-400 line-through" : "text-gray-700")}>
                                {item.product?.name || 'Product'}
                              </p>
                              <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        disabled={!Object.values(packingItems).every(v => v)}
                        onClick={() => finishPacking(order._id)}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-40 shadow-lg shadow-blue-100 transition-all"
                      >
                        Complete Packing
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 flex gap-2">
                      {activeTab === 'queue' && (order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') ? (
                        <button
                          onClick={() => startPacking(order)}
                          className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Package size={14} /> Start Packing
                        </button>
                      ) : (
                        <div className="flex-1 relative">
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order._id, e.target.value)}
                            className="w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold outline-none appearance-none focus:ring-2 focus:ring-blue-200"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/tracking?orderId=${order._id}`)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                      >
                        Track
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

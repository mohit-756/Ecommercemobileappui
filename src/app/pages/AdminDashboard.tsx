import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Package, Users, IndianRupee, ShoppingBag, AlertTriangle, Zap, Clock, Activity } from 'lucide-react';
import { adminService } from '../services/adminService';
import { cn } from '../lib/utils';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(res => setData(res.data))
      .catch(() => navigate('/home'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const cards = [
    { label: 'Total Orders', value: data?.stats?.totalOrders ?? '-', icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Revenue', value: data ? `₹${(data.stats.totalRevenue || 0).toLocaleString('en-IN')}` : '-', icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Users', value: data?.stats?.totalUsers ?? '-', icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Products', value: data?.stats?.totalProducts ?? '-', icon: ShoppingBag, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white px-6 pt-12 pb-6 md:pt-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Store Dashboard</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Live Ops</span>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-y-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {cards.map((card, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                    <card.icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-amber-500" />
                    <span className="text-xs font-bold text-gray-900 uppercase">Avg. Packing</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">1m 42s</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">↑ 12% faster</p>
               </div>
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-blue-500" />
                    <span className="text-xs font-bold text-gray-900 uppercase">Avg. Delivery</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">14m 05s</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">Within target</p>
               </div>
            </div>

            {data?.stats?.lowStockCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  {data.stats.lowStockCount} products have low stock (≤5)
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900">Orders Status</h2>
                <Activity size={16} className="text-gray-400" />
              </div>
              {data?.ordersByStatus && Object.keys(data.ordersByStatus).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500 capitalize">{status.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-gray-900">{count as number}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            status === 'delivered' ? 'bg-emerald-500' : 'bg-blue-500'
                          )}
                          style={{ width: `${Math.min(100, (count as number / (data.stats.totalOrders || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No orders yet</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/admin/products')} className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100 text-left">
                <ShoppingBag size={20} className="text-white mb-2" />
                <p className="font-bold text-white text-sm">Inventory</p>
                <p className="text-white/60 text-[10px]">Manage Products</p>
              </button>
              <button onClick={() => navigate('/admin/orders')} className="bg-gray-900 p-4 rounded-2xl shadow-lg shadow-gray-100 text-left">
                <Package size={20} className="text-white mb-2" />
                <p className="font-bold text-white text-sm">Live Queue</p>
                <p className="text-white/60 text-[10px]">Manage Orders</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

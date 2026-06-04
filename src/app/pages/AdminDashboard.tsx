import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Package, Users, IndianRupee, ShoppingBag, AlertTriangle } from 'lucide-react';
import { adminService } from '../services/adminService';

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
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      <div className="p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
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

            {data?.stats?.lowStockCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  {data.stats.lowStockCount} products have low stock (≤5)
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <h2 className="font-bold text-gray-900 mb-3">Orders by Status</h2>
              {data?.ordersByStatus && Object.keys(data.ordersByStatus).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(data.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{status.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-bold text-gray-900">{count as number}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No orders yet</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/admin/products')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-left">
                <ShoppingBag size={20} className="text-blue-600 mb-2" />
                <p className="font-bold text-gray-900 text-sm">Products</p>
                <p className="text-xs text-gray-400">Manage inventory</p>
              </button>
              <button onClick={() => navigate('/admin/orders')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-left">
                <Package size={20} className="text-blue-600 mb-2" />
                <p className="font-bold text-gray-900 text-sm">Orders</p>
                <p className="text-xs text-gray-400">Manage orders</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useNavigate } from "react-router";
import { ArrowLeft, Package } from "lucide-react";

export default function MyOrdersScreen() {
  const navigate = useNavigate();

  const ORDERS = [
    { id: "ORD-892471", status: "Out for Delivery", items: 2, total: 162.00, date: "Aug 24, 2023", active: true },
    { id: "ORD-891002", status: "Delivered", items: 1, total: 299.00, date: "Aug 15, 2023", active: false },
    { id: "ORD-889445", status: "Cancelled", items: 3, total: 45.50, date: "Aug 02, 2023", active: false }
  ];

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-safe">
      <div className="bg-white pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto pr-6">My Orders</h1>
      </div>

      <div className="flex border-b border-gray-200 bg-white sticky top-[72px] z-10">
        <button className="flex-1 py-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600">Active</button>
        <button className="flex-1 py-3 text-sm font-medium text-gray-500">Completed</button>
        <button className="flex-1 py-3 text-sm font-medium text-gray-500">Cancelled</button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {ORDERS.map(order => (
          <div key={order.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-gray-400" />
                <span className="font-bold text-gray-900 text-sm">{order.id}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                order.status === "Delivered" ? "bg-green-100 text-green-700" :
                order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                "bg-blue-100 text-blue-700"
              }`}>{order.status}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>{order.date}</span>
              <span>{order.items} Items • <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span></span>
            </div>
            
            <div className="flex gap-3">
              {order.active && (
                <button onClick={() => navigate(`/order-tracking/${order.id}`)} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700">
                  Track Order
                </button>
              )}
              <button className="flex-1 bg-gray-100 text-gray-900 rounded-xl py-2.5 text-sm font-bold hover:bg-gray-200">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

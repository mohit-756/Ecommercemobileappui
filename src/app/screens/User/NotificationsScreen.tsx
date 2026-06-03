import { useNavigate } from "react-router";
import { ArrowLeft, Tag, Package, Star } from "lucide-react";

export default function NotificationsScreen() {
  const navigate = useNavigate();

  const NOTIFICATIONS = [
    { id: 1, title: "Order Delivered!", message: "Your order #ORD-891002 has been delivered.", time: "2 hours ago", type: "order", icon: Package, color: "bg-blue-100 text-blue-600" },
    { id: 2, title: "Summer Sale is Live", message: "Get up to 50% off on all summer collections. Shop now!", time: "5 hours ago", type: "offer", icon: Tag, color: "bg-amber-100 text-amber-600" },
    { id: 3, title: "Rate your recent purchase", message: "How was your experience with Nike Air Max?", time: "1 day ago", type: "review", icon: Star, color: "bg-purple-100 text-purple-600" }
  ];

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-safe">
      <div className="bg-white pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto">Notifications</h1>
        <button className="text-sm font-medium text-blue-600">Clear All</button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {NOTIFICATIONS.map(notif => (
          <div key={notif.id} className="bg-white rounded-3xl p-4 shadow-sm flex gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notif.color}`}>
              <notif.icon size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm mb-1">{notif.title}</h4>
              <p className="text-xs text-gray-500 mb-2 leading-relaxed">{notif.message}</p>
              <p className="text-[10px] text-gray-400 font-medium">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

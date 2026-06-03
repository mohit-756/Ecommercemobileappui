import { useNavigate } from "react-router";
import { User, Package, MapPin, CreditCard, Settings, HelpCircle, LogOut, ChevronRight, Heart, Bell } from "lucide-react";

export default function ProfileScreen() {
  const navigate = useNavigate();

  const MENU_ITEMS = [
    { icon: Package, label: "My Orders", path: "/my-orders", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Heart, label: "Wishlist", path: "/wishlist", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: MapPin, label: "Shipping Addresses", path: "/settings", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: CreditCard, label: "Payment Methods", path: "/settings", color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: Bell, label: "Notifications", path: "/notifications", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Settings, label: "Settings", path: "/settings", color: "text-gray-500", bg: "bg-gray-100" },
    { icon: HelpCircle, label: "Help & Support", path: "/settings", color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-20">
      <div className="bg-blue-600 pt-16 pb-20 px-5 relative">
        <h1 className="text-xl font-bold text-white text-center mb-6">Profile</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white p-1">
            <img src="https://images.unsplash.com/photo-1590131222139-91ba5992e4ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB3b21hbnxlbnwxfHx8fDE3ODAzOTExNjd8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Alex Johnson</h2>
            <p className="text-blue-100 text-sm">alex.johnson@example.com</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 relative z-10 flex-1">
        <div className="bg-white rounded-3xl p-2 shadow-sm mb-6 flex justify-around">
          <div className="text-center p-3">
            <p className="text-xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-500">Orders</p>
          </div>
          <div className="w-px bg-gray-100 my-2"></div>
          <div className="text-center p-3">
            <p className="text-xl font-bold text-gray-900">4</p>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
          <div className="w-px bg-gray-100 my-2"></div>
          <div className="text-center p-3">
            <p className="text-xl font-bold text-gray-900">89</p>
            <p className="text-xs text-gray-500">Points</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-2 shadow-sm space-y-1 mb-6">
          {MENU_ITEMS.map((item, index) => (
            <button 
              key={index} 
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg}`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <span className="font-semibold text-gray-900 text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </div>

        <button 
          onClick={() => navigate("/auth/login")}
          className="w-full bg-white rounded-3xl p-4 shadow-sm flex items-center justify-center gap-2 text-red-500 font-bold mb-6 hover:bg-red-50 transition-colors border border-red-100"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

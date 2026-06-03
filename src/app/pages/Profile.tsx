import { useNavigate } from 'react-router';
import { Settings, Package, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Profile() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Package, label: 'My Orders', path: '/orders' },
    { icon: MapPin, label: 'Shipping Addresses', path: '/addresses' },
    { icon: CreditCard, label: 'Payment Methods', path: '/payments' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/support' },
  ];

  return (
    <div className="min-h-full bg-gray-50 pb-6">
      {/* Header Profile Section */}
      <div className="bg-white px-6 pt-16 pb-8 md:pt-10 rounded-b-3xl shadow-sm mb-6 relative">
        <div className="absolute top-12 right-6 md:top-6">
          <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-indigo-400 relative">
            <div className="w-full h-full bg-white rounded-full overflow-hidden border-2 border-white">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">Jane Doe</h1>
            <p className="text-gray-500 text-sm">jane.doe@example.com</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <span className="block text-xl font-bold text-gray-900">12</span>
            <span className="text-xs text-gray-500 font-medium">Orders</span>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <span className="block text-xl font-bold text-gray-900">5</span>
            <span className="text-xs text-gray-500 font-medium">Reviews</span>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <span className="block text-xl font-bold text-gray-900">3</span>
            <span className="text-xs text-gray-500 font-medium">Saved</span>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-6 space-y-3">
        {menuItems.map((item, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                <item.icon size={20} />
              </div>
              <span className="font-semibold text-gray-900">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </motion.button>
        ))}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/login')}
          className="w-full bg-red-50 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-red-100 mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500">
              <LogOut size={20} />
            </div>
            <span className="font-semibold text-red-600">Logout</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
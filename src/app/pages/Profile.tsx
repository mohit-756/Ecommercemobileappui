import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings, Package, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight, Shield, Camera, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { cameraService } from '../services/cameraService';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { t } = useTranslation();

  const menuItems = [
    { icon: Heart, label: t('myWishlist'), path: '/wishlist' },
    { icon: Package, label: t('myOrders'), path: '/orders' },
    { icon: MapPin, label: t('shippingAddresses'), path: '/addresses' },
    { icon: CreditCard, label: t('paymentMethods'), path: '/payments' },
    { icon: Settings, label: t('settings'), path: '/settings' },
    { icon: HelpCircle, label: t('helpSupport'), path: '/support' },
  ];

  if (user?.role === 'admin') {
    menuItems.unshift({ icon: Shield, label: 'Admin Dashboard', path: '/admin' });
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-full bg-gray-50 pb-6 lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none lg:bg-transparent overflow-hidden">
      <div className="bg-white px-6 pt-16 pb-8 lg:pt-8 rounded-b-3xl shadow-sm mb-6 relative">
        <div className="absolute top-12 right-6 md:top-6">
          <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-indigo-400 relative">
            <div className="w-full h-full bg-white rounded-full overflow-hidden border-2 border-white">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            {Capacitor.isNativePlatform() && (
              <button
                onClick={async () => {
                  setAvatarLoading(true);
                  const photo = await cameraService.pickFromGallery();
                  if (photo) {
                    toast.success('Profile photo updated!');
                  }
                  setAvatarLoading(false);
                }}
                disabled={avatarLoading}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white"
              >
                <Camera size={12} />
              </button>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{user?.name || 'User'}</h1>
            <p className="text-gray-500 text-sm">{user?.email || ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div onClick={() => navigate('/orders')} className="bg-gray-50 rounded-2xl p-3 text-center cursor-pointer active:bg-gray-100 transition-colors">
            <span className="block text-xl font-bold text-gray-900">0</span>
            <span className="text-xs text-gray-500 font-medium">{t('orders')}</span>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <span className="block text-xl font-bold text-gray-900">0</span>
            <span className="text-xs text-gray-500 font-medium">{t('reviews')}</span>
          </div>
          <div onClick={() => navigate('/wishlist')} className="bg-gray-50 rounded-2xl p-3 text-center cursor-pointer active:bg-gray-100 transition-colors">
            <span className="block text-xl font-bold text-gray-900">{user?.wishlist?.length || 0}</span>
            <span className="text-xs text-gray-500 font-medium">{t('saved')}</span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-3">
        {menuItems.map((item, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.path)}
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
          onClick={handleLogout}
          className="w-full bg-red-50 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-red-100 mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500">
              <LogOut size={20} />
            </div>
            <span className="font-semibold text-red-600">{t('logout')}</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

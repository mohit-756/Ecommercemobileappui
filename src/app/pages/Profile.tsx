import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Settings, Package, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight, Shield, Camera, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { cameraService } from '../services/cameraService';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { orderService } from '../services/orderService';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { t } = useTranslation();
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    orderService.getUserOrders({ limit: 1 })
      .then(res => {
        setOrdersCount(res.data.total || res.data.orders?.length || 0);
      })
      .catch(() => {});

    const saved = localStorage.getItem('user_wishlist');
    if (saved) {
      setWishlistCount(JSON.parse(saved).length);
    }
    const handleWishlistUpdate = () => {
      const updated = localStorage.getItem('user_wishlist');
      setWishlistCount(updated ? JSON.parse(updated).length : 0);
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, []);

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
    <div className="min-h-full bg-gray-50 dark:bg-background pb-6 lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none lg:bg-transparent overflow-hidden transition-colors duration-300">
      <div className="bg-white dark:bg-surface px-6 pt-16 pb-8 lg:pt-8 rounded-b-3xl shadow-sm mb-6 relative">
        <div className="absolute top-12 right-6 md:top-6">
          <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-surface-tertiary flex items-center justify-center text-gray-600 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-surface-tertiary transition-colors">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-indigo-400 relative">
            <div className="w-full h-full bg-white dark:bg-surface rounded-full overflow-hidden border-2 border-white dark:border-surface">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 text-2xl font-bold">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary leading-tight mb-1">{user?.name || 'User'}</h1>
            <p className="text-gray-500 dark:text-text-secondary text-sm">{user?.email || ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div onClick={() => navigate('/orders')} className="bg-gray-50 dark:bg-surface-tertiary rounded-2xl p-3 text-center cursor-pointer active:bg-gray-100 dark:active:bg-surface-tertiary transition-colors">
            <span className="block text-xl font-bold text-gray-900 dark:text-text-primary">{ordersCount}</span>
            <span className="text-xs text-gray-500 dark:text-text-secondary font-medium">{t('orders')}</span>
          </div>
          <div className="bg-gray-50 dark:bg-surface-tertiary rounded-2xl p-3 text-center">
            <span className="block text-xl font-bold text-gray-900 dark:text-text-primary">0</span>
            <span className="text-xs text-gray-500 dark:text-text-secondary font-medium">{t('reviews')}</span>
          </div>
          <div onClick={() => navigate('/wishlist')} className="bg-gray-50 dark:bg-surface-tertiary rounded-2xl p-3 text-center cursor-pointer active:bg-gray-100 dark:active:bg-surface-tertiary transition-colors">
            <span className="block text-xl font-bold text-gray-900 dark:text-text-primary">{wishlistCount}</span>
            <span className="text-xs text-gray-500 dark:text-text-secondary font-medium">{t('saved')}</span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-3">
        {menuItems.map((item, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.path)}
            className="w-full bg-white dark:bg-surface p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 dark:border-border-light"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-surface-tertiary flex items-center justify-center text-gray-600 dark:text-text-secondary">
                <item.icon size={20} />
              </div>
              <span className="font-semibold text-gray-900 dark:text-text-primary">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 dark:text-text-tertiary" />
          </motion.button>
        ))}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-red-100 dark:border-red-500/30 mt-6"
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

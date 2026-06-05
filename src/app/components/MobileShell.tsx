import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { Capacitor } from '@capacitor/core';

const BOTTOM_NAV_ROUTES = ['/home', '/search', '/cart', '/profile'];

export function MobileShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const showBottomNav = BOTTOM_NAV_ROUTES.includes(location.pathname);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: itemCount },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-4 font-sans text-gray-900 overflow-hidden">
      <div className="w-full h-screen md:h-[850px] md:max-w-[393px] md:rounded-[40px] md:shadow-2xl bg-white overflow-hidden relative flex flex-col md:border-[8px] md:border-gray-900 ring-1 ring-black/5">
        
        {/* Status Bar Mock for Desktop Preview */}
        <div className="hidden md:flex justify-between items-center px-6 py-3 text-xs font-medium z-50 bg-white/80 backdrop-blur-md absolute top-0 w-full">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-3 rounded-[2px] border border-current relative">
              <div className="absolute right-[-3px] top-[3px] w-[2px] h-1 bg-current"></div>
              <div className="absolute inset-0.5 bg-current rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-gray-50",
          showBottomNav ? "pb-24" : "pb-0", // Increased padding to avoid overlap
          "md:pt-8" // Padding for fake status bar on desktop
        )}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] md:rounded-b-[32px] z-50">
            <div className="flex justify-between items-center mb-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="relative p-2 flex flex-col items-center gap-1 min-w-[64px]"
                  >
                    <div className="relative">
                      <item.icon 
                        size={24} 
                        className={cn(
                          "transition-colors duration-200",
                          isActive ? "text-blue-600" : "text-gray-400"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {(item.badge ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute -top-3 w-8 h-1 bg-blue-600 rounded-b-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {/* Only show manual home indicator on non-native (web) desktop preview */}
            {!Capacitor.isNativePlatform() && (
              <div className="w-1/3 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

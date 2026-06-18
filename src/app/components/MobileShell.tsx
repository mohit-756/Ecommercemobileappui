import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';

const BOTTOM_NAV_ROUTES = ['/home', '/search', '/cart', '/profile'];

export function MobileShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showBottomNav = BOTTOM_NAV_ROUTES.includes(location.pathname);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: itemCount },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-dvh bg-white dark:bg-background font-sans text-gray-900 dark:text-text-primary overflow-hidden transition-colors duration-300">
      <div className="w-full h-dvh bg-white dark:bg-background overflow-hidden relative flex flex-col transition-colors duration-300">
        
        <div
          ref={scrollRef}
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-gray-50 dark:bg-background transition-colors duration-300",
            showBottomNav ? "pb-24" : "pb-0"
          )}
        >
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

        {showBottomNav && (
          <div className="absolute bottom-0 w-full bg-white dark:bg-nav-bg border-t border-gray-100 dark:border-border-light pb-safe pt-2 px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)] z-50 transition-colors duration-300">
            <div className="flex justify-between items-center">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="relative flex flex-col items-center gap-1 min-w-[64px] py-1 px-1"
                  >
                    {/* Background pill chip for active state */}
                    <div className="relative">
                      {isActive && (
                        <motion.div
                          layoutId="nav-chip"
                          className="absolute inset-0 -inset-x-3 -inset-y-1 bg-blue-50 dark:bg-blue-500/15 rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        <item.icon
                          size={22}
                          className={cn(
                            "transition-colors duration-200",
                            isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-text-tertiary"
                          )}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        {(item.badge ?? 0) > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface">
                            {(item.badge ?? 0) > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold transition-colors leading-none",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-text-tertiary"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

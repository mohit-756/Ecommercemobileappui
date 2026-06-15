import { useEffect } from 'react';
import { Outlet, useNavigate, useSearchParams, useLocation } from 'react-router';
import { ShoppingCart, User, Search, Heart, Leaf, Zap, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../contexts/AuthContext';
import { useDeliveryLocation } from '../contexts/LocationContext';

export function WebShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { deliveryLocation, setShowSelector } = useDeliveryLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (Capacitor.isNativePlatform()) {
    return null;
  }

  if (location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-header-bg border-b border-gray-200 dark:border-border-light sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <div
                onClick={() => navigate('/home')}
                className="flex-shrink-0 cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-100 dark:shadow-amber-500/20">
                  <Leaf size={22} className="text-white" />
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-text-primary tracking-tight transition-colors">DryFruit Hub</span>
              </div>

              {user && (
                <div
                  onClick={() => setShowSelector(true)}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-secondary cursor-pointer transition-colors text-left border border-transparent hover:border-gray-100 dark:hover:border-border-light"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <Zap size={15} className="fill-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-gray-400 dark:text-text-tertiary uppercase tracking-widest leading-none">Deliver to</div>
                    <div className="text-sm font-black text-gray-800 dark:text-text-secondary flex items-center gap-0.5 leading-tight mt-1">
                      <span className="truncate max-w-[150px]">{deliveryLocation}</span>
                      <span className="text-blue-600 text-[10px] flex-shrink-0">▾</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <div className="flex-grow max-w-3xl mx-8 hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary" size={22} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        navigate(`/search?q=${encodeURIComponent(val)}`, { replace: location.pathname === '/search' });
                      } else {
                        navigate('/search', { replace: location.pathname === '/search' });
                      }
                    }}
                    placeholder="Search products..."
                    className="w-full bg-gray-100/80 dark:bg-surface-secondary border border-transparent hover:bg-gray-100 dark:hover:bg-surface-tertiary focus:bg-white dark:focus:bg-surface focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-full py-3 pl-12 pr-12 outline-none transition-all text-base text-gray-900 dark:text-text-primary placeholder-gray-400 dark:placeholder-text-tertiary"
                    onFocus={() => {
                      if (location.pathname !== '/search') {
                        navigate('/search');
                      }
                    }}
                  />
                  {query && (
                    <button
                      onClick={() => navigate('/search', { replace: location.pathname === '/search' })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary hover:text-gray-600 dark:hover:text-text-secondary transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-1.5">
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/20 active:scale-95 transition-all mr-2 cursor-pointer"
                  >
                    <span>Admin Panel</span>
                    <span>👑</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/wishlist')}
                  className="p-2.5 text-gray-600 dark:text-text-secondary hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-surface-secondary rounded-full transition-all relative"
                >
                  <Heart size={24} />
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="p-2.5 text-gray-600 dark:text-text-secondary hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-surface-secondary rounded-full transition-all relative"
                >
                  <ShoppingCart size={24} />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface">
                      {itemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2.5 text-gray-600 dark:text-text-secondary hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-surface-secondary rounded-full transition-all"
                >
                  <User size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white dark:bg-header-bg border-t border-gray-200 dark:border-border-light py-8 mt-auto transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-text-secondary text-sm transition-colors">&copy; 2026 DryFruit Hub. All rights reserved.</p>
            {user && (
              <div className="flex gap-6">
                <button onClick={() => navigate('/support')} className="text-gray-500 dark:text-text-secondary text-sm hover:text-blue-600 transition-colors">
                  Support
                </button>
                <button onClick={() => navigate('/orders')} className="text-gray-500 dark:text-text-secondary text-sm hover:text-blue-600 transition-colors">
                  Orders
                </button>
                <button onClick={() => navigate('/settings')} className="text-gray-500 dark:text-text-secondary text-sm hover:text-blue-600 transition-colors">
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

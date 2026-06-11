import { Outlet, useNavigate, useSearchParams, useLocation } from 'react-router';
import { ShoppingCart, User, Search, Heart, Leaf, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../contexts/AuthContext';

export function WebShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { itemCount } = useCart();
  const { user } = useAuth();

  if (Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <div
                onClick={() => navigate('/home')}
                className="flex-shrink-0 cursor-pointer flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-100">
                  <Leaf size={22} className="text-white" />
                </div>
                <span className="text-2xl font-black text-gray-900 tracking-tight">DryFruit Hub</span>
              </div>

              {user && (
                <div
                  onClick={() => navigate('/addresses')}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors text-left border border-transparent hover:border-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <Zap size={15} className="fill-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider leading-none">Deliver to</div>
                    <div className="text-xs font-extrabold text-gray-800 flex items-center gap-0.5 leading-tight mt-0.5">
                      <span className="truncate max-w-[120px]">Mumbai, India</span>
                      <span className="text-blue-600 text-[10px] flex-shrink-0">▾</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <div className="flex-grow max-w-3xl mx-8 hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
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
                    className="w-full bg-gray-100/80 border border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-full py-3 pl-12 pr-4 outline-none transition-all text-base text-gray-900"
                    onFocus={() => {
                      if (location.pathname !== '/search') {
                        navigate('/search');
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {user && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate('/wishlist')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all relative"
                >
                  <Heart size={24} />
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all relative"
                >
                  <ShoppingCart size={24} />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-white">
                      {itemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all"
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

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2026 DryFruit Hub. All rights reserved.</p>
            {user && (
              <div className="flex gap-6">
                <button onClick={() => navigate('/support')} className="text-gray-500 text-sm hover:text-blue-600 transition-colors">
                  Support
                </button>
                <button onClick={() => navigate('/orders')} className="text-gray-500 text-sm hover:text-blue-600 transition-colors">
                  Orders
                </button>
                <button onClick={() => navigate('/settings')} className="text-gray-500 text-sm hover:text-blue-600 transition-colors">
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

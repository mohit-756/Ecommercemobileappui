import { Outlet, useNavigate } from 'react-router';
import { ShoppingCart, User, Search, Heart, Leaf } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Capacitor } from '@capacitor/core';

export function WebShell() {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  if (Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              onClick={() => navigate('/home')}
              className="flex-shrink-0 cursor-pointer flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Leaf size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DryFruit Hub</span>
            </div>

            <div className="flex-1 max-w-lg mx-8 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-gray-100 border-transparent rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm"
                  onFocus={() => navigate('/search')}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/wishlist')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
              >
                <Heart size={22} />
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
              >
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <User size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2026 DryFruit Hub. All rights reserved.</p>
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
          </div>
        </div>
      </footer>
    </div>
  );
}

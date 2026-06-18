import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useSearchParams, useLocation } from 'react-router';
import { ShoppingCart, User, Search, Heart, Leaf, Zap, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../contexts/AuthContext';
import { useDeliveryLocation } from '../contexts/LocationContext';
import { saveRecentSearch } from '../lib/utils';
import { productService } from '../services/productService';

export function WebShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { deliveryLocation, setShowSelector } = useDeliveryLocation();

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const searchPlaceholders = [
    'Search cashews, almonds, walnuts...',
    'Try "Premium Almonds 500g"...',
    'Search for pistachios, raisins...',
    'Find organic dates, dried figs...',
    'Try "Mixed Dry Fruits"...',
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const placeholderTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    placeholderTimer.current = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => {
      if (placeholderTimer.current) clearInterval(placeholderTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await productService.getSearchSuggestions(query);
        setSuggestions(res.data || []);
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
        setSuggestions([]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (Capacitor.isNativePlatform()) {
    return null;
  }

  // No shell (navbar/footer) on splash, login, OTP, or onboarding pages
  const noShellRoutes = ['/', '/login', '/verify-otp', '/onboarding'];
  if (noShellRoutes.includes(location.pathname)) {
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
                className="flex-shrink-0 cursor-pointer flex items-center gap-2.5"
              >
                <img src="/logo.png" alt="DryFruit Hub" className="h-12 w-auto object-contain drop-shadow-sm" />
                <span className="text-2xl font-black text-gray-900 dark:text-text-primary tracking-tight transition-colors">DryFruit Hub</span>
              </div>

              {user && (
                <div
                  onClick={() => setShowSelector(true)}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-55 dark:hover:bg-surface-secondary cursor-pointer transition-colors text-left border border-transparent hover:border-gray-100 dark:hover:border-border-light"
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
              <div className="flex-grow max-w-3xl mx-8 hidden sm:block relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-tertiary" size={22} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSuggestionsOpen(true);
                      if (val) {
                        navigate(`/search?q=${encodeURIComponent(val)}`, { replace: location.pathname === '/search' });
                      } else {
                        navigate('/search', { replace: location.pathname === '/search' });
                      }
                    }}
                    onFocus={() => {
                      setSuggestionsOpen(true);
                      if (location.pathname !== '/search') {
                        navigate('/search');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && query.trim()) {
                        saveRecentSearch(query);
                        setSuggestionsOpen(false);
                      }
                    }}
                    onBlur={() => {
                      if (query.trim()) {
                        saveRecentSearch(query);
                      }
                      setTimeout(() => setSuggestionsOpen(false), 200);
                    }}
                    placeholder={searchPlaceholders[placeholderIdx]}
                    className="w-full bg-gray-100/80 dark:bg-surface-secondary border border-transparent hover:bg-gray-100 dark:hover:bg-surface-tertiary focus:bg-white dark:focus:bg-surface focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-full py-3 pl-12 pr-12 outline-none transition-all text-base text-gray-900 dark:text-text-primary placeholder-gray-400 dark:placeholder-text-tertiary"
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

                {suggestionsOpen && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-surface border border-gray-150 dark:border-border-light rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 dark:divide-border-light">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(item)}`, { replace: location.pathname === '/search' });
                          saveRecentSearch(item);
                          setSuggestionsOpen(false);
                        }}
                        className="w-full text-left px-5 py-3.5 text-sm text-gray-800 dark:text-text-primary hover:bg-gray-50 dark:hover:bg-surface-secondary transition-colors cursor-pointer"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
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

      <footer className="bg-white dark:bg-header-bg border-t border-gray-200 dark:border-border-light mt-auto transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4 cursor-pointer" onClick={() => navigate('/home')}>
                <img src="/logo.png" alt="DryFruit Hub" className="h-9 w-auto object-contain" />
                <span className="text-lg font-black text-gray-900 dark:text-text-primary">DryFruit Hub</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-text-secondary leading-relaxed mb-5">
                Premium organic dry fruits and nuts, handpicked for freshness. Delivered fresh to your door across India.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-surface-tertiary flex items-center justify-center text-gray-600 dark:text-text-secondary hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-500/10 dark:hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-surface-tertiary flex items-center justify-center text-gray-600 dark:text-text-secondary hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-500/10 dark:hover:text-sky-400 transition-colors"
                  aria-label="Twitter / X"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-surface-tertiary flex items-center justify-center text-gray-600 dark:text-text-secondary hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-500/10 dark:hover:text-green-400 transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop column */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-text-primary uppercase tracking-wider mb-4">Shop</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'All Products', path: '/search' },
                  { label: 'Best Sellers', path: '/search?q=best' },
                  { label: 'Almonds & Cashews', path: '/search?q=almonds' },
                  { label: 'Dates & Figs', path: '/search?q=dates' },
                  { label: 'Gift Boxes', path: '/search?q=gift' },
                ].map(item => (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-sm text-gray-500 dark:text-text-secondary hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account column */}
            {user && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-text-primary uppercase tracking-wider mb-4">My Account</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'My Orders', path: '/orders' },
                    { label: 'Wishlist', path: '/wishlist' },
                    { label: 'Addresses', path: '/addresses' },
                    { label: 'Settings', path: '/settings' },
                    { label: 'Profile', path: '/profile' },
                  ].map(item => (
                    <li key={item.path}>
                      <button
                        onClick={() => navigate(item.path)}
                        className="text-sm text-gray-500 dark:text-text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Help & Legal column */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-text-primary uppercase tracking-wider mb-4">Help & Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Help & Support', path: '/support' },
                  { label: 'Shipping Info', path: '/shipping' },
                  { label: 'Refund Policy', path: '/refund' },
                  { label: 'Terms of Service', path: '/terms' },
                  { label: 'Privacy Policy', path: '/privacy' },
                ].map(item => (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className="text-sm text-gray-500 dark:text-text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-100 dark:border-border-light pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-400 dark:text-text-tertiary text-xs">
              &copy; 2026 DryFruit Hub. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
                100% Organic
              </span>
              <span>·</span>
              <span>Free delivery above ₹500</span>
              <span>·</span>
              <span>Secure payments</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

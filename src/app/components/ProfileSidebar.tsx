import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Package, Headphones, MapPin, User, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfileSidebarProps {
  activeTab?: 'orders' | 'support' | 'addresses' | 'profile';
}

export function ProfileSidebar({ activeTab }: ProfileSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    { id: 'orders', label: 'Orders', icon: Package, path: '/orders' },
    { id: 'support', label: 'Customer Support', icon: Headphones, path: '/support' },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, path: '/addresses' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-100 dark:border-border-light shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl font-bold flex-shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary truncate">{user?.name || 'User'}</h2>
          <p className="text-xs text-gray-500 dark:text-text-secondary mt-0.5">{user?.phone || user?.email || '+91 9999999999'}</p>
        </div>
      </div>

      {/* Gift Card Card */}
      <div className="bg-white dark:bg-surface p-5 rounded-2xl border border-gray-100 dark:border-border-light shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-50 dark:border-border-light pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <span className="text-sm font-semibold text-gray-800 dark:text-text-primary">DryFruit Hub Cash</span>
          </div>
          <ArrowRight size={14} className="text-gray-400" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Available Balance</div>
            <div className="text-base font-extrabold text-gray-950 dark:text-text-primary mt-0.5">₹0</div>
          </div>
          <button 
            type="button"
            className="bg-black hover:bg-gray-800 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer"
          >
            Add Balance
          </button>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border-light shadow-sm overflow-hidden">
        <nav className="flex flex-col">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 text-left border-l-4 transition-all duration-200 cursor-pointer font-semibold text-sm",
                  isActive
                    ? "bg-pink-50/25 dark:bg-pink-950/10 border-pink-500 text-pink-600 dark:text-pink-400 font-bold"
                    : "border-transparent text-gray-600 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-surface-secondary hover:text-gray-900 dark:hover:text-text-primary"
                )}
              >
                <item.icon size={18} className={isActive ? "text-pink-600 dark:text-pink-400" : "text-gray-400"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

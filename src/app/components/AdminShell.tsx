import { Outlet, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, Package, ShoppingBag, Store, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background font-sans text-gray-900 dark:text-text-primary flex flex-col lg:flex-row transition-colors duration-300">
      
      {/* Desktop Sidebar (Left side) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-surface border-r border-gray-200 dark:border-border-light h-screen sticky top-0 shrink-0 self-start overflow-y-auto">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-100 dark:border-border-light">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-100 dark:shadow-blue-900/30">
            <span className="text-white text-lg font-black">👑</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-gray-900 dark:text-text-primary tracking-tight">Admin Panel</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 leading-none">DryFruit Hub</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                    : "text-gray-600 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-surface-secondary hover:text-gray-900 dark:hover:text-text-primary"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-border-light space-y-1">
          <button
            onClick={() => navigate('/home')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-surface-secondary hover:text-gray-900 dark:hover:text-text-primary transition-all cursor-pointer"
          >
            <Store size={20} />
            <span>Go to Shop</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        


        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (hidden on large screens) */}
        <nav className="lg:hidden bg-white dark:bg-surface border-t border-gray-150 dark:border-border-light py-2 px-6 flex justify-around items-center sticky bottom-0 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] transition-colors duration-300">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 py-1 px-3 text-center cursor-pointer"
              >
                <item.icon
                  size={22}
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-blue-600" : "text-gray-400 dark:text-text-tertiary"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-blue-600" : "text-gray-400 dark:text-text-tertiary"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('/home')}
            className="flex flex-col items-center gap-1 py-1 px-3 text-center cursor-pointer"
          >
            <Store size={22} className="text-gray-400 dark:text-text-tertiary" />
            <span className="text-[10px] font-medium text-gray-400 dark:text-text-tertiary">Shop</span>
          </button>
        </nav>

      </div>
    </div>
  );
}

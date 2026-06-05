import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Bell, Lock, Eye, Globe, Trash2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';

export function Settings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedNotifs = localStorage.getItem('settings_notifs');
    const savedDark = localStorage.getItem('settings_dark');
    if (savedNotifs !== null) setNotifications(JSON.parse(savedNotifs));
    if (savedDark !== null) setDarkMode(JSON.parse(savedDark));
  }, []);

  const handleToggleNotifs = (val: boolean) => {
    setNotifications(val);
    localStorage.setItem('settings_notifs', JSON.stringify(val));
    toast.success(`Notifications turned ${val ? 'on' : 'off'}`);
  };

  const handleToggleDark = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem('settings_dark', JSON.stringify(val));
    toast.info('Dark mode will be applied on next restart (Demo)');
  };

  const handleClearCache = () => {
    toast.promise(new Promise(res => setTimeout(res, 1500)), {
      loading: 'Clearing cache...',
      success: 'Cache cleared successfully!',
      error: 'Failed to clear cache'
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Settings</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Preferences</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <span className="font-semibold text-gray-900">Notifications</span>
              </div>
              <Switch checked={notifications} onCheckedChange={handleToggleNotifs} />
            </div>

            <div className="flex items-center justify-between p-4 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <span className="font-semibold text-gray-900">Dark Mode</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={handleToggleDark} />
            </div>

            <motion.button
              whileTap={{ backgroundColor: '#f9fafb' }}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <span className="font-semibold text-gray-900">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">English (US)</span>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            </motion.button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Security</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <motion.button
              whileTap={{ backgroundColor: '#f9fafb' }}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <span className="font-semibold text-gray-900">Privacy & Security</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </motion.button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">System</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <motion.button
              onClick={handleClearCache}
              whileTap={{ backgroundColor: '#fef2f2' }}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <span className="font-semibold text-red-500">Clear Cache</span>
              </div>
              <span className="text-sm text-gray-400">24 MB</span>
            </motion.button>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400 font-medium">Luminar Retail Shop</p>
          <p className="text-[10px] text-gray-300 mt-1">Version 1.0.0 (Build 2024.06)</p>
        </div>
      </div>
    </div>
  );
}

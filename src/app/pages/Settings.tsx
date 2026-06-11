import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Bell, Lock, Eye, Globe, Trash2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

export function Settings() {
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage } = useTranslation();
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
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success(`Dark mode ${val ? 'enabled' : 'disabled'}`);
  };

  const handleToggleLanguage = () => {
    const nextLang = currentLanguage === 'English (US)' ? 'Hindi (हिन्दी)' : 'English (US)';
    setLanguage(nextLang);
    toast.success(`Language changed to ${nextLang}`);
  };

  const handleClearCache = () => {
    toast.promise(new Promise(res => setTimeout(res, 1500)), {
      loading: 'Clearing cache...',
      success: 'Cache cleared successfully!',
      error: 'Failed to clear cache'
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none lg:bg-transparent overflow-hidden transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 pt-6 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-gray-800 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-gray-100 cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 ml-2">{t('settings')}</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">{t('preferences')}</h3>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{t('notifications')}</span>
              </div>
              <Switch checked={notifications} onCheckedChange={handleToggleNotifs} />
            </div>

            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{t('darkMode')}</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={handleToggleDark} />
            </div>

            <motion.button
              onClick={handleToggleLanguage}
              whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              className="w-full flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{t('language')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 dark:text-gray-500">{currentLanguage}</span>
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
              </div>
            </motion.button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">{t('security')}</h3>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <motion.button
              onClick={() => navigate('/privacy')}
              whileTap={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              className="w-full flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{t('privacySecurity')}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
            </motion.button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">{t('system')}</h3>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <motion.button
              onClick={handleClearCache}
              whileTap={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              className="w-full flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <span className="font-semibold text-red-500 dark:text-red-400">{t('clearCache')}</span>
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500">24 MB</span>
            </motion.button>
          </div>
        </div>


        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400 font-medium">DryFruit Hub</p>
          <p className="text-[10px] text-gray-300 mt-1">{t('version')} 1.0.0 ({t('build')} 2024.06)</p>
        </div>
      </div>
    </div>
  );
}

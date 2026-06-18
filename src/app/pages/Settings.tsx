import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Bell, Lock, Eye, Globe, Trash2, ChevronRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { hapticService } from '../services/hapticService';

export function Settings() {
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage } = useTranslation();
  const { isDark, setTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const [notifications, setNotifications] = useState(true);



  useEffect(() => {
    const savedNotifs = localStorage.getItem('settings_notifs');
    if (savedNotifs !== null) setNotifications(JSON.parse(savedNotifs));
  }, []);

  const handleToggleNotifs = (val: boolean) => {
    setNotifications(val);
    localStorage.setItem('settings_notifs', JSON.stringify(val));
    toast.success(`Notifications turned ${val ? 'on' : 'off'}`);
  };

  const handleToggleDark = (val: boolean) => {
    setTheme(val);
    toast.success(`Dark mode ${val ? 'enabled' : 'disabled'}`);
  };

  const handleToggleLanguage = () => {
    const nextLang = currentLanguage === 'English (US)' ? 'Hindi (हिन्दी)' : 'English (US)';
    setLanguage(nextLang);
    toast.success(`Language changed to ${nextLang}`);
  };

  const handleClearCache = () => {
    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(() => {
          // Clear all non-critical cached data
          const keysToRemove = [
            'recent_searches',
            'recently_viewed',
            'guest_cart',
            'delivery_location',
            'location-popup-dismissed',
          ];
          keysToRemove.forEach(key => localStorage.removeItem(key));
          sessionStorage.clear();
          resolve();
        }, 600);
      }),
      {
        loading: 'Clearing cache...',
        success: 'Cache cleared! Some data like login session is preserved.',
        error: 'Failed to clear cache',
      }
    );
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-background lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none lg:bg-transparent overflow-hidden transition-colors duration-300">
      <div className="bg-white dark:bg-header-bg pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-border-light flex items-center transition-colors duration-300">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary ml-2 transition-colors">{t('settings')}</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-3 px-1">{t('preferences')}</h3>
          <div className="bg-white dark:bg-surface rounded-3xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden transition-colors duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-border-light">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{t('notifications')}</span>
              </div>
              <Switch checked={notifications} onCheckedChange={handleToggleNotifs} />
            </div>

            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-border-light">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{t('darkMode')}</span>
              </div>
              <Switch checked={isDark} onCheckedChange={handleToggleDark} />
            </div>

            <motion.button
              onClick={handleToggleLanguage}
              whileTap={{ backgroundColor: '#f9fafb' }}
              className="w-full flex items-center justify-between p-4 cursor-pointer dark:hover:bg-surface-secondary"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{t('language')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 dark:text-text-tertiary">{currentLanguage}</span>
                <ChevronRight size={18} className="text-gray-300 dark:text-text-tertiary" />
              </div>
            </motion.button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-3 px-1">{t('account')}</h3>
          <div className="bg-white dark:bg-surface rounded-3xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden transition-colors duration-300">
            <motion.button
              onClick={() => {
                hapticService.impact();
                navigate('/profile/edit');
              }}
              whileTap={{ backgroundColor: '#f9fafb' }}
              className="w-full flex items-center justify-between p-4 cursor-pointer dark:hover:bg-surface-secondary text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center">
                  <User size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{t('editProfile')}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-text-tertiary" />
            </motion.button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-3 px-1">{t('security')}</h3>
          <div className="bg-white dark:bg-surface rounded-3xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden transition-colors duration-300">
            <motion.button
              onClick={() => navigate('/privacy')}
              whileTap={{ backgroundColor: '#f9fafb' }}
              className="w-full flex items-center justify-between p-4 cursor-pointer dark:hover:bg-surface-secondary"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/20 text-purple-600 flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{t('privacySecurity')}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-text-tertiary" />
            </motion.button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-3 px-1">{t('system')}</h3>
          <div className="bg-white dark:bg-surface rounded-3xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden transition-colors duration-300">
            <motion.button
              onClick={handleClearCache}
              whileTap={{ backgroundColor: '#fef2f2' }}
              className="w-full flex items-center justify-between p-4 cursor-pointer dark:hover:bg-surface-secondary"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/20 text-red-500 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <span className="font-semibold text-red-500">{t('clearCache')}</span>
              </div>
            </motion.button>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-text-tertiary font-medium">DryFruit Hub</p>
          <p className="text-[10px] text-gray-300 dark:text-text-tertiary mt-1">{t('version')} 1.0.0 ({t('build')} 2024.06)</p>
        </div>
      </div>


    </div>
  );
}

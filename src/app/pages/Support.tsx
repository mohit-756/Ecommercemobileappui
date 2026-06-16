import { useNavigate } from 'react-router';
import { ChevronLeft, MessageCircle, Phone, Mail, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

export function Support() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const contactMethods = [
    { icon: MessageCircle, label: t('liveChat'), description: t('liveChatDesc'), color: 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' },
    { icon: Phone, label: t('callSupport'), description: t('callSupportDesc'), color: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
    { icon: Mail, label: t('emailUs'), description: t('emailUsDesc'), color: 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  ];

  const commonTopics = [
    { label: t('refundPolicy'), onClick: () => navigate('/refund') },
    { label: t('shippingInfo'), onClick: () => navigate('/shipping') },
    { label: t('termsOfService'), onClick: () => navigate('/terms') },
    { label: t('privacyPolicy'), onClick: () => navigate('/privacy') }
  ];

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300 lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none lg:bg-transparent overflow-hidden">
      <div className="bg-white dark:bg-surface pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-border-light flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary ml-2">{t('helpSupport')}</h1>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-blue-600 rounded-3xl p-6 text-white mb-2">
              <h2 className="text-xl font-bold mb-2">{t('howCanWeHelp')}</h2>
              <p className="text-blue-100 text-sm leading-relaxed">{t('howCanWeHelpDesc')}</p>
            </div>

            <div className="space-y-3">
              {contactMethods.map((method, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white dark:bg-surface p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 dark:border-border-light cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.color}`}>
                    <method.icon size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900 dark:text-text-primary">{method.label}</p>
                    <p className="text-xs text-gray-500 dark:text-text-secondary">{method.description}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 dark:text-text-tertiary" />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 dark:text-text-tertiary uppercase tracking-wider mb-3 px-1">{t('commonTopics')}</h3>
            <div className="bg-white dark:bg-surface rounded-3xl shadow-sm border border-gray-100 dark:border-border-light overflow-hidden">
              {commonTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-surface-tertiary transition-colors ${idx !== 3 ? 'border-b border-gray-50 dark:border-border-light' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-gray-400 dark:text-text-tertiary" />
                    <span className="text-sm font-medium text-gray-700 dark:text-text-primary">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 dark:text-text-tertiary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router';
import { ChevronLeft, MessageCircle, Phone, Mail, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

export function Support() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const contactMethods = [
    { icon: MessageCircle, label: t('liveChat'), description: t('liveChatDesc'), color: 'bg-blue-50 text-blue-600' },
    { icon: Phone, label: t('callSupport'), description: t('callSupportDesc'), color: 'bg-emerald-50 text-emerald-600' },
    { icon: Mail, label: t('emailUs'), description: t('emailUsDesc'), color: 'bg-purple-50 text-purple-600' },
  ];

  const commonTopics = [
    { label: t('refundPolicy'), onClick: () => toast.info("Refund Policy: Orders can be cancelled before shipping for a full refund. Delivered items can be returned within 7 days.") },
    { label: t('shippingInfo'), onClick: () => toast.info("Shipping Information: Free delivery for orders above ₹500. Standard shipping takes 1-3 business days.") },
    { label: t('termsOfService'), onClick: () => navigate('/terms') },
    { label: t('privacyPolicy'), onClick: () => navigate('/privacy') }
  ];

  return (
    <div className="min-h-full flex flex-col bg-gray-50 lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none lg:bg-transparent overflow-hidden">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">{t('helpSupport')}</h1>
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
                  className="w-full bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.color}`}>
                    <method.icon size={24} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-gray-900">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.description}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{t('commonTopics')}</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {commonTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${idx !== 3 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

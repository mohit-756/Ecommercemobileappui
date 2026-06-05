import { useNavigate } from 'react-router';
import { ChevronLeft, MessageCircle, Phone, Mail, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Support() {
  const navigate = useNavigate();

  const contactMethods = [
    { icon: MessageCircle, label: 'Live Chat', description: 'Typical response time: 2 mins', color: 'bg-blue-50 text-blue-600' },
    { icon: Phone, label: 'Call Support', description: 'Mon-Fri, 9am - 6pm', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Mail, label: 'Email Us', description: 'support@retailshop.com', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Help & Support</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
        <div className="bg-blue-600 rounded-3xl p-6 text-white mb-2">
          <h2 className="text-xl font-bold mb-2">How can we help?</h2>
          <p className="text-blue-100 text-sm leading-relaxed">Our support team is available to assist you with any questions or issues.</p>
        </div>

        <div className="space-y-3">
          {contactMethods.map((method, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100"
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

        <div className="pt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Common Topics</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {['Refund Policy', 'Shipping Information', 'Terms of Service', 'Privacy Policy'].map((item, idx) => (
              <button key={idx} className={`w-full flex items-center justify-between p-4 ${idx !== 3 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

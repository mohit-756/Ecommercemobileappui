import { useNavigate } from 'react-router';
import { ChevronLeft, Bell, Lock, Eye, Globe, Trash2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Settings() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Account Settings',
      items: [
        { icon: Bell, label: 'Notifications', value: 'On' },
        { icon: Lock, label: 'Privacy & Security', value: '' },
        { icon: Eye, label: 'Display Mode', value: 'Light' },
        { icon: Globe, label: 'Language', value: 'English (US)' },
      ]
    },
    {
      title: 'Data & Storage',
      items: [
        { icon: Trash2, label: 'Clear Cache', value: '24 MB', color: 'text-red-500' },
      ]
    }
  ];

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Settings</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">{section.title}</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item, iIdx) => (
                <motion.button
                  key={iIdx}
                  whileTap={{ backgroundColor: '#f9fafb' }}
                  className={`w-full flex items-center justify-between p-4 ${iIdx !== section.items.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center ${item.color || 'text-gray-600'}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-semibold text-gray-900">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-sm text-gray-400">{item.value}</span>}
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400">App Version 0.0.1</p>
        </div>
      </div>
    </div>
  );
}

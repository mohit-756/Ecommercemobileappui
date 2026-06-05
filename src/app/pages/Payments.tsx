import { useNavigate } from 'react-router';
import { ChevronLeft, CreditCard, Plus, ShieldCheck } from 'lucide-react';

export function Payments() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">Payment Methods</h1>
        </div>
        <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-xl relative overflow-hidden text-white mb-6">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <CreditCard size={32} />
              <span className="text-sm font-medium opacity-80">Primary Card</span>
            </div>
            <p className="text-xl tracking-[4px] font-mono mb-6">•••• •••• •••• 4242</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase opacity-60 mb-1">Card Holder</p>
                <p className="text-sm font-semibold uppercase">Mohit C</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase opacity-60 mb-1">Expires</p>
                <p className="text-sm font-semibold">12/28</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">Safe & Secure</p>
            <p className="text-xs text-emerald-600">Your payment data is encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}

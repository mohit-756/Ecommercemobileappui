import { useNavigate } from 'react-router';
import { ChevronLeft, Package, ChevronRight } from 'lucide-react';

export function Orders() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">My Orders</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto">
        {[1, 2].map((_, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-600 transition-colors" onClick={() => navigate('/tracking')}>
            <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
              <div>
                <p className="text-sm font-bold text-gray-900">Order #ORD-{12345 + idx}</p>
                <p className="text-xs text-gray-500 mt-0.5">12 Oct 2023</p>
              </div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">In Transit</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">2 Items</p>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">$204.98</p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-sm font-semibold text-blue-600">
                Track <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
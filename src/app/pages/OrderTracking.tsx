import { useNavigate } from 'react-router';
import { ChevronLeft, Package, Truck, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function OrderTracking() {
  const navigate = useNavigate();

  const steps = [
    { title: 'Order Placed', time: '10:00 AM, 12 Oct', completed: true },
    { title: 'Processing', time: '11:30 AM, 12 Oct', completed: true },
    { title: 'Packed', time: '02:00 PM, 12 Oct', completed: true },
    { title: 'Shipped', time: '04:15 PM, 12 Oct', completed: false, current: true },
    { title: 'Out for Delivery', time: 'Estimated 13 Oct', completed: false },
    { title: 'Delivered', time: 'Pending', completed: false },
  ];

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Track Order</h1>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium">Order ID</p>
            <p className="font-bold text-gray-900">#ORD-12345</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gray-100" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 mb-8 last:mb-0 relative">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center z-10 relative",
                  step.completed ? "bg-blue-600 text-white" : step.current ? "bg-blue-100 border-2 border-blue-600 text-blue-600" : "bg-gray-100 text-gray-400"
                )}>
                  {step.completed ? <CheckCircle2 size={16} /> : <div className={cn("w-2 h-2 rounded-full", step.current ? "bg-blue-600" : "bg-transparent")} />}
                </div>
                <div>
                  <h3 className={cn("font-bold text-sm", step.completed || step.current ? "text-gray-900" : "text-gray-400")}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
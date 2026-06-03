import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, MapPin, CreditCard, Wallet, Banknote, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully!');
    setTimeout(() => navigate('/success'), 500);
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 md:pt-6 md:rounded-t-[32px] border-b border-gray-100 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Checkout</h1>
      </div>

      <div className="flex-1 px-6 py-6 pb-32 space-y-6 overflow-y-auto">
        
        {/* Shipping Address */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">Shipping Address</h3>
            <button className="text-blue-600 text-sm font-medium">Change</button>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">Home</span>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-sm">DEFAULT</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                123 Design Street, Apt 4B<br/>
                New York, NY 10001<br/>
                +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Payment Method</h3>
          <div className="space-y-3">
            {[
              { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
              { id: 'wallet', name: 'Digital Wallet (Apple/GPay)', icon: Wallet },
              { id: 'upi', name: 'UPI', icon: ShieldCheck },
              { id: 'cod', name: 'Cash on Delivery', icon: Banknote },
            ].map((method) => (
              <label 
                key={method.id}
                className={cn(
                  "flex items-center p-4 rounded-2xl border cursor-pointer transition-all",
                  paymentMethod === method.id 
                    ? "border-blue-600 bg-blue-50/50" 
                    : "border-gray-100 bg-white hover:bg-gray-50"
                )}
              >
                <method.icon 
                  size={24} 
                  className={cn("mr-4", paymentMethod === method.id ? "text-blue-600" : "text-gray-400")} 
                />
                <span className={cn(
                  "font-medium flex-1",
                  paymentMethod === method.id ? "text-blue-900" : "text-gray-700"
                )}>
                  {method.name}
                </span>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  paymentMethod === method.id ? "border-blue-600" : "border-gray-300"
                )}>
                  {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                </div>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Place Order Button */}
      <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-10 md:rounded-b-[32px]">
        <div className="flex justify-between items-end mb-4">
          <span className="text-gray-500">Total Payment</span>
          <span className="text-2xl font-bold text-gray-900">$204.98</span>
        </div>
        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-gray-900 text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
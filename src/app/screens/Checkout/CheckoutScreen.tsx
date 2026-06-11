import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "../../components/Button";

export default function CheckoutScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-background min-h-full pb-safe transition-colors duration-300">
      <div className="bg-white dark:bg-surface pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-900 dark:text-text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary mx-auto pr-6">Checkout</h1>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto pb-24">
        {/* Shipping Address */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-text-primary mb-3">Shipping Address</h3>
          <div className="bg-white dark:bg-surface rounded-2xl p-4 shadow-sm border border-blue-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-gray-900 dark:text-text-primary text-sm">Home</h4>
                <button className="text-blue-600 text-xs font-semibold">Change</button>
              </div>
              <p className="text-sm text-gray-500 dark:text-text-secondary leading-relaxed">
                123 Design Street, Creative Block<br />
                New York, NY 10001<br />
                +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>

        {/* Order Items Summary */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-text-primary mb-3">Order Items</h3>
          <div className="bg-white dark:bg-surface rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-surface-tertiary rounded-xl overflow-hidden flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBzbmVha2Vyc3xlbnwxfHx8fDE3ODAzOTc4NTV8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Nike" className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-text-primary text-sm line-clamp-1">Nike Air Max 270</h4>
                <p className="text-xs text-gray-500 dark:text-text-secondary mt-1">Size: US 9 • Qty: 1</p>
              </div>
              <span className="font-bold text-gray-900 dark:text-text-primary">$150</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-text-primary mb-3">Payment Method</h3>
          <button 
            onClick={() => navigate("/payment")}
            className="w-full bg-white dark:bg-surface rounded-2xl p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 dark:bg-background rounded-full flex items-center justify-center">
                <CreditCard size={20} className="text-gray-700 dark:text-text-primary" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900 dark:text-text-primary text-sm">Select Payment Method</h4>
                <p className="text-xs text-gray-500 dark:text-text-secondary">Choose how you want to pay</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 dark:text-text-tertiary" />
          </button>
        </div>

        {/* Totals */}
        <div className="bg-white dark:bg-surface rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-text-secondary">Subtotal</span>
            <span className="font-medium text-gray-900 dark:text-text-primary">$150.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-text-secondary">Shipping</span>
            <span className="font-medium text-green-500">Free</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-text-secondary">Tax</span>
            <span className="font-medium text-gray-900 dark:text-text-primary">$12.00</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full bg-white dark:bg-surface p-5 pb-safe border-t border-gray-100 dark:border-border-light flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-text-secondary">Total Price</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-text-primary">$162.00</p>
        </div>
        <Button onClick={() => navigate("/payment")} className="px-8 shadow-xl shadow-blue-600/30">
          Continue
        </Button>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-background lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none overflow-hidden transition-colors duration-300">
      <div className="bg-white dark:bg-surface pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-border-light flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary ml-2">Refund & Cancellation Policy</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto pb-24 text-sm text-gray-600 dark:text-text-secondary leading-relaxed">
        <div>
          <p className="font-bold text-gray-900 dark:text-text-primary">Last Updated: June 2026</p>
          <p className="mt-2">At DryFruit Hub, we want you to be fully satisfied with your purchase. If you are not completely happy with your order, we are here to help.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">1. Order Cancellation</h2>
          <p className="mt-2">Orders can be cancelled before dispatch for a full refund. Once the order has been handed over to our shipping partner, cancellation is no longer possible. To cancel your order, please visit the order tracking page or contact support immediately.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">2. Damaged or Incorrect Items</h2>
          <p className="mt-2">Due to the perishable nature of dry fruits, we verify all packages prior to dispatch. However, if you receive a damaged, stale, or incorrect item, please notify us within 24 hours of delivery. Please provide photographic evidence of the packaging and products to assist our team in resolving the issue quickly.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">3. Return Policy</h2>
          <p className="mt-2">To maintain strict hygiene and quality controls, we do not accept returns on opened packets unless the product is defective. If a return is approved by our quality control team, the items must be returned in their original packaging and condition.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">4. Refund Processing</h2>
          <p className="mt-2">Once approved, refunds are initiated immediately to your original payment source (credit/debit card, UPI, bank account). Please note that it can take 5 to 7 business days for the funds to reflect in your account, depending on your bank's processing timelines.</p>
        </div>
      </div>
    </div>
  );
}

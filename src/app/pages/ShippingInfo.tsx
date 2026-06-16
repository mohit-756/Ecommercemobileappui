import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function ShippingInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-background lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none overflow-hidden transition-colors duration-300">
      <div className="bg-white dark:bg-surface pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 dark:border-border-light flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900 dark:text-text-primary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-text-primary ml-2">Shipping Information</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto pb-24 text-sm text-gray-600 dark:text-text-secondary leading-relaxed">
        <div>
          <p className="font-bold text-gray-900 dark:text-text-primary">Last Updated: June 2026</p>
          <p className="mt-2">We deliver premium-grade dry fruits and nuts straight to your doorstep across India. Here is a summary of our shipping operations, charges, and delivery timelines.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">1. Shipping Charges</h2>
          <p className="mt-2">We offer free standard delivery on all orders above ₹500. For orders below ₹500, a flat shipping fee of ₹40 is added to the total cart value. All shipping charges are shown clearly during checkout before you make a payment.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">2. Delivery Timelines</h2>
          <p className="mt-2">Orders are processed and packed within 24 hours of placement. Standard shipping delivery timelines are:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
            <li><strong>Metro Cities:</strong> 1 to 3 business days</li>
            <li><strong>Rest of India:</strong> 3 to 5 business days</li>
            <li><strong>Hyperlocal Delivery (Select areas):</strong> Same day or next-day delivery</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">3. Order Tracking</h2>
          <p className="mt-2">Once your order is handed over to our courier partners, we will send a tracking link to your registered mobile number via SMS and your email address. You can also monitor your shipment's real-time transit status in the app under the "Orders" tab.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-text-primary">4. Vacuum Packaging & Freshness</h2>
          <p className="mt-2">To prevent spoilage and contamination, we pack all our products in airtight, food-grade vacuum-sealed containers. This helps retain the crunchiness, natural moisture, and premium quality of our products throughout transit.</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CreditCard, Smartphone, Wallet, Banknote } from "lucide-react";
import { Button } from "../../components/Button";

const PAYMENT_METHODS = [
  { id: "upi", title: "UPI (Google Pay, PhonePe)", icon: Smartphone, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "card", title: "Credit / Debit Card", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "wallet", title: "Wallets", icon: Wallet, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "cod", title: "Cash on Delivery", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" }
];

export default function PaymentScreen() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("card");

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-safe">
      <div className="bg-white pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto pr-6">Payment</h1>
      </div>

      <div className="p-5 space-y-4 flex-1">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`w-full bg-white rounded-2xl p-4 flex items-center justify-between border-2 transition-all ${selectedMethod === method.id ? "border-blue-600 shadow-md" : "border-transparent shadow-sm hover:border-gray-100"}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${method.bg} rounded-xl flex items-center justify-center`}>
                <method.icon size={24} className={method.color} />
              </div>
              <span className="font-semibold text-gray-900">{method.title}</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? "border-blue-600" : "border-gray-300"}`}>
              {selectedMethod === method.id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
            </div>
          </button>
        ))}

        {selectedMethod === "card" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mt-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div>
              <label className="text-sm font-medium text-gray-700 ml-1">Card Number</label>
              <input type="text" placeholder="0000 0000 0000 0000" className="mt-1 w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 ml-1">Expiry Date</label>
                <input type="text" placeholder="MM/YY" className="mt-1 w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 ml-1">CVV</label>
                <input type="password" placeholder="•••" className="mt-1 w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 ml-1">Cardholder Name</label>
              <input type="text" placeholder="John Doe" className="mt-1 w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-5 pb-safe border-t border-gray-100">
        <Button fullWidth onClick={() => navigate("/order-success")} className="shadow-xl shadow-blue-600/30">
          Pay $162.00
        </Button>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Phone, PackageCheck, CheckCircle2 } from "lucide-react";

export default function OrderTrackingScreen() {
  const navigate = useNavigate();

  const STATUSES = [
    { label: "Order Placed", date: "Aug 24, 10:30 AM", completed: true },
    { label: "Processing", date: "Aug 24, 02:15 PM", completed: true },
    { label: "Packed", date: "Aug 25, 09:00 AM", completed: true },
    { label: "Shipped", date: "Aug 25, 04:30 PM", completed: true },
    { label: "Out for Delivery", date: "Aug 26, 08:00 AM", completed: false, active: true },
    { label: "Delivered", date: "Expected by Aug 26, 08:00 PM", completed: false }
  ];

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-safe">
      <div className="bg-white pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto pr-6">Track Order</h1>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        {/* Map Mockup */}
        <div className="w-full h-48 bg-gray-200 rounded-3xl mb-6 overflow-hidden relative border border-gray-100">
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXB8ZW58MXx8fHwxNzgwNDc2MjkyfDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Map" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-bold text-blue-600 flex items-center">
              <MapPin size={16} className="mr-2" /> 15 mins away
            </div>
          </div>
        </div>

        {/* Delivery Partner */}
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-6 flex items-center gap-4">
          <img src="https://images.unsplash.com/photo-1590131222139-91ba5992e4ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB3b21hbnxlbnwxfHx8fDE3ODAzOTExNjd8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Driver" className="w-12 h-12 rounded-full object-cover" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Delivery Partner</p>
            <h4 className="font-bold text-gray-900">Sarah Jenkins</h4>
          </div>
          <button className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <Phone size={20} />
          </button>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <PackageCheck className="text-blue-600" size={24} />
            <div>
              <p className="text-sm font-bold text-gray-900">Order #ORD-892471</p>
              <p className="text-xs text-gray-500">Arriving Today</p>
            </div>
          </div>

          <div className="relative pl-3">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
            <div className="absolute left-[15px] top-2 h-[65%] w-0.5 bg-blue-600"></div>
            
            <div className="space-y-6">
              {STATUSES.map((status, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className={`w-3 h-3 mt-1.5 rounded-full ring-4 ring-white ${status.completed ? "bg-blue-600" : status.active ? "bg-blue-600 animate-pulse" : "bg-gray-300"}`} />
                  <div>
                    <h4 className={`text-sm font-bold ${status.completed || status.active ? "text-gray-900" : "text-gray-400"}`}>{status.label}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{status.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

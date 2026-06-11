import { useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, Users, Package, DollarSign, Activity } from "lucide-react";

export default function AdminDashboardScreen() {
  const navigate = useNavigate();

  const STATS = [
    { title: "Total Revenue", value: "$45,231", icon: DollarSign, color: "bg-emerald-100 text-emerald-600", trend: "+12.5%" },
    { title: "Total Orders", value: "1,245", icon: Package, color: "bg-blue-100 text-blue-600", trend: "+5.2%" },
    { title: "Total Users", value: "8,942", icon: Users, color: "bg-purple-100 text-purple-600", trend: "+18.1%" },
    { title: "Conversion Rate", value: "3.2%", icon: Activity, color: "bg-amber-100 text-amber-600", trend: "-1.4%" },
  ];

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-background min-h-full pb-safe transition-colors duration-300">
      <div className="bg-gray-900 pt-12 pb-20 px-5 relative rounded-b-3xl">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white mx-auto pr-6">Admin Dashboard</h1>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Today's Sales</p>
          <h2 className="text-4xl font-black text-white">$4,289.00</h2>
        </div>
      </div>

      <div className="px-5 -mt-10 relative z-10 flex-1 overflow-y-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-surface rounded-3xl p-4 shadow-sm border border-transparent dark:border-border-light transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-xs text-gray-500 dark:text-text-secondary mb-1">{stat.title}</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-text-primary mb-2">{stat.value}</h3>
              <div className={`text-xs font-bold flex items-center ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                <TrendingUp size={12} className="mr-1" /> {stat.trend}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-text-primary">Recent Orders</h3>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>
          <div className="bg-white dark:bg-surface rounded-3xl p-2 shadow-sm space-y-2 border border-transparent dark:border-border-light transition-colors">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-surface-secondary rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-surface rounded-xl flex items-center justify-center shadow-sm">
                    <Package size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-text-primary text-sm">#ORD-{892471 + i}</h4>
                    <p className="text-xs text-gray-500 dark:text-text-secondary">2 mins ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-text-primary text-sm">$150.00</p>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Processing</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

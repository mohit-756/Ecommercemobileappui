import { useNavigate } from "react-router";
import { ArrowLeft, Moon, Globe, Bell, Shield, ChevronRight } from "lucide-react";

export default function SettingsScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gray-50 min-h-full pb-safe">
      <div className="bg-white pt-12 pb-4 px-5 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 mx-auto pr-6">Settings</h1>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 px-2">General</h3>
          <div className="bg-white rounded-3xl p-2 shadow-sm">
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Globe size={20} className="text-gray-700" /></div>
                <span className="font-semibold text-gray-900 text-sm">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">English (US)</span>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Moon size={20} className="text-gray-700" /></div>
                <span className="font-semibold text-gray-900 text-sm">Dark Mode</span>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 px-2">Account</h3>
          <div className="bg-white rounded-3xl p-2 shadow-sm">
            <div className="flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"><Bell size={20} className="text-blue-600" /></div>
                <span className="font-semibold text-gray-900 text-sm">Notification Preferences</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-b-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center"><Shield size={20} className="text-emerald-600" /></div>
                <span className="font-semibold text-gray-900 text-sm">Privacy & Security</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

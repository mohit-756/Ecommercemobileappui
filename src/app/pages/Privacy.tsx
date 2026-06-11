import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col bg-white lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none overflow-hidden">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Privacy Policy</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto pb-24 text-sm text-gray-600 leading-relaxed">
        <p className="font-bold text-gray-900">Last Updated: June 2026</p>
        <p>At DryFruit Hub, accessible from our mobile application, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by DryFruit Hub and how we use it.</p>

        <h2 className="text-lg font-bold text-gray-900 mt-6">1. Log Files</h2>
        <p>DryFruit Hub follows a standard procedure of using log files. These files log visitors when they use the app. All hosting companies do this and a part of hosting services' analytics.</p>

        <h2 className="text-lg font-bold text-gray-900 mt-6">2. Privacy Policies</h2>
        <p>You may consult this list to find the Privacy Policy for each of the advertising partners of DryFruit Hub.</p>

        <h2 className="text-lg font-bold text-gray-900 mt-6">3. Third Party Privacy Policies</h2>
        <p>DryFruit Hub's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.</p>

        <h2 className="text-lg font-bold text-gray-900 mt-6">4. Children's Information</h2>
        <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>
      </div>
    </div>
  );
}

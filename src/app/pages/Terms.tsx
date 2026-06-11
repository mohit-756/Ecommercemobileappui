import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col bg-white lg:max-w-full lg:mx-0 lg:my-0 lg:rounded-none lg:shadow-none lg:border-none overflow-hidden">
      <div className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 lg:pt-4 border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">Terms & Conditions</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto pb-24 text-sm text-gray-600 leading-relaxed">
        <p className="font-bold text-gray-900">Last Updated: June 2026</p>
        <p>Welcome to DryFruit Hub. By using our application, you agree to comply with and be bound by the following terms and conditions of use.</p>

        <h2 className="text-lg font-bold text-gray-900 mt-6">1. Usage License</h2>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on DryFruit Hub's app for personal, non-commercial transitory viewing only.</p>

        <h2 className="text-lg font-bold text-gray-900 mt-6">2. Disclaimer</h2>
        <p>The materials on DryFruit Hub's app are provided on an 'as is' basis. DryFruit Hub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

        <h2 className="text-lg font-bold text-gray-900 mt-6">3. Limitations</h2>
        <p>In no event shall DryFruit Hub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DryFruit Hub's app.</p>

        <h2 className="text-lg font-bold text-gray-900 mt-6">4. Governing Law</h2>
        <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
      </div>
    </div>
  );
}

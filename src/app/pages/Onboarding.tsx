import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Leaf, Truck, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { IMAGE_BASE_URL } from '../services/api';

const slides = [
  {
    title: "Premium Dry Fruits",
    description: "Explore our finest collection of organic dry fruits and nuts, handpicked for quality.",
    icon: Leaf,
    color: "bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400"
  },
  {
    title: "Fresh & Fast Delivery",
    description: "Get your orders delivered to your doorstep at lightning speed, keeping them fresh.",
    icon: Truck,
    color: "bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400"
  },
  {
    title: "Healthy & Delicious",
    description: "100% natural, no preservatives. Pure nutrition and taste in every bite.",
    icon: Sparkles,
    color: "bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400"
  }
];

export function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      navigate('/login');
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const SlideIcon = slides[currentSlide].icon;

  return (
    <div className="w-full min-h-screen lg:min-h-[75vh] flex items-stretch lg:items-center justify-center bg-white dark:bg-background lg:bg-transparent transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-surface-secondary lg:rounded-3xl lg:shadow-2xl lg:border lg:border-border-medium/60 overflow-hidden transition-all duration-300 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-full lg:min-h-[600px]">
          
          {/* Left panel - Visual Showcase (desktop only) */}
          <div className={cn(
            "hidden lg:flex lg:col-span-5 p-12 flex-col justify-between relative overflow-hidden text-white transition-all duration-500",
            currentSlide === 0 && "from-amber-600 via-amber-800 to-amber-950 bg-gradient-to-br",
            currentSlide === 1 && "from-emerald-600 via-emerald-800 to-emerald-950 bg-gradient-to-br",
            currentSlide === 2 && "from-rose-600 via-rose-800 to-rose-950 bg-gradient-to-br"
          )}>
            {/* Background decorative patterns */}
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                <span className="font-black tracking-tight text-xl">DryFruit Hub</span>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl font-black mb-4 leading-tight">{slides[currentSlide].title}</h2>
                  <p className="text-white/80 text-sm leading-relaxed font-medium">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="relative z-10 flex justify-center py-6">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ duration: 0.3 }}
                  src={`${IMAGE_BASE_URL}${
                    currentSlide === 0 ? '/images/promo/mixed_nuts.png' :
                    currentSlide === 1 ? '/images/promo/gift_box.png' :
                    '/images/promo/healthy_lifestyle.png'
                  }`}
                  alt="Onboarding Showcase" 
                  className="w-56 h-56 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-float"
                />
              </AnimatePresence>
            </div>
            
            <div className="relative z-10">
              <div className="flex gap-1 mb-2">
                <span className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", currentSlide === 0 ? "w-4 bg-white" : "bg-white/40")}></span>
                <span className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", currentSlide === 1 ? "w-4 bg-white" : "bg-white/40")}></span>
                <span className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", currentSlide === 2 ? "w-4 bg-white" : "bg-white/40")}></span>
              </div>
              <p className="text-[10px] text-white/50 tracking-wider uppercase font-bold">Premium Quality Guaranteed</p>
            </div>
          </div>

          {/* Right panel - Content (always visible) */}
          <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 pt-safe pb-safe sm:p-10 lg:p-12 bg-white dark:bg-surface-secondary">
            <div className="flex justify-end">
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-500 dark:text-text-secondary font-medium text-sm py-2 px-4 rounded-full hover:bg-gray-50 dark:hover:bg-surface-tertiary transition-colors cursor-pointer"
              >
                Skip
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative my-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center w-full"
                >
                  <div className={cn("w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center mb-8", slides[currentSlide].color)}>
                    <SlideIcon size={80} strokeWidth={1} />
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-text-primary mb-3 tracking-tight">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-gray-500 dark:text-text-secondary text-sm sm:text-base leading-relaxed px-2">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-border-light">
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300",
                      idx === currentSlide ? "w-8 bg-blue-600" : "w-2.5 bg-gray-200 dark:bg-border-medium"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="bg-blue-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors active:scale-95 cursor-pointer"
              >
                <ArrowRight size={22} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Leaf, Truck, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

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
    <div className="flex flex-col h-full min-h-[100vh] bg-white dark:bg-background pt-12 pb-8 px-6 transition-colors duration-300">
      <div className="flex justify-end">
        <button 
          onClick={() => navigate('/login')}
          className="text-gray-500 dark:text-text-secondary font-medium text-sm py-2 px-4 rounded-full hover:bg-gray-50 dark:hover:bg-surface-tertiary transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className={cn("w-64 h-64 rounded-full flex items-center justify-center mb-12", slides[currentSlide].color)}>
              <SlideIcon size={100} strokeWidth={1} />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-text-primary mb-4 tracking-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-gray-500 dark:text-text-secondary text-base leading-relaxed px-4">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-auto pt-8">
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
          className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors active:scale-95"
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}

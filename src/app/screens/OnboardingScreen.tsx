import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";

const onboardingData = [
  {
    title: "Discover Premium Products",
    description: "Explore a vast collection of premium brands and exclusive items curated just for you.",
    image: "https://images.unsplash.com/photo-1590131222139-91ba5992e4ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB3b21hbnxlbnwxfHx8fDE3ODAzOTExNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    title: "Fast & Secure Delivery",
    description: "Get your favorite items delivered right to your doorstep with our lightning-fast shipping.",
    image: "https://images.unsplash.com/photo-1656543802898-41c8c46683a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBkZWxpdmVyeSUyMGJveHxlbnwxfHx8fDE3ODA0NzMwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    title: "Secure Payments",
    description: "Experience hassle-free and 100% secure payments with multiple convenient options.",
    image: "https://images.unsplash.com/photo-1539278383962-a7774385fa02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBiYW5uZXIlMjBmYXNoaW9ufGVufDF8fHx8MTc4MDQ3MzAzOHww&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const nextStep = () => {
    if (step < onboardingData.length - 1) setStep(step + 1);
    else navigate("/auth/login");
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-surface h-full relative transition-colors duration-300">
      <div className="absolute top-12 right-6 z-10">
        <button 
          onClick={() => navigate("/auth/login")}
          className="text-gray-500 dark:text-text-secondary font-medium text-sm hover:text-gray-800"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-end relative pb-10">
        <div className="absolute inset-0 h-[60%] rounded-b-[40px] overflow-hidden bg-gray-100">
          <AnimatePresence mode="wait">
            <motion.img
              key={step}
              src={onboardingData[step].image}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover"
              alt="Onboarding"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="bg-white dark:bg-surface rounded-t-[40px] pt-10 px-8 pb-8 relative z-10 -mt-10 flex flex-col items-center text-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex space-x-2 mb-8">
            {onboardingData.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-blue-600" : "w-2 bg-gray-200 dark:bg-border-medium"}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-32 flex flex-col items-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-3">{onboardingData[step].title}</h2>
              <p className="text-gray-500 dark:text-text-secondary leading-relaxed text-sm">{onboardingData[step].description}</p>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={nextStep}
            className="w-full mt-8 bg-blue-600 text-white rounded-2xl py-4 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-transform"
          >
            <span>{step === onboardingData.length - 1 ? "Get Started" : "Continue"}</span>
            {step < onboardingData.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

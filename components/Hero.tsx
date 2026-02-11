import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/30 rounded-full blur-[128px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[128px] -z-10" />

      <div className="container mx-auto px-6 text-center z-10">
        
        <h1 className="text-5xl md:text-8xl font-serif italic mb-6 leading-tight">
          Smart AI <br />
          <span className="not-italic gradient-text">for Finance</span>
        </h1>

        <p className="max-w-xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
          Your intelligent partner on the path to financial growth. Track, save, and invest with the power of generative AI.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStart}
            className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:scale-105 transition-transform flex items-center gap-2"
          >
            Start Budgeting <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Image / Visual */}
      <div className="mt-20 relative w-full max-w-5xl mx-auto px-4">
        <div className="aspect-[16/9] rounded-2xl overflow-hidden glass-card relative group">
             {/* Simulating a video cover or dashboard preview */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent opacity-60 z-10"></div>
             <img 
                src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1920&auto=format&fit=crop" 
                alt="Smart Budgeting and Savings" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
             />
             <div className="absolute bottom-8 left-8 z-20 text-left">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <span className="text-xl">🤖</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">BudgetBuddy</p>
                        <p className="font-medium">"How can I optimize my subscription costs?"</p>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
import React from 'react';
import { Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="glass-card rounded-3xl p-8 md:p-16 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
            
            <div className="space-y-8 flex flex-col items-center">
                <Quote className="w-12 h-12 text-finora-purple opacity-50" />
                <h3 className="text-3xl md:text-5xl font-serif italic leading-snug">
                    "BudgetBuddy AI has transformed my financial journey! With their expert guidance, I've seen my savings grow exponentially."
                </h3>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
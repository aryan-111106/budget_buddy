import React from 'react';
import { X, Info } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-white/10 w-full max-w-lg p-8 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 text-purple-400">
                <Info className="w-6 h-6" />
            </div>
            
            <h2 className="text-3xl font-serif italic font-bold mb-4 text-white">
                {title}
            </h2>
            
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"></div>

            <p className="text-gray-300 leading-relaxed text-lg">
                {description}
            </p>

            <button 
                onClick={onClose}
                className="mt-8 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm text-gray-400 hover:text-white"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
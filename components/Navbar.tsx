import React, { useRef, useEffect } from 'react';
import { ViewState } from '../types';
import { Sparkles, Home, LogIn } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLoginClick: () => void;
  onMenuClick: (item: string) => void;
  onProfileClick: () => void;
  userName?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
    currentView, 
    setView, 
    onLoginClick, 
    onMenuClick, 
    onProfileClick, 
    userName,
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass-card border-b-0 border-l-0 border-r-0 rounded-b-xl">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setView(ViewState.LANDING)}
      >
        <Sparkles className="w-6 h-6 text-finora-purple" />
        <span className="text-2xl font-serif italic font-bold tracking-tight">BudgetBuddy</span>
      </div>

      {/* Centered Menu Links - Visible on Landing View */}
      {currentView === ViewState.LANDING && (
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {['About Us', 'Personal', 'Business', 'Resources'].map((item) => (
            <a 
              key={item} 
              href="#" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onMenuClick(item);
              }}
            >
              {item}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        {currentView === ViewState.LANDING ? (
          <button 
            onClick={onLoginClick}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors text-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            <LogIn className="w-4 h-4" />
            Log In
          </button>
        ) : (
          <div className="flex items-center gap-4">
             {/* User Profile */}
            <div 
                onClick={onProfileClick}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer group"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-inner">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors hidden sm:block">
                    {userName || 'Guest User'}
                </span>
            </div>

            <button 
                onClick={() => setView(ViewState.LANDING)}
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
            >
                <Home className="w-4 h-4" />
                Home
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
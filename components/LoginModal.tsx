import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Loader2, User, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { User as UserType } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay for realism
    setTimeout(() => {
        try {
            let user: UserType;
            if (isSignUp) {
                user = StorageService.register(name, email, password);
            } else {
                user = StorageService.login(email, password);
            }
            onLogin(user);
            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setLoading(false);
        } catch (err: any) {
            setLoading(false);
            setError(err.message || 'An error occurred');
        }
    }, 1000);
  };

  const toggleMode = () => {
      setIsSignUp(!isSignUp);
      setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-white/10 w-full max-w-md p-8 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
            <h2 className="text-2xl font-serif italic font-bold mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 text-sm">
                {isSignUp ? 'Join us to master your financial future' : 'Sign in to access your financial dashboard'}
            </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <label className="text-xs font-medium text-gray-400 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            required={isSignUp}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-600"
                            placeholder="John Doe"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-600"
                        placeholder="you@company.com"
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-medium text-gray-400">Password</label>
                    {!isSignUp && <a href="#" className="text-xs text-purple-400 hover:text-purple-300">Forgot?</a>}
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-600"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-semibold rounded-xl py-3 mt-6 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        {isSignUp ? 'Create Account' : 'Sign In'} 
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"} 
            <span 
                onClick={toggleMode}
                className="text-white cursor-pointer hover:underline ml-1 font-medium"
            >
                {isSignUp ? 'Sign In' : 'Create one'}
            </span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import InfoModal from './components/InfoModal';
import UserProfileModal from './components/UserProfileModal';
import { ViewState, User } from './types';
import { StorageService } from './services/storage';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Info Modal State
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; description: string }>({
    isOpen: false,
    title: '',
    description: ''
  });

  const contentMap: Record<string, string> = {
    'About Us': "BudgetBuddy is your intelligent financial companion. We combine cutting-edge AI technology with proven financial strategies to help individuals and businesses achieve their monetary goals. Our mission is to make financial literacy and management accessible to everyone.",
    'Personal': "Take control of your personal finances with AI-driven budgeting, expense tracking, and savings goals. Whether you're saving for a vacation, a home, or retirement, BudgetBuddy provides the insights you need to stay on track.",
    'Business': "Empower your business with enterprise-grade financial tools. From cash flow analysis and automated expense categorization to predictive forecasting, we help businesses of all sizes optimize their operations and maximize profitability.",
    'Resources': "Explore our curated library of financial guides, articles, and tutorials. Stay informed about market trends, learn budgeting best practices, and get tips from financial experts to make smarter money moves."
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProfileOpen(false);
    setCurrentView(ViewState.LANDING);
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    try {
      const updatedUser = StorageService.updateUser(currentUser.id, updates);
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleMenuClick = (item: string) => {
    const description = contentMap[item] || "Information coming soon.";
    setInfoModal({
        isOpen: true,
        title: item,
        description: description
    });
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-purple-500/30">
      <Navbar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLoginClick={() => setIsLoginOpen(true)}
        onMenuClick={handleMenuClick}
        onProfileClick={() => setIsProfileOpen(true)}
        userName={currentUser?.name}
      />
      
      {currentView === ViewState.LANDING ? (
        <>
          <Hero onStart={() => {
              if (currentUser) {
                  setCurrentView(ViewState.DASHBOARD);
              } else {
                  setIsLoginOpen(true);
              }
          }} />
          <Features />
          <Stats />
          <Testimonials />
          <Footer />
        </>
      ) : (
        // Pass the user ID to dashboard for data persistence
        <Dashboard userId={currentUser?.id || 'guest'} />
      )}
      
      <ChatBot />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin}
      />
      <InfoModal 
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
        title={infoModal.title}
        description={infoModal.description}
      />
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}

export default App;
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050507] pt-20 pb-10 px-6 border-t border-white/5">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif italic font-bold">BudgetBuddy</h2>
            <div className="p-4 border border-white/10 rounded-xl max-w-xs">
                <p className="text-xs text-gray-400 mb-2">End-to-end encrypted</p>
                <p className="text-xs text-gray-500">Your data, your decisions.</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Careers</li>
                <li className="hover:text-white cursor-pointer">FAQ</li>
                <li className="hover:text-white cursor-pointer">Get in touch</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white cursor-pointer">AI Budgeting Tools</li>
                <li className="hover:text-white cursor-pointer">Automated Invoicing</li>
                <li className="hover:text-white cursor-pointer">Real-time Analytics</li>
                <li className="hover:text-white cursor-pointer">Fraud Protection</li>
            </ul>
          </div>

          <div className="space-y-4">
             <h4 className="font-serif italic text-2xl">Subscribe to <br/> our newsletter</h4>
             <div className="flex gap-2">
                <input 
                    type="email" 
                    placeholder="Write your email here" 
                    className="bg-transparent border-b border-white/20 pb-2 text-sm focus:outline-none focus:border-white w-full placeholder-gray-600"
                />
                <button className="text-sm px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200">
                    Subscribe
                </button>
             </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 pt-8 border-t border-white/5">
            <p>© 2026 Tech Titans. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
                <span>Instagram</span>
                <span>LinkedIn</span>
                <span>Facebook</span>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
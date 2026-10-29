import React, { useState } from 'react';
import { 
  Globe, 
  Tv, 
  UserCheck, 
  Shield, 
  Search, 
  LogOut, 
  LogIn, 
  Printer, 
  Clock,
  Sparkles
} from 'lucide-react';
import { usePrintStore } from '../context/PrintStoreContext';
import { Logo } from './Logo';

interface HeaderProps {
  onSearchCatalog?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchCatalog }) => {
  const { 
    activePortal, 
    setActivePortal, 
    currentUser, 
    loginUser, 
    logoutUser,
    orders 
  } = usePrintStore();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('staff');
  const [passwordInput, setPasswordInput] = useState('staff123');
  const [searchVal, setSearchVal] = useState('');

  const activeQueueCount = orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING').length;
  const readyPickupCount = orders.filter(o => o.orderStatus === 'READY').length;

  const handlePortalSwitch = (portal: 'customer' | 'tv' | 'staff' | 'admin') => {
    if ((portal === 'staff' || portal === 'admin') && !currentUser) {
      setUsernameInput(portal === 'admin' ? 'admin' : 'staff');
      setPasswordInput(portal === 'admin' ? 'admin123' : 'staff123');
      setShowLoginModal(true);
      return;
    }
    setActivePortal(portal);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginUser(usernameInput);
    if (ok) {
      setShowLoginModal(false);
      setActivePortal(usernameInput.toLowerCase() === 'admin' ? 'admin' : 'staff');
    } else {
      alert('Invalid username or account inactive. Try demo: "staff" or "admin"');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchVal(q);
    if (onSearchCatalog) {
      onSearchCatalog(q);
    }
  };

  return (
    <>
      {/* Top Banner Ribbon */}
      <div className="bg-[#242B33] text-white text-[11px] font-medium py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#FF9F00] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9F00]" /> Student Plaza Commercial Complex
            </span>
            <span className="text-white/40 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden md:inline">Open Mon–Sat 8:00 AM – 7:00 PM</span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1.5 text-white/80">
              <span className="w-2 h-2 rounded-full bg-[#309898] animate-ping inline-block"></span>
              Live Queue Load: <b className="text-[#FF9F00]">{activeQueueCount}</b>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              Ready for Handover: <b>{readyPickupCount}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-16 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
            
            {/* Brand Logo */}
            <Logo 
              size="md" 
              onClick={() => setActivePortal('customer')} 
              className="py-1"
            />

            {/* Quick Search */}
            <div className="hidden lg:flex flex-1 max-w-sm items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#309898] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#309898]/20 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchVal}
                onChange={handleSearchChange}
                placeholder="Search printing services & materials..." 
                className="w-full text-xs text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
              />
              {searchVal && (
                <button 
                  onClick={() => { setSearchVal(''); onSearchCatalog?.(''); }} 
                  className="text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Portal Switcher Buttons */}
            <nav className="flex items-center gap-1.5">
              {/* Customer Shop */}
              <button
                type="button"
                onClick={() => handlePortalSwitch('customer')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  activePortal === 'customer'
                    ? 'bg-[#F4631E] text-white shadow-sm ring-2 ring-[#F4631E]/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Shop</span>
              </button>

              {/* Lobby TV Display */}
              <button
                type="button"
                onClick={() => handlePortalSwitch('tv')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  activePortal === 'tv'
                    ? 'bg-[#242B33] text-white shadow-sm ring-2 ring-[#242B33]/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Lobby Queue Monitoring Display"
              >
                <Tv className="w-3.5 h-3.5 text-[#309898]" />
                <span className="hidden sm:inline">TV Lobby</span>
              </button>

              {/* Staff Console */}
              <button
                type="button"
                onClick={() => handlePortalSwitch('staff')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  activePortal === 'staff'
                    ? 'bg-[#309898] text-white shadow-sm ring-2 ring-[#309898]/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Staff POS</span>
              </button>

              {/* Admin Hub */}
              <button
                type="button"
                onClick={() => handlePortalSwitch('admin')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  activePortal === 'admin'
                    ? 'bg-[#CB0404] text-white shadow-sm ring-2 ring-[#CB0404]/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </nav>

            {/* Auth status & Quick Login */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#309898]/10 text-[#309898] font-bold">
                      {currentUser.role}
                    </span>
                  </div>
                  <button
                    onClick={logoutUser}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-[#309898] text-[#309898] hover:bg-[#309898]/10 flex items-center gap-1 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log in</span>
                </button>
              )}
            </div>

          </div>

          {/* Quick Sub-navigation anchor links for Customer Portal */}
          {activePortal === 'customer' && (
            <div className="hidden sm:flex items-center gap-6 border-t border-slate-100 py-2.5 text-xs font-medium text-slate-600">
              <a href="#catalog-section" className="hover:text-[#F4631E] flex items-center gap-1">
                <span>Browse Services</span>
              </a>
              <a href="#tracker-section" className="hover:text-[#F4631E] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#309898]" />
                <span>Track My Order & Queue</span>
              </a>
              <a href="#order-form-section" className="hover:text-[#F4631E] flex items-center gap-1">
                <Printer className="w-3.5 h-3.5 text-[#F4631E]" />
                <span>Place New Print Order</span>
              </a>
              <span className="ml-auto text-[11px] text-slate-400">
                Express Student Printing • Ground Floor Student Plaza
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Staff / Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#309898] text-white flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Console Authentication</h3>
                  <p className="text-[11px] text-slate-500">Sign in to access Staff POS or Admin Hub</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. staff or admin"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#309898]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#309898]"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1 font-mono">
                <span className="font-sans font-bold text-slate-700 block">Team Accounts:</span>
                <div>• Admin: <span className="text-[#CB0404] font-bold">benitez</span> (or admin)</div>
                <div>• Staff: <span className="text-[#309898] font-bold">bonda</span>, <span className="text-[#309898] font-bold">cometa</span>, <span className="text-[#309898] font-bold">laserna</span>, <span className="text-[#309898] font-bold">porosa</span></div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F4631E] hover:bg-[#E64A19] text-white font-bold shadow-sm transition-all"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

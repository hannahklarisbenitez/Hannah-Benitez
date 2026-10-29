import React, { useState } from 'react';
import { PrintStoreProvider, usePrintStore } from './context/PrintStoreContext';
import { Header } from './components/Header';
import { CustomerShop } from './components/CustomerShop';
import { TVLobbyDisplay } from './components/TVLobbyDisplay';
import { StaffConsole } from './components/StaffConsole';
import { AdminConsole } from './components/AdminConsole';
import { PrintTicketModal } from './components/PrintTicketModal';
import { Logo } from './components/Logo';
import { Order } from './types';

const MainLayout: React.FC = () => {
  const { activePortal, setActivePortal } = usePrintStore();
  const [ticketToPrint, setTicketToPrint] = useState<Order | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#222831]">
      
      {/* Top Header Navigation */}
      <Header 
        onSearchCatalog={(q) => {
          setCatalogSearch(q);
          if (activePortal !== 'customer') {
            setActivePortal('customer');
          }
        }}
      />

      {/* Main Dynamic Portal View */}
      <main className="flex-grow">
        {activePortal === 'customer' && (
          <CustomerShop 
            externalSearch={catalogSearch}
            onPrintTicket={(order) => setTicketToPrint(order)}
          />
        )}

        {activePortal === 'tv' && (
          <TVLobbyDisplay />
        )}

        {activePortal === 'staff' && (
          <StaffConsole 
            onPrintTicket={(order) => setTicketToPrint(order)}
          />
        )}

        {activePortal === 'admin' && (
          <AdminConsole />
        )}
      </main>

      {/* Global Footer (shown on all portals except TV Lobby) */}
      {activePortal !== 'tv' && (
        <footer className="bg-[#242B33] text-white/70 text-xs py-10 border-t border-white/10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
              <Logo size="md" variant="dark" />

              <div className="flex items-center gap-4 text-xs font-medium">
                <button 
                  onClick={() => setActivePortal('customer')} 
                  className="hover:text-white transition-colors"
                >
                  Shop Catalog
                </button>
                <span>•</span>
                <button 
                  onClick={() => setActivePortal('tv')} 
                  className="hover:text-[#FF9F00] transition-colors"
                >
                  Lobby TV Display
                </button>
                <span>•</span>
                <button 
                  onClick={() => setActivePortal('staff')} 
                  className="hover:text-[#309898] transition-colors"
                >
                  Staff POS
                </button>
                <span>•</span>
                <button 
                  onClick={() => setActivePortal('admin')} 
                  className="hover:text-[#CB0404] transition-colors"
                >
                  Admin Hub
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
              <p>
                © 2026 Quick Print Hub • For quick & easy life • Printing Shop Queue & Order Management System.
              </p>
              <p className="text-slate-300">
                Ground Floor, Student Plaza Commercial Complex
              </p>
            </div>

          </div>
        </footer>
      )}

      {/* Printable Thermal Claim Ticket Modal */}
      <PrintTicketModal 
        order={ticketToPrint}
        onClose={() => setTicketToPrint(null)}
      />

    </div>
  );
};

export default function App() {
  return (
    <PrintStoreProvider>
      <MainLayout />
    </PrintStoreProvider>
  );
}

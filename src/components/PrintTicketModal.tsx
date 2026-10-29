import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';

interface PrintTicketModalProps {
  order: Order | null;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Area with Perforated Receipt Look */}
        <div id="printable-slip-area" className="ticket-paper p-5 bg-white border border-slate-200 text-center font-mono">
          
          <div className="border-b border-dashed border-slate-300 pb-3 mb-3">
            <div className="flex justify-center mb-2">
              <img src="/assets/aistudio/LOGO_b09fcfb6.jpg" alt="Quick Print hub" className="w-12 h-12 object-contain rounded-lg border border-slate-200" />
            </div>
            <h2 className="text-base font-black font-sans text-slate-900">Quick Print Hub</h2>
            <p className="text-[10px] text-[#0A11A0] font-sans font-medium">
              For quick & easy life
            </p>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              Student Plaza Commercial Complex, Ground Floor
            </p>
            <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
              Tel: (02) 8123-4567 • Mon-Sat 8AM-7PM
            </span>
          </div>

          <div className="text-left text-xs space-y-1 text-slate-700 py-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Date/Time:</span>
              <span>{order.createdAt.substring(0, 16).replace('T', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tracking Code:</span>
              <span className="font-bold text-[#309898]">{order.trackingCode}</span>
            </div>
          </div>

          {/* Huge Queue Number Box */}
          <div className="my-3 py-3 border-y-2 border-slate-900 bg-slate-50">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-slate-500 block">
              YOUR QUEUE NUMBER
            </span>
            <div className="text-5xl font-black text-[#F4631E] tracking-wider my-1">
              {order.queueNumber}
            </div>
            <span className="text-[10px] font-sans font-bold text-slate-600">
              PLEASE WAIT FOR NUMBER TO BE CALLED
            </span>
          </div>

          {/* Order Details */}
          <div className="text-left text-xs space-y-1 text-slate-600 py-1 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Customer:</span>
              <span className="font-bold text-slate-800">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Service:</span>
              <span className="text-slate-800">{order.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Specs:</span>
              <span>{order.pageCount} pgs × {order.copiesCount} set ({order.paperSize.toUpperCase()})</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="text-[#F4631E]">₱{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Payment Status:</span>
              <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-[#CB0404]'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Barcode Strip */}
          <div className="mt-3">
            <div className="barcode-stripes"></div>
            <span className="text-[9px] text-slate-400 tracking-widest block mt-1">
              *{order.trackingCode}*
            </span>
          </div>

          <div className="mt-3 text-[10px] font-sans text-slate-400 leading-tight">
            Please retain this slip to claim your printed copies at Counter 1.
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-[#242B33] hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Slip</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

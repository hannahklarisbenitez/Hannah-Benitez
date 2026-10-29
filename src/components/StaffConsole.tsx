import React, { useState, useMemo } from 'react';
import { 
  List, 
  PlusCircle, 
  CreditCard, 
  CheckCircle2, 
  Archive, 
  Search, 
  Printer, 
  ArrowRight, 
  AlertCircle,
  FileText,
  User,
  Clock,
  DollarSign
} from 'lucide-react';
import { usePrintStore } from '../context/PrintStoreContext';
import { Order, OrderStatus } from '../types';

interface StaffConsoleProps {
  onPrintTicket: (order: Order) => void;
}

export const StaffConsole: React.FC<StaffConsoleProps> = ({ onPrintTicket }) => {
  const { 
    orders, 
    services, 
    currentUser, 
    placeOrder, 
    updateOrderStatus, 
    recordPayment, 
    releaseOrder,
    calculatePrice 
  } = usePrintStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'new-order' | 'cashier' | 'release' | 'records'>('queue');
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'READY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Modal State
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('Cash');
  const [payRef, setPayRef] = useState<string>('');

  // Walk-in POS Form State
  const [walkinName, setWalkinName] = useState('');
  const [walkinContact, setWalkinContact] = useState('');
  const [walkinServiceId, setWalkinServiceId] = useState(services[0]?.id || '');
  const [walkinSize, setWalkinSize] = useState<'short' | 'a4' | 'long' | 'a3'>('a4');
  const [walkinType, setWalkinType] = useState<'regular70' | 'book80' | 'glossyPhoto' | 'matteCardstock' | 'stickerVinyl'>('regular70');
  const [walkinSide, setWalkinSide] = useState<'single' | 'double'>('single');
  const [walkinPages, setWalkinPages] = useState<number>(1);
  const [walkinCopies, setWalkinCopies] = useState<number>(1);
  const [walkinBinding, setWalkinBinding] = useState<'none' | 'staple' | 'ring' | 'soft' | 'hard' | 'laminate'>('none');
  const [walkinDeposit, setWalkinDeposit] = useState<number>(0);
  const [walkinDepositMethod, setWalkinDepositMethod] = useState('Cash');
  const [walkinFileName, setWalkinFileName] = useState('');
  const [walkinNotes, setWalkinNotes] = useState('');

  // Computed total for POS
  const posComputation = useMemo(() => {
    return calculatePrice({
      serviceId: walkinServiceId,
      paperSize: walkinSize,
      paperType: walkinType,
      printSide: walkinSide,
      pageCount: walkinPages,
      copiesCount: walkinCopies,
      binding: walkinBinding
    });
  }, [calculatePrice, walkinServiceId, walkinSize, walkinType, walkinSide, walkinPages, walkinCopies, walkinBinding]);

  // KPIs
  const totalOrdersToday = orders.length;
  const pendingCount = orders.filter(o => o.orderStatus === 'PENDING').length;
  const processingCount = orders.filter(o => o.orderStatus === 'PROCESSING').length;
  const readyCount = orders.filter(o => o.orderStatus === 'READY').length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.amountPaid || 0), 0);

  // Filtered queue
  const filteredQueueOrders = useMemo(() => {
    return orders.filter(o => {
      if (queueFilter === 'PENDING' && o.orderStatus !== 'PENDING') return false;
      if (queueFilter === 'PROCESSING' && o.orderStatus !== 'PROCESSING') return false;
      if (queueFilter === 'READY' && o.orderStatus !== 'READY') return false;
      if (queueFilter === 'ALL' && o.orderStatus === 'COMPLETED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return o.queueNumber.toLowerCase().includes(q) ||
          o.trackingCode.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.serviceName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [orders, queueFilter, searchQuery]);

  const unpaidOrders = useMemo(() => {
    return orders.filter(o => o.paymentStatus !== 'PAID');
  }, [orders]);

  const readyToReleaseOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'READY');
  }, [orders]);

  const handleCreateWalkinOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinContact.trim()) {
      alert('Please fill out customer name and contact.');
      return;
    }

    const srv = services.find(s => s.id === walkinServiceId) || services[0];
    const total = posComputation.totalAmount;
    const depositNum = Math.min(total, Number(walkinDeposit) || 0);

    const newOrd = placeOrder({
      customerName: walkinName,
      contactNumber: walkinContact,
      serviceId: srv.id,
      serviceName: srv.name,
      paperSize: walkinSize,
      paperType: walkinType,
      printSide: walkinSide,
      pageCount: walkinPages,
      copiesCount: walkinCopies,
      binding: walkinBinding,
      specialInstructions: walkinNotes,
      fileName: walkinFileName || `${srv.name}_POS.pdf`,
      subtotal: total,
      totalAmount: total,
      amountPaid: depositNum,
      paymentStatus: depositNum >= total ? 'PAID' : (depositNum > 0 ? 'PARTIAL' : 'UNPAID'),
      paymentMethod: walkinDepositMethod,
      cashierName: currentUser?.fullName || 'POS Counter'
    });

    alert(`Order ${newOrd.queueNumber} assigned successfully!`);
    onPrintTicket(newOrd);

    // Reset POS form
    setWalkinName('');
    setWalkinContact('');
    setWalkinDeposit(0);
    setWalkinFileName('');
    setWalkinNotes('');
    setActiveTab('queue');
  };

  const handleOpenPayment = (order: Order) => {
    setPayingOrder(order);
    const balance = Math.max(0, order.totalAmount - order.amountPaid);
    setPayAmount(balance);
    setPayMethod('Cash');
    setPayRef('');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingOrder) return;
    const amt = Number(payAmount) || 0;
    if (amt <= 0) {
      alert('Enter a valid payment amount.');
      return;
    }
    recordPayment(payingOrder.id, amt, payMethod, payRef, currentUser?.fullName);
    setPayingOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Staff Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#309898]/15 text-[#309898] font-bold text-xs uppercase tracking-wide">
              STAFF POS CONSOLE
            </span>
            <span className="text-xs text-slate-400">• Flowchart Operations & Counter 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Order & Queue Management Console
          </h1>
        </div>

        {/* Sub-Nav Flowchart Modules */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'queue', label: 'Queue List', icon: List },
            { id: 'new-order', label: 'Create POS Order', icon: PlusCircle },
            { id: 'cashier', label: 'Cashiering', icon: CreditCard, badge: unpaidOrders.length },
            { id: 'release', label: 'Release Order', icon: CheckCircle2, badge: readyToReleaseOrders.length },
            { id: 'records', label: 'All Records', icon: Archive }
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  isCurrent
                    ? 'bg-[#309898] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isCurrent ? 'bg-white/30 text-white' : 'bg-red-100 text-[#CB0404]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-400 font-bold block uppercase">Today's Orders</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalOrdersToday}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#FF9F00]/30 bg-[#FF9F00]/5 shadow-sm">
          <span className="text-[11px] text-amber-700 font-bold block uppercase">In Queue (Pending)</span>
          <span className="text-2xl font-black text-[#FF9F00] mt-1 block">{pendingCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#309898]/30 bg-[#309898]/5 shadow-sm">
          <span className="text-[11px] text-[#309898] font-bold block uppercase">Now Printing</span>
          <span className="text-2xl font-black text-[#309898] mt-1 block">{processingCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <span className="text-[11px] text-emerald-700 font-bold block uppercase">Ready for Pickup</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{readyCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#F4631E]/30 bg-[#F4631E]/5 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] text-[#F4631E] font-bold block uppercase">Counter Revenue</span>
          <span className="text-2xl font-black font-mono text-[#F4631E] mt-1 block">
            ₱{totalRevenue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ==============================================================
           TAB 1: QUEUE LIST & STATUS CONTROLS
           ============================================================== */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['ALL', 'PENDING', 'PROCESSING', 'READY'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setQueueFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    queueFilter === filter
                      ? 'bg-[#309898] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queue #, customer name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#309898]"
              />
            </div>
          </div>

          {/* Queue Management Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Queue #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Service & Specs</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Advance Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueueOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No orders matching this queue filter.
                      </td>
                    </tr>
                  ) : (
                    filteredQueueOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-base text-[#F4631E]">
                          {order.queueNumber}
                          <span className="block text-[10px] text-slate-400 font-sans">{order.trackingCode}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">{order.customerName}</span>
                          <span className="text-[11px] text-slate-500">{order.contactNumber}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700 block">{order.serviceName}</span>
                          <span className="text-[11px] text-slate-500">
                            {order.pageCount} pgs × {order.copiesCount} copy • {order.paperSize.toUpperCase()} ({order.binding})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            order.orderStatus === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                            order.orderStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            order.orderStatus === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                            'bg-[#FF9F00]/20 text-amber-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-slate-800 block">₱{order.totalAmount.toFixed(2)}</span>
                          <span className={`text-[10px] font-bold ${
                            order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-[#CB0404]'
                          }`}>
                            {order.paymentStatus} (Bal: ₱{(order.totalAmount - order.amountPaid).toFixed(2)})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {order.orderStatus === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'PROCESSING', currentUser?.fullName)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                              >
                                <span>Start Print</span>
                              </button>
                            )}

                            {order.orderStatus === 'PROCESSING' && (
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id, 'READY', currentUser?.fullName)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                              >
                                <span>Mark Ready</span>
                              </button>
                            )}

                            {order.orderStatus === 'READY' && (
                              <button
                                type="button"
                                onClick={() => releaseOrder(order.id, currentUser?.fullName)}
                                className="px-3 py-1.5 rounded-lg bg-[#242B33] hover:bg-black text-white font-bold text-xs shadow-sm"
                              >
                                Release
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onPrintTicket(order)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                              title="Print ticket"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
           TAB 2: CREATE WALK-IN / POS ORDER
           ============================================================== */}
      {activeTab === 'new-order' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Point-of-Sale: Walk-in / Phone Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter customer specifications to calculate charges and assign the next sequential Queue Number.
            </p>
          </div>

          <form onSubmit={handleCreateWalkinOrder} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input 
                  type="text" 
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Number *</label>
                <input 
                  type="text" 
                  value={walkinContact}
                  onChange={(e) => setWalkinContact(e.target.value)}
                  placeholder="09XX-XXX-XXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Service Type *</label>
              <select 
                value={walkinServiceId}
                onChange={(e) => setWalkinServiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (₱{s.basePrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Size</label>
                <select 
                  value={walkinSize} 
                  onChange={(e) => setWalkinSize(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="short">Short</option>
                  <option value="a4">A4</option>
                  <option value="long">Long</option>
                  <option value="a3">A3</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paper Type</label>
                <select 
                  value={walkinType} 
                  onChange={(e) => setWalkinType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="regular70">70gsm Copier</option>
                  <option value="book80">80gsm Book</option>
                  <option value="glossyPhoto">Glossy Photo</option>
                  <option value="matteCardstock">Cardstock</option>
                  <option value="stickerVinyl">Vinyl Sticker</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Layout</label>
                <select 
                  value={walkinSide} 
                  onChange={(e) => setWalkinSide(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="single">Single-sided</option>
                  <option value="double">Double-sided</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Binding</label>
                <select 
                  value={walkinBinding} 
                  onChange={(e) => setWalkinBinding(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="none">None</option>
                  <option value="staple">Corner Staple</option>
                  <option value="ring">Spiral Ring</option>
                  <option value="soft">Soft Bind</option>
                  <option value="hard">Hardbound Foil</option>
                  <option value="laminate">Laminate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pages</label>
                <input 
                  type="number" 
                  min="1"
                  value={walkinPages}
                  onChange={(e) => setWalkinPages(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Copies</label>
                <input 
                  type="number" 
                  min="1"
                  value={walkinCopies}
                  onChange={(e) => setWalkinCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Deposit (₱)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.50"
                  value={walkinDeposit}
                  onChange={(e) => setWalkinDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deposit Method</label>
                <select 
                  value={walkinDepositMethod}
                  onChange={(e) => setWalkinDepositMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            {/* Price Preview Banner & Submit */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Computed POS Total:</span>
                <span className="text-2xl font-black font-mono text-[#F4631E]">
                  ₱{posComputation.totalAmount.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#309898] hover:bg-[#287D7D] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save POS Order & Assign Ticket</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================================
           TAB 3: CASHIERING & PAYMENTS
           ============================================================== */}
      {activeTab === 'cashier' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Orders Awaiting Payment</h3>
            <span className="text-xs text-slate-500">{unpaidOrders.length} orders with remaining balance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaidOrders.length === 0 ? (
              <div className="col-span-3 p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                All active orders have settled payments!
              </div>
            ) : (
              unpaidOrders.map(order => (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-2xl font-black font-mono text-[#F4631E] block">
                        {order.queueNumber}
                      </span>
                      <span className="font-bold text-slate-800 text-sm block">{order.customerName}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-[#CB0404]">
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service:</span>
                      <span className="font-medium text-slate-800">{order.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total:</span>
                      <span className="font-mono">₱{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paid So Far:</span>
                      <span className="font-mono text-emerald-600">₱{order.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-[#CB0404]">
                      <span>Remaining Balance:</span>
                      <span className="font-mono">₱{(order.totalAmount - order.amountPaid).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenPayment(order)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Collect Payment</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==============================================================
           TAB 4: ORDER RELEASE & HANDOVER
           ============================================================== */}
      {activeTab === 'release' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Orders Ready for Handover</h3>
              <p className="text-xs text-slate-500">
                Flowchart enforcement: Order must be <b>Ready</b> and payment <b>Settled</b> before completing handover.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyToReleaseOrders.length === 0 ? (
              <div className="col-span-3 p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No orders are currently waiting at the pickup counter.
              </div>
            ) : (
              readyToReleaseOrders.map(order => {
                const isPaid = order.paymentStatus === 'PAID';
                return (
                  <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-2xl font-black font-mono text-emerald-600 block">
                          {order.queueNumber}
                        </span>
                        <span className="font-bold text-slate-800 text-sm block">{order.customerName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        READY
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Service:</span>
                        <span className="font-semibold">{order.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Specs:</span>
                        <span>{order.pageCount} pgs • {order.binding}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Payment Status:</span>
                        <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-[#CB0404]'}`}>
                          {order.paymentStatus} {isPaid ? '✓' : `(Bal: ₱${(order.totalAmount - order.amountPaid).toFixed(2)})`}
                        </span>
                      </div>
                    </div>

                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => releaseOrder(order.id, currentUser?.fullName)}
                        className="w-full py-2 bg-[#242B33] hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confirm Handover & Complete</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPayment(order)}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Settle Balance (₱{(order.totalAmount - order.amountPaid).toFixed(2)}) First</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==============================================================
           TAB 5: ORDER RECORDS ARCHIVE
           ============================================================== */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">Master Orders Log</span>
            <span className="text-slate-400 font-mono">Total {orders.length} transactions recorded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Queue #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Total / Balance</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#F4631E]">{order.queueNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{order.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{order.serviceName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      ₱{order.totalAmount.toFixed(2)}
                      {order.totalAmount > order.amountPaid && (
                        <span className="text-[#CB0404] ml-1 text-[10px]">
                          (Bal: ₱{(order.totalAmount - order.amountPaid).toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {order.createdAt.substring(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onPrintTicket(order)}
                        className="p-1 text-slate-500 hover:text-slate-800"
                        title="Print"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECT PAYMENT MODAL */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Cashier Settlement</h3>
              <span className="font-mono font-bold text-[#F4631E]">{payingOrder.queueNumber}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between"><span>Customer:</span><b>{payingOrder.customerName}</b></div>
              <div className="flex justify-between"><span>Total Cost:</span><span>₱{payingOrder.totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Paid So Far:</span><span className="text-emerald-600">₱{payingOrder.amountPaid.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-[#CB0404] pt-1 border-t border-slate-200">
                <span>Remaining:</span><span>₱{(payingOrder.totalAmount - payingOrder.amountPaid).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount to Pay (₱) *</label>
                <input 
                  type="number"
                  step="0.50"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-base text-[#309898]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select 
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="Visa/Mastercard">Card</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reference / Receipt Number</label>
                <input 
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Optional GCash / POS Ref #"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingOrder(null)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

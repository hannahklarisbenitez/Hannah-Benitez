import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Printer, 
  FileText, 
  Layers, 
  Star, 
  Maximize2, 
  ChevronRight, 
  Eye, 
  AlertCircle, 
  Tag, 
  SlidersHorizontal,
  Upload,
  Calendar,
  X,
  CreditCard,
  Building,
  RotateCcw
} from 'lucide-react';
import { usePrintStore } from '../context/PrintStoreContext';
import { PrintingService, ServiceCategory, Order } from '../types';
import stickersImage from '../assets/images/regenerated_image_1793250653885.jpg';
import thesisImage from '../assets/images/regenerated_image_1793252093574.jpg';

interface CustomerShopProps {
  externalSearch?: string;
  onPrintTicket: (order: Order) => void;
}

export const CustomerShop: React.FC<CustomerShopProps> = ({ externalSearch = '', onPrintTicket }) => {
  const { 
    services, 
    orders, 
    placeOrder, 
    calculatePrice, 
    selectedServiceForOrder, 
    setSelectedServiceForOrder 
  } = usePrintStore();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState(externalSearch);
  const [selectedTurnaround, setSelectedTurnaround] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-asc' | 'price-desc' | 'turnaround'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Quick View Modal
  const [quickViewService, setQuickViewService] = useState<PrintingService | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // Tracker State
  const [trackerCode, setTrackerCode] = useState('Q-101');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => orders.find(o => o.queueNumber === 'Q-101') || null);
  const [trackerError, setTrackerError] = useState<string | null>(null);

  // Order Submission Form State
  const orderFormRef = useRef<HTMLDivElement>(null);
  const [custName, setCustName] = useState('');
  const [custContact, setCustContact] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'srv-doc-thesis');
  const [paperSize, setPaperSize] = useState<'short' | 'a4' | 'long' | 'a3'>('a4');
  const [paperType, setPaperType] = useState<'regular70' | 'book80' | 'glossyPhoto' | 'matteCardstock' | 'stickerVinyl'>('regular70');
  const [printSide, setPrintSide] = useState<'single' | 'double'>('single');
  const [pageCount, setPageCount] = useState<number>(10);
  const [copiesCount, setCopiesCount] = useState<number>(1);
  const [binding, setBinding] = useState<'none' | 'staple' | 'ring' | 'soft' | 'hard' | 'laminate'>('none');
  const [instructions, setInstructions] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [simulatedFileName, setSimulatedFileName] = useState('');

  // Confirmation modal
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Synchronize when a service is selected from quick action or external click
  React.useEffect(() => {
    if (selectedServiceForOrder) {
      setSelectedServiceId(selectedServiceForOrder.id);
      orderFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedServiceForOrder]);

  // Sync external search
  React.useEffect(() => {
    if (externalSearch !== undefined) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);

  // Compute live price breakdown
  const priceComputation = useMemo(() => {
    return calculatePrice({
      serviceId: selectedServiceId,
      paperSize,
      paperType,
      printSide,
      pageCount: Number(pageCount) || 1,
      copiesCount: Number(copiesCount) || 1,
      binding
    });
  }, [calculatePrice, selectedServiceId, paperSize, paperType, printSide, pageCount, copiesCount, binding]);

  // Collect unique tags for filter pills
  const allTags = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => s.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [services]);

  // Filter & Sort Services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = service.name.toLowerCase().includes(q);
        const matchesDesc = service.description.toLowerCase().includes(q);
        const matchesTag = service.tags?.some(t => t.toLowerCase().includes(q));
        const matchesCategory = service.categoryLabel.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTag && !matchesCategory) {
          return false;
        }
      }
      // Turnaround filter
      if (selectedTurnaround !== 'all') {
        if (selectedTurnaround === 'rush' && service.turnaround !== 'rush') return false;
        if (selectedTurnaround === 'sameday' && service.turnaround !== 'sameday' && service.turnaround !== 'rush') return false;
        if (selectedTurnaround === 'nextday' && service.turnaround !== 'nextday') return false;
      }
      // Price range filter
      if (selectedPriceRange !== 'all') {
        if (selectedPriceRange === 'under50' && service.basePrice >= 50) return false;
        if (selectedPriceRange === '50to150' && (service.basePrice < 50 || service.basePrice > 150)) return false;
        if (selectedPriceRange === 'over150' && service.basePrice <= 150) return false;
      }
      // Tag filter
      if (selectedTag !== 'all') {
        if (!service.tags?.includes(selectedTag)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'turnaround') {
        const rank = { rush: 1, sameday: 2, nextday: 3, standard: 4 };
        return rank[a.turnaround] - rank[b.turnaround];
      }
      return 0;
    });
  }, [services, selectedCategory, searchQuery, selectedTurnaround, selectedPriceRange, selectedTag, sortBy]);

  // Tracker Search Handler
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackerCode.trim().toUpperCase();
    const found = orders.find(
      o => o.queueNumber.toUpperCase() === query || o.trackingCode.toUpperCase() === query
    );
    if (found) {
      setSearchedOrder(found);
      setTrackerError(null);
    } else {
      setSearchedOrder(null);
      setTrackerError(`No order matching "${query}" was found. Check your ticket number.`);
    }
  };

  // Order Submit Handler
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custContact.trim()) {
      alert('Please provide your name and mobile number.');
      return;
    }

    const srv = services.find(s => s.id === selectedServiceId) || services[0];
    const newOrd = placeOrder({
      customerName: custName,
      contactNumber: custContact,
      email: custEmail,
      serviceId: srv.id,
      serviceName: srv.name,
      paperSize,
      paperType,
      printSide,
      pageCount: Number(pageCount) || 1,
      copiesCount: Number(copiesCount) || 1,
      binding,
      specialInstructions: instructions,
      fileName: simulatedFileName || uploadedFile?.name || `${srv.name}_Document.pdf`,
      subtotal: priceComputation.totalAmount,
      totalAmount: priceComputation.totalAmount,
      amountPaid: 0,
      paymentStatus: 'UNPAID',
      paymentMethod: 'Cashier Settlement'
    });

    setCreatedOrder(newOrd);
    setSearchedOrder(newOrd);
    setTrackerCode(newOrd.queueNumber);

    // Reset Form
    setCustName('');
    setCustContact('');
    setCustEmail('');
    setInstructions('');
    setUploadedFile(null);
    setSimulatedFileName('');
  };

  const handleSelectServiceFromCard = (service: PrintingService) => {
    setSelectedServiceId(service.id);
    setSelectedServiceForOrder(service);
    orderFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedTurnaround('all');
    setSelectedPriceRange('all');
    setSelectedTag('all');
    setSortBy('popular');
  };

  const isFiltering = selectedCategory !== 'all' || 
    Boolean(searchQuery.trim()) || 
    selectedTurnaround !== 'all' || 
    selectedPriceRange !== 'all' || 
    selectedTag !== 'all';

  return (
    <div className="space-y-12 pb-20">
      
      {/* ==============================================================
           HERO SECTION: Dynamic, high-impact print studio banner
           ============================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#242B33] via-[#1E232A] to-[#12161A] text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        {/* Subtle background glow accents in the 4 palette colors */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#F4631E]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#309898]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#FF9F00]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF9F00] animate-pulse"></span>
              <span className="text-white/90">Official Print & Queue Management System</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              We take care of all your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9F00] via-[#F4631E] to-[#CB0404]">
                printing & copy needs.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Submit your document thesis, laboratory photos, die-cut vinyl stickers, and marketing collateral online. Track live queue tickets from pending, active printing, to ready for pickup.
            </p>

            {/* Quick CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a 
                href="#catalog-section"
                className="px-6 py-3 rounded-xl bg-[#F4631E] hover:bg-[#E64A19] text-white font-bold text-sm shadow-lg shadow-[#F4631E]/25 transition-all flex items-center gap-2 group"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a 
                href="#order-form-section"
                className="px-6 py-3 rounded-xl bg-[#309898] hover:bg-[#287D7D] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Place Order Online</span>
              </a>

              <a 
                href="#tracker-section"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-[#FF9F00]" />
                <span>Track Claim Ticket</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/10 text-xs">
              <div>
                <span className="font-extrabold text-lg text-white font-mono block">99.4%</span>
                <span className="text-slate-400 text-[11px]">On-Time Pickup</span>
              </div>
              <div>
                <span className="font-extrabold text-lg text-[#FF9F00] font-mono block">14,200+</span>
                <span className="text-slate-400 text-[11px]">Jobs Completed</span>
              </div>
              <div>
                <span className="font-extrabold text-lg text-emerald-400 font-mono block">★ 4.9 / 5</span>
                <span className="text-slate-400 text-[11px]">Student & Pro Rating</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Multi-layered Realistic Showcase collage */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto max-w-md">
              {/* Card 1: Realistic Thesis / Book */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500 bg-white">
                <img 
                  src={thesisImage} 
                  alt="Thesis hardbound gold foil printing" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 bg-white flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">Thesis & Documents</span>
                    <span className="text-slate-500 text-[11px]">Hardbound Foil & Coil Spiral</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-[#F4631E]/10 text-[#F4631E]">
                    From ₱2.00
                  </span>
                </div>
              </div>

              {/* Floating Overlay Card 2: Stickers & Photo */}
              <div className="absolute -bottom-6 -right-4 w-60 rounded-2xl overflow-hidden shadow-2xl border-2 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500 bg-white">
                <img 
                  src={stickersImage} 
                  alt="Die-cut stickers printing" 
                  className="w-full h-28 object-cover"
                />
                <div className="p-2.5 bg-white text-xs">
                  <span className="font-bold text-slate-800 block">Die-Cut Vinyl Stickers</span>
                  <span className="text-[#309898] text-[10px] font-bold">Waterproof & UV Coated</span>
                </div>
              </div>

              {/* Live Queue Pulse Badge */}
              <div className="absolute -top-3 -left-3 px-3.5 py-1.5 rounded-xl bg-[#242B33] border border-white/20 text-white text-xs font-mono font-bold shadow-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#309898] animate-ping"></span>
                <span>COUNTER 1 ACTIVE</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==============================================================
           SECTION 2: LIVE ORDER & QUEUE TRACKER
           ============================================================== */}
      <section id="tracker-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#309898] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#309898]" /> Real-Time Queue Monitor
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Live Order & Queue Tracker
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your assigned Queue Number (e.g. <span className="font-mono text-[#F4631E] font-bold">Q-101</span>) or Tracking ID (<span className="font-mono text-[#309898] font-bold">QP-2026-101</span>) to see live progress.
              </p>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Quick Demo:</span>
              <button
                type="button"
                onClick={() => {
                  setTrackerCode('Q-101');
                  const found = orders.find(o => o.queueNumber === 'Q-101');
                  if (found) { setSearchedOrder(found); setTrackerError(null); }
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold hover:bg-emerald-100"
              >
                Q-101 (Ready)
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrackerCode('Q-102');
                  const found = orders.find(o => o.queueNumber === 'Q-102');
                  if (found) { setSearchedOrder(found); setTrackerError(null); }
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold hover:bg-blue-100"
              >
                Q-102 (Printing)
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrackerCode('Q-103');
                  const found = orders.find(o => o.queueNumber === 'Q-103');
                  if (found) { setSearchedOrder(found); setTrackerError(null); }
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FF9F00]/10 text-[#FF9F00] border border-[#FF9F00]/30 font-mono font-bold hover:bg-[#FF9F00]/20"
              >
                Q-103 (Pending)
              </button>
            </div>
          </div>

          {/* Tracker Input Search Form */}
          <form onSubmit={handleTrackSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input 
                type="text" 
                value={trackerCode}
                onChange={(e) => setTrackerCode(e.target.value)}
                placeholder="Enter Queue No. (e.g. Q-101) or Tracking Code..." 
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#309898] font-mono uppercase"
                required
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-[#309898] hover:bg-[#287D7D] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Track Status</span>
            </button>
          </form>

          {/* Tracker Error Alert */}
          {trackerError && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{trackerError}</span>
            </div>
          )}

          {/* Tracker Results Card with 4-Step Stepper */}
          {searchedOrder && (
            <div className="mt-6 p-6 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-6">
              
              {/* Status Alert Banner */}
              <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
                searchedOrder.orderStatus === 'READY'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : searchedOrder.orderStatus === 'PROCESSING'
                  ? 'bg-blue-50 text-blue-900 border border-blue-200'
                  : searchedOrder.orderStatus === 'COMPLETED'
                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                  : 'bg-[#FF9F00]/10 text-amber-900 border border-[#FF9F00]/30'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${
                    searchedOrder.orderStatus === 'READY' ? 'bg-emerald-500 animate-ping' :
                    searchedOrder.orderStatus === 'PROCESSING' ? 'bg-blue-500 animate-pulse' :
                    searchedOrder.orderStatus === 'COMPLETED' ? 'bg-slate-500' : 'bg-[#FF9F00]'
                  }`}></span>
                  <span>
                    Status: <b className="uppercase">{searchedOrder.orderStatus.replace('_', ' ')}</b>
                    {searchedOrder.orderStatus === 'READY' && ' — Please proceed to Counter 1 with your Claim Ticket!'}
                    {searchedOrder.orderStatus === 'PROCESSING' && ' — Your print job is actively printing on the machine.'}
                    {searchedOrder.orderStatus === 'PENDING' && ` — In queue (${searchedOrder.estimatedWaitMinutes || 10} mins estimated wait).`}
                    {searchedOrder.orderStatus === 'COMPLETED' && ' — This order has been collected and finalized.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onPrintTicket(searchedOrder)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#242B33] hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>

              {/* 4-Step Stepper */}
              <div className="px-2 sm:px-8 py-2">
                <div className="flex items-center justify-between relative">
                  
                  {/* Step 1: Pending */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-8 h-8 rounded-full bg-[#309898] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      1
                    </div>
                    <span className="text-xs font-bold text-[#309898] mt-1.5">Pending</span>
                  </div>
                  <div className={`h-1 flex-1 mx-2 ${
                    searchedOrder.orderStatus !== 'PENDING' ? 'bg-[#309898]' : 'bg-slate-200'
                  }`}></div>

                  {/* Step 2: Processing */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-sm ${
                      searchedOrder.orderStatus === 'PROCESSING' || searchedOrder.orderStatus === 'READY' || searchedOrder.orderStatus === 'COMPLETED'
                        ? 'bg-[#F4631E] text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      2
                    </div>
                    <span className={`text-xs font-semibold mt-1.5 ${
                      searchedOrder.orderStatus === 'PROCESSING' || searchedOrder.orderStatus === 'READY' || searchedOrder.orderStatus === 'COMPLETED'
                        ? 'text-[#F4631E] font-bold'
                        : 'text-slate-400'
                    }`}>Processing</span>
                  </div>
                  <div className={`h-1 flex-1 mx-2 ${
                    searchedOrder.orderStatus === 'READY' || searchedOrder.orderStatus === 'COMPLETED' ? 'bg-[#F4631E]' : 'bg-slate-200'
                  }`}></div>

                  {/* Step 3: Ready for Pickup */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-sm ${
                      searchedOrder.orderStatus === 'READY' || searchedOrder.orderStatus === 'COMPLETED'
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      3
                    </div>
                    <span className={`text-xs font-semibold mt-1.5 ${
                      searchedOrder.orderStatus === 'READY' || searchedOrder.orderStatus === 'COMPLETED'
                        ? 'text-emerald-700 font-bold'
                        : 'text-slate-400'
                    }`}>Ready</span>
                  </div>
                  <div className={`h-1 flex-1 mx-2 ${
                    searchedOrder.orderStatus === 'COMPLETED' ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}></div>

                  {/* Step 4: Completed */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-sm ${
                      searchedOrder.orderStatus === 'COMPLETED'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      4
                    </div>
                    <span className={`text-xs font-semibold mt-1.5 ${
                      searchedOrder.orderStatus === 'COMPLETED' ? 'text-slate-800 font-bold' : 'text-slate-400'
                    }`}>Completed</span>
                  </div>

                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Assigned Queue No.</span>
                  <span className="text-2xl font-black font-mono text-[#F4631E] block mt-0.5">
                    {searchedOrder.queueNumber}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px] block">
                    Code: {searchedOrder.trackingCode}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Customer & Service</span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">
                    {searchedOrder.customerName}
                  </span>
                  <span className="text-[#309898] font-medium block">
                    {searchedOrder.serviceName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Specifications</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">
                    {searchedOrder.pageCount} pgs × {searchedOrder.copiesCount} copy • {searchedOrder.paperSize.toUpperCase()}
                  </span>
                  <span className="text-slate-500 block">
                    Binding: {searchedOrder.binding.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Payment & Balance</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-extrabold font-mono text-slate-900">
                      ₱{searchedOrder.totalAmount.toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      searchedOrder.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : searchedOrder.paymentStatus === 'PARTIAL'
                        ? 'bg-[#FF9F00]/20 text-amber-800'
                        : 'bg-red-100 text-[#CB0404]'
                    }`}>
                      {searchedOrder.paymentStatus}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Balance: <b className="text-[#CB0404] font-mono">₱{(searchedOrder.totalAmount - searchedOrder.amountPaid).toFixed(2)}</b>
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ==============================================================
           SECTION 3: REALISTIC PICTURES & INTUITIVE FILTERS CATALOG
           ============================================================== */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F4631E] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F4631E]" /> Full Service Print Studio
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Printing Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Photographic samples of our materials, bindings, paper finishes, and turnarounds. Use the multi-dimensional filters below to find the exact service for your job.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-400 font-medium">View:</span>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#242B33] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Showcase Grid View"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'compact'
                  ? 'bg-[#242B33] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Compact Comparison View"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* INTUITIVE CATEGORY PILLS FILTER BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Services', icon: Sparkles, count: services.length },
            { id: 'documents', label: 'Documents & Thesis', icon: FileText, count: services.filter(s => s.category === 'documents').length },
            { id: 'photos', label: 'Photo & Framing', icon: Maximize2, count: services.filter(s => s.category === 'photos').length },
            { id: 'posters', label: 'Posters & Banners', icon: Layers, count: services.filter(s => s.category === 'posters').length },
            { id: 'marketing', label: 'Marketing & Business', icon: Tag, count: services.filter(s => s.category === 'marketing').length },
            { id: 'custom', label: 'Custom Gifts & Stationery', icon: Sparkles, count: services.filter(s => s.category === 'custom').length },
            { id: 'architectural', label: 'Architectural & CAD', icon: Building, count: services.filter(s => s.category === 'architectural').length },
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as ServiceCategory)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-[#F4631E] text-white shadow-md shadow-[#F4631E]/20 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#309898]'}`} />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SECONDARY INTUITIVE MULTI-FILTER BAR (Search, Turnaround, Budget, Sorting) */}
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Live Search */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, paper type, finish..."
              className="w-full pl-9 pr-7 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#309898] bg-slate-50/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Turnaround speed filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedTurnaround}
              onChange={(e) => setSelectedTurnaround(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#309898]"
            >
              <option value="all">Turnaround: Any speed</option>
              <option value="rush">⚡ 1-2 Hours Express Rush</option>
              <option value="sameday">Same Day Pickup</option>
              <option value="nextday">Next Day (24 hrs)</option>
            </select>
          </div>

          {/* Budget filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#309898]"
            >
              <option value="all">Budget: All</option>
              <option value="under50">Under ₱50</option>
              <option value="50to150">₱50 – ₱150</option>
              <option value="over150">₱150 & up</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#309898]"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="turnaround">Sort: Fastest Turnaround</option>
            </select>

            {isFiltering && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs shrink-0 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Filter tags row */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
          <span className="font-medium text-slate-400">Popular tags:</span>
          {allTags.slice(0, 8).map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
              className={`px-2 py-0.5 rounded-full transition-all ${
                selectedTag === tag
                  ? 'bg-[#309898] text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              #{tag}
            </button>
          ))}
          {isFiltering && (
            <span className="ml-auto text-xs text-[#F4631E] font-bold">
              Showing {filteredServices.length} of {services.length} services
            </span>
          )}
        </div>

        {/* PRODUCT CARDS: REALISTIC PICTURES SHOWCASE */}
        {filteredServices.length === 0 ? (
          <div className="mt-8 p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-base">No printing services match your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, price bracket, or turnaround speed.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-xl bg-[#F4631E] text-white font-bold text-xs"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View with High-Resolution Realistic Photos */
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map(service => (
              <div 
                key={service.id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#309898] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Realistic Picture Card Container */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img 
                    src={service.realisticImage} 
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Turnaround Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-bold tracking-tight">
                    {service.turnaroundLabel}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#309898] text-white text-[10px] font-bold shadow-sm">
                    {service.categoryLabel.split(' ')[0]}
                  </div>

                  {/* Hover Quick View Trigger */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickViewService(service);
                        setActiveGalleryIndex(0);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-slate-100 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#309898]" />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>

                {/* Card Info Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <div className="flex items-center text-[#FF9F00]">
                        <Star className="w-3.5 h-3.5 fill-[#FF9F00] text-[#FF9F00]" />
                        <span className="font-bold text-slate-800 ml-1 text-xs">{service.rating}</span>
                      </div>
                      <span>•</span>
                      <span className="text-[11px]">({service.reviewsCount} reviews)</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-[#F4631E] transition-colors">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Starting from</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-extrabold text-base font-mono text-[#F4631E]">
                          ₱{service.basePrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {service.unit}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectServiceFromCard(service)}
                      className="px-3 py-2 rounded-xl bg-[#F4631E] hover:bg-[#E64A19] text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                    >
                      <span>Configure</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Compact Comparison Table View */
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Starting Rate</th>
                    <th className="py-3 px-4">Turnaround</th>
                    <th className="py-3 px-4">Finish Options</th>
                    <th className="py-3 px-4 text-right">Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map(service => (
                    <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={service.realisticImage} 
                            alt={service.name} 
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{service.name}</span>
                            <span className="text-[11px] text-slate-500">★ {service.rating} ({service.reviewsCount})</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {service.categoryLabel}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#F4631E]">
                        ₱{service.basePrice.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans font-normal">/{service.unit}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-700">
                          {service.turnaroundLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {service.finishOptions.slice(0, 2).join(', ')}...
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectServiceFromCard(service)}
                          className="px-3 py-1.5 rounded-lg bg-[#F4631E] hover:bg-[#E64A19] text-white font-bold text-xs"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </section>

      {/* ==============================================================
           SECTION 4: ORDER PLACEMENT & LIVE COST CALCULATOR
           ============================================================== */}
      <section id="order-form-section" ref={orderFormRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 7 Columns: Order Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#309898] mb-1">
                <Printer className="w-3.5 h-3.5 text-[#309898]" /> Online Claim Ticket Issuance
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Submit Print Order & Specifications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your document, photo, or merchandise job below. You will be assigned a sequential queue number for pickup at Counter 1.
              </p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-5">
              
              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input 
                    type="text" 
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Maria Santos" 
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#309898]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Contact No. *
                  </label>
                  <input 
                    type="text" 
                    value={custContact}
                    onChange={(e) => setCustContact(e.target.value)}
                    placeholder="e.g. 0917-123-4567" 
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#309898]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Optional for status updates)
                </label>
                <input 
                  type="email" 
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="e.g. student@icct.edu.ph" 
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#309898]"
                />
              </div>

              {/* Service Selection Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Selected Printing Service *
                </label>
                <select 
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#309898] bg-white text-slate-800"
                  required
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ₱{s.basePrice.toFixed(2)} ({s.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Paper & Layout Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paper Size</label>
                  <select 
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="short">Short (8.5 × 11")</option>
                    <option value="a4">A4 (8.27 × 11.69") [+₱0.50]</option>
                    <option value="long">Long (8.5 × 13") [+₱1.00]</option>
                    <option value="a3">A3 Tabloid (11.7 × 16.5") [+₱8.00]</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paper Material</label>
                  <select 
                    value={paperType}
                    onChange={(e) => setPaperType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="regular70">Standard 70gsm Copier</option>
                    <option value="book80">80gsm Book Paper [+₱1.00]</option>
                    <option value="glossyPhoto">Glossy Photo 230gsm [+₱12.00]</option>
                    <option value="matteCardstock">Matte Cardstock 250gsm [+₱10.00]</option>
                    <option value="stickerVinyl">Vinyl Sticker Sheet [+₱15.00]</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Print Layout</label>
                  <select 
                    value={printSide}
                    onChange={(e) => setPrintSide(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="single">Single-sided (1 page/sheet)</option>
                    <option value="double">Back-to-Back (Duplex)</option>
                  </select>
                </div>
              </div>

              {/* Pages, Copies, and Binding */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pages Count</label>
                  <input 
                    type="number" 
                    min="1"
                    max="1000"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Copies / Sets</label>
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    value={copiesCount}
                    onChange={(e) => setCopiesCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Finishing / Binding</label>
                  <select 
                    value={binding}
                    onChange={(e) => setBinding(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="none">No Binding</option>
                    <option value="staple">Corner Staple (Free)</option>
                    <option value="ring">Spiral Coil Bind (+₱55.00)</option>
                    <option value="soft">Soft Bind with PVC (+₱75.00)</option>
                    <option value="hard">Hardbound Gold Foil (+₱350.00)</option>
                    <option value="laminate">Laminate Sheet (+₱25.00)</option>
                  </select>
                </div>
              </div>

              {/* Simulated File Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Document / Artwork
                </label>
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition-colors text-center relative">
                  <input 
                    type="file" 
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploadedFile(f);
                        setSimulatedFileName(f.name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 text-[#309898] mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-700 block">
                    {simulatedFileName || 'Click or drop PDF, DOCX, ZIP or AI file here'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Max 100MB per file • High-resolution CMYK recommended
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Special Printing Notes</label>
                <textarea 
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Please print page 1 in colored cover, stapled on top-left corner..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#309898]"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full py-3.5 bg-[#F4631E] hover:bg-[#E64A19] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#F4631E]/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Print Job & Generate Queue Ticket</span>
              </button>

            </form>
          </div>

          {/* Right 5 Columns: Live Reactive Cost Calculator */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#309898]/10 text-[#309898] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Instant Cost Calculator</h3>
                    <span className="text-[11px] text-slate-400">Live system matrix rate</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Calculated Live
                </span>
              </div>

              {/* Itemized Calculation Breakdown */}
              <div className="space-y-2 text-xs py-1">
                <div className="flex justify-between text-slate-600">
                  <span>Base Rate:</span>
                  <span className="font-mono font-semibold">₱{priceComputation.baseRate.toFixed(2)} / unit</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Pages & Sheets:</span>
                  <span className="font-mono">{pageCount} pgs ({priceComputation.sheetCount} physical sheets)</span>
                </div>

                {priceComputation.paperSurcharge > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Paper Size & Finish Surcharge:</span>
                    <span className="font-mono text-slate-800">+₱{priceComputation.paperSurcharge.toFixed(2)}</span>
                  </div>
                )}

                {priceComputation.duplexDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Double-Sided Paper Discount:</span>
                    <span className="font-mono">-₱{priceComputation.duplexDiscount.toFixed(2)}</span>
                  </div>
                )}

                {priceComputation.bindingFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Binding / Finishing Fee:</span>
                    <span className="font-mono">+₱{priceComputation.bindingFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Number of Copies:</span>
                  <span className="font-mono">× {copiesCount}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-slate-400 block tracking-wider">
                      Total Payable
                    </span>
                    <span className="text-[11px] text-slate-400">Inclusive of VAT & Counter Prep</span>
                  </div>
                  <span className="text-3xl font-black font-mono text-[#F4631E]">
                    ₱{priceComputation.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Counter Settlement Notice */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#309898]" /> Payment & Pickup Protocol
                </div>
                <p>• Payments are settled at Counter 1 or 2 upon pickup or arrival.</p>
                <p>• We accept Cash, GCash, Maya, and Visa/Mastercard.</p>
                <p>• Present your assigned <b>Queue Number</b> upon arrival.</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==============================================================
           MODAL 1: ORDER CONFIRMATION TICKET POPUP
           ============================================================== */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your printing order is active in the shop queue.
            </p>

            {/* Thermal Ticket Paper Card */}
            <div className="ticket-paper p-5 my-6 bg-slate-50 border border-slate-200 text-left">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <span>Assigned Queue Ticket</span>
                <span className="font-mono text-[#309898]">{createdOrder.trackingCode}</span>
              </div>

              <div className="text-5xl font-black font-mono text-[#F4631E] tracking-wider my-2 text-center">
                {createdOrder.queueNumber}
              </div>

              <div className="pt-3 border-t border-slate-200 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <b className="text-slate-800">{createdOrder.customerName}</b>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="text-[#309898] font-semibold">{createdOrder.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Specs:</span>
                  <span>{createdOrder.pageCount} pgs × {createdOrder.copiesCount} set ({createdOrder.paperSize.toUpperCase()})</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-extrabold text-slate-900 text-sm">
                  <span>Total Amount:</span>
                  <span className="font-mono text-[#F4631E]">₱{createdOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="barcode-stripes mt-4"></div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => onPrintTicket(createdOrder)}
                className="w-full py-2.5 bg-[#242B33] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Customer Claim Slip</span>
              </button>

              <button 
                type="button"
                onClick={() => setCreatedOrder(null)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Done & Return to Catalog
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==============================================================
           MODAL 2: QUICK VIEW REALISTIC GALLERY POPUP
           ============================================================== */}
      {quickViewService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 p-6 sm:p-8">
            
            <button 
              onClick={() => setQuickViewService(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left: Realistic Image Gallery */}
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden bg-slate-100 h-64 border border-slate-200">
                  <img 
                    src={quickViewService.gallery?.[activeGalleryIndex] || quickViewService.realisticImage} 
                    alt={quickViewService.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {quickViewService.gallery && quickViewService.gallery.length > 1 && (
                  <div className="flex items-center gap-2">
                    {quickViewService.gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveGalleryIndex(idx)}
                        className={`w-16 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          activeGalleryIndex === idx ? 'border-[#F4631E] scale-105' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Service Details & Specs */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#309898]">
                    {quickViewService.categoryLabel}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {quickViewService.name}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500 mt-1">
                    <span className="flex items-center text-[#FF9F00] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#FF9F00]" /> {quickViewService.rating}
                    </span>
                    <span>•</span>
                    <span>{quickViewService.reviewsCount} verified reviews</span>
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  {quickViewService.description}
                </p>

                {/* Available Paper & Finishes */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">Available Finishes:</span>
                    <div className="flex flex-wrap gap-1">
                      {quickViewService.finishOptions.map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block mb-1">Paper Material Stock:</span>
                    <div className="flex flex-wrap gap-1">
                      {quickViewService.paperOptions.map(p => (
                        <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Turnaround Pill */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Turnaround</span>
                    <span className="font-bold text-slate-800">{quickViewService.turnaroundLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Starting Base Rate</span>
                    <span className="font-mono font-extrabold text-[#F4631E] text-sm">
                      ₱{quickViewService.basePrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectServiceFromCard(quickViewService);
                      setQuickViewService(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#F4631E] hover:bg-[#E64A19] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Select & Order This Service</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

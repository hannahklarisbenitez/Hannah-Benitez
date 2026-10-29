import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Clock, 
  Printer, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { usePrintStore } from '../context/PrintStoreContext';
import { playQueueChime } from '../utils/audioChime';

export const TVLobbyDisplay: React.FC = () => {
  const { orders, chimeEnabled, setChimeEnabled } = usePrintStore();
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString());
      setCurrentDate(d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter queue columns
  const readyOrders = orders.filter(o => o.orderStatus === 'READY');
  const processingOrders = orders.filter(o => o.orderStatus === 'PROCESSING');
  const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleTestChime = () => {
    playQueueChime('ready');
  };

  return (
    <div className="bg-[#181C21] text-white min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      
      {/* Top Header of TV Display */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/10 gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F4631E] to-[#CB0404] flex items-center justify-center text-white shadow-xl">
            <Printer className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                QuickPrint <span className="text-[#F4631E]">Hub</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#309898]/20 text-[#309898] border border-[#309898]/40">
                LOBBY TV
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Live Printing Queue & Customer Call Display • Student Plaza Commercial Complex
            </p>
          </div>
        </div>

        {/* TV Controls & Live Digital Clock */}
        <div className="flex items-center gap-3">
          
          <button
            type="button"
            onClick={() => {
              setChimeEnabled(!chimeEnabled);
              if (!chimeEnabled) playQueueChime('ready');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              chimeEnabled ? 'bg-[#309898] text-white' : 'bg-white/10 text-slate-400'
            }`}
          >
            {chimeEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Chime: {chimeEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={handleTestChime}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            title="Test alert sound"
          >
            🔊 Sound Test
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            title="Fullscreen Mode"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <div className="text-right pl-3 border-l border-white/10">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-[#FF9F00]">
              {currentTime}
            </div>
            <div className="text-[11px] text-slate-400">
              {currentDate}
            </div>
          </div>

        </div>

      </div>

      {/* 3-Column Live Queue Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-8 flex-grow">
        
        {/* Column 1: READY FOR PICKUP (5 Cols) - High visibility */}
        <div className="lg:col-span-5 flex flex-col bg-white/5 rounded-3xl p-5 border border-emerald-500/30">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xl font-black text-emerald-400 uppercase tracking-wider">
                READY FOR PICKUP
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
              Proceed to Counter 1
            </span>
          </div>

          <div className="space-y-3 flex-grow overflow-y-auto max-h-[520px] pr-1">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No orders waiting for pickup right now.
              </div>
            ) : (
              readyOrders.map(order => (
                <div 
                  key={order.id}
                  className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/60 shadow-lg flex items-center justify-between animate-pulse"
                >
                  <div>
                    <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-wider">
                      {order.queueNumber}
                    </span>
                    <span className="text-xs text-slate-300 block font-medium mt-1">
                      {order.customerName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-xs block">
                      COUNTER 1
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                      {order.serviceName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: NOW PRINTING / PROCESSING (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col bg-white/5 rounded-3xl p-5 border border-[#309898]/30">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#309898] animate-bounce" />
              <h2 className="text-lg font-black text-[#309898] uppercase tracking-wider">
                NOW PRINTING
              </h2>
            </div>
            <span className="text-xs text-slate-400">Active Run</span>
          </div>

          <div className="space-y-3 flex-grow overflow-y-auto max-h-[520px] pr-1">
            {processingOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Printers are currently idle.
              </div>
            ) : (
              processingOrders.map(order => (
                <div 
                  key={order.id}
                  className="p-4 rounded-2xl bg-[#309898]/10 border border-[#309898]/40 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="text-3xl font-black font-mono text-white tracking-wider">
                      {order.queueNumber}
                    </span>
                    <span className="text-xs text-slate-300 block font-medium mt-0.5">
                      {order.customerName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-[#FF9F00] font-bold block">
                      {order.pageCount} pgs × {order.copiesCount}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Est. 3-5 mins
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: NEXT IN LINE / PENDING (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col bg-white/5 rounded-3xl p-5 border border-white/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                NEXT IN LINE
              </h2>
            </div>
            <span className="text-xs text-slate-500">{pendingOrders.length} waiting</span>
          </div>

          <div className="space-y-2 flex-grow overflow-y-auto max-h-[520px] pr-1">
            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No waiting orders in queue.
              </div>
            ) : (
              pendingOrders.map(order => (
                <div 
                  key={order.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <span className="font-mono font-bold text-[#FF9F00] text-lg">
                    {order.queueNumber}
                  </span>
                  <span className="text-slate-400 truncate max-w-[110px]">
                    {order.customerName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Footer Bar */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-4">
          <span>Active Queue Load: <b className="text-[#FF9F00] font-mono">{orders.length}</b> orders</span>
          <span>•</span>
          <span>Pick-up Counter: <b className="text-white">Counter 1 & 2</b></span>
        </div>
        <div className="text-slate-400 text-center sm:text-right">
          QuickPrint Hub • High-Performance Queue & Order Management System
        </div>
      </div>

    </div>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Order, 
  PrintingService, 
  PricingMatrix, 
  StaffUser, 
  AuditLog, 
  OrderStatus 
} from '../types';
import { 
  INITIAL_SERVICES, 
  INITIAL_ORDERS, 
  INITIAL_PRICING, 
  INITIAL_STAFF, 
  INITIAL_AUDIT_LOGS 
} from '../data/mockData';
import { playQueueChime } from '../utils/audioChime';

interface PrintStoreContextType {
  orders: Order[];
  services: PrintingService[];
  pricing: PricingMatrix;
  staffUsers: StaffUser[];
  auditLogs: AuditLog[];
  currentUser: StaffUser | null;
  activePortal: 'customer' | 'tv' | 'staff' | 'admin';
  selectedServiceForOrder: PrintingService | null;
  chimeEnabled: boolean;
  
  // Actions
  setActivePortal: (portal: 'customer' | 'tv' | 'staff' | 'admin') => void;
  setSelectedServiceForOrder: (service: PrintingService | null) => void;
  setChimeEnabled: (enabled: boolean) => void;
  loginUser: (username: string) => boolean;
  logoutUser: () => void;
  
  // Order actions (matching flowchart)
  placeOrder: (orderData: Omit<Order, 'id' | 'queueNumber' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'orderStatus'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, actorName?: string) => void;
  recordPayment: (orderId: string, amount: number, method: string, refNumber?: string, cashierName?: string) => boolean;
  releaseOrder: (orderId: string, actorName?: string) => boolean;
  overrideOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  
  // Service management actions (matching flowchart: Add, Edit, Remove)
  addService: (service: Omit<PrintingService, 'id'>) => boolean;
  updateService: (service: PrintingService) => void;
  deleteService: (serviceId: string) => boolean;
  
  // User management actions (matching flowchart: Add, Edit, Deactivate)
  addStaffUser: (user: Omit<StaffUser, 'id'>) => boolean;
  updateStaffUser: (user: StaffUser) => void;
  toggleStaffUserActive: (userId: string) => void;

  // Pricing matrix actions
  updatePricing: (newPricing: PricingMatrix) => void;
  resetDatabase: () => void;
  
  // Computations
  calculatePrice: (params: {
    serviceId: string;
    paperSize: 'short' | 'a4' | 'long' | 'a3';
    paperType: 'regular70' | 'book80' | 'glossyPhoto' | 'matteCardstock' | 'stickerVinyl';
    printSide: 'single' | 'double';
    pageCount: number;
    copiesCount: number;
    binding: 'none' | 'staple' | 'ring' | 'soft' | 'hard' | 'laminate';
  }) => {
    baseRate: number;
    sheetCount: number;
    paperSurcharge: number;
    duplexDiscount: number;
    bindingFee: number;
    subtotalPerCopy: number;
    totalAmount: number;
  };
}

const PrintStoreContext = createContext<PrintStoreContextType | undefined>(undefined);

export const PrintStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('qp_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [services, setServices] = useState<PrintingService[]>(() => {
    const saved = localStorage.getItem('qp_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((s: PrintingService) => {
            const initial = INITIAL_SERVICES.find(init => init.id === s.id);
            if (initial) {
              return {
                ...s,
                realisticImage: initial.realisticImage,
                gallery: initial.gallery
              };
            }
            return s;
          });
        }
      } catch (e) {}
    }
    return INITIAL_SERVICES;
  });

  const [pricing, setPricing] = useState<PricingMatrix>(() => {
    const saved = localStorage.getItem('qp_pricing');
    return saved ? JSON.parse(saved) : INITIAL_PRICING;
  });

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('qp_staff');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((u: StaffUser) => u.fullName === 'Hannah Benitez')) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_STAFF;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('qp_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    const saved = localStorage.getItem('qp_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.username === 'benitez' || parsed.username === 'admin' || parsed.role === 'ADMIN' || parsed.fullName?.includes('Benitez')) {
            return INITIAL_STAFF[0];
          }
          const matched = INITIAL_STAFF.find(u => u.username === parsed.username);
          if (matched) return matched;
        }
      } catch (e) {}
    }
    return INITIAL_STAFF[0];
  });

  const [activePortal, setActivePortal] = useState<'customer' | 'tv' | 'staff' | 'admin'>('customer');
  const [selectedServiceForOrder, setSelectedServiceForOrder] = useState<PrintingService | null>(null);
  const [chimeEnabled, setChimeEnabled] = useState<boolean>(true);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('qp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('qp_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('qp_pricing', JSON.stringify(pricing));
  }, [pricing]);

  useEffect(() => {
    localStorage.setItem('qp_staff', JSON.stringify(staffUsers));
  }, [staffUsers]);

  useEffect(() => {
    localStorage.setItem('qp_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('qp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('qp_current_user');
    }
  }, [currentUser]);

  const addAuditLog = (action: string, details: string, actor: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      details,
      actor
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 59)]);
  };

  const loginUser = (username: string): boolean => {
    const term = username.toLowerCase().trim();
    // Support aliases: 'admin' maps to benitez, 'staff' maps to bonda
    const mapped = term === 'admin' ? 'benitez' : term === 'staff' ? 'bonda' : term;
    const user = staffUsers.find(u => 
      (u.username.toLowerCase() === mapped || u.username.toLowerCase() === term) && u.active
    );
    if (user) {
      setCurrentUser(user);
      addAuditLog('USER_LOGIN', `User ${user.fullName} (${user.role}) logged in successfully`, user.fullName);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', `User ${currentUser.fullName} logged out`, currentUser.fullName);
    }
    setCurrentUser(null);
  };

  const calculatePrice = ({
    serviceId,
    paperSize,
    paperType,
    printSide,
    pageCount,
    copiesCount,
    binding
  }: {
    serviceId: string;
    paperSize: 'short' | 'a4' | 'long' | 'a3';
    paperType: 'regular70' | 'book80' | 'glossyPhoto' | 'matteCardstock' | 'stickerVinyl';
    printSide: 'single' | 'double';
    pageCount: number;
    copiesCount: number;
    binding: 'none' | 'staple' | 'ring' | 'soft' | 'hard' | 'laminate';
  }) => {
    const srv = services.find(s => s.id === serviceId) || services[0];
    const baseRate = srv.basePrice;

    // Sheet calculation
    const sheetCount = printSide === 'double' ? Math.ceil(pageCount / 2) : pageCount;
    
    // Paper surcharges
    const sizeSurcharge = (pricing.paperSizeSurcharges[paperSize] || 0) * sheetCount;
    const materialSurcharge = (pricing.paperMaterialSurcharges[paperType] || 0) * sheetCount;
    const paperSurcharge = sizeSurcharge + materialSurcharge;

    // Duplex savings
    const duplexDiscount = printSide === 'double' 
      ? (pricing.doubleSidedDiscountPerSheet || 0.25) * sheetCount 
      : 0;

    // Binding fee
    const bindingFee = pricing.bindingFees[binding] || 0;

    // Subtotal calculation
    const printRunCost = (baseRate * pageCount) + paperSurcharge - duplexDiscount;
    const subtotalPerCopy = Math.max(1, printRunCost + bindingFee);
    const totalAmount = Math.round(subtotalPerCopy * copiesCount * 100) / 100;

    return {
      baseRate,
      sheetCount,
      paperSurcharge,
      duplexDiscount,
      bindingFee,
      subtotalPerCopy,
      totalAmount
    };
  };

  // Flowchart Node: Create New Printing Order -> Save Order
  const placeOrder = (orderData: Omit<Order, 'id' | 'queueNumber' | 'trackingCode' | 'createdAt' | 'updatedAt' | 'orderStatus'>): Order => {
    const maxNum = orders.reduce((max, o) => {
      const match = o.queueNumber.match(/Q-(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        return val > max ? val : max;
      }
      return max;
    }, 100);

    const nextSeq = maxNum + 1;
    const queueNumber = `Q-${nextSeq}`;
    const trackingCode = `QP-2026-${nextSeq}`;

    const pendingCount = orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING').length;
    const estimatedWaitMinutes = Math.max(5, pendingCount * 4);

    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      queueNumber,
      trackingCode,
      orderStatus: 'PENDING',
      createdAt: now,
      updatedAt: now,
      estimatedWaitMinutes
    };

    setOrders(prev => [newOrder, ...prev]);
    addAuditLog(
      'ORDER_CREATED', 
      `Assigned ${queueNumber} (${trackingCode}) for ${newOrder.customerName} - ${newOrder.serviceName}`,
      currentUser?.fullName || 'Online Customer'
    );

    if (chimeEnabled) {
      playQueueChime('success');
    }

    return newOrder;
  };

  // Flowchart Node: Update Order Progress (Pending -> Processing -> Ready -> Completed)
  const updateOrderStatus = (orderId: string, status: OrderStatus, actorName?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: status,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    const found = orders.find(o => o.id === orderId);
    if (found) {
      const actor = actorName || currentUser?.fullName || 'Staff Console';
      addAuditLog('ORDER_STATUS_CHANGED', `Order ${found.queueNumber} status set to ${status}`, actor);

      if (status === 'READY' && chimeEnabled) {
        playQueueChime('ready');
      }
    }
  };

  // Flowchart Node: Record Payment (Decision: Payment Amount Valid? -> Decision: Balance Fully Paid?)
  const recordPayment = (orderId: string, amount: number, method: string, refNumber?: string, cashierName?: string): boolean => {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return false;

    // Decision Node: Payment Amount Valid?
    if (amount <= 0) {
      alert('Invalid payment amount. Amount must be greater than zero.');
      return false;
    }

    const remaining = Math.max(0, ord.totalAmount - ord.amountPaid);
    if (amount > remaining + 0.01) {
      alert(`Payment amount (₱${amount.toFixed(2)}) exceeds remaining balance (₱${remaining.toFixed(2)}).`);
      return false;
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newPaid = Math.min(o.totalAmount, o.amountPaid + amount);
        // Decision Node: Balance Fully Paid?
        const isFullyPaid = newPaid >= (o.totalAmount - 0.01);
        const newStatus = isFullyPaid ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'UNPAID');

        return {
          ...o,
          amountPaid: newPaid,
          paymentStatus: newStatus,
          paymentMethod: method + (refNumber ? ` (Ref: ${refNumber})` : ''),
          cashierName: cashierName || currentUser?.fullName || 'Counter Cashier',
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    addAuditLog(
      'PAYMENT_RECORDED',
      `Collected ₱${amount.toFixed(2)} via ${method} for ${ord.queueNumber}`,
      cashierName || currentUser?.fullName || 'Cashier'
    );

    if (chimeEnabled) {
      playQueueChime('ding');
    }
    return true;
  };

  // Flowchart Node: Release Completed Order (Decision: Order Ready and Payment Settled?)
  const releaseOrder = (orderId: string, actorName?: string): boolean => {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return false;

    // Decision: Order Ready and Payment Settled?
    if (ord.orderStatus !== 'READY') {
      alert(`Cannot release Order ${ord.queueNumber}: Order must be marked READY first.`);
      return false;
    }

    if (ord.paymentStatus !== 'PAID') {
      const bal = (ord.totalAmount - ord.amountPaid).toFixed(2);
      alert(`Flowchart verification failed: Order ${ord.queueNumber} has an outstanding balance of ₱${bal}. Payment must be settled before handover.`);
      return false;
    }

    // Step: Release Order to Customer -> Mark Order Completed
    updateOrderStatus(orderId, 'COMPLETED', actorName);
    addAuditLog('ORDER_RELEASED', `Handed over ${ord.queueNumber} to customer ${ord.customerName} (Payment Settled)`, actorName || currentUser?.fullName || 'Staff');
    return true;
  };

  const overrideOrderStatus = (orderId: string, status: OrderStatus, reason?: string) => {
    updateOrderStatus(orderId, status, `${currentUser?.fullName || 'Admin'} (Override: ${reason || 'Manual'})`);
  };

  // Flowchart Admin Node: Printing Service Management (Add, Edit, Remove)
  const addService = (serviceData: Omit<PrintingService, 'id'>): boolean => {
    // Decision: Information Valid?
    if (!serviceData.name.trim() || serviceData.basePrice <= 0) {
      alert('Service validation failed. Name and a base price greater than zero are required.');
      return false;
    }

    const newService: PrintingService = {
      ...serviceData,
      id: `srv-${Date.now()}`
    };
    setServices(prev => [...prev, newService]);
    addAuditLog('SERVICE_ADDED', `Admin added new printing service: ${newService.name}`, currentUser?.fullName || 'Admin');
    return true;
  };

  const updateService = (updatedService: PrintingService) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    addAuditLog('SERVICE_UPDATED', `Updated service rate/details: ${updatedService.name}`, currentUser?.fullName || 'Admin');
  };

  const deleteService = (serviceId: string): boolean => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return false;
    setServices(prev => prev.filter(s => s.id !== serviceId));
    addAuditLog('SERVICE_REMOVED', `Admin removed service: ${srv.name}`, currentUser?.fullName || 'Admin');
    return true;
  };

  // Flowchart Admin Node: User Account Management (Add, Edit, Deactivate)
  const addStaffUser = (userData: Omit<StaffUser, 'id'>): boolean => {
    if (!userData.username.trim() || !userData.fullName.trim()) {
      alert('Username and full name are required.');
      return false;
    }
    const exists = staffUsers.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
    if (exists) {
      alert('Username already exists. Please choose a different username.');
      return false;
    }

    const newUser: StaffUser = {
      ...userData,
      id: `user-${Date.now()}`
    };
    setStaffUsers(prev => [...prev, newUser]);
    addAuditLog('USER_CREATED', `Admin registered ${newUser.role} user: ${newUser.username}`, currentUser?.fullName || 'Admin');
    return true;
  };

  const updateStaffUser = (updatedUser: StaffUser) => {
    setStaffUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    addAuditLog('USER_UPDATED', `Admin updated staff profile: ${updatedUser.fullName}`, currentUser?.fullName || 'Admin');
  };

  const toggleStaffUserActive = (userId: string) => {
    setStaffUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextState = !u.active;
        addAuditLog(
          nextState ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
          `Admin ${nextState ? 'activated' : 'deactivated'} staff user ${u.username}`,
          currentUser?.fullName || 'Admin'
        );
        return { ...u, active: nextState };
      }
      return u;
    }));
  };

  const updatePricing = (newPricing: PricingMatrix) => {
    setPricing(newPricing);
    addAuditLog('PRICING_UPDATED', 'Administrator updated system pricing matrix', currentUser?.fullName || 'Admin');
  };

  const resetDatabase = () => {
    setOrders(INITIAL_ORDERS);
    setServices(INITIAL_SERVICES);
    setPricing(INITIAL_PRICING);
    setStaffUsers(INITIAL_STAFF);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem('qp_orders');
    localStorage.removeItem('qp_services');
    localStorage.removeItem('qp_pricing');
    localStorage.removeItem('qp_staff');
    localStorage.removeItem('qp_logs');
    addAuditLog('DATABASE_RESET', 'Sample database and test queue reset to clean seed state', 'System');
  };

  return (
    <PrintStoreContext.Provider value={{
      orders,
      services,
      pricing,
      staffUsers,
      auditLogs,
      currentUser,
      activePortal,
      selectedServiceForOrder,
      chimeEnabled,
      setActivePortal,
      setSelectedServiceForOrder,
      setChimeEnabled,
      loginUser,
      logoutUser,
      placeOrder,
      updateOrderStatus,
      recordPayment,
      releaseOrder,
      overrideOrderStatus,
      addService,
      updateService,
      deleteService,
      addStaffUser,
      updateStaffUser,
      toggleStaffUserActive,
      updatePricing,
      resetDatabase,
      calculatePrice
    }}>
      {children}
    </PrintStoreContext.Provider>
  );
};

export const usePrintStore = () => {
  const context = useContext(PrintStoreContext);
  if (!context) {
    throw new Error('usePrintStore must be used within a PrintStoreProvider');
  }
  return context;
};

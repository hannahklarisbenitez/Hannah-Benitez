import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Printer, 
  Tags, 
  Database, 
  FileSpreadsheet, 
  Download, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  Trash2,
  Edit2,
  UserX,
  UserCheck,
  Search,
  Eye,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { usePrintStore } from '../context/PrintStoreContext';
import { PrintingService, PricingMatrix, StaffUser, Order, OrderStatus, ServiceCategory } from '../types';

export const AdminConsole: React.FC = () => {
  const { 
    orders, 
    services, 
    pricing, 
    staffUsers, 
    auditLogs, 
    currentUser, 
    updatePricing, 
    addService, 
    updateService,
    deleteService,
    addStaffUser,
    updateStaffUser,
    toggleStaffUserActive,
    overrideOrderStatus,
    resetDatabase 
  } = usePrintStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'services' | 'pricing' | 'orders' | 'reports'>('analytics');

  // Pricing Form State
  const [paperSizes, setPaperSizes] = useState(pricing.paperSizeSurcharges);
  const [paperMaterials, setPaperMaterials] = useState(pricing.paperMaterialSurcharges);
  const [bindings, setBindings] = useState(pricing.bindingFees);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState(false);

  // New Service Modal State
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<PrintingService | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState<ServiceCategory>('documents');
  const [srvPrice, setSrvPrice] = useState<number>(30);
  const [srvUnit, setSrvUnit] = useState('per copy');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvImage, setSrvImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80');

  // Delete Service Confirmation Modal
  const [serviceToDelete, setServiceToDelete] = useState<PrintingService | null>(null);

  // User Modals State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [userFullName, setUserFullName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userRole, setUserRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [userContact, setUserContact] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Order Details Modal State
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Reports and Transactions Filter
  const [reportType, setReportType] = useState<'sales' | 'queue' | 'payment'>('sales');
  const [reportDateFrom, setReportDateFrom] = useState('2026-10-01');
  const [reportDateTo, setReportDateTo] = useState('2026-10-31');

  // Computations
  const totalGrossRevenue = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
  const totalRecordedOrders = orders.length;
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'COMPLETED').length;
  const activeQueueCount = orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING').length;
  const completionRate = totalRecordedOrders > 0 ? Math.round((completedOrdersCount / totalRecordedOrders) * 100) : 0;

  // Filtered Orders for Master Audit
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'ALL' && o.orderStatus !== orderStatusFilter) return false;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      return o.queueNumber.toLowerCase().includes(q) ||
        o.trackingCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.serviceName.toLowerCase().includes(q);
    }
    return true;
  });

  // Handle Save Pricing (Flowchart Node: Price Management -> Price Valid? -> Save)
  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricing({
      paperSizeSurcharges: paperSizes,
      paperMaterialSurcharges: paperMaterials,
      bindingFees: bindings,
      doubleSidedDiscountPerSheet: pricing.doubleSidedDiscountPerSheet
    });
    setPricingSuccessMsg(true);
    setTimeout(() => setPricingSuccessMsg(false), 3000);
  };

  // Flowchart Node: Printing Service Management (Add New Service / Edit Service Details)
  const handleSaveServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName.trim()) {
      alert('Service name is required.');
      return;
    }
    if (srvPrice <= 0) {
      alert('Price must be greater than zero.');
      return;
    }

    if (editingService) {
      updateService({
        ...editingService,
        name: srvName,
        category: srvCategory,
        categoryLabel: srvCategory.charAt(0).toUpperCase() + srvCategory.slice(1),
        basePrice: Number(srvPrice),
        unit: srvUnit,
        description: srvDesc,
        realisticImage: srvImage,
        gallery: [srvImage]
      });
      setEditingService(null);
    } else {
      addService({
        code: `SRV-${services.length + 1}`,
        name: srvName,
        category: srvCategory,
        categoryLabel: srvCategory.charAt(0).toUpperCase() + srvCategory.slice(1),
        basePrice: Number(srvPrice),
        unit: srvUnit,
        description: srvDesc,
        realisticImage: srvImage,
        gallery: [srvImage],
        turnaround: 'sameday',
        turnaroundLabel: 'Same Day Pickup',
        rating: 5.0,
        reviewsCount: 1,
        finishOptions: ['Standard Finish'],
        paperOptions: ['Standard Stock'],
        tags: ['New Service']
      });
      setShowAddServiceModal(false);
    }
    setSrvName('');
    setSrvDesc('');
  };

  const openEditService = (service: PrintingService) => {
    setEditingService(service);
    setSrvName(service.name);
    setSrvCategory(service.category);
    setSrvPrice(service.basePrice);
    setSrvUnit(service.unit);
    setSrvDesc(service.description);
    setSrvImage(service.realisticImage);
  };

  const handleConfirmDeleteService = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete.id);
      setServiceToDelete(null);
    }
  };

  // Flowchart Node: User Account Management (Add, Edit, Deactivate)
  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName.trim() || !userUsername.trim()) {
      alert('Full name and username are required.');
      return;
    }

    if (editingUser) {
      updateStaffUser({
        ...editingUser,
        fullName: userFullName,
        username: userUsername,
        role: userRole,
        contact: userContact,
        email: userEmail
      });
      setEditingUser(null);
    } else {
      addStaffUser({
        fullName: userFullName,
        username: userUsername,
        role: userRole,
        contact: userContact,
        email: userEmail,
        active: true
      });
      setShowAddUserModal(false);
    }
    setUserFullName('');
    setUserUsername('');
    setUserContact('');
    setUserEmail('');
  };

  const openEditUser = (user: StaffUser) => {
    setEditingUser(user);
    setUserFullName(user.fullName);
    setUserUsername(user.username);
    setUserRole(user.role);
    setUserContact(user.contact);
    setUserEmail(user.email);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ['Queue Number', 'Tracking Code', 'Customer', 'Contact', 'Service', 'Total Cost', 'Amount Paid', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.queueNumber,
      o.trackingCode,
      `"${o.customerName}"`,
      o.contactNumber,
      `"${o.serviceName}"`,
      o.totalAmount.toFixed(2),
      o.amountPaid.toFixed(2),
      o.orderStatus,
      o.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `QuickPrint_Orders_Audit_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#CB0404]/15 text-[#CB0404] font-bold text-xs uppercase tracking-wide">
              ADMINISTRATOR HUB
            </span>
            <span className="text-xs text-slate-400">• Flowchart Modules & Financial Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            System & Service Management Hub
          </h1>
        </div>

        {/* Sub-Nav */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'users', label: 'Staff Accounts', icon: Users },
            { id: 'services', label: 'Services Catalog', icon: Printer },
            { id: 'pricing', label: 'Price Matrix', icon: Tags },
            { id: 'orders', label: 'Master Orders', icon: Database },
            { id: 'reports', label: 'Official Reports', icon: FileSpreadsheet }
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
                    ? 'bg-[#CB0404] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block uppercase">Gross Revenue Collected</span>
          <span className="text-3xl font-black text-[#CB0404] font-mono mt-1 block">
            ₱{totalGrossRevenue.toFixed(2)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block uppercase">Total Jobs Recorded</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">
            {totalRecordedOrders}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block uppercase">Active Queue Load</span>
          <span className="text-3xl font-black text-[#309898] mt-1 block">
            {activeQueueCount}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-bold block uppercase">Handover Completion Rate</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">
            {completionRate}%
          </span>
        </div>
      </div>

      {/* ==============================================================
           TAB 1: ANALYTICS & CHARTS
           ============================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Revenue Trend Visual Bar Chart */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">7-Day Revenue & Transactions Trend</h3>
                  <span className="text-[11px] text-slate-400">Daily counter collections</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#F4631E]">
                  ₱{(totalGrossRevenue * 0.9).toFixed(2)} Weekly Average
                </span>
              </div>

              {/* Responsive Bar Visualizer */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {[
                  { day: 'Mon', amount: 820, height: '45%' },
                  { day: 'Tue', amount: 1140, height: '65%' },
                  { day: 'Wed', amount: 950, height: '52%' },
                  { day: 'Thu', amount: 1480, height: '80%' },
                  { day: 'Fri', amount: 1850, height: '100%' },
                  { day: 'Sat', amount: 1320, height: '72%' },
                  { day: 'Today', amount: totalGrossRevenue, height: '88%' }
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₱{bar.amount.toFixed(0)}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-40 flex items-end">
                      <div 
                        style={{ height: bar.height }}
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          i === 6 ? 'bg-gradient-to-t from-[#F4631E] to-[#FF9F00]' : 'bg-[#309898]'
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Breakdown */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Service Category Demand</h3>
                <span className="text-[11px] text-slate-400">Distribution by customer orders</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Documents & Thesis', pct: 42, color: 'bg-[#309898]' },
                  { label: 'Stickers & Product Labels', pct: 28, color: 'bg-[#F4631E]' },
                  { label: 'Photo Prints & Tiles', pct: 15, color: 'bg-[#FF9F00]' },
                  { label: 'Posters & Large Format', pct: 10, color: 'bg-[#CB0404]' },
                  { label: 'Custom Stationery & Merch', pct: 5, color: 'bg-indigo-600' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="font-mono font-bold text-slate-900">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Audit Logs Trail */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Live System Activity Audit Trail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3">Details</th>
                    <th className="py-2.5 px-3">Actor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.slice(0, 10).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#309898]">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-700">{log.details}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{log.actor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
           TAB 2: USER ACCOUNT MANAGEMENT (Add, Edit, Deactivate)
           ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base">User Account Management</h3>
              <p className="text-xs text-slate-500">Add staff accounts, edit user details, or deactivate accounts per flowchart.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setUserFullName('');
                setUserUsername('');
                setUserRole('STAFF');
                setUserContact('');
                setUserEmail('');
                setShowAddUserModal(true);
              }}
              className="px-4 py-2 bg-[#CB0404] hover:bg-[#B00303] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Account</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Full Name & Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-400">{user.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{user.fullName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">@{user.username}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.role === 'ADMIN' ? 'bg-[#CB0404]/10 text-[#CB0404]' : 'bg-[#309898]/10 text-[#309898]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{user.contact}</td>
                    <td className="py-3 px-4 text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {user.active ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditUser(user)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                          title="Edit user details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStaffUserActive(user.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.active ? 'Deactivate account' : 'Reactivate account'}
                        >
                          {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
           TAB 3: SERVICES CATALOG (Add, Edit, Remove)
           ============================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Printing Service Management</h3>
              <p className="text-xs text-slate-500">Add new service, edit details, or remove service per flowchart.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingService(null);
                setSrvName('');
                setSrvCategory('documents');
                setSrvPrice(30);
                setSrvUnit('per copy');
                setSrvDesc('');
                setShowAddServiceModal(true);
              }}
              className="px-4 py-2 bg-[#F4631E] hover:bg-[#E64A19] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group">
                <div className="relative h-36 w-full">
                  <img src={s.realisticImage} alt={s.name} className="h-full w-full object-cover" />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => openEditService(s)}
                      className="p-1 text-white hover:text-[#FF9F00]"
                      title="Edit service details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceToDelete(s)}
                      className="p-1 text-white hover:text-red-400"
                      title="Remove service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#309898]">{s.categoryLabel}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{s.name}</h4>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{s.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-mono font-bold text-[#F4631E] text-sm">
                      ₱{s.basePrice.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans font-normal">/{s.unit}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">{s.turnaroundLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
           TAB 4: PRICING MATRIX CONFIGURATION
           ============================================================== */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Price Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select printing service rates & surcharges, validate prices, and save changes across the system.
            </p>
          </div>

          {pricingSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pricing matrix updated and synchronized successfully!</span>
            </div>
          )}

          <form onSubmit={handleSavePricing} className="space-y-6 text-xs">
            {/* Paper Sizes */}
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
                Paper Size Surcharges (₱ per sheet)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Short / Letter</label>
                  <input 
                    type="number"
                    step="0.25"
                    value={paperSizes.short}
                    onChange={(e) => setPaperSizes({ ...paperSizes, short: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">A4 Standard</label>
                  <input 
                    type="number"
                    step="0.25"
                    value={paperSizes.a4}
                    onChange={(e) => setPaperSizes({ ...paperSizes, a4: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Long / Legal</label>
                  <input 
                    type="number"
                    step="0.25"
                    value={paperSizes.long}
                    onChange={(e) => setPaperSizes({ ...paperSizes, long: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">A3 Tabloid</label>
                  <input 
                    type="number"
                    step="0.50"
                    value={paperSizes.a3}
                    onChange={(e) => setPaperSizes({ ...paperSizes, a3: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Paper Materials */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
                Paper Material Surcharges (₱ per sheet)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">80gsm Book Paper</label>
                  <input 
                    type="number"
                    step="0.25"
                    value={paperMaterials.book80}
                    onChange={(e) => setPaperMaterials({ ...paperMaterials, book80: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Glossy Photo 230gsm</label>
                  <input 
                    type="number"
                    step="1.00"
                    value={paperMaterials.glossyPhoto}
                    onChange={(e) => setPaperMaterials({ ...paperMaterials, glossyPhoto: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Matte Cardstock 250gsm</label>
                  <input 
                    type="number"
                    step="1.00"
                    value={paperMaterials.matteCardstock}
                    onChange={(e) => setPaperMaterials({ ...paperMaterials, matteCardstock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Binding Fees */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
                Finishing & Binding Fees (₱ per unit)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Ring / Spiral Bind</label>
                  <input 
                    type="number"
                    value={bindings.ring}
                    onChange={(e) => setBindings({ ...bindings, ring: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Soft Bind (PVC)</label>
                  <input 
                    type="number"
                    value={bindings.soft}
                    onChange={(e) => setBindings({ ...bindings, soft: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Hardbound Gold Foil</label>
                  <input 
                    type="number"
                    value={bindings.hard}
                    onChange={(e) => setBindings({ ...bindings, hard: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Lamination Sheet</label>
                  <input 
                    type="number"
                    value={bindings.laminate}
                    onChange={(e) => setBindings({ ...bindings, laminate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#F4631E] hover:bg-[#E64A19] text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Save Updated Price
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================================
           TAB 5: ORDER MANAGEMENT (View All Orders, Search, Review)
           ============================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Order Management</h3>
              <p className="text-xs text-slate-500">View all printing orders, search, filter, and review details per flowchart.</p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by queue #, customer, or service..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#309898]"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
              <span className="text-slate-400">Status:</span>
              {['ALL', 'PENDING', 'PROCESSING', 'READY', 'COMPLETED'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    orderStatusFilter === st
                      ? 'bg-[#309898] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Queue #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Total Cost</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#F4631E]">{o.queueNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{o.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{o.serviceName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.orderStatus === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                        o.orderStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        o.orderStatus === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">₱{o.totalAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600">₱{o.amountPaid.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {o.createdAt.substring(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setViewingOrder(o)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
           TAB 6: REPORTS & TRANSACTIONS (Select Type, Range, Generate)
           ============================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reports and Transactions Module</h3>
                <p className="text-xs text-slate-500">Flowchart workflow: Select Report Type → Select Date Range → Generate Report</p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#242B33] hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Sheet</span>
              </button>
            </div>

            {/* Filter Controls: Report Type & Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Report Type</label>
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="sales">Gross Sales & Daily Revenue</option>
                  <option value="queue">Queue Volume & Order Turnaround</option>
                  <option value="payment">Payment & Cashier Settlement Ledger</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date Range (From)</label>
                <input 
                  type="date"
                  value={reportDateFrom}
                  onChange={(e) => setReportDateFrom(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date Range (To)</label>
                <input 
                  type="date"
                  value={reportDateTo}
                  onChange={(e) => setReportDateTo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Official Report Card with Signatory lines */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <span className="font-mono text-[10px] uppercase text-slate-400 tracking-wider">OFFICIAL SYSTEM REPORT</span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">QuickPrint Hub Queue & Financial Audit</h2>
                <span className="text-slate-500 text-[11px]">
                  Report Type: <b className="uppercase">{reportType}</b> • Date Filter: {reportDateFrom} to {reportDateTo}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">TOTAL REVENUE</span>
                  <span className="text-xl font-black font-mono text-[#CB0404]">₱{totalGrossRevenue.toFixed(2)}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">COMPLETED JOBS</span>
                  <span className="text-xl font-black text-slate-800">{completedOrdersCount}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">OUTSTANDING BALANCES</span>
                  <span className="text-xl font-black font-mono text-emerald-600">
                    ₱{orders.reduce((sum, o) => sum + Math.max(0, o.totalAmount - o.amountPaid), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-slate-600">
                <div>
                  <div className="border-b border-slate-400 w-44 mx-auto mb-1"></div>
                  <span className="font-bold text-slate-800 block">Maria Santos</span>
                  <span className="text-[10px] text-slate-400">Shop Counter Cashier</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-44 mx-auto mb-1"></div>
                  <span className="font-bold text-slate-800 block">Engr. David Ramos</span>
                  <span className="text-[10px] text-slate-400">System Administrator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Reset */}
          <div className="p-6 bg-red-50/70 border border-red-200 rounded-3xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-red-900 text-sm">Demo Data & Queue Reset</h4>
              <p className="text-xs text-red-700 mt-0.5">
                Restore initial seed orders (Q-101, Q-102, Q-103), pricing matrix, and catalog items.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all orders and queue tickets to demo seed data?')) {
                  resetDatabase();
                  alert('Database reset to clean sample state.');
                }
              }}
              className="px-4 py-2 bg-[#CB0404] hover:bg-[#B00303] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Sample DB</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SERVICE */}
      {(showAddServiceModal || editingService) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {editingService ? 'Edit Service Details' : 'Add New Printing Service'}
            </h3>
            <form onSubmit={handleSaveServiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                <input 
                  type="text" 
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="e.g. Spiral Bound Course Packs"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select 
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="documents">Documents & Thesis</option>
                    <option value="photos">Photo & Framing</option>
                    <option value="posters">Posters & Banners</option>
                    <option value="marketing">Marketing & Business</option>
                    <option value="custom">Custom Gifts</option>
                    <option value="architectural">Architectural</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price (₱) *</label>
                  <input 
                    type="number"
                    step="0.50"
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Label</label>
                <input 
                  type="text" 
                  value={srvUnit}
                  onChange={(e) => setSrvUnit(e.target.value)}
                  placeholder="per page / per sheet"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Realistic Picture URL</label>
                <input 
                  type="text"
                  value={srvImage}
                  onChange={(e) => setSrvImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  placeholder="Details about this printing offering..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddServiceModal(false);
                    setEditingService(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#F4631E] hover:bg-[#E64A19] text-white font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REMOVE SERVICE CONFIRMATION */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Confirm Service Removal</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove <b>{serviceToDelete.name}</b> from the catalog? This matches the flowchart decision <i>Confirm Removal?</i>
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                No, Keep Service
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteService}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STAFF USER */}
      {(showAddUserModal || editingUser) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {editingUser ? 'Edit Staff Information' : 'Add Staff Account'}
            </h3>
            <form onSubmit={handleSaveUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input 
                  type="text"
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder="e.g. John Santos"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input 
                    type="text"
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="jsantos"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select 
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="STAFF">Staff / Cashier</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact No.</label>
                  <input 
                    type="text"
                    value={userContact}
                    onChange={(e) => setUserContact(e.target.value)}
                    placeholder="09XX-XXX-XXXX"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input 
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="staff@quickprint.hub"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#CB0404] hover:bg-[#B00303] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ORDER DETAILS (FLOWCHART: View Order Details -> Review Order Status) */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Order Specifications & Review</h3>
                <span className="text-[11px] text-slate-400 font-mono">{viewingOrder.trackingCode}</span>
              </div>
              <span className="text-2xl font-black font-mono text-[#F4631E]">{viewingOrder.queueNumber}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between"><span>Customer:</span><b>{viewingOrder.customerName} ({viewingOrder.contactNumber})</b></div>
              <div className="flex justify-between"><span>Service:</span><span className="text-[#309898] font-bold">{viewingOrder.serviceName}</span></div>
              <div className="flex justify-between"><span>Specifications:</span><span>{viewingOrder.pageCount} pgs × {viewingOrder.copiesCount} set ({viewingOrder.paperSize.toUpperCase()})</span></div>
              <div className="flex justify-between"><span>Binding:</span><span>{viewingOrder.binding.toUpperCase()}</span></div>
              <div className="flex justify-between"><span>Total Cost:</span><span className="font-mono font-bold">₱{viewingOrder.totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Amount Paid:</span><span className="font-mono text-emerald-600">₱{viewingOrder.amountPaid.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Payment Status:</span><b className="uppercase">{viewingOrder.paymentStatus}</b></div>
              {viewingOrder.specialInstructions && (
                <div className="pt-1 text-slate-500 italic">Notes: "{viewingOrder.specialInstructions}"</div>
              )}
            </div>

            {/* Status Override / Review Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Status Review</label>
              <select
                value={viewingOrder.orderStatus}
                onChange={(e) => {
                  overrideOrderStatus(viewingOrder.id, e.target.value as OrderStatus, 'Admin console review');
                  setViewingOrder({ ...viewingOrder, orderStatus: e.target.value as OrderStatus });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="READY">READY FOR PICKUP</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#242B33] text-white font-bold text-xs"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

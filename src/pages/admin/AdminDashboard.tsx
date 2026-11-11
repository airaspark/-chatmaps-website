import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService, AdminStats } from '../../services/adminService';
import { Vendor, UserProfile, VendorApprovalStatus } from '../../types';
import { VendorMap } from '../../components/map/VendorMap';
import {
  LayoutDashboard,
  Store,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Power,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  Menu,
  X,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Ban,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { userProfile, role, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'stalls' | 'customers' | 'map'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<AdminStats>({
    totalCustomers: 0,
    totalVendors: 0,
    pendingApprovals: 0,
    approvedVendors: 0,
    rejectedVendors: 0,
    suspendedVendors: 0,
    activeStalls: 0,
    closedStalls: 0
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [vendorFilterStatus, setVendorFilterStatus] = useState<string>('all');
  const [vendorSearch, setVendorSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedMapVendor, setSelectedMapVendor] = useState<Vendor | null>(null);

  // Modal states for actions
  const [selectedVendorForAction, setSelectedVendorForAction] = useState<Vendor | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'delete' | 'edit' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Edit vendor modal form state
  const [editShopName, setEditShopName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPriceRange, setEditPriceRange] = useState<'₹' | '₹₹' | '₹₹₹'>('₹');

  // Customer action modal
  const [selectedCustomerForAction, setSelectedCustomerForAction] = useState<UserProfile | null>(null);
  const [customerActionType, setCustomerActionType] = useState<'suspend' | 'delete' | null>(null);

  // Load all admin data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, vList, cList] = await Promise.all([
        adminService.getStats(),
        adminService.getAllVendors(),
        adminService.getAllCustomers()
      ]);
      setStats(s);
      setVendors(vList);
      setCustomers(cList);
      if (vList.length > 0 && !selectedMapVendor) {
        setSelectedMapVendor(vList.find(v => v.status === 'approved') || vList[0]);
      }
    } catch (err) {
      console.warn('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Role verification
    if (!userProfile || (userProfile.role !== 'admin' && role !== 'admin') || userProfile.status === 'suspended') {
      navigate('/admin', { replace: true });
      return;
    }
    fetchData();
  }, [userProfile, role, navigate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(curr => (curr === msg ? null : curr));
    }, 3500);
  };

  // Actions on Vendors
  const handleApprove = async () => {
    if (!selectedVendorForAction) return;
    setIsSubmittingAction(true);
    try {
      await adminService.approveVendor(selectedVendorForAction.id);
      showToast(`Approved "${selectedVendorForAction.shopName}". Now visible to customers.`);
      closeModals();
      await fetchData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to approve vendor.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVendorForAction) return;
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason for the vendor.');
      return;
    }
    setIsSubmittingAction(true);
    try {
      await adminService.rejectVendor(selectedVendorForAction.id, rejectionReason.trim());
      showToast(`Rejected "${selectedVendorForAction.shopName}".`);
      closeModals();
      await fetchData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to reject vendor.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (!selectedVendorForAction) return;
    setIsSubmittingAction(true);
    try {
      await adminService.toggleVendorSuspension(selectedVendorForAction.id, selectedVendorForAction.status);
      const isNowSuspended = selectedVendorForAction.status !== 'suspended';
      showToast(`${isNowSuspended ? 'Suspended' : 'Reactivated'} "${selectedVendorForAction.shopName}".`);
      closeModals();
      await fetchData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update vendor status.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDeleteStall = async () => {
    if (!selectedVendorForAction) return;
    setIsSubmittingAction(true);
    try {
      await adminService.deleteStall(selectedVendorForAction.id);
      showToast(`Listing "${selectedVendorForAction.shopName}" removed.`);
      closeModals();
      await fetchData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete stall listing.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForAction) return;
    setIsSubmittingAction(true);
    try {
      await adminService.editStallDetails(selectedVendorForAction.id, {
        shopName: editShopName,
        ownerName: editOwnerName,
        phone: editPhone,
        category: editCategory,
        address: editAddress,
        priceRange: editPriceRange
      });
      showToast(`Updated details for "${editShopName}".`);
      closeModals();
      await fetchData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to edit stall.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleToggleAvailability = async (vendor: Vendor) => {
    const nextState = !vendor.isOpen;
    try {
      await adminService.updateStallAvailability(vendor.id, nextState);
      showToast(`"${vendor.shopName}" marked as ${nextState ? 'OPEN' : 'CLOSED'}.`);
      await fetchData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to toggle availability.');
    }
  };

  // Actions on Customers
  const handleToggleCustomerSuspend = async () => {
    if (!selectedCustomerForAction) return;
    setIsSubmittingAction(true);
    try {
      await adminService.toggleCustomerSuspension(selectedCustomerForAction.uid, selectedCustomerForAction.status);
      showToast(`Customer account updated.`);
      closeModals();
      await fetchData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update customer account.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomerForAction) return;
    setIsSubmittingAction(true);
    try {
      await adminService.deleteCustomer(selectedCustomerForAction.uid);
      showToast(`Customer account deleted.`);
      closeModals();
      await fetchData();
    } catch (e: any) {
      showToast(e?.message || 'Failed to delete customer.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const openEditModal = (vendor: Vendor) => {
    setSelectedVendorForAction(vendor);
    setEditShopName(vendor.shopName);
    setEditOwnerName(vendor.ownerName);
    setEditPhone(vendor.phone);
    setEditCategory(vendor.category);
    setEditAddress(vendor.address);
    setEditPriceRange(vendor.priceRange || '₹');
    setActionType('edit');
  };

  const closeModals = () => {
    setSelectedVendorForAction(null);
    setSelectedCustomerForAction(null);
    setActionType(null);
    setCustomerActionType(null);
    setRejectionReason('');
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to exit the Admin Portal?')) {
      await logout();
      navigate('/admin', { replace: true });
    }
  };

  // Filtered lists
  const filteredVendors = vendors.filter(v => {
    const matchesStatus =
      vendorFilterStatus === 'all' ||
      (vendorFilterStatus === 'pending' && v.status === 'pending') ||
      (vendorFilterStatus === 'approved' && v.status === 'approved') ||
      (vendorFilterStatus === 'rejected' && v.status === 'rejected') ||
      (vendorFilterStatus === 'suspended' && v.status === 'suspended');

    const q = vendorSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.shopName.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q) ||
      v.phone.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase().trim();
    return (
      !q ||
      c.displayName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const approvedVendorsForMap = vendors.filter(v => v.status === 'approved');

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-stone-100 flex flex-col md:flex-row antialiased selection:bg-orange-600 selection:text-white">
      {/* Toast alert message */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 border border-orange-500/50 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="md:hidden bg-[#141414] border-b border-stone-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h1 className="font-black text-sm text-white tracking-tight">ChatMaps Admin</h1>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 text-stone-400 hover:text-rose-400 transition"
          title="Logout"
        >
          <Power className="w-4 h-4" />
        </button>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 md:z-10 w-64 bg-[#141414] border-r border-stone-800/90 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Close on mobile */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-orange-600/30">
                CM
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white tracking-tight">ChatMaps</h2>
                <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 block">
                  Admin Console
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              {
                id: 'vendors',
                label: 'Vendor Applications',
                icon: Store,
                badge: stats.pendingApprovals > 0 ? stats.pendingApprovals : undefined
              },
              { id: 'stalls', label: 'Stall Management', icon: SlidersHorizontal },
              { id: 'customers', label: 'Customer Accounts', icon: Users },
              { id: 'map', label: 'Live Stall Map', icon: Compass }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition active:scale-98 ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Admin profile & logout */}
        <div className="p-4 border-t border-stone-800 space-y-3 bg-[#111111]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-xs text-orange-400">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-white truncate">
                {userProfile?.displayName || 'Administrator'}
              </p>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active Governance
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-rose-950/60 hover:text-rose-300 text-stone-400 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header with Tab Title and Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight capitalize">
              {activeTab === 'overview' && 'Platform Overview & Governance'}
              {activeTab === 'vendors' && 'Vendor Verification & Applications'}
              {activeTab === 'stalls' && 'Street Stall Directory & Availability'}
              {activeTab === 'customers' && 'Customer Management & Access'}
              {activeTab === 'map' && 'Live Street Stalls Map View'}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              ChatMaps internal administration console
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white text-xs font-bold transition active:scale-95"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: OVERVIEW DASHBOARD
            ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Pending Applications Alert Banner */}
            {stats.pendingApprovals > 0 && (
              <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-stone-900 border border-amber-600/40 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-900/10">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      {stats.pendingApprovals} Vendor Application{stats.pendingApprovals > 1 ? 's' : ''} Awaiting Review
                    </h3>
                    <p className="text-xs text-stone-300 mt-0.5">
                      New street food stalls will remain hidden from the customer explore feed until verified by an administrator.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('vendors');
                    setVendorFilterStatus('pending');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition shrink-0"
                >
                  Review Applications
                </button>
              </div>
            )}

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-stone-800/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Registered Customers
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalCustomers}</div>
                <p className="text-[10px] text-stone-500">Verified food lovers</p>
              </div>

              <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-stone-800/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Total Vendors
                </span>
                <div className="text-2xl sm:text-3xl font-black text-orange-500">{stats.totalVendors}</div>
                <p className="text-[10px] text-stone-500">All applications</p>
              </div>

              <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-stone-800/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Pending Approvals
                </span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">{stats.pendingApprovals}</div>
                <p className="text-[10px] text-stone-500">Awaiting review</p>
              </div>

              <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-stone-800/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Approved Vendors
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.approvedVendors}</div>
                <p className="text-[10px] text-stone-500">Active public listings</p>
              </div>

              <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-stone-800/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Rejected Applications
                </span>
                <div className="text-2xl sm:text-3xl font-black text-rose-400">{stats.rejectedVendors}</div>
                <p className="text-[10px] text-stone-500">Declined registrations</p>
              </div>

              <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-stone-800/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Suspended Vendors
                </span>
                <div className="text-2xl sm:text-3xl font-black text-stone-300">{stats.suspendedVendors}</div>
                <p className="text-[10px] text-stone-500">Temporarily disabled</p>
              </div>

              <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-stone-800/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Active Stalls
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.activeStalls}</div>
                <p className="text-[10px] text-stone-500">Open for business now</p>
              </div>

              <div className="bg-[#141414] rounded-2xl p-4 sm:p-5 border border-stone-800/90 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Closed Stalls
                </span>
                <div className="text-2xl sm:text-3xl font-black text-stone-400">{stats.closedStalls}</div>
                <p className="text-[10px] text-stone-500">Currently shut</p>
              </div>
            </div>

            {/* Quick Action Tables in Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Recent Pending Applications */}
              <div className="bg-[#141414] rounded-3xl p-5 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Recent Applications</span>
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab('vendors');
                      setVendorFilterStatus('pending');
                    }}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300"
                  >
                    View All
                  </button>
                </div>

                {vendors.filter(v => v.status === 'pending').length === 0 ? (
                  <p className="text-xs text-stone-500 py-6 text-center">
                    No pending vendor applications. All current stalls are reviewed!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {vendors.filter(v => v.status === 'pending').slice(0, 3).map(v => (
                      <div
                        key={v.id}
                        className="p-3 bg-stone-900 rounded-2xl border border-stone-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">{v.shopName}</h4>
                          <p className="text-[11px] text-stone-400 truncate">
                            {v.ownerName} • {v.phone} • {v.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedVendorForAction(v);
                              setActionType('approve');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVendorForAction(v);
                              setActionType('reject');
                            }}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-rose-900 text-stone-300 hover:text-white font-bold text-[11px] rounded-lg"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Platform Security & Health */}
              <div className="bg-[#141414] rounded-3xl p-5 border border-stone-800 space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Platform Security Status</span>
                </h3>
                <div className="space-y-3 text-xs text-stone-300">
                  <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Role-Based Access Control</span>
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        Enforced
                      </span>
                    </div>
                    <p className="text-stone-400 text-[11px]">
                      Firestore Security Rules enforce that unapproved vendors are hidden from public queries.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Google Maps POI Suppression</span>
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        Active
                      </span>
                    </div>
                    <p className="text-stone-400 text-[11px]">
                      Map ID <code className="text-orange-400 font-mono text-[10px]">a54c70146c10e24ca6df8436</code> displays verified ChatMaps vendors only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: VENDOR MANAGEMENT & APPLICATIONS
            ======================================================== */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Search vendor by name, owner, phone, address..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] border border-stone-800 text-xs font-semibold text-white outline-none focus:border-orange-500"
                />
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'approved', label: 'Approved' },
                  { id: 'rejected', label: 'Rejected' },
                  { id: 'suspended', label: 'Suspended' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setVendorFilterStatus(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                      vendorFilterStatus === st.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-[#141414] text-stone-400 border border-stone-800 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendors List Cards */}
            <div className="space-y-3">
              {filteredVendors.length === 0 ? (
                <div className="bg-[#141414] rounded-3xl p-12 text-center border border-stone-800">
                  <Store className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                  <p className="text-xs text-stone-400">No vendors found matching current filter.</p>
                </div>
              ) : (
                filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="bg-[#141414] rounded-3xl p-5 border border-stone-800/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Thumbnail and Details */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shrink-0">
                        <img
                          src={vendor.bannerImage || vendor.photos[0]}
                          alt={vendor.shopName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-sm sm:text-base text-white">
                            {vendor.shopName}
                          </h3>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              vendor.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : vendor.status === 'pending'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                                : vendor.status === 'suspended'
                                ? 'bg-stone-800 text-stone-300 border border-stone-700'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {vendor.status}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            vendor.isOpen ? 'bg-emerald-900/40 text-emerald-300' : 'bg-stone-900 text-stone-500'
                          }`}>
                            {vendor.isOpen ? 'Open Now' : 'Closed'}
                          </span>
                        </div>

                        <p className="text-xs text-stone-300 font-medium">
                          Owner: <strong>{vendor.ownerName}</strong> • {vendor.category} • Price: {vendor.priceRange || '₹'}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-stone-400 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-orange-400" />
                            <span>{vendor.phone}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-orange-400" />
                            <span>{vendor.address}, {vendor.city}</span>
                          </span>
                        </div>

                        {vendor.rejectionReason && (
                          <p className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-xl border border-rose-900/50 mt-1">
                            <strong>Rejection Note:</strong> {vendor.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Moderation Actions */}
                    <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                      {vendor.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedVendorForAction(vendor);
                              setActionType('approve');
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVendorForAction(vendor);
                              setActionType('reject');
                            }}
                            className="px-3.5 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-bold text-xs rounded-xl transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {vendor.status === 'approved' && (
                        <button
                          onClick={() => {
                            setSelectedVendorForAction(vendor);
                            setActionType('suspend');
                          }}
                          className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold text-xs rounded-xl border border-stone-800 transition"
                        >
                          Suspend
                        </button>
                      )}

                      {vendor.status === 'suspended' && (
                        <button
                          onClick={() => {
                            setSelectedVendorForAction(vendor);
                            setActionType('suspend');
                          }}
                          className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-800 transition"
                        >
                          Reactivate
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(vendor)}
                        className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVendorForAction(vendor);
                          setActionType('delete');
                        }}
                        className="p-2 rounded-xl bg-stone-900 hover:bg-rose-950/60 text-stone-400 hover:text-rose-400 border border-stone-800"
                        title="Remove Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: STALL MANAGEMENT & AVAILABILITY
            ======================================================== */}
        {activeTab === 'stalls' && (
          <div className="space-y-4">
            <div className="bg-[#141414] rounded-3xl p-5 border border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white">Live Stall Directory</h3>
                <p className="text-xs text-stone-400">
                  Toggle stall availability in real-time or edit street location information.
                </p>
              </div>
              <span className="text-xs font-black text-orange-500 bg-orange-950/40 px-3 py-1 rounded-full border border-orange-800">
                {vendors.length} Total Stalls
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendors.map((stall) => (
                <div
                  key={stall.id}
                  className="bg-[#141414] rounded-3xl p-5 border border-stone-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">
                          {stall.category}
                        </span>
                        <h4 className="font-black text-base text-white">{stall.shopName}</h4>
                        <p className="text-xs text-stone-400">{stall.address}, {stall.city}</p>
                      </div>

                      {/* Live Open / Closed Switch Button */}
                      <button
                        onClick={() => handleToggleAvailability(stall)}
                        className={`px-3 py-1.5 rounded-full text-xs font-black transition flex items-center gap-1.5 shadow-xs ${
                          stall.isOpen
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
                        }`}
                        title="Toggle Stall Availability"
                      >
                        <span className={`w-2 h-2 rounded-full ${stall.isOpen ? 'bg-white animate-pulse' : 'bg-stone-500'}`} />
                        <span>{stall.isOpen ? 'OPEN' : 'CLOSED'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
                      <span>Owner: <strong>{stall.ownerName}</strong></span>
                      <span>Status: <strong className="capitalize">{stall.status}</strong></span>
                      <span>Rating: ★{stall.rating}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${stall.location.lat},${stall.location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(stall)}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVendorForAction(stall);
                          setActionType('delete');
                        }}
                        className="p-1.5 rounded-xl bg-stone-900 hover:bg-rose-900/60 text-stone-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: CUSTOMER MANAGEMENT
            ======================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            {/* Customer Search Bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers by name, email, city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] border border-stone-800 text-xs font-semibold text-white outline-none focus:border-orange-500"
              />
            </div>

            {/* Customers Table / Cards */}
            <div className="bg-[#141414] rounded-3xl border border-stone-800 overflow-hidden">
              <div className="p-4 border-b border-stone-800 flex items-center justify-between text-xs font-bold text-stone-400">
                <span>Registered Customer Accounts ({filteredCustomers.length})</span>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="p-10 text-center text-xs text-stone-500">
                  No customers found matching search criteria.
                </div>
              ) : (
                <div className="divide-y divide-stone-800/80">
                  {filteredCustomers.map((cust) => (
                    <div
                      key={cust.uid}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-900/40 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{cust.displayName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              cust.status === 'suspended'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {cust.status === 'suspended' ? 'Suspended' : 'Active'}
                          </span>
                        </div>

                        <p className="text-xs text-stone-400">
                          {cust.email} • {cust.phone || 'No phone'} • City: {cust.city || 'Bangalore'}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Dietary: <span className="capitalize font-semibold text-stone-400">{cust.dietaryPreference || 'All'}</span> • Joined: {new Date(cust.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setSelectedCustomerForAction(cust);
                            setCustomerActionType('suspend');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            cust.status === 'suspended'
                              ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                              : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                          }`}
                        >
                          {cust.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomerForAction(cust);
                            setCustomerActionType('delete');
                          }}
                          className="p-2 rounded-xl bg-stone-900 hover:bg-rose-950/60 text-stone-400 hover:text-rose-400 border border-stone-800 transition"
                          title="Delete Customer Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: LIVE STALL MAP VIEW
            ======================================================== */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-[#141414] rounded-3xl p-5 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-white">Live Stall Geographic Map</h3>
                <p className="text-xs text-stone-400">
                  Inspect all {approvedVendorsForMap.length} approved street stalls with ChatMaps custom orange pins.
                </p>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800 font-bold">
                Map ID: a54c70146c10e24ca6df8436
              </span>
            </div>

            <div className="h-[600px] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl relative">
              <VendorMap
                vendors={approvedVendorsForMap}
                selectedVendor={selectedMapVendor}
                onSelectVendor={setSelectedMapVendor}
                className="h-full w-full"
                showCardOverlay={true}
              />
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          CONFIRMATION & ACTION MODALS
          ======================================================== */}

      {/* 1. Approve Vendor Modal */}
      {actionType === 'approve' && selectedVendorForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-3xl p-6 max-w-sm w-full border border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>Approve Stall Application</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to approve <strong>{selectedVendorForAction.shopName}</strong>? It will immediately appear on the public explore feed and live map.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={closeModals}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:bg-stone-900"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingAction}
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
              >
                {isSubmittingAction ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reject Vendor Modal */}
      {actionType === 'reject' && selectedVendorForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-3xl p-6 max-w-sm w-full border border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-base">
              <XCircle className="w-5 h-5" />
              <span>Reject Application</span>
            </div>
            <p className="text-xs text-stone-300">
              Please provide a clear reason for rejecting <strong>{selectedVendorForAction.shopName}</strong>:
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Inaccurate stall coordinates, missing phone contact, unclear food photo..."
              className="w-full p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs font-medium text-white outline-none focus:border-rose-500"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={closeModals}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:bg-stone-900"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingAction}
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
              >
                {isSubmittingAction ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Suspend / Reactivate Vendor Modal */}
      {actionType === 'suspend' && selectedVendorForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-3xl p-6 max-w-sm w-full border border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-base">
              <Ban className="w-5 h-5" />
              <span>{selectedVendorForAction.status === 'suspended' ? 'Reactivate Vendor' : 'Suspend Vendor'}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {selectedVendorForAction.status === 'suspended'
                ? `Reactivate ${selectedVendorForAction.shopName}? It will become visible on the public map again.`
                : `Suspend ${selectedVendorForAction.shopName}? It will be hidden from customer explore and live map immediately.`}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={closeModals}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:bg-stone-900"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingAction}
                onClick={handleToggleSuspend}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md"
              >
                {isSubmittingAction ? 'Processing...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Stall Listing Modal */}
      {actionType === 'delete' && selectedVendorForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-3xl p-6 max-w-sm w-full border border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-500 font-extrabold text-base">
              <Trash2 className="w-5 h-5" />
              <span>Remove Listing</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to permanently remove <strong>{selectedVendorForAction.shopName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={closeModals}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:bg-stone-900"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingAction}
                onClick={handleDeleteStall}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
              >
                {isSubmittingAction ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Vendor Details Modal */}
      {actionType === 'edit' && selectedVendorForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] rounded-3xl p-6 max-w-md w-full border border-stone-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="font-extrabold text-base text-white">Edit Stall Details</h3>
              <button onClick={closeModals} className="p-1 text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Shop Name</label>
                <input
                  type="text"
                  required
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-semibold outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={editOwnerName}
                  onChange={(e) => setEditOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-semibold outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-semibold outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Food Category</label>
                <input
                  type="text"
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-semibold outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Stall Address</label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-semibold outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Price Range</label>
                <select
                  value={editPriceRange}
                  onChange={(e) => setEditPriceRange(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-semibold outline-none focus:border-orange-500"
                >
                  <option value="₹">₹ (Budget-friendly street bite, &lt; ₹100)</option>
                  <option value="₹₹">₹₹ (Moderate platter, ₹100 - ₹250)</option>
                  <option value="₹₹₹">₹₹₹ (Premium artisan street meal)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 rounded-xl font-semibold text-stone-400 hover:bg-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="px-4 py-2 rounded-xl font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md"
                >
                  {isSubmittingAction ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Customer Action Modal (Suspend / Delete) */}
      {customerActionType && selectedCustomerForAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-3xl p-6 max-w-sm w-full border border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-base">
              {customerActionType === 'delete' ? <Trash2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
              <span>{customerActionType === 'delete' ? 'Delete Customer Account' : 'Change Account Status'}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {customerActionType === 'delete'
                ? `Permanently delete account for ${selectedCustomerForAction.displayName} (${selectedCustomerForAction.email})?`
                : `${selectedCustomerForAction.status === 'suspended' ? 'Reactivate' : 'Suspend'} account for ${selectedCustomerForAction.displayName}?`}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={closeModals}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:bg-stone-900"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingAction}
                onClick={customerActionType === 'delete' ? handleDeleteCustomer : handleToggleCustomerSuspend}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md ${
                  customerActionType === 'delete' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-orange-600 hover:bg-orange-500'
                }`}
              >
                {isSubmittingAction ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

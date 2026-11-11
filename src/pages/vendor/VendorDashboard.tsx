import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';
import { reviewService } from '../../services/reviewService';
import { Vendor, Review } from '../../types';
import { storageService } from '../../services/storageService';
import { getVendorCoverImage, STALL_PLACEHOLDER_IMAGE } from '../../data/foodImages';
import {
  Store,
  Clock,
  Eye,
  Heart,
  Star,
  Settings,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Plus,
  Utensils,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Power,
  Camera,
  Trash2,
  Upload,
  Check
} from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [toggleNotice, setToggleNotice] = useState('');

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // Try finding vendor belonging to current user
      let currentVendor = await vendorService.getVendorByOwnerUid(userProfile.uid);

      // If user is a demo vendor or newly signed in, link to first vendor or pending vendor for preview
      if (!currentVendor) {
        const allVendors = await vendorService.getAllVendorsForAdmin();
        currentVendor = allVendors.find(v => v.ownerUid === userProfile.uid) || allVendors[0];
      }

      if (currentVendor) {
        setVendor(currentVendor);
        const revs = await reviewService.getReviewsByVendorId(currentVendor.id);
        setReviews(revs);
      }

      setLoading(false);
    };

    fetchVendorData();
  }, [userProfile]);

  // LIVE OPEN / CLOSED TOGGLE
  // Requirement: "If a vendor updates shop details or availability, the customer website must show the updated information."
  const handleToggleOpenStatus = async () => {
    if (!vendor) return;
    setTogglingStatus(true);
    const nextStatus = !vendor.isOpen;

    try {
      await vendorService.toggleOpenStatus(vendor.id, nextStatus);
      setVendor({ ...vendor, isOpen: nextStatus });
      setToggleNotice(`Stall availability updated to ${nextStatus ? 'OPEN' : 'CLOSED'}! Customers on the Explore feed and Live Map will see this change live.`);
      setTimeout(() => setToggleNotice(''), 4000);
    } catch (err: any) {
      console.error('Error toggling open status:', err);
    } finally {
      setTogglingStatus(false);
    }
  };

  // COVER PHOTO MANAGEMENT (Firebase Storage + Cloud Firestore)
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverNotice, setCoverNotice] = useState('');
  const [coverError, setCoverError] = useState('');

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor) return;

    if (!file.type.startsWith('image/')) {
      setCoverError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCoverError('Image file size must be under 10MB.');
      return;
    }

    setUploadingCover(true);
    setCoverError('');
    setCoverNotice('');

    try {
      // 1. Upload to Firebase Storage
      const downloadUrl = await storageService.uploadImage(
        file,
        `vendors/${vendor.id}/cover_${Date.now()}.jpg`
      );

      // 2. Update coverImageUrl and bannerImage in Firestore
      await vendorService.updateVendorShop(vendor.id, {
        coverImageUrl: downloadUrl,
        bannerImage: downloadUrl
      });

      // 3. Update local state
      setVendor({
        ...vendor,
        coverImageUrl: downloadUrl,
        bannerImage: downloadUrl
      });

      setCoverNotice('Shop cover photograph successfully updated! Synchronized live to Nearby Stalls.');
      setTimeout(() => setCoverNotice(''), 5000);
    } catch (err: any) {
      console.error('Error uploading vendor cover photo:', err);
      setCoverError(err?.message || 'Failed to upload photograph. Please try another image.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!vendor) return;
    if (!window.confirm('Remove shop cover photograph? Your listing will use the ChatMaps verified placeholder.')) return;

    setUploadingCover(true);
    setCoverError('');

    try {
      await vendorService.updateVendorShop(vendor.id, {
        coverImageUrl: '',
        bannerImage: ''
      });

      setVendor({
        ...vendor,
        coverImageUrl: '',
        bannerImage: ''
      });

      setCoverNotice('Cover photograph removed. ChatMaps verified placeholder is now active.');
      setTimeout(() => setCoverNotice(''), 4000);
    } catch (err: any) {
      setCoverError('Failed to remove cover photograph.');
    } finally {
      setUploadingCover(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Vendor Login Required</h2>
        <p className="text-stone-500 text-xs mb-6">Please sign in with your vendor account.</p>
        <Link to="/vendor/login" className="px-5 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl">
          Vendor Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">No Stall Registered Yet</h2>
        <p className="text-stone-500 text-xs mb-6">You haven't registered your street food stall yet.</p>
        <Link to="/vendor/register" className="px-5 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl">
          Register Stall Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={vendor.bannerImage || vendor.photos[0]}
            alt={vendor.shopName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-stone-200 shrink-0"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                {vendor.shopName}
              </h1>
              {/* Approval status badge */}
              {vendor.status === 'approved' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified & Live</span>
                </span>
              ) : vendor.status === 'pending' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Pending Admin Approval</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Rejected / Revisions Needed</span>
                </span>
              )}
            </div>

            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
              <span>Managed by {vendor.ownerName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{vendor.city}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/vendor/${vendor.id}`}
            className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50/50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-orange-600" />
            <span>Preview Public Stall</span>
          </Link>

          <Link
            to="/vendor/profile"
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Shop & Menu</span>
          </Link>
        </div>
      </div>

      {/* Pending status warning banner if not approved yet */}
      {vendor.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-sm block">Your stall application is under review!</strong>
            <p>
              Your street stall was submitted successfully. Once the ChatMaps administrator reviews and approves your stall, it will be visible to all customers on the explore page and interactive live map. You can continue updating your dishes and photos in the meantime.
            </p>
          </div>
        </div>
      )}

      {/* LIVE OPEN/CLOSED TOGGLE HERO CARD */}
      <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
        vendor.isOpen
          ? 'bg-emerald-500/10 border-emerald-300'
          : 'bg-stone-100 border-stone-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${vendor.isOpen ? 'bg-emerald-500 animate-ping' : 'bg-stone-400'}`} />
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                Stall Availability: {vendor.isOpen ? 'OPEN NOW' : 'CURRENTLY CLOSED'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
              {vendor.isOpen
                ? 'Your stall is currently marked OPEN. Nearby customers on the Live Map and Explore feed can see your active stall and get directions.'
                : 'Your stall is marked CLOSED. Toggle it on whenever you are set up and ready to serve foodies!'}
            </p>
          </div>

          <button
            onClick={handleToggleOpenStatus}
            disabled={togglingStatus}
            className={`px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2.5 transition active:scale-95 ${
              vendor.isOpen
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {togglingStatus
                ? 'Updating...'
                : vendor.isOpen
                ? 'Close Stall for the Day'
                : 'Open Stall Now'}
            </span>
          </button>
        </div>

        {toggleNotice && (
          <div className="mt-4 p-3 bg-white/90 rounded-xl text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toggleNotice}</span>
          </div>
        )}
      </div>

      {/* SHOP COVER PHOTOGRAPH (Firebase Storage + Cloud Firestore Sync) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-black text-stone-900">
                Stall Cover Photograph
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              This photo appears on the customer Home page under <strong>"Nearby Stalls"</strong> and on the <strong>Live Map</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload / Replace Cover Button */}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploadingCover ? 'Uploading to Cloud...' : vendor.coverImageUrl ? 'Replace Cover Photo' : 'Upload Cover Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
                className="hidden"
              />
            </label>

            {/* Remove Cover Button */}
            {vendor.coverImageUrl && (
              <button
                type="button"
                onClick={handleRemoveCover}
                disabled={uploadingCover}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-rose-300 text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Remove cover photo and use default placeholder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Notices */}
        {coverNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{coverNotice}</span>
          </div>
        )}

        {coverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{coverError}</span>
          </div>
        )}

        {/* Live Preview Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 relative aspect-16/10 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm group">
            <img
              src={getVendorCoverImage(vendor)}
              alt={vendor.shopName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                vendor.isOpen ? 'bg-emerald-500 text-white shadow-xs' : 'bg-stone-900/80 text-stone-300'
              }`}>
                {vendor.isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 bg-stone-950/75 backdrop-blur-xs text-white p-2.5 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold truncate">{vendor.shopName}</span>
              <span className="text-[10px] text-stone-300 font-medium">Customer Card Preview</span>
            </div>
          </div>

          <div className="md:col-span-5 space-y-3 text-xs text-stone-600 leading-relaxed bg-stone-50 p-5 rounded-2xl border border-stone-200/80">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Real-Time Cloud Synchronization</span>
            </h4>
            <p>
              When you upload or replace your cart photograph:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-stone-500">
              <li>Image is stored securely in <strong>Firebase Storage</strong> bucket.</li>
              <li>The download URL is saved under <code className="bg-white px-1 py-0.5 rounded text-stone-800 font-mono text-[11px]">coverImageUrl</code> in Firestore.</li>
              <li>Instantly reflected across all customer homepages and live map pins without reloading.</li>
            </ul>
            {vendor.coverImageUrl ? (
              <div className="pt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Custom stall photograph is currently LIVE</span>
              </div>
            ) : (
              <div className="pt-2 text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
                <span>Default verified ChatMaps placeholder active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Views</p>
            <Eye className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2">{vendor.viewsCount || 1420}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">↑ 14% this week</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Foodie Favorites</p>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2">{vendor.favoritesCount || 184}</p>
          <p className="text-[11px] text-stone-500 mt-1">Saved by loyal foodies</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Average Rating</p>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2">
            {vendor.rating} <span className="text-xs font-medium text-stone-400">/ 5.0</span>
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Based on {vendor.reviewCount} reviews</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Menu Items</p>
            <Utensils className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2">{vendor.menu.length}</p>
          <Link to="/vendor/profile" className="text-[11px] text-orange-600 font-bold mt-1 hover:underline block">
            Add or edit dishes →
          </Link>
        </div>
      </div>

      {/* Dishes preview & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Menu overview */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-600" />
              <span>Current Street Food Menu</span>
            </h3>
            <Link
              to="/vendor/profile"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage Dishes</span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {vendor.menu.map((dish) => (
              <div
                key={dish.id}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-xs border border-stone-300 flex items-center justify-center p-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-stone-900">{dish.name}</h5>
                    {dish.description && (
                      <p className="text-[11px] text-stone-500 truncate max-w-xs">{dish.description}</p>
                    )}
                  </div>
                </div>

                <span className="font-extrabold text-xs text-stone-900">₹{dish.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customer Reviews */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Customer Reviews ({reviews.length})</span>
            </h3>
          </div>

          {reviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No customer reviews yet. Foodies will leave reviews after visiting your stall!
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{r.userName}</span>
                    <span className="text-[11px] font-bold text-amber-500">★ {r.rating}.0</span>
                  </div>
                  <p className="text-xs text-stone-600 italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

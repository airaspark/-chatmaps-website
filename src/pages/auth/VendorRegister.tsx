import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';
import { FOOD_CATEGORIES } from '../../data/initialVendors';
import {
  Store,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export const VendorRegister: React.FC = () => {
  const { registerWithEmail, userProfile } = useAuth();
  const navigate = useNavigate();

  // Registration form state
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('Chaat & Snacks');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [isPureVeg, setIsPureVeg] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !ownerName || !email || !password || !phone || !address) {
      setError('Please fill in all required shop and contact fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create vendor user auth
      const user = await registerWithEmail(email, password, ownerName, 'vendor', phone);

      // 2. Create vendor record with status: 'pending' (per requirement: unapproved vendors must not appear publicly)
      await vendorService.registerVendorShop({
        ownerUid: user.uid,
        ownerEmail: email.trim(),
        shopName,
        ownerName,
        description: description || `Authentic ${category} made fresh daily by ${ownerName}.`,
        category,
        subCategories: [category],
        phone,
        whatsapp: phone,
        address,
        city,
        photos: [],
        menu: [],
        bannerImage: '',
        isOpen: false,
        openingHours,
        isPureVeg,
        priceRange: '₹'
      });

      setRegisteredSuccess(true);
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Vendor registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-stone-200/90 p-8 sm:p-10 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-orange-600/30">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Register Your Street Food Stall
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Get your stall verified on ChatMaps, manage your live open/closed availability, and attract nearby foodies.
          </p>
        </div>

        {/* Verification Notice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Approval Process Notice:</strong>
            To maintain high authenticity and street food safety standards, newly registered stalls start in <strong>Pending</strong> status and undergo quick admin approval before appearing on the public live map and explore feed.
          </div>
        </div>

        {registeredSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Registration submitted successfully! Redirecting to your Vendor Dashboard...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Shop / Stall Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Ramesh Butter Dosa Corner"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Owner / Chef Name *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Ramesh Gowda"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Vendor Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@foodstall.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Phone / WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Account Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Primary Food Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 outline-none focus:border-orange-500 focus:bg-white cursor-pointer"
              >
                {FOOD_CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Shop Specialty & Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell foodies about your famous dishes, homemade chutneys, or butter recipes..."
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Stall Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Opposite Metro Gate 2, Main Market"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                City *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 outline-none focus:border-orange-500 focus:bg-white cursor-pointer"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Other">Other City</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Daily Operating Timings
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="e.g. 5:00 PM - 11:30 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={isPureVeg}
                  onChange={(e) => setIsPureVeg(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                />
                <span>This stall is 100% Pure Vegetarian</span>
              </label>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <button
              type="submit"
              disabled={loading || registeredSuccess}
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Submitting Registration...' : 'Submit Stall for Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Legal Agreement Subtext */}
            <p className="text-[11px] text-stone-500 text-center leading-relaxed px-2">
              By submitting this vendor application, you acknowledge that you have read and agree to the{' '}
              <Link to="/terms" className="text-orange-600 font-bold hover:underline">
                Terms of Service
              </Link>{' '}
              and acknowledge our{' '}
              <Link to="/privacy-policy" className="text-orange-600 font-bold hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>

        <div className="pt-2 text-center border-t border-stone-100">
          <p className="text-xs text-stone-500">
            Already have a vendor account?{' '}
            <Link to="/vendor/login" className="text-orange-600 font-bold hover:underline">
              Vendor Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

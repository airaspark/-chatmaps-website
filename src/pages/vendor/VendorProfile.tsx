import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { vendorService } from '../../services/vendorService';
import { storageService } from '../../services/storageService';
import { Vendor, MenuItem } from '../../types';
import { FOOD_CATEGORIES } from '../../data/initialVendors';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Camera,
  Trash2,
  Plus,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Utensils,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const VendorProfile: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dosa & South Indian');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [postalCode, setPostalCode] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [isPureVeg, setIsPureVeg] = useState(true);
  const [priceRange, setPriceRange] = useState<'₹' | '₹₹' | '₹₹₹'>('₹');

  // Images state
  const [bannerImage, setBannerImage] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Menu items state
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState<number | ''>('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishVeg, setNewDishVeg] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!userProfile) return;
      setLoading(true);
      const v = await vendorService.getVendorByOwnerUid(userProfile.uid);

      if (v) {
        setVendor(v);
        setShopName(v.shopName);
        setOwnerName(v.ownerName);
        setDescription(v.description);
        setCategory(v.category);
        setPhone(v.phone);
        setWhatsapp(v.whatsapp || v.phone);
        setAddress(v.address);
        setLandmark(v.landmark || '');
        setCity(v.city);
        setPostalCode(v.postalCode || '');
        setOpeningHours(v.openingHours);
        setIsPureVeg(v.isPureVeg ?? true);
        setPriceRange(v.priceRange || '₹');
        setBannerImage(v.bannerImage);
        setPhotos(v.photos || []);
        setMenu(v.menu || []);
      }
      setLoading(false);
    };

    fetchVendor().catch(error => {
      console.error('Unable to load vendor profile:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Unable to load the vendor profile.');
      setLoading(false);
    });
  }, [userProfile]);

  // Upload shop banner image
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor || !userProfile) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const url = await storageService.uploadImage(file, `vendors/${userProfile.uid}/${vendor.id}/banner_${Date.now()}.jpg`);
      setBannerImage(url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload stall / food gallery photo
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor || !userProfile) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const url = await storageService.uploadImage(file, `vendors/${userProfile.uid}/${vendor.id}/food_${Date.now()}.jpg`);
      setPhotos([...photos, url]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete image
  const handleDeletePhoto = (indexToDelete: number) => {
    setPhotos(photos.filter((_, idx) => idx !== indexToDelete));
  };

  // Add Dish
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    const dish: MenuItem = {
      id: 'dish-' + Date.now(),
      name: newDishName.trim(),
      price: Number(newDishPrice),
      description: newDishDesc.trim(),
      isVeg: newDishVeg,
      isPopular: false
    };

    setMenu([...menu, dish]);
    setNewDishName('');
    setNewDishPrice('');
    setNewDishDesc('');
  };

  // Delete Dish
  const handleDeleteDish = (dishId: string) => {
    setMenu(menu.filter(d => d.id !== dishId));
  };

  // Save full vendor profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await vendorService.updateVendorShop(vendor.id, {
        shopName,
        ownerName,
        description,
        category,
        phone,
        whatsapp,
        address,
        landmark,
        city,
        postalCode,
        openingHours,
        isPureVeg,
        priceRange,
        bannerImage,
        coverImageUrl: bannerImage,
        photos,
        menu
      });

      setSuccessMsg('Shop details and menu successfully saved! Updated live on ChatMaps.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save shop details.');
    } finally {
      setSaving(false);
    }
  };

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
        <h2 className="text-xl font-bold text-stone-900 mb-2">No Stall Found</h2>
        <Link to="/vendor/register" className="px-5 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl">
          Register Stall
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/vendor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vendor Dashboard</span>
        </Link>

        <Link
          to={`/vendor/${vendor.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 text-xs font-bold transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Preview Public Page</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Edit Stall Details & Menu
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Keep your stall information, photos, and prices accurate. Your live cart location is captured from device GPS when you go online.
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* SECTION 1: Stall Visuals (Banner & Food Photos) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <Camera className="w-4 h-4 text-orange-600" />
              <span>Shop & Food Photos</span>
            </h2>

            {/* Banner Photo */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                Main Banner Photo
              </label>
              <div className="relative aspect-21/9 max-h-56 rounded-2xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-300 group">
                <img
                  src={bannerImage}
                  alt={shopName}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-bold text-xs gap-2">
                  <Camera className="w-4 h-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Replace Banner Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Gallery Photos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-700">
                  Food & Stall Gallery Photos ({photos.length})
                </label>
                <label className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((pUrl, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                    <img src={pUrl} alt="Stall dish" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-stone-900/80 text-white hover:bg-rose-600 transition"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: General Shop Information */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <Store className="w-4 h-4 text-orange-600" />
              <span>Shop Basic Info</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Stall / Shop Name
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Description & Specialties
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Primary Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold outline-none focus:border-orange-500 focus:bg-white cursor-pointer"
                >
                  {FOOD_CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Daily Timings
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Price Tier
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold outline-none focus:border-orange-500 focus:bg-white cursor-pointer"
                >
                  <option value="₹">₹ (Budget / Under ₹100)</option>
                  <option value="₹₹">₹₹ (Mid / ₹100 - ₹250)</option>
                  <option value="₹₹₹">₹₹₹ (Premium / ₹250+)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={isPureVeg}
                  onChange={(e) => setIsPureVeg(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm"
                />
                <span>100% Pure Vegetarian Stall</span>
              </label>
            </div>
          </div>

          {/* SECTION 3: Location and Map Pin */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Stall Location & Coordinates</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near temple, metro, or college"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

          </div>

          {/* SECTION 4: Menu Items Management */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <Utensils className="w-4 h-4 text-orange-600" />
              <span>Manage Menu Dishes ({menu.length})</span>
            </h2>

            {/* Existing Dishes List */}
            <div className="space-y-2">
              {menu.map((dish) => (
                <div
                  key={dish.id}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-xs border border-stone-300 flex items-center justify-center p-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    </span>
                    <div>
                      <h5 className="font-bold text-xs text-stone-900">{dish.name}</h5>
                      <span className="text-[11px] text-stone-500">₹{dish.price}</span>
                      {dish.description && <span className="text-[11px] text-stone-400 ml-2">— {dish.description}</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDish(dish.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Dish Mini Form */}
            <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200/80 space-y-3">
              <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-orange-600" />
                <span>Add a New Dish to Menu</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <input
                    type="text"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="Dish Name (e.g. Cheese Pav Bhaji)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="number"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Price in ₹"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={newDishVeg}
                      onChange={(e) => setNewDishVeg(e.target.checked)}
                      className="w-3.5 h-3.5 text-emerald-600 rounded-xs"
                    />
                    <span>Veg Dish</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Short description (e.g. Made with melting Amul butter, served with 2 pavs)"
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddDish}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition"
                >
                  Add Dish
                </button>
              </div>
            </div>
          </div>

          {/* Submit Save Button */}
          <div className="pt-6 border-t border-stone-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Stall & Menu Updates'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

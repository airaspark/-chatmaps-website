import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Vendor, FilterOptions } from '../types';
import { vendorService } from '../services/vendorService';
import { VendorCard } from '../components/vendor/VendorCard';
import { FOOD_CATEGORIES } from '../data/initialVendors';
import { useApp } from '../context/AppContext';
import { normalizeCityName } from '../data/cities';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

const categoryTerms: Record<string, string[]> = {
  chaat: ['chaat', 'pani puri', 'chat'],
  'indo-chinese': ['indo chinese', 'chinese', 'gobi'],
  momos: ['momo'],
  snacks: ['snack', 'samosa'],
  'south-indian': ['south indian', 'dosa', 'idli', 'vada'],
  'mumbai-special': ['mumbai', 'pav bhaji', 'fast food']
};

const vendorMatchesCategory = (vendor: Vendor, category: string): boolean => {
  const terms = categoryTerms[category];
  if (!terms) return vendor.category === category || Boolean(vendor.subCategories?.includes(category));
  const fields = [vendor.category, ...(vendor.subCategories || []), ...vendor.menu.map(item => item.name)]
    .map(value => value.toLowerCase());
  return terms.some(term => fields.some(field => field.includes(term)));
};

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity, locationSource, customerCoordinates, detectCurrentLocation, locationError } = useApp();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorLoadError, setVendorLoadError] = useState<string | null>(null);
  const userCoords = customerCoordinates;
  const cityFilter = selectedCity || searchParams.get('city') || '';

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [pureVegOnly, setPureVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'reviews'>('recommended');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Subscribe to vendors
  useEffect(() => {
    setLoading(true);
    const unsubscribe = vendorService.subscribeToApprovedVendors((list) => {
      setVendors(list);
      setLoading(false);
      setVendorLoadError(null);
    }, error => {
      setVendors([]);
      setLoading(false);
      setVendorLoadError(error.message || 'Vendor listings are unavailable.');
    });
    return () => unsubscribe();
  }, []);

  // Sync with URL query params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Distance helper
  const getDistanceKm = (vendorLat: number, vendorLng: number) => {
    if (!userCoords) return Number.POSITIVE_INFINITY;
    const R = 6371;
    const dLat = ((vendorLat - userCoords.lat) * Math.PI) / 180;
    const dLon = ((vendorLng - userCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userCoords.lat * Math.PI) / 180) *
        Math.cos((vendorLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter and sort computation
  const filteredVendors = useMemo(() => {
    return vendors
      .filter((v) => {
        if (cityFilter) {
          const sameCity = normalizeCityName(v.city || '') === normalizeCityName(cityFilter);
          const nearbyGpsVendor = locationSource === 'gps' && userCoords && v.location && getDistanceKm(v.location.lat, v.location.lng) <= 30;
          if (!sameCity && !nearbyGpsVendor) return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = v.shopName.toLowerCase().includes(q);
          const matchesCategory = v.category.toLowerCase().includes(q);
          const matchesCity = v.city.toLowerCase().includes(q);
          const matchesAddress = v.address.toLowerCase().includes(q);
          const matchesMenu = v.menu.some((m) => m.name.toLowerCase().includes(q));
          if (!matchesName && !matchesCategory && !matchesCity && !matchesAddress && !matchesMenu) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (!vendorMatchesCategory(v, selectedCategory)) return false;
        }

        // Open Now filter
        if (openNowOnly && !v.isOpen) {
          return false;
        }

        // Pure Veg filter
        if (pureVegOnly && !v.isPureVeg) {
          return false;
        }

        // Rating filter
        if (selectedRating !== null && v.rating < selectedRating) {
          return false;
        }

        // Distance filter
        if (selectedDistance !== null) {
          if (!userCoords || !v.location) return false;
          const dist = getDistanceKm(v.location.lat, v.location.lng);
          if (dist > selectedDistance) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      });
  }, [vendors, searchQuery, selectedCategory, openNowOnly, pureVegOnly, selectedRating, selectedDistance, sortBy, userCoords, cityFilter, locationSource]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDistance(null);
    setSelectedRating(null);
    setOpenNowOnly(false);
    setPureVegOnly(false);
    setSortBy('recommended');
    setSearchParams(cityFilter ? { city: cityFilter } : {});
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedDistance !== null ||
    selectedRating !== null ||
    openNowOnly ||
    pureVegOnly;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {vendorLoadError && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{vendorLoadError}</div>}
      {locationError && <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{locationError}</div>}
      {/* Top Header & Search */}
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {cityFilter ? `Explore Street Food in ${cityFilter}` : 'Explore Street Food Stalls'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {cityFilter ? `Showing current online vendors in ${cityFilter}` : `Discover ${vendors.length} current online vendors`}
          </p>
        </div>

        {/* Search Bar & Quick Toggles */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by stall name, dish (e.g. Masala Dosa, Sev Puri), or area..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 text-sm font-medium placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Open Now Quick Toggle */}
            <button
              onClick={() => setOpenNowOnly(!openNowOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 border ${
                openNowOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open Now</span>
            </button>

            {/* Pure Veg Quick Toggle */}
            <button
              onClick={() => setPureVegOnly(!pureVegOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 border ${
                pureVegOnly
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Pure Veg</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white border border-stone-200 text-stone-700 outline-none cursor-pointer hover:bg-stone-50 shrink-0"
            >
              <option value="recommended">Sort: Popular</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="reviews">Sort: Most Reviews</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FOOD_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 shrink-0 border ${
                isSelected
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Chips (Distance & Rating) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
            Distance:
          </span>
          {[
            { label: 'All', value: null },
            { label: '< 1 km', value: 1 },
            { label: '< 3 km', value: 3 },
            { label: '< 5 km', value: 5 },
            { label: '< 10 km', value: 10 },
          ].map((d) => (
            <button
              key={d.label}
              onClick={() => {
                if (d.value !== null && !userCoords) void detectCurrentLocation();
                setSelectedDistance(d.value);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                selectedDistance === d.value
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {d.label}
            </button>
          ))}

          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mx-2">
            Rating:
          </span>
          {[
            { label: 'All', value: null },
            { label: '4.5+ ★', value: 4.5 },
            { label: '4.0+ ★', value: 4.0 },
            { label: '3.5+ ★', value: 3.5 },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => setSelectedRating(r.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                selectedRating === r.value
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-stone-600">
          Showing <span className="text-orange-600">{filteredVendors.length}</span> verified street food stalls
        </p>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-stone-500">Finding delicious street stalls...</p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-stone-200 shadow-sm my-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            {cityFilter ? `No online street stalls found in ${cityFilter}` : 'No street stalls found'}
          </h3>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            {cityFilter ? 'No approved vendors with fresh live locations match this city and your current filters.' : 'We could not find stalls matching your current filters. Try choosing a city or widening the distance.'}
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              userCoords={userCoords}
            />
          ))}
        </div>
      )}
    </div>
  );
};

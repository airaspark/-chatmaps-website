import React, { useState, useEffect } from 'react';
import { Vendor } from '../types';
import { vendorService } from '../services/vendorService';
import { VendorMap } from '../components/map/VendorMap';
import { FOOD_CATEGORIES } from '../data/initialVendors';
import {
  Search,
  Clock,
  Layers,
  MapPin,
  ChevronRight,
  Sparkles,
  Compass
} from 'lucide-react';

export const LiveMap: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openNowOnly, setOpenNowOnly] = useState(false);

  useEffect(() => {
    const unsubscribe = vendorService.subscribeToApprovedVendors((list) => {
      setVendors(list);
      setSelectedVendor(current => list.find(vendor => vendor.id === current?.id) || list[0] || null);
      setLoadError(null);
    }, error => {
      setVendors([]);
      setSelectedVendor(null);
      setLoadError(error.message || 'Live vendor locations are unavailable.');
    });
    return () => unsubscribe();
  }, []);

  const filteredVendors = vendors.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        v.shopName.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedCategory !== 'all' && v.category !== selectedCategory) {
      return false;
    }
    if (openNowOnly && !v.isOpen) {
      return false;
    }
    return true;
  });

  return (
    <div className="relative flex h-[calc(100dvh-10rem)] min-h-[32rem] w-full flex-1 flex-col overflow-hidden md:h-[calc(100dvh-8rem)] xl:h-[calc(100dvh-4rem)]">
      {loadError && <div role="alert" className="absolute bottom-4 left-4 right-4 z-40 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{loadError}</div>}
      {!loadError && filteredVendors.length === 0 && <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"><div className="rounded-2xl border border-stone-200 bg-white/95 p-5 text-center shadow-xl"><MapPin className="w-7 h-7 text-stone-400 mx-auto mb-2"/><p className="text-sm font-bold text-stone-800">No vendors are currently online</p><p className="text-xs text-stone-500 mt-1">Approved carts appear when vendors share a fresh device location.</p></div></div>}
      {/* Floating Controls Bar at Top */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col gap-2 max-w-2xl mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-stone-200 pointer-events-auto flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5">
            <Search className="w-4 h-4 text-orange-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter live stalls by name or street..."
              className="w-full text-xs sm:text-sm font-medium outline-none bg-transparent text-stone-900 placeholder-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-stone-400 hover:text-stone-700"
              >
                ×
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-stone-200" />

          {/* Open Now quick toggle */}
          <button
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              openNowOnly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Now</span>
          </button>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FOOD_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-orange-600 text-white'
                    : 'bg-white/90 backdrop-blur-md text-stone-700 hover:bg-white hover:text-orange-600 border border-stone-200/80'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Fullscreen Map */}
      <div className="relative min-h-0 w-full flex-1">
        <VendorMap
          vendors={filteredVendors}
          selectedVendor={selectedVendor}
          onSelectVendor={(v) => setSelectedVendor(v)}
          className="h-full min-h-[32rem] w-full rounded-none"
          showCardOverlay={true}
        />
      </div>
    </div>
  );
};

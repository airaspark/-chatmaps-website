import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Vendor } from '../types';
import { vendorService } from '../services/vendorService';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CRAVING_CATEGORIES, getVendorCoverImage } from '../data/foodImages';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import {
  Search,
  MapPin,
  Heart,
  ArrowUpDown,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  Star,
  Compass,
  ArrowRight
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { selectedCity, t } = useApp();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesktopCity, setSelectedDesktopCity] = useState('All');

  // Quick filter states matching screenshot
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterWithin2Km, setFilterWithin2Km] = useState(false);
  const [filterNearest, setFilterNearest] = useState(false);

  // Selected craving: default to 'Pani Puri' to match the screenshot
  const [selectedCraving, setSelectedCraving] = useState<string>('Pani Puri');

  // Favorites tracking
  const [userFavorites, setUserFavorites] = useState<string[]>(['vendor-1']);

  // Scroll indicator state for Cravings carousel
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Real-time Firestore approved vendors subscription
  useEffect(() => {
    const unsubscribe = vendorService.subscribeToApprovedVendors((list) => {
      setVendors(list);
    });
    return () => unsubscribe();
  }, []);

  // Sync user favorites
  useEffect(() => {
    if (userProfile) {
      favoriteService.getUserFavorites(userProfile.uid).then((favs) => {
        setUserFavorites(favs.map((v) => v.id));
      });
    }
  }, [userProfile]);

  // Track horizontal scroll progress for Cravings carousel
  const handleCravingsScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleToggleFavorite = async (vendorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userProfile) {
      navigate('/customer/login');
      return;
    }
    const isFav = userFavorites.includes(vendorId);
    const updated = isFav
      ? userFavorites.filter((id) => id !== vendorId)
      : [...userFavorites, vendorId];
    setUserFavorites(updated);
    try {
      await favoriteService.toggleFavorite(userProfile.uid, vendorId);
    } catch {
      setUserFavorites(userFavorites);
    }
  };

  // Filter vendors based on quick filters and selected craving
  const filteredVendors = vendors.filter((v) => {
    if (filterOpenNow && !v.isOpen) return false;
    if (selectedCraving) {
      const query = selectedCraving.toLowerCase();
      const matchName = v.shopName.toLowerCase().includes(query);
      const matchCat = v.category.toLowerCase().includes(query);
      const matchDesc = v.description.toLowerCase().includes(query);
      const matchMenu = v.menu && v.menu.some(m => m.name.toLowerCase().includes(query));
      const matchSub = v.subCategories && v.subCategories.some(s => s.toLowerCase().includes(query));
      if (!matchName && !matchCat && !matchDesc && !matchMenu && !matchSub) {
        // If not a strict text match, still show nearby stalls unless filter was explicitly changed
        if (selectedCraving !== 'Pani Puri' && selectedCraving !== 'Chats') return false;
      }
    }
    return true;
  });

  const displayVendors = filteredVendors.length > 0 ? filteredVendors : vendors;
  const topRatedVendors = [...vendors].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="flex-1 flex flex-col bg-stone-50 dark:bg-stone-950 transition-colors">
      {/* ========================================================
          MOBILE & TABLET VIEW: Strict Pixel-Fidelity to Screenshot
          ======================================================== */}
      <div className="xl:hidden flex flex-col space-y-4 px-4 sm:px-6 md:px-8 pt-3 pb-8 max-w-4xl mx-auto w-full">
        {/* 1. SEARCH BAR */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] px-4 py-3"
        >
          <Search className="w-5 h-5 text-stone-700 dark:text-stone-300 shrink-0 mr-3 stroke-[2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search street food (e.g. Pani Puri, Dosa, Gobi Manchurian)"
            className="w-full text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 outline-none bg-transparent"
          />
        </form>

        {/* 2. QUICK FILTER PILLS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {/* Open Now Pill */}
          <button
            type="button"
            onClick={() => setFilterOpenNow(!filterOpenNow)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold shrink-0 transition shadow-xs ${
              filterOpenNow
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Open Now</span>
          </button>

          {/* Within 2 km Pill */}
          <button
            type="button"
            onClick={() => setFilterWithin2Km(!filterWithin2Km)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold shrink-0 transition shadow-xs ${
              filterWithin2Km
                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-500 text-orange-700 dark:text-orange-300 ring-1 ring-orange-500'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[2.2]" />
            <span>Within 2 km</span>
          </button>

          {/* Nearest Pill */}
          <button
            type="button"
            onClick={() => setFilterNearest(!filterNearest)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold shrink-0 transition shadow-xs ${
              filterNearest
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
            <span>Nearest</span>
          </button>
        </div>

        {/* 3. EXPLORE MYSURU PROMOTIONAL BANNER */}
        <div>
          <div
            onClick={() => navigate('/explore?city=Mysuru')}
            className="cursor-pointer bg-gradient-to-r from-[#ff5e00] via-[#ff5e00] to-[#e64c00] rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden flex items-center justify-between min-h-[175px] active:scale-[0.99] transition-transform"
          >
            {/* Left Content */}
            <div className="z-10 max-w-[55%] space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[10px] sm:text-xs font-black tracking-wider uppercase text-white">
                EXPLORE MYSURU
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]">
                Taste<br />Mysuru
              </h2>
              <p className="text-xs text-orange-100 font-medium leading-snug pt-0.5">
                Explore street foods around your location.
              </p>
            </div>

            {/* Right Food Dish Image: Realistic High-Resolution Masala Puri Platter */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shrink-0 border-4 border-white/25 shadow-2xl bg-stone-900 relative">
              <img
                src="/images/foods/explore-banner.jpg"
                alt="Taste Mysuru Street Food"
                className="w-full h-full object-cover scale-105"
                loading="eager"
              />
            </div>
          </div>

          {/* Carousel Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <span className="w-6 h-1.5 rounded-full bg-orange-600 transition-all duration-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>
        </div>

        {/* 4. CRAVINGS SECTION (PORTRAIT CARDS WITH REALISTIC FOOD PHOTOGRAPHS) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-stone-900 dark:text-stone-100 tracking-wider uppercase">
              CRAVINGS
            </h3>
            <Link
              to="/explore"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 transition"
            >
              See All
            </Link>
          </div>

          {/* Horizontal Scrolling Portrait Food Cards */}
          <div
            ref={scrollRef}
            onScroll={handleCravingsScroll}
            className="flex items-start gap-3.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
          >
            {CRAVING_CATEGORIES.map((item) => {
              const isSelected = selectedCraving === item.name;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCraving(isSelected ? '' : item.name)}
                  className="flex flex-col items-center gap-2 shrink-0 group active:scale-95 transition text-left"
                >
                  {/* Portrait Card Container */}
                  <div
                    className={`w-20 sm:w-24 h-28 sm:h-32 rounded-2xl overflow-hidden transition-all duration-200 bg-stone-100 dark:bg-stone-800 shadow-sm relative ${
                      isSelected
                        ? 'border-2 border-orange-500 ring-2 ring-orange-500/30 shadow-md shadow-orange-500/20'
                        : 'border border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Category Name Label */}
                  <span
                    className={`text-xs tracking-tight transition-colors text-center ${
                      isSelected
                        ? 'text-orange-600 font-extrabold'
                        : 'text-stone-900 dark:text-stone-100 font-bold'
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Orange Scroll Progress Bar beneath Cravings (matching screenshot) */}
          <div className="w-full max-w-[180px] h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-orange-600 rounded-full transition-all duration-150"
              style={{
                width: '45%',
                transform: `translateX(${scrollProgress * 1.2}%)`
              }}
            />
          </div>
        </div>

        {/* 5. NEARBY STALLS (REAL VENDOR COVER PHOTOS & FIRESTORE DATA) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-stone-900 dark:text-stone-100 tracking-wider uppercase">
              NEARBY STALLS
            </h3>
            <Link
              to="/explore"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 transition"
            >
              See All
            </Link>
          </div>

          {/* Cards Grid: 2 columns on phones, 3 columns on tablets */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {displayVendors.map((vendor, idx) => {
              const isFav = userFavorites.includes(vendor.id) || idx === 0;
              const coverPhoto = getVendorCoverImage(vendor);

              return (
                <div
                  key={vendor.id}
                  onClick={() => navigate(`/vendor/${vendor.id}`)}
                  className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xs cursor-pointer flex flex-col justify-between group hover:border-orange-400 transition"
                >
                  {/* Stall Cover Image with Favorite Heart Button */}
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={coverPhoto}
                      alt={vendor.shopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Circular Translucent Heart Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(vendor.id, e)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center transition active:scale-90 hover:bg-black/60"
                      aria-label="Save to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav
                            ? 'text-white fill-white'
                            : 'text-white/90'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Stall Info */}
                  <div className="p-3 space-y-1">
                    <h4 className="font-black text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-orange-600 transition-colors">
                      {vendor.shopName}
                    </h4>

                    {/* Open Now / Closed Status Indicator with vibrant green dot */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          vendor.isOpen ? 'bg-emerald-500' : 'bg-stone-400'
                        }`}
                      />
                      <span>{vendor.isOpen ? 'Open Now' : 'Closed'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          DESKTOP VIEW: Rich, Expansive, Full-Featured Web Experience
          ======================================================== */}
      <div className="hidden xl:flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#ff5e00] via-orange-600 to-amber-700 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-400/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10 text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-orange-100 text-xs sm:text-sm font-semibold mb-6">
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Discover Authentic Street Food with Real-Time Availability</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
              Taste the Real India. <br />
              <span className="text-amber-200 underline decoration-amber-400 decoration-wavy decoration-2">
                Every Corner. Every Stall.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-orange-100 font-medium mb-10 leading-relaxed">
              Find verified street food gems, live open/closed stalls, authentic heirloom chaats, dosas, momos, and chai spots near you.
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto bg-white rounded-2xl p-2.5 shadow-2xl flex flex-row gap-2.5 items-stretch border border-orange-200"
            >
              <div className="flex-1 flex items-center gap-3 px-3.5 py-2 text-stone-800">
                <Search className="w-5 h-5 text-orange-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search street food (e.g. Pani Puri, Dosa, Gobi Manchurian)..."
                  className="w-full text-sm sm:text-base outline-none bg-transparent placeholder-stone-400 font-medium text-stone-900"
                />
              </div>

              <div className="h-auto w-px bg-stone-200 mx-1" />

              <div className="flex items-center gap-2 px-3 text-stone-600 w-44 shrink-0">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                <select
                  value={selectedDesktopCity}
                  onChange={(e) => setSelectedDesktopCity(e.target.value)}
                  className="w-full text-sm font-semibold bg-transparent outline-none cursor-pointer text-stone-800"
                >
                  <option value="All">All Cities</option>
                  <option value="Mysuru">Mysuru</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jaipur">Jaipur</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
              >
                <span>Find Food</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* CRAVINGS CAROUSEL ON DESKTOP */}
        <section className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-8 px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2 tracking-wide uppercase">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <span>Popular Street Cravings</span>
              </h2>
              <Link to="/explore" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                <span>View All Cuisines</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
              {CRAVING_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/explore?category=${encodeURIComponent(item.categoryKey)}`)}
                  className="flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-orange-50/50 dark:hover:bg-stone-800/80 transition group text-left"
                >
                  <div className="w-full aspect-3/4 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 group-hover:border-orange-400 group-hover:shadow-md transition">
                    <img src={item.image} alt={item.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 group-hover:text-orange-600 transition">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Top-Rated Street Vendors with Real Cover Photos */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-row items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4" />
                <span>Verified Artisan Stalls</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                Top Rated Stalls Near You
              </h2>
            </div>

            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 font-bold text-xs transition"
            >
              <span>Explore All {vendors.length} Vendors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedVendors.map((vendor) => {
              const cover = getVendorCoverImage(vendor);
              return (
                <div
                  key={vendor.id}
                  onClick={() => navigate(`/vendor/${vendor.id}`)}
                  className="group bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-orange-400 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={cover}
                      alt={vendor.shopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${vendor.isOpen ? 'bg-emerald-600 text-white' : 'bg-stone-900/80 text-stone-300'}`}>
                        {vendor.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-orange-600">{vendor.category}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{vendor.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 truncate group-hover:text-orange-600 transition">
                      {vendor.shopName}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{vendor.address}, {vendor.city}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Map Callout */}
        <section className="bg-orange-50/70 dark:bg-orange-950/20 border-y border-orange-100 dark:border-orange-900/40 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider">
                Live Google Maps Platform
              </span>
              <h2 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                Never visit a closed street stall again.
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
                ChatMaps connects you to verified street food artisans in real time. See exactly who is serving right now, check live walking distances, and track calorie burn.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/live-map"
                  className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Open Interactive Live Map</span>
                </Link>
                <Link
                  to="/explore"
                  className="px-5 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 font-bold text-sm transition"
                >
                  <span>Explore All Stalls</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2">
                <div className="h-64 sm:h-72 w-full rounded-xl bg-stone-100 dark:bg-stone-800 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  <div className="text-center p-6 z-10 max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-600/30">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-1">
                      Interactive Live Map
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                      Pinpointed locations with custom badges, distance filters, and live directions.
                    </p>
                    <Link
                      to="/live-map"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-sm hover:bg-orange-700 transition"
                    >
                      <span>Launch Live Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PWA Banner */}
        <section className="bg-stone-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Install ChatMaps On Your Device</h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
                Add ChatMaps to your home screen for fast native app speed, offline maps, and push alerts when your favorite food cart fires up the stove.
              </p>
            </div>
            <PWAInstallButton />
          </div>
        </section>
      </div>
    </div>
  );
};

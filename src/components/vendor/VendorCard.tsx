import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Vendor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { favoriteService } from '../../services/favoriteService';
import { getVendorCoverImage } from '../../data/foodImages';
import {
  Star,
  MapPin,
  Heart,
  Clock,
  Compass,
  Phone,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface VendorCardProps {
  vendor: Vendor;
  isFavoritedInitially?: boolean;
  onFavoriteToggle?: (vendorId: string, nextState: boolean) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  isFavoritedInitially = false,
  onFavoriteToggle,
  userCoords
}) => {
  const { userProfile } = useAuth();
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitially);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  // Approximate distance in km using Haversine formula if userCoords available
  const calculateDistance = () => {
    if (!userCoords || !vendor.location) return null;
    const R = 6371; // km
    const dLat = ((vendor.location.lat - userCoords.lat) * Math.PI) / 180;
    const dLon = ((vendor.location.lng - userCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userCoords.lat * Math.PI) / 180) *
        Math.cos((vendor.location.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  const distance = calculateDistance();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userProfile) {
      window.location.href = '/customer/login';
      return;
    }

    setIsTogglingFav(true);
    const nextState = !isFavorited;
    setIsFavorited(nextState);

    try {
      await favoriteService.toggleFavorite(userProfile.uid, vendor.id);
      if (onFavoriteToggle) {
        onFavoriteToggle(vendor.id, nextState);
      }
    } catch (err) {
      console.warn('Favorite toggle failed:', err);
      setIsFavorited(!nextState);
    } finally {
      setIsTogglingFav(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col">
      {/* Image Banner Container */}
      <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
        <img
          src={getVendorCoverImage(vendor)}
          alt={vendor.shopName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Live Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 backdrop-blur-md shadow-sm ${
              vendor.isOpen
                ? 'bg-emerald-600/95 text-white'
                : 'bg-stone-900/85 text-stone-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                vendor.isOpen ? 'bg-white animate-pulse' : 'bg-stone-500'
              }`}
            />
            <span>{vendor.isOpen ? 'Open Now' : 'Closed'}</span>
          </span>

          {vendor.isPureVeg && (
            <span className="w-6 h-6 rounded-md bg-white/95 backdrop-blur-xs flex items-center justify-center border border-emerald-600 shadow-xs" title="Pure Veg Stall">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFav}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-90 ${
            isFavorited
              ? 'bg-rose-50 text-rose-500 hover:bg-white'
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-rose-500'
          }`}
          aria-label="Save to favorites"
        >
          <Heart
            className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`}
          />
        </button>

        {/* Distance Badge if available */}
        {distance && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
            {distance} away
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Hours */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-semibold text-orange-600 uppercase text-[11px] tracking-wider">
              {vendor.category}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{vendor.openingHours}</span>
            </span>
          </div>

          {/* Shop Name */}
          <Link to={`/vendor/${vendor.id}`}>
            <h3 className="font-bold text-base text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {vendor.shopName}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
            {vendor.description}
          </p>

          {/* Address */}
          <div className="flex items-center gap-1 text-xs text-stone-500 mt-2.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{vendor.address}, {vendor.city}</span>
          </div>
        </div>

        {/* Footer info: Rating, Price Range, Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{vendor.rating}</span>
            </div>
            <span className="text-[11px] text-stone-400">
              ({vendor.reviewCount} reviews)
            </span>
            {vendor.priceRange && (
              <span className="text-xs font-bold text-stone-400 ml-1">
                {vendor.priceRange}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {vendor.location && <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.location.lat},${vendor.location.lng}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-stone-600 transition"
              title="Directions"
            >
              <Compass className="w-4 h-4" />
            </a>}
            <Link
              to={`/vendor/${vendor.id}`}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
            >
              View Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

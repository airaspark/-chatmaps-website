import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vendor } from '../types';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { VendorCard } from '../components/vendor/VendorCard';
import { Heart, Compass, LogIn } from 'lucide-react';

export const Favorites: React.FC = () => {
  const { userProfile } = useAuth();
  const [favoriteVendors, setFavoriteVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (userProfile) {
        setLoading(true);
        const list = await favoriteService.getUserFavorites(userProfile.uid);
        setFavoriteVendors(list);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchFavorites();

    const handleUpdate = () => {
      fetchFavorites();
    };
    window.addEventListener('chatmaps_favorites_updated', handleUpdate);
    return () => window.removeEventListener('chatmaps_favorites_updated', handleUpdate);
  }, [userProfile]);

  const handleFavoriteToggle = (vendorId: string, nextState: boolean) => {
    if (!nextState) {
      setFavoriteVendors((prev) => prev.filter((v) => v.id !== vendorId));
    }
  };

  if (!userProfile) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          Save Your Favorite Food Stalls
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mb-6 leading-relaxed">
          Log in with your customer account to save your favorite street stalls, track their opening hours, and get quick access.
        </p>
        <Link
          to="/customer/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition"
        >
          <LogIn className="w-4 h-4" />
          <span>Customer Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Heart className="w-4 h-4 fill-rose-600" />
          <span>Your Bookmarks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Favorite Street Food Stalls
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          You have {favoriteVendors.length} saved street food stalls
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-stone-500">Loading saved stalls...</p>
        </div>
      ) : favoriteVendors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-stone-200 shadow-sm my-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            No favorites saved yet
          </h3>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Whenever you see a tempting dosa stall, momo stand, or chaat vendor, tap the heart icon to save it here.
          </p>
          <Link
            to="/explore"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-block"
          >
            Explore Street Food Near You
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              isFavoritedInitially={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { favoriteService } from '../../services/favoriteService';
import { reviewService } from '../../services/reviewService';
import { Vendor, Review } from '../../types';
import { VendorCard } from '../../components/vendor/VendorCard';
import {
  Heart,
  MessageSquare,
  User,
  Compass,
  Star,
  Settings,
  Sparkles
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [favorites, setFavorites] = useState<Vendor[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (userProfile) {
        setLoading(true);
        const favs = await favoriteService.getUserFavorites(userProfile.uid);
        setFavorites(favs);

        const allRevs = await reviewService.getAllReviewsForAdmin();
        const userRevs = allRevs.filter(r => r.userId === userProfile.uid);
        setMyReviews(userRevs);
        setLoading(false);
      }
    };
    loadData();
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Please Log In</h2>
        <p className="text-stone-500 text-xs mb-6">Log in to view your customer dashboard.</p>
        <Link to="/customer/login" className="px-5 py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl">
          Customer Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-extrabold shadow-inner border border-white/20">
            {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Namaste, {userProfile.displayName || 'Food Explorer'}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                Explorer
              </span>
            </div>
            <p className="text-orange-100 text-xs sm:text-sm mt-1">
              Ready to explore authentic street food stalls in {userProfile.city || 'India'} today?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/explore"
            className="px-4 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-xs shadow-md hover:bg-orange-50 transition active:scale-95 flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Now</span>
          </Link>
          <Link
            to="/customer/profile"
            className="px-3.5 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white font-semibold text-xs backdrop-blur-xs transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-stone-900">{favorites.length}</p>
            <p className="text-xs font-semibold text-stone-500">Favorite Stalls</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-stone-900">{myReviews.length}</p>
            <p className="text-xs font-semibold text-stone-500">Reviews Written</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-stone-900">
              {userProfile.dietaryPreference ? userProfile.dietaryPreference.toUpperCase() : 'ALL'}
            </p>
            <p className="text-xs font-semibold text-stone-500">Diet Preference</p>
          </div>
        </div>
      </div>

      {/* Bookmarked Stalls Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Saved Stalls</span>
          </h2>
          <Link to="/favorites" className="text-xs font-bold text-orange-600 hover:underline">
            View All ({favorites.length})
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
            <p className="text-xs text-stone-500 mb-3">You haven't bookmarked any street food stalls yet.</p>
            <Link to="/explore" className="text-xs font-bold text-orange-600 hover:underline">
              Discover popular street food stalls →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.slice(0, 4).map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} isFavoritedInitially={true} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews written by user */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-600" />
          <span>Your Recent Reviews</span>
        </h2>

        {myReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
            <p className="text-xs text-stone-500 mb-3">No reviews submitted yet.</p>
            <Link to="/explore" className="text-xs font-bold text-orange-600 hover:underline">
              Browse vendors and share your experience →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myReviews.map((rev) => (
              <div key={rev.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}.0</span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <Link to={`/vendor/${rev.vendorId}`} className="text-[11px] font-bold text-orange-600 hover:underline block pt-1">
                  View Stall Page →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

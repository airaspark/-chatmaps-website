import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Vendor, Review } from '../types';
import { vendorService } from '../services/vendorService';
import { reviewService } from '../services/reviewService';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { applyPageMetadata } from '../seo/pageMetadata';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Compass,
  Heart,
  Share2,
  Utensils,
  MessageSquare,
  Sparkles,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';

export const VendorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review Form state
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      const v = await vendorService.getVendorById(id);
      if (v) {
        setVendor(v);
        applyPageMetadata(`/vendor/${encodeURIComponent(v.id)}`, {
          title: `${v.shopName} | Street Food on ChatMaps`,
          description: `${v.category} at ${v.shopName}${v.city ? ` in ${v.city}` : ''}. View stall details, opening status, directions, menu, and reviews on ChatMaps.`,
          indexable: true,
        });
        const revs = await reviewService.getReviewsByVendorId(id);
        setReviews(revs);

        if (userProfile) {
          const fav = await favoriteService.isVendorFavorited(userProfile.uid, id);
          setIsFavorited(fav);
        }
      } else {
        applyPageMetadata(`/vendor/${encodeURIComponent(id)}`, {
          title: 'Street Stall Not Found | ChatMaps',
          description: 'This stall is not currently available on ChatMaps.',
          indexable: false,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [id, userProfile]);

  const handleFavoriteToggle = async () => {
    if (!vendor) return;
    if (!userProfile) {
      window.location.href = '/customer/login';
      return;
    }

    const next = !isFavorited;
    setIsFavorited(next);
    await favoriteService.toggleFavorite(userProfile.uid, vendor.id);
  };

  const handleShare = () => {
    if (navigator.share && vendor) {
      navigator.share({
        title: `${vendor.shopName} on ChatMaps`,
        text: `Check out ${vendor.shopName} street food stall on ChatMaps!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    if (!userProfile) {
      window.location.href = '/customer/login';
      return;
    }
    if (!commentInput.trim()) {
      setReviewError('Please write a few words about your experience.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      const newRev = await reviewService.addReview({
        vendorId: vendor.id,
        userId: userProfile.uid,
        userName: userProfile.displayName || 'Food Lover',
        userPhoto: userProfile.photoURL,
        rating: ratingInput,
        comment: commentInput.trim()
      });

      setReviews([newRev, ...reviews]);
      setCommentInput('');
      setReviewSuccess(true);

      // Refresh vendor stats
      const updated = await vendorService.getVendorById(vendor.id);
      if (updated) setVendor(updated);

      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
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
      <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Street Stall Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">This stall may have moved or is pending verification.</p>
        <Link to="/explore" className="px-5 py-2.5 bg-orange-600 text-white font-bold text-sm rounded-xl">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden mb-8 shadow-sm">
        <div className="md:col-span-2 aspect-16/9 md:aspect-auto h-72 md:h-96 relative">
          <img
            src={vendor.bannerImage || vendor.photos[0]}
            alt={vendor.shopName}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 backdrop-blur-md shadow-md ${
              vendor.isOpen ? 'bg-emerald-600 text-white' : 'bg-stone-900/80 text-stone-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${vendor.isOpen ? 'bg-white animate-pulse' : 'bg-stone-500'}`} />
              <span>{vendor.isOpen ? 'Open Now' : 'Closed'}</span>
            </span>

            {vendor.isPureVeg && (
              <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Pure Veg</span>
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-3 h-96">
          <div className="flex-1 overflow-hidden relative">
            <img
              src={vendor.photos[1] || vendor.bannerImage}
              alt={`${vendor.shopName} dish`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 overflow-hidden relative">
            <img
              src={vendor.photos[2] || vendor.photos[0] || vendor.bannerImage}
              alt={`${vendor.shopName} stall`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Vendor info, Menu, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Block */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  {vendor.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-0.5">
                  {vendor.shopName}
                </h1>
                <p className="text-xs text-stone-400 mt-0.5">
                  Managed by {vendor.ownerName}
                </p>
              </div>

              {/* Rating Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="font-extrabold text-sm">{vendor.rating}</span>
                <span className="text-xs text-stone-500 font-medium">({vendor.reviewCount} reviews)</span>
              </div>
            </div>

            <p className="text-stone-600 text-sm leading-relaxed mt-3">
              {vendor.description}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-stone-100">
              {vendor.location && <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.location.lat},${vendor.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Get Directions</span>
              </a>}

              <a
                href={`tel:${vendor.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
              >
                <Phone className="w-4 h-4" />
                <span>Call Stall</span>
              </a>

              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorited ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Menu Section */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-bold text-stone-900">
                  Street Food Menu
                </h2>
              </div>
              <span className="text-xs text-stone-400 font-medium">
                {vendor.menu.length} Items Listed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vendor.menu.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between hover:border-orange-200 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-xs border border-stone-300 flex items-center justify-center p-0.5 shrink-0">
                          <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 leading-snug">
                          {item.name}
                        </h4>
                      </div>

                      <span className="font-extrabold text-sm text-stone-900 shrink-0">
                        ₹{item.price}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {item.isPopular && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        <span>Bestseller</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-bold text-stone-900">
                  Customer Reviews
                </h2>
              </div>
              <span className="text-xs font-semibold text-stone-500">
                {reviews.length} total reviews
              </span>
            </div>

            {/* Write a Review Box */}
            <div className="bg-orange-50/50 p-4 sm:p-5 rounded-2xl border border-orange-100">
              <h3 className="font-bold text-sm text-stone-900 mb-1">
                Rate this Street Food Stall
              </h3>
              <p className="text-xs text-stone-500 mb-3">
                Help other street food lovers find authentic gems.
              </p>

              {reviewSuccess && (
                <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your review has been published.</span>
                </div>
              )}

              {reviewError && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{reviewError}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                {/* Star Rating Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= ratingInput
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-600 ml-1">
                    {ratingInput} of 5 Stars
                  </span>
                </div>

                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="What was the taste like? Did you try the special chutney or masala? How was hygiene?"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Posting...' : 'Post Review'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-4 pt-2">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                        {rev.userName.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-stone-900">{rev.userName}</h5>
                        <p className="text-[10px] text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <span>★</span>
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-10">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Timings, Address & Map Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Timing & Contact card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-stone-900">
              Timings & Location
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Opening Hours</p>
                  <p className="text-stone-600 mt-0.5">{vendor.openingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Stall Address</p>
                  <p className="text-stone-600 mt-0.5">{vendor.address}</p>
                  {vendor.landmark && (
                    <p className="text-stone-400 text-[11px] mt-0.5">Landmark: {vendor.landmark}</p>
                  )}
                  <p className="text-stone-500 text-[11px] font-semibold mt-0.5">{vendor.city} - {vendor.postalCode}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Vendor Contact</p>
                  <p className="text-stone-600 mt-0.5">{vendor.phone}</p>
                </div>
              </div>
            </div>

            {/* Direct Map Route Trigger */}
            <div className="pt-3 border-t border-stone-100">
              {vendor.location && <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.location.lat},${vendor.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Compass className="w-4 h-4" />
                <span>Open in Google Maps Navigation</span>
              </a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

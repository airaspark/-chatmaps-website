import React, { useState } from 'react';
import { Menu, MapPin, ChevronDown, Bell, X, Navigation, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface MobileHeaderProps {
  onOpenMobileMenu: () => void;
}

const INDIAN_FOOD_CITIES = [
  'Mysuru',
  'Bengaluru (Indiranagar / VV Puram)',
  'Mumbai (Vile Parle / Chowpatty)',
  'Delhi (Chandni Chowk)',
  'Jaipur (Badi Chaupar)',
  'Kolkata (Park Street)',
  'Hyderabad (Charminar)'
];

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenMobileMenu }) => {
  const { userProfile } = useAuth();
  const {
    selectedCity,
    setSelectedCity,
    gpsActive,
    toggleGps,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    t
  } = useApp();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Name from profile or default 'Suri' (matching user's Android app screenshot)
  const customerName = userProfile?.displayName || 'Suri';

  const handleOpenNotifications = () => {
    setShowNotificationsModal(true);
    markNotificationsAsRead();
  };

  return (
    <>
      <header className="xl:hidden sticky top-0 z-40 bg-[#121212] text-white px-4 md:px-8 py-3 shadow-md border-b border-stone-800 flex items-center justify-between">
        {/* Left: Hamburger & Greeting */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition active:scale-95"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg md:text-xl text-white tracking-tight">
                {t('greeting')}, {customerName}
              </span>
              <span className="text-base md:text-lg" role="img" aria-label="Waving hand">👋</span>
            </div>

            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1 text-[11px] sm:text-xs text-amber-400 font-semibold hover:text-amber-300 transition text-left mt-0.5"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate max-w-[170px] sm:max-w-xs">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Right: GPS Live Badge & Notification Bell */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* GPS Live Pill */}
          <button
            onClick={toggleGps}
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-stone-900 border border-stone-700/80 hover:border-emerald-500/50 text-stone-200 text-xs font-semibold shadow-xs transition active:scale-95"
            title="Toggle GPS Live Location"
          >
            <span
              className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${
                gpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-500'
              }`}
            />
            <span className="text-[11px] md:text-xs font-bold text-stone-200">
              {t('gpsLive')}
            </span>
          </button>

          {/* Notification Bell with Dot */}
          <button
            onClick={handleOpenNotifications}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-800 transition relative active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-[#121212]" />
            )}
          </button>
        </div>
      </header>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base">Select Your Location</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Live detect button */}
            <button
              onClick={() => {
                toggleGps();
                setShowLocationModal(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold text-xs mb-4 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition"
            >
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-orange-600" />
                <span>Use Current Live GPS</span>
              </div>
              <span className="text-[10px] uppercase bg-orange-600 text-white px-2 py-0.5 rounded-full">
                Accurate
              </span>
            </button>

            {/* City Presets */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {INDIAN_FOOD_CITIES.map((city) => {
                const isSelected = selectedCity.startsWith(city.split(' ')[0]);
                return (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowLocationModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-left transition ${
                      isSelected
                        ? 'bg-orange-600 text-white font-bold'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span>{city}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base">Street Food Alerts</h3>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-stone-900 dark:text-white">{n.title}</h5>
                    <span className="text-[10px] text-stone-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="mt-4 w-full py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-black text-white text-xs font-bold rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

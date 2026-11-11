import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Flame, Heart, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { t } = useApp();

  const isHome = location.pathname === '/';
  const isMap = location.pathname === '/live-map';
  const isCalories = location.pathname === '/calories';
  const isFavorites = location.pathname === '/favorites';
  const isProfile = location.pathname === '/customer/profile' || location.pathname === '/profile';

  return (
    <nav
      aria-label="Application Bottom Navigation"
      className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)] transition-all"
    >
      <div className="max-w-md md:max-w-2xl mx-auto grid grid-cols-5 items-end h-16 md:h-18 px-2 md:px-6 relative select-none">
        {/* 1. HOME */}
        <NavLink
          to="/"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors group active:scale-95 ${
            isHome
              ? 'text-orange-600 dark:text-orange-500 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          <Home className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 ${isHome ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] md:text-xs tracking-tight mt-1 uppercase font-bold transition-colors ${
            isHome ? 'text-orange-600 dark:text-orange-500' : 'text-stone-500 dark:text-stone-400'
          }`}>
            {t('home')}
          </span>
        </NavLink>

        {/* 2. LIVE MAP */}
        <NavLink
          to="/live-map"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors group active:scale-95 ${
            isMap
              ? 'text-orange-600 dark:text-orange-500 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          <Map className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 ${isMap ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] md:text-xs tracking-tight mt-1 uppercase font-bold transition-colors ${
            isMap ? 'text-orange-600 dark:text-orange-500' : 'text-stone-500 dark:text-stone-400'
          }`}>
            {t('liveMap')}
          </span>
        </NavLink>

        {/* 3. CALORIES (Central Prominent Elevated Orange Button) */}
        <div className="flex flex-col items-center justify-center relative -mt-6 md:-mt-8">
          <NavLink
            to="/calories"
            aria-label="Calories & Activity Tracker"
            className="group relative flex flex-col items-center focus:outline-none"
          >
            {/* Elevated Circular Orange Button with white flame */}
            <div
              className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_8px_24px_rgba(234,88,12,0.45)] ring-4 ring-white dark:ring-stone-950 active:scale-90 ${
                isCalories
                  ? 'bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 scale-105'
                  : 'bg-gradient-to-tr from-orange-500 to-orange-600 group-hover:scale-105'
              }`}
            >
              <Flame className="w-7 h-7 md:w-8 md:h-8 text-white fill-white transition-transform duration-200 group-hover:scale-110" />
            </div>

            <span
              className={`text-[10px] md:text-xs tracking-tight mt-1 uppercase font-extrabold transition-colors ${
                isCalories
                  ? 'text-orange-600 dark:text-orange-500'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {t('calories')}
            </span>
          </NavLink>
        </div>

        {/* 4. FAVORITES */}
        <NavLink
          to="/favorites"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors group active:scale-95 ${
            isFavorites
              ? 'text-orange-600 dark:text-orange-500 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          <Heart className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 ${isFavorites ? 'scale-110 fill-orange-600 stroke-orange-600 stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] md:text-xs tracking-tight mt-1 uppercase font-bold transition-colors ${
            isFavorites ? 'text-orange-600 dark:text-orange-500' : 'text-stone-500 dark:text-stone-400'
          }`}>
            {t('favorites')}
          </span>
        </NavLink>

        {/* 5. PROFILE */}
        <NavLink
          to="/customer/profile"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors group active:scale-95 ${
            isProfile
              ? 'text-orange-600 dark:text-orange-500 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          <User className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 ${isProfile ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className={`text-[10px] md:text-xs tracking-tight mt-1 uppercase font-bold transition-colors ${
            isProfile ? 'text-orange-600 dark:text-orange-500' : 'text-stone-500 dark:text-stone-400'
          }`}>
            {t('profile')}
          </span>
        </NavLink>
      </div>
    </nav>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Compass, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20 bg-stone-50 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <MapPin className="w-8 h-8" />
        </div>

        <div>
          <span className="text-4xl sm:text-5xl font-black text-orange-600">404</span>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-2">
            Wrong Alley! Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Looks like this street food stall or page doesn't exist or has moved to another corner.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/explore"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Stalls</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

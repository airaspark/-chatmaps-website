import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ShieldCheck, Flame, Users, Store, ArrowRight } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="flex-1 bg-stone-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-orange-500 to-orange-600 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            About ChatMaps
          </h1>
          <p className="text-base sm:text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed">
            Digitizing and elevating India's vibrant street food culture with live availability, accurate geolocation, and genuine community reviews.
          </p>
        </div>
      </section>

      {/* Mission & Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Our Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
              Every city in India has a legendary street food stall with an unforgettable flavor.
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Street food artisans are the heartbeat of India's culinary soul. Yet, until now, small vendors lacked the digital tools to show their live opening hours, exact alleyway pins, and daily specials. Foodies often arrived only to discover a favorite stall closed or shifted.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              <strong>ChatMaps</strong> (<a href="https://chatmaps.in" className="text-orange-600 hover:underline">chatmaps.in</a>) was created to bridge this gap: providing street-food vendors with an instant, one-tap platform to signal their live status and allowing food lovers to discover verified gems wherever they go.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-200 aspect-4/3">
            <img
              src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
              alt="Indian street food vendor making pani puri"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Verified Vendors</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every vendor profile is verified by administrators to maintain authenticity, hygiene awareness, and accurate coordinates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Real-Time Open/Closed</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Vendors can toggle their status live with one tap from their vendor console, keeping customers informed in real time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Community Driven</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Genuine reviews written by authentic foodies who celebrate traditional recipes, secret chutneys, and local flavor legends.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-8 sm:p-10 text-center space-y-4">
          <h3 className="text-2xl font-extrabold text-stone-900">
            Join the Street Food Movement
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm max-w-xl mx-auto">
            Whether you are looking for Mumbai's crispiest Sev Puri, Bangalore's fluffiest Benne Dosa, or Delhi's heritage Dahi Bhalla — ChatMaps is your personal food compass.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/explore"
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition"
            >
              Explore Street Stalls
            </Link>
            <Link
              to="/vendor/register"
              className="px-6 py-3 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition"
            >
              Register Your Food Stall
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

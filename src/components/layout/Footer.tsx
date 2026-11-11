import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Shield, Phone, Mail, Instagram, Twitter, Facebook } from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                Chat<span className="text-orange-500">Maps</span>
              </span>
            </Link>

            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              Discover authentic, hygienic, and mouth-watering street food stalls across India with live open/closed availability, verified locations, customer reviews, and menus.
            </p>

            <div className="pt-2">
              <PWAInstallButton variant="banner" className="py-2 px-3.5" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-orange-600 hover:text-white flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-orange-600 hover:text-white flex items-center justify-center transition"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-orange-600 hover:text-white flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-orange-400 transition">Nearby Street Food</Link>
              </li>
              <li>
                <Link to="/live-map" className="hover:text-orange-400 transition">Interactive Live Map</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-orange-400 transition">Saved Stalls</Link>
              </li>
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              For Food Vendors
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/vendor/register" className="text-orange-400 hover:text-orange-300 font-semibold transition">
                  Register Your Stall
                </Link>
              </li>
              <li>
                <Link to="/vendor/login" className="hover:text-orange-400 transition">Vendor Login</Link>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="hover:text-orange-400 transition">Vendor Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Legal & Privacy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy-policy" className="hover:text-orange-400 transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-orange-400 transition">Terms of Service</Link>
              </li>
              <li>
                <Link to="/delete-account" className="hover:text-orange-400 transition text-rose-400 hover:text-rose-300">Account Deletion</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-400 transition">Contact / Privacy Support</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 transition">About ChatMaps</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} ChatMaps • Developed and Designed by Airaspark Industries, Mysuru (<a href="https://airaspark.com" className="text-orange-500 hover:underline">airaspark.com</a>). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-stone-400">
            <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/delete-account" className="hover:underline text-rose-400">Delete Account</Link>
            <Link to="/contact" className="hover:underline">Support</Link>
            <span>•</span>
            <a href="mailto:privacy@chatmaps.in" className="hover:text-orange-400">privacy@chatmaps.in</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

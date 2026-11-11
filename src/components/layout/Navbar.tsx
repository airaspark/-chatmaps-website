import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Menu,
  X,
  MapPin,
  Heart,
  Compass,
  Store,
  User,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { userProfile, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="hidden xl:block sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white group-hover:text-orange-600 transition-colors">
                Chat<span className="text-orange-600">Maps</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 rounded-md">
                Live
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-medium leading-none -mt-0.5">
              Authentic Street Food
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
              isActive('/')
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800'
            }`}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
              isActive('/explore')
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </Link>
          <Link
            to="/live-map"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
              isActive('/live-map')
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Live Map</span>
          </Link>
          <Link
            to="/calories"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
              isActive('/calories')
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Calories</span>
          </Link>
          <Link
            to="/favorites"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
              isActive('/favorites')
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Favorites</span>
          </Link>
          <Link
            to="/about"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
              isActive('/about')
                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/70 dark:hover:bg-stone-800'
            }`}
          >
            About
          </Link>
        </nav>

        {/* Right Action Icons & User Profile / Login */}
        <div className="flex items-center gap-2.5">
          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton variant="nav" />
          </div>

          {/* User Account / Login */}
          {userProfile ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-full border border-stone-200 hover:border-orange-300 hover:bg-orange-50/50 transition"
              >
                <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                  {userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    userProfile.displayName.charAt(0)
                  )}
                </div>
                <span className="text-xs font-bold text-stone-800 max-w-[100px] truncate hidden md:inline">
                  {userProfile.displayName}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-orange-100 text-orange-700">
                  {role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs text-stone-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-stone-900 truncate">{userProfile.email}</p>
                  </div>

                  {role === 'customer' && (
                    <>
                      <Link
                        to="/customer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <User className="w-4 h-4" />
                        <span>Customer Dashboard</span>
                      </Link>
                      <Link
                        to="/customer/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile & Preferences</span>
                      </Link>
                    </>
                  )}

                  {role === 'vendor' && (
                    <>
                      <Link
                        to="/vendor/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Store className="w-4 h-4 text-orange-600" />
                        <span>Vendor Dashboard</span>
                      </Link>
                      <Link
                        to="/vendor/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Store className="w-4 h-4" />
                        <span>Edit Shop & Menu</span>
                      </Link>
                    </>
                  )}

                  <div className="border-t border-stone-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/customer/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-orange-600 transition"
              >
                Log In
              </Link>
              <Link
                to="/vendor/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition active:scale-95"
              >
                Vendor Portal
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-orange-50 hover:text-orange-600 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

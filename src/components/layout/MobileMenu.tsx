import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  X,
  MapPin,
  Home,
  Compass,
  Map,
  Flame,
  Heart,
  User,
  LogIn,
  Store,
  UserPlus,
  Info,
  Mail,
  Shield,
  FileText,
  UserX,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { userProfile, role, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useApp();
  const location = useLocation();

  if (!isOpen) return null;

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-start">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Menu Container (Left side) */}
      <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-r border-stone-200 dark:border-stone-800">
        <div>
          {/* Top Brand Header */}
          <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white">
                  Chat<span className="text-orange-500">Maps</span>
                </span>
                <p className="text-[10px] text-stone-400 font-medium">Street Food Finder</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile strip if authenticated */}
          {userProfile && (
            <div className="p-4 bg-orange-50 dark:bg-stone-800/80 border-b border-orange-100 dark:border-stone-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-sm">
                {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-stone-900 dark:text-white truncate">
                  {userProfile.displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-sm bg-orange-200 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                    {role}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 truncate">{userProfile.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links list */}
          <div className="p-3 space-y-1">
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-orange-500" />
                <span>{t('home')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            <Link
              to="/explore"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/explore')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-orange-500" />
                <span>{t('explore')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            <Link
              to="/live-map"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/live-map')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Map className="w-4 h-4 text-orange-500" />
                <span>{t('liveMap')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            <Link
              to="/calories"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/calories')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{t('calories')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            <Link
              to="/favorites"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/favorites')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{t('favorites')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            <Link
              to="/customer/profile"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/customer/profile')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-orange-500" />
                <span>{t('profile')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            {/* Quick Language & Theme Controls */}
            <div className="py-2.5 px-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl my-2 space-y-2 border border-stone-200/80 dark:border-stone-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <Globe className="w-4 h-4 text-orange-500" />
                  <span>Language</span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-stone-900 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      language === 'en'
                        ? 'bg-orange-600 text-white'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('kn')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      language === 'kn'
                        ? 'bg-orange-600 text-white'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    ಕನ್ನಡ
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>{theme === 'dark' ? t('darkMode') : t('lightMode')}</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300"
                >
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>

            {/* Portal & Accounts */}
            <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800">
              <span className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Accounts & Stalls
              </span>
            </div>

            {!userProfile ? (
              <>
                <Link
                  to="/customer/login"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <div className="flex items-center gap-3">
                    <LogIn className="w-4 h-4 text-stone-500" />
                    <span>{t('customerLogin')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                </Link>

                <Link
                  to="/vendor/login"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-orange-500" />
                    <span>{t('vendorLogin')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                </Link>

                <Link
                  to="/vendor/register"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-orange-600 text-white shadow-sm hover:bg-orange-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-4 h-4 text-white" />
                    <span>{t('registerStall')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-orange-200" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/vendor/dashboard"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-orange-500" />
                    <span>Vendor Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                </Link>

                <Link
                  to="/vendor/register"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold text-orange-600 font-bold hover:bg-orange-50 dark:hover:bg-stone-800"
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-orange-500" />
                    <span>Register New Food Cart</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
                </Link>
              </>
            )}

            <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800">
              <span className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Legal & Support
              </span>
            </div>

            <Link
              to="/privacy-policy"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/privacy-policy')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-stone-500" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            <Link
              to="/terms"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/terms')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-stone-500" />
                <span>Terms of Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            <Link
              to="/delete-account"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/delete-account')
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold'
                  : 'text-rose-600/90 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserX className="w-4 h-4 text-rose-500" />
                <span>Account Deletion</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-300 dark:text-rose-700" />
            </Link>

            <Link
              to="/contact"
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/contact')
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-stone-500" />
                <span>Contact & Privacy Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>

            <Link
              to="/about"
              onClick={handleLinkClick}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-stone-500" />
                <span>{t('about')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600" />
            </Link>
          </div>
        </div>

        {/* Bottom PWA & Logout footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-3 bg-stone-50/70 dark:bg-stone-900">
          <div className="flex justify-center">
            <PWAInstallButton variant="banner" className="w-full justify-center py-2.5 text-xs" />
          </div>

          {userProfile && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition border border-rose-200 dark:border-rose-900"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          )}

          <p className="text-[11px] text-center text-stone-400">
            ChatMaps • chatmaps.in
          </p>
        </div>
      </div>
    </div>
  );
};

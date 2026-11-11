import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Check,
  AlertCircle,
  Save,
  Utensils,
  Moon,
  Sun,
  Globe,
  Trash2,
  Heart,
  Flame,
  AlertTriangle,
  X,
  Shield,
  FileText,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { userProfile, updateProfileData, deleteAccount } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useApp();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [city, setCity] = useState(userProfile?.city || 'Bangalore');
  const [dietaryPreference, setDietaryPreference] = useState<'all' | 'veg' | 'jain'>(
    userProfile?.dietaryPreference || 'all'
  );
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!userProfile) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Please Log In</h2>
        <p className="text-stone-500 dark:text-stone-400 text-xs mb-4">
          You need to be logged in to view your profile and account settings.
        </p>
        <Link
          to="/customer/login"
          className="inline-block px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold"
        >
          Customer Login
        </Link>
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError('');
    try {
      const url = await storageService.uploadImage(file, `profiles/${userProfile.uid}/avatar.jpg`);
      setPhotoURL(url);
    } catch (err: any) {
      setError('Failed to upload image. Please try another file.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfileData({
        displayName,
        phone,
        city,
        dietaryPreference,
        photoURL
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      navigate('/');
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete account. Please re-authenticate and try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              {t('profile')} & Account Settings
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Manage your personal street food profile, language, and theme
            </p>
          </div>

          {/* Quick shortcuts */}
          <div className="flex items-center gap-2">
            <Link
              to="/favorites"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold text-xs border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition"
            >
              <Heart className="w-3.5 h-3.5 fill-orange-500" />
              <span>{t('favorites')}</span>
            </Link>
            <Link
              to="/calories"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{t('calories')}</span>
            </Link>
          </div>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-orange-600 text-white font-black text-2xl flex items-center justify-center overflow-hidden border-2 border-orange-200 shadow-md">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-stone-900 text-white hover:bg-orange-600 transition cursor-pointer shadow-md">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">Profile Photo</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {uploadingPhoto ? 'Uploading image...' : 'Tap camera icon to update avatar'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-medium text-stone-900 dark:text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={userProfile.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-medium text-stone-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">Account email is tied to authentication</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-medium text-stone-900 dark:text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                City / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mysuru, Bengaluru, Mumbai, Delhi..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-medium text-stone-900 dark:text-white outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Dietary Preference selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-orange-600" />
                <span>Food & Dietary Preference</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'all', label: 'All Street Food' },
                  { id: 'veg', label: 'Pure Veg Only' },
                  { id: 'jain', label: 'Jain Friendly' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDietaryPreference(item.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                      dietaryPreference === item.id
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* App Preferences: Language & Theme */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-stone-900 dark:text-white">
          App Preferences & Appearance
        </h2>

        {/* Language selector */}
        <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                {t('language')}
              </h4>
              <p className="text-[11px] text-stone-400">
                Choose between English and Kannada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                language === 'en'
                  ? 'bg-white dark:bg-stone-900 text-orange-600 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('kn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                language === 'kn'
                  ? 'bg-white dark:bg-stone-900 text-orange-600 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                Display Theme
              </h4>
              <p className="text-[11px] text-stone-400">
                Switch between Light mode and Dark mode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-bold transition text-stone-800 dark:text-stone-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>

      {/* Legal, Privacy & Compliance */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-stone-900 dark:text-white">
          Legal & Privacy Policies
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Review your consumer rights, data privacy protections, and support channels
        </p>

        <div className="divide-y divide-stone-100 dark:divide-stone-800 pt-1">
          <Link
            to="/privacy-policy"
            className="flex items-center justify-between py-3 hover:text-orange-600 transition"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-orange-500" />
              <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                Privacy Policy
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/terms"
            className="flex items-center justify-between py-3 hover:text-orange-600 transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-orange-500" />
              <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                Terms of Service
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/delete-account"
            className="flex items-center justify-between py-3 hover:text-rose-600 transition"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
                Account Deletion Guide & Erasure
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/contact"
            className="flex items-center justify-between py-3 hover:text-orange-600 transition"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
                Contact & Privacy Support (privacy@chatmaps.in)
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </Link>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl p-6 sm:p-8 border border-rose-200/80 dark:border-rose-900/40 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-extrabold text-sm text-rose-900 dark:text-rose-200">
              {t('deleteAccount')}
            </h3>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/70 mt-1 leading-relaxed">
              Permanently delete your ChatMaps customer account, saved favorite stalls, and reviews. This action cannot be reversed.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('deleteAccount')}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Delete Account</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Are you sure you want to permanently delete your account? All your favorites, calorie history, and reviews will be erased.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-black outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmationText !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Trash2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Mail,
  UserX,
  HelpCircle,
  Database,
  Lock,
  ArrowLeft
} from 'lucide-react';

export const AccountDeletion: React.FC = () => {
  const { userProfile, deleteAccount, currentUser } = useAuth();
  const navigate = useNavigate();

  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInAppModal, setShowInAppModal] = useState(false);

  const handleDeleteCurrentAccount = async () => {
    if (confirmInput !== 'DELETE') {
      setErrorMessage('Please type DELETE in capital letters to confirm.');
      return;
    }

    setIsDeleting(true);
    setErrorMessage('');

    try {
      await deleteAccount();
      setDeletionSuccess(true);
      setShowInAppModal(false);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Failed to complete automatic account deletion. You may need to log out and log back in, or contact privacy@chatmaps.in.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 bg-stone-50 dark:bg-stone-950 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 text-stone-800 dark:text-stone-200 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-orange-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200">Account Deletion</span>
        </div>

        {/* Header Card */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  Permanent Account Deletion
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                  ChatMaps User Data Erasure & Privacy Rights
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-stone-500 dark:text-stone-400 font-medium sm:self-end">
              <div>Privacy Desk: <strong className="text-stone-800 dark:text-stone-200">privacy@chatmaps.in</strong></div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            At <strong>ChatMaps</strong>, we respect your right to be forgotten. Customers and vendors have the absolute right to permanently delete their account and associated personal data at any time. This page details the exact deletion process, what data is permanently wiped, and how to request deletion if you cannot access your account.
          </p>
        </div>

        {/* Deletion Success Notice (Only shown if deletion was actually completed) */}
        {deletionSuccess && (
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Account Permanently Deleted</span>
            </div>
            <p className="text-xs leading-relaxed">
              Your ChatMaps account, authentication credentials, and associated user profile have been successfully and permanently purged from our Firebase systems.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
              >
                <span>Return to Homepage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Step-by-Step Account Deletion Guide */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-6">
          <h2 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>How to Permanently Delete Your Account (6 Steps)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { step: '1', title: 'Sign In to Your Account', desc: 'Sign in to your ChatMaps customer or vendor account using your registered email and password or Google Sign-In.' },
              { step: '2', title: 'Open Profile Settings', desc: 'Navigate to the Profile tab from the bottom navigation bar or click your name in the menu to open Account Settings.' },
              { step: '3', title: 'Select "Delete Account"', desc: 'Scroll to the bottom of the Settings screen and click the red "Delete Account" button in the Danger Zone.' },
              { step: '4', title: 'Review Deletion Warning', desc: 'Read the permanent data removal summary detailing all bookmarks, food diaries, and reviews that will be erased.' },
              { step: '5', title: 'Complete Verification', desc: 'Complete any required security verification or re-authentication with your email password or Google credentials.' },
              { step: '6', title: 'Confirm Deletion with "DELETE"', desc: 'Type DELETE into the confirmation field and click "Permanently Delete My Account" to finalize the purge.' }
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-1.5">
                <div className="flex items-center gap-2 font-black text-sm text-stone-900 dark:text-stone-100">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">
                    {s.step}
                  </span>
                  <span>{s.title}</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed pl-8">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Action button if user is currently signed in */}
          {userProfile && !deletionSuccess && (
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
              <div>
                <p className="font-extrabold text-xs sm:text-sm text-rose-900 dark:text-rose-200">
                  You are currently signed in as {userProfile.displayName} ({userProfile.email})
                </p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                  You can initiate permanent account deletion directly from this session.
                </p>
              </div>

              <button
                onClick={() => setShowInAppModal(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete This Account Now</span>
              </button>
            </div>
          )}
        </div>

        {/* What Gets Removed vs Retained */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-6 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">
            What Data is Removed During Deletion
          </h2>

          <div className="space-y-3">
            <p>
              When you confirm account deletion, our backend systems automatically and permanently remove:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Firebase Authentication Account:</strong> Your email, hashed credentials, and authentication UID are permanently destroyed.</li>
              <li><strong>Cloud Firestore User Records:</strong> Your <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-xs">users/{'{uid}'}</code> document, saved dietary preferences, language settings, bookmarked favorite stalls, and notification tokens.</li>
              <li><strong>Personal Activity & Calorie Diary:</strong> All logged street food diary entries, daily targets, and walking route breadcrumbs stored in Firestore.</li>
              <li><strong>Firebase Storage Uploads:</strong> Profile photos or personal media files uploaded to our cloud buckets.</li>
              <li><strong>Firebase Realtime Database Records:</strong> Temporary active session or presence state records, where applicable.</li>
              <li><strong>Associated Personal Identifiers:</strong> Contact phone numbers and correspondence metadata.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Legal Retention Notice</span>
            </div>
            <p className="leading-relaxed">
              In accordance with Indian legal requirements, cybersecurity compliance, and fraud prevention regulations, certain transactional logs, security audit records, or public food hygiene records may be retained in encrypted archives for the minimum statutory period required by law before final destruction.
            </p>
          </div>
        </div>

        {/* Manual Request & Privacy Support */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cannot Access Your Account?</h3>
              <p className="text-xs text-stone-400">
                You can submit a manual account deletion request to our Data Protection Officer
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            If you have lost access to your login email, Google account, or phone number, email our privacy desk directly from your registered email address with the subject line <strong>"Account Deletion Request"</strong>:
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-800/80 p-4 rounded-2xl border border-stone-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Privacy Desk Email</span>
              <a
                href="mailto:privacy@chatmaps.in?subject=Account%20Deletion%20Request"
                className="text-orange-400 font-bold hover:underline text-sm sm:text-base"
              >
                privacy@chatmaps.in
              </a>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition active:scale-95 shrink-0"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contact Privacy Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modal (for signed-in users) */}
      {showInAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                Permanent Deletion
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              This action is permanent and cannot be undone. All your bookmarks, saved stalls, calorie diaries, and profile records will be permanently erased.
            </p>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Type <strong className="text-rose-600">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm font-mono font-bold text-stone-900 dark:text-stone-100 outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowInAppModal(false);
                  setConfirmInput('');
                  setErrorMessage('');
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrentAccount}
                disabled={confirmInput !== 'DELETE' || isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

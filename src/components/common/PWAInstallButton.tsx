import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'nav' | 'hero' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'nav'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General fallback guide
      setShowIOSModal(true);
    }
  };

  const buttonContent = (
    <>
      <Download className="w-4 h-4 animate-bounce" />
      <span>{variant === 'hero' ? 'Install ChatMaps App' : 'Get App'}</span>
    </>
  );

  return (
    <>
      {variant === 'hero' ? (
        <button
          onClick={handleClick}
          className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-orange-600 font-bold rounded-xl shadow-lg shadow-orange-950/20 hover:bg-orange-50 active:scale-95 transition-all text-sm md:text-base border border-orange-200 ${className}`}
        >
          {buttonContent}
        </button>
      ) : variant === 'banner' ? (
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install PWA</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-800 text-xs font-semibold rounded-full border border-orange-200 transition active:scale-95 ${className}`}
          title="Install ChatMaps on your device"
        >
          {buttonContent}
        </button>
      )}

      {/* iOS & Browser Install Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 text-orange-600">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Install ChatMaps
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Add ChatMaps to your Home Screen for full-screen navigation, offline vendor access, and instant street-food discovery.
            </p>

            <div className="space-y-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div className="leading-snug">
                  In Safari or Chrome, tap the <strong className="inline-flex items-center gap-1 text-orange-700 font-semibold"><Share2 className="w-3.5 h-3.5 inline" /> Share</strong> icon or browser menu.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div className="leading-snug">
                  Scroll down and tap <strong className="inline-flex items-center gap-1 text-orange-700 font-semibold"><PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div className="leading-snug">
                  Tap <strong>Add</strong> in the top-right corner. ChatMaps will appear on your phone home screen!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl shadow-md transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileHeader } from './MobileHeader';
import { MobileMenu } from './MobileMenu';
import { BottomNavigation } from './BottomNavigation';
import { Footer } from './Footer';
import { OfflineIndicator } from '../common/OfflineIndicator';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Mobile Dark Header (Matching Android App) */}
      <MobileHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Desktop Navbar (Large desktop screens only) */}
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Slide-out Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area - padded at bottom on phones and tablets so fixed 5-item bottom nav never overlaps */}
      <main className="flex-1 flex flex-col pb-28 xl:pb-0">
        <Outlet />
      </main>

      {/* Footer (Visible across Desktop, Tablet, and Mobile above the fixed bottom nav) */}
      <div className="pb-20 xl:pb-0">
        <Footer />
      </div>

      {/* Mobile & Tablet Fixed 5-Item Bottom Navigation Bar */}
      <BottomNavigation />

      <OfflineIndicator />
    </div>
  );
};


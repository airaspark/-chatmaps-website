import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';

// Public & Customer Pages
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { LiveMap } from './pages/LiveMap';
import { Calories } from './pages/Calories';
import { VendorDetails } from './pages/VendorDetails';
import { Favorites } from './pages/Favorites';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsConditions } from './pages/legal/TermsConditions';
import { AccountDeletion } from './pages/legal/AccountDeletion';
import { NotFound } from './pages/NotFound';

// Auth Pages
import { CustomerLogin } from './pages/auth/CustomerLogin';
import { CustomerRegister } from './pages/auth/CustomerRegister';
import { VendorLogin } from './pages/auth/VendorLogin';
import { VendorRegister } from './pages/auth/VendorRegister';
import { AdminLogin } from './pages/auth/AdminLogin';

// Protected Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Vendor Pages
import { VendorDashboard } from './pages/vendor/VendorDashboard';
import { VendorProfile } from './pages/vendor/VendorProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RequireAdmin } from './components/auth/RequireAdmin';
import { RouteMetadata } from './seo/RouteMetadata';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <RouteMetadata />
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public discovery routes */}
              <Route index element={<Home />} />
              <Route path="explore" element={<Explore />} />
              <Route path="live-map" element={<LiveMap />} />
              <Route path="calories" element={<Calories />} />
              <Route path="vendor/:id" element={<VendorDetails />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<Navigate to="/terms-conditions" replace />} />
              <Route path="terms-conditions" element={<TermsConditions />} />
              <Route path="delete-account" element={<AccountDeletion />} />

              {/* Customer authentication & dashboard */}
              <Route path="customer/login" element={<CustomerLogin />} />
              <Route path="customer/register" element={<CustomerRegister />} />
              <Route path="customer/dashboard" element={<CustomerDashboard />} />
              <Route path="customer/profile" element={<CustomerProfile />} />
              <Route path="profile" element={<CustomerProfile />} />

              {/* Vendor authentication & management */}
              <Route path="vendor/login" element={<VendorLogin />} />
              <Route path="vendor/register" element={<VendorRegister />} />
              <Route path="vendor/dashboard" element={<VendorDashboard />} />
              <Route path="vendor/profile" element={<VendorProfile />} />

              {/* Aliases & 404 */}
              <Route path="login" element={<Navigate to="/customer/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Dedicated Admin Portal Routes (Isolated from customer navigation & bottom bar) */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/vendor-applications" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/stall-management" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/customers" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/live-map" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

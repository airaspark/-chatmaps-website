import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, MapPin, Database, UserCheck, AlertCircle, Mail, ExternalLink, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
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
          <span className="text-stone-800 dark:text-stone-200">Privacy Policy</span>
        </div>

        {/* Document Header Card */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/30 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  ChatMaps Privacy Policy
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                  Operated by Airaspark Industries • Bengaluru, Karnataka, India
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-stone-500 dark:text-stone-400 font-medium sm:self-end">
              <div>Effective Date: <strong className="text-stone-800 dark:text-stone-200">February 15, 2025</strong></div>
              <div>Last Updated: <strong className="text-stone-800 dark:text-stone-200">February 15, 2025</strong></div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            Welcome to <strong>ChatMaps</strong> (<a href="https://chatmaps.in" className="text-orange-600 font-semibold hover:underline">https://chatmaps.in</a>). We are dedicated to respecting your privacy, protecting your personal data, and maintaining transparent data practices. This Privacy Policy details our data collection, handling, storage, and sharing practices in connection with the ChatMaps web portal, Progressive Web App (PWA), and associated services.
          </p>

          <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs text-orange-900 dark:text-orange-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <strong>Key Privacy Commitment:</strong> We never sell your personal information. Location access is requested strictly with your explicit browser or device consent and is used solely to display nearby verified food stalls and calculate accurate walking distances.
            </div>
          </div>
        </div>

        {/* Complete 15 Sections */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>Introduction & Scope</span>
            </h2>
            <p>
              This Privacy Policy applies to all individuals who access or use the <strong>ChatMaps</strong> service via our website, mobile browsers, or Progressive Web Application. ChatMaps is owned and operated by <strong>Airaspark Industries</strong>, headquartered in Bengaluru, Karnataka, India.
            </p>
            <p>
              By accessing ChatMaps, registering an account, or browsing street food stall listings, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with any part of this policy, please refrain from using the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              We collect information to operate the platform efficiently and deliver accurate local discovery. The categories of information we collect include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Customer Profile Information:</strong> When you register an account, we collect your full name, email address, optional contact phone number, profile photo URL (if authenticating via Google Sign-In), dietary preferences (such as Pure Veg or Jain food filters), and account creation timestamps.
              </li>
              <li>
                <strong>Vendor Stall & Business Data:</strong> When registering as a food cart or stall artisan, we collect the stall name, owner/proprietor full name, phone number, WhatsApp contact, stall street address, landmark, city, postal code, exact geographical latitude and longitude coordinates, stall operating hours, food menu items with pricing, and submitted stall photographs.
              </li>
              <li>
                <strong>Precise Geolocation Data:</strong> With your explicit consent via your browser or mobile device, we collect your latitude, longitude, reported GPS accuracy radius in meters, and heading information.
              </li>
              <li>
                <strong>Nutrition & Walking Activity Logs:</strong> In the Calories section, users may voluntarily log street food items consumed, portion sizes, meal times, and record walking exercise sessions (distance in km, duration, step counts, and GPS route breadcrumbs).
              </li>
              <li>
                <strong>Technical & Diagnostic Data:</strong> IP address, browser type and version, device operating system, language preferences, and referral URLs for platform security and debugging.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>How We Collect Information</span>
            </h2>
            <p>
              We collect information through three primary mechanisms:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Direct Input:</strong> Submitted by you during customer account registration, vendor stall onboarding, review writing, calorie logging, or contact support submission.
              </li>
              <li>
                <strong>Device Sensors with Permission:</strong> Geolocation coordinates collected via the HTML5 Geolocation API only after you explicitly grant permission in your browser or device dialog.
              </li>
              <li>
                <strong>Third-Party Authentication:</strong> When you choose to register or sign in via Google Sign-In, Google securely transmits your basic public profile details (name, email, profile photo) in compliance with Google's OAuth consent standards.
              </li>
            </ol>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <span>Purpose and Legal Basis for Processing</span>
            </h2>
            <p>
              We process your personal information under the following legitimate purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide, maintain, and personalize the ChatMaps street food discovery experience.</li>
              <li>To calculate real-time walking and driving distances between you and approved vendors.</li>
              <li>To allow food artisans to manage stall availability (Open/Closed status) and menu pricing.</li>
              <li>To enable authenticated customer reviews, stall favorites, and personalized bookmarks.</li>
              <li>To power the optional street food calorie tracker and GPS walking activity monitor.</li>
              <li>To prevent fraudulent vendor listings, spam reviews, security breaches, and unauthorized administrator access.</li>
              <li>To respond to customer support inquiries, account deletion requests, and privacy questions.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <span>Location Data & Real-Time Geolocation</span>
            </h2>
            <p>
              Location accuracy is vital to ChatMaps. We strictly abide by the following location privacy standards:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Separate Location Consent:</strong> Account registration consent does not combine or bundle location permissions. Your browser or mobile operating system will prompt you separately for location access.
              </li>
              <li>
                <strong>High Accuracy Hardware Fix:</strong> When location is enabled, we use high-accuracy GPS positioning (<code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-xs">enableHighAccuracy: true</code>) to center the Live Map and calculate distances to nearby stalls.
              </li>
              <li>
                <strong>No Location Sharing:</strong> Your live GPS position is processed locally on your device and is never broadcast or exposed to other customers or third-party advertisers.
              </li>
              <li>
                <strong>Revocability:</strong> You may revoke location access at any time through your browser or device operating system settings.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">6</span>
              <span>Cloud Infrastructure & Third-Party Processors</span>
            </h2>
            <p>
              To maintain high reliability, security, and performance, ChatMaps engages trusted third-party service providers:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Google Cloud Platform & Firebase:</strong> We utilize Firebase Authentication for user accounts, Cloud Firestore for encrypted cloud database persistence, and Firebase Storage for user and vendor photo uploads. Review the{' '}
                <a
                  href="https://firebase.google.com/support/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Firebase Privacy & Security Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                <strong>Google Maps Platform:</strong> We use the Google Maps JavaScript API with a dedicated Map ID to display roads, locality labels, and custom vendor pins while suppressing commercial business POIs. Your interaction with map components is subject to the{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Google Privacy Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">7</span>
              <span>Street Food Nutrition & Calorie Tracking Disclaimer</span>
            </h2>
            <p>
              The nutrition database and calorie estimations provided in ChatMaps are calculated based on standard culinary reference benchmarks for Indian street food portions. They are provided solely for general educational and lifestyle awareness. They do not constitute clinical, dietary, or medical prescriptions.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">8</span>
              <span>Cookies, Local Storage & Session State</span>
            </h2>
            <p>
              ChatMaps uses browser local storage and essential session tokens rather than intrusive tracking cookies. These store:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authentication tokens to maintain your sign-in state across page reloads.</li>
              <li>Theme preferences (Light or Dark mode).</li>
              <li>Language preferences (English or Kannada).</li>
              <li>Offline food diary entries and walking session cache.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">9</span>
              <span>Information Sharing & Third-Party Disclosures</span>
            </h2>
            <p>
              We do not sell, rent, or trade your personal data. We disclose information only under the following limited circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Public Vendor Profiles:</strong> Food stall names, addresses, menus, and approved photographs are published publicly for all foodies to discover.
              </li>
              <li>
                <strong>Customer Reviews:</strong> Customer star ratings and written reviews are published publicly alongside the customer's display name.
              </li>
              <li>
                <strong>Legal Requirements:</strong> Where required by valid law, legal process, or governmental authority to protect the rights, property, or safety of ChatMaps, our users, or the public.
              </li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">10</span>
              <span>Data Security & Storage Regions</span>
            </h2>
            <p>
              We implement industry-standard administrative, physical, and technical security safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All communications between your device and ChatMaps are encrypted in transit using Transport Layer Security (HTTPS / TLS 1.3).</li>
              <li>Firebase databases enforce strict role-based access control rules preventing unauthorized users from accessing or modifying other accounts.</li>
              <li>Cloud data is hosted primarily in secure Google Cloud regions (including Asia-South regions in India).</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">11</span>
              <span>Data Retention & Preservation Policy</span>
            </h2>
            <p>
              We retain personal information only for as long as your account remains active or as necessary to fulfill the purposes outlined in this policy. When you delete your account, your authentication record and personal profile documents are permanently erased. Certain transaction, security audit, or dispute resolution logs may be retained for the minimum statutory period required by Indian law.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">12</span>
              <span>Your Legal Rights & Choices</span>
            </h2>
            <p>
              Under applicable Indian and global data protection standards, you have the following rights:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Right of Access:</strong> Review the personal data associated with your profile at any time in Profile Settings.</li>
              <li><strong>Right to Rectification:</strong> Edit or correct inaccurate profile, dietary, or vendor stall details.</li>
              <li><strong>Right to Erasure / Account Deletion:</strong> Permanently delete your user profile and associated data through our in-app flow or dedicated portal.</li>
              <li><strong>Right to Withdraw Consent:</strong> Revoke browser location permissions or log out at any time.</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">13</span>
              <span>Account Deletion & Right to Erasure</span>
            </h2>
            <p>
              We believe in simple, transparent account deletion. For complete step-by-step instructions and technical details regarding permanent erasure of your account from Firebase Authentication and Cloud Firestore, please visit our dedicated{' '}
              <Link to="/delete-account" className="text-orange-600 font-bold hover:underline">
                Account Deletion Page
              </Link>.
            </p>
            <p>
              You can also contact our privacy desk directly at{' '}
              <a href="mailto:privacy@chatmaps.in" className="text-orange-600 font-bold hover:underline">
                privacy@chatmaps.in
              </a>{' '}
              to request manual data purge.
            </p>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">14</span>
              <span>Children's Privacy</span>
            </h2>
            <p>
              ChatMaps is not intended for use by children under the age of 13 (or under 18 without parental supervision). We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, please contact us immediately so we can remove the data.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">15</span>
              <span>Contact Us & Grievance Redressal</span>
            </h2>
            <p>
              If you have any questions, concerns, personal data correction requests, or privacy grievances regarding this Privacy Policy or ChatMaps data handling practices, please contact our designated Privacy Office:
            </p>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1.5 text-xs">
              <div><strong>Application:</strong> ChatMaps (<a href="https://chatmaps.in" className="text-orange-600 hover:underline">https://chatmaps.in</a>)</div>
              <div><strong>Parent Organisation:</strong> Airaspark Industries</div>
              <div>
                <strong>Privacy Officer Email:</strong>{' '}
                <a href="mailto:privacy@chatmaps.in" className="text-orange-600 font-bold hover:underline">
                  privacy@chatmaps.in
                </a>
              </div>
              <div><strong>Location:</strong> Bengaluru, Karnataka, India</div>
              <div>
                <strong>Web Support Portal:</strong>{' '}
                <Link to="/contact" className="text-orange-600 font-bold hover:underline">
                  https://chatmaps.in/contact
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

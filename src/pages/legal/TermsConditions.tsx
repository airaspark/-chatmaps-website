import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const TermsConditions: React.FC = () => {
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
          <span className="text-stone-800 dark:text-stone-200">Terms of Service</span>
        </div>

        {/* Header Card */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/30 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  ChatMaps Terms of Service
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
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and <strong>Airaspark Industries</strong> ("ChatMaps", "we", "us", or "our"), governing your access to and use of the <strong>ChatMaps</strong> platform available at <a href="https://chatmaps.in" className="text-orange-600 font-semibold hover:underline">https://chatmaps.in</a>, our mobile Progressive Web App, and all related tools, APIs, and services.
          </p>
        </div>

        {/* 18 Complete Sections */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-8 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, browsing, registering an account on, or interacting with ChatMaps, you confirm that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these Terms, you must discontinue your use of the platform immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>Privacy Policy Incorporation</span>
            </h2>
            <p>
              Your privacy is of utmost importance to us. Our data practices, geolocation processing, and cookie usage are governed by our complete{' '}
              <Link to="/privacy-policy" className="text-orange-600 font-bold hover:underline">
                ChatMaps Privacy Policy (/privacy-policy)
              </Link>
              , which is explicitly incorporated into and made an integral part of these Terms of Service.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>Eligibility & Account Registration</span>
            </h2>
            <p>
              You must be at least 18 years of age (or the age of legal majority in your jurisdiction) to enter into these Terms or operate a vendor stall listing. Minors between 13 and 18 years of age may only access customer features with the informed consent and supervision of a parent or legal guardian.
            </p>
            <p>
              When registering an account, you agree to provide truthful, accurate, and current information. You are solely responsible for maintaining the confidentiality of your authentication credentials and for all activities occurring under your account.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <span>User Roles & Account Security</span>
            </h2>
            <p>
              ChatMaps recognizes three distinct user roles:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Customer:</strong> Accesses street food discovery, favorites, calorie tracking, and writes verified reviews.</li>
              <li><strong>Vendor:</strong> Operates food cart or stall profiles, publishes menus, and manages live open/closed availability.</li>
              <li><strong>Administrator:</strong> Authorized personnel managing vendor verifications, stall moderation, and security auditing.</li>
            </ul>
            <p>
              Administrator privileges cannot be obtained through public registration. Any attempt to exploit, tamper with, or circumvent role validation checks constitutes a severe violation of these Terms.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <span>Customer Code of Conduct & Reviews</span>
            </h2>
            <p>
              ChatMaps values honest, community-driven feedback. When posting reviews, ratings, or bookmarks, customers agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submit reviews based on genuine personal dining experiences at the stall.</li>
              <li>Refrain from posting defamatory, hateful, abusive, threatening, obscene, or fraudulent comments.</li>
              <li>Avoid submitting false negative reviews against competing stalls or commercial extortion.</li>
            </ul>
            <p>
              We reserve the right to remove any review that violates our community standards and suspend repeat offenders.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">6</span>
              <span>Vendor Registration, Verification & Stall Approvals</span>
            </h2>
            <p>
              Street food artisans and food truck proprietors registering on ChatMaps warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All business information, stall photos, addresses, and menu prices submitted are authentic and accurate.</li>
              <li>The stall complies with applicable local municipal, health, sanitation, and food safety standards (including FSSAI registration where applicable).</li>
              <li>Newly registered stalls commence in <strong>Pending</strong> status and will undergo administrator review before appearing publicly on the explore directory or Live Map.</li>
              <li>ChatMaps reserves the right to reject, suspend, or delist stalls that fail to meet hygiene standards, provide falsified coordinates, or engage in deceptive conduct.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">7</span>
              <span>Real-Time Availability & Operating Hours</span>
            </h2>
            <p>
              Vendors are responsible for toggling their "Open Stall" / "Closed Stall" status in the Vendor Dashboard. While ChatMaps strives to reflect live availability instantaneously, we cannot warrant that a stall will not exhaust ingredient stock unexpectedly, close early, or adjust their location due to weather or municipal movement.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">8</span>
              <span>Location Accuracy, GPS Dependencies & Map POI Restrictions</span>
            </h2>
            <p>
              ChatMaps uses device GPS coordinates to display nearby stalls and calculate walking times. You acknowledge that GPS accuracy varies depending on physical surroundings, atmospheric conditions, device hardware, and signal reflections in urban density.
            </p>
            <p>
              On our interactive Live Map, commercial Google business Points of Interest (POIs) such as private malls, hotels, and retail chains are intentionally filtered to focus exclusively on verified ChatMaps street food artisan pins.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">9</span>
              <span>Street Food Nutrition, Calorie Tracker & Health Estimates</span>
            </h2>
            <p>
              The nutritional values, calorie counts, macronutrient breakdowns, and walking burn times in our Calories tool are general informational estimates compiled from standard Indian street food recipes. They do not constitute certified nutritional analysis, medical diagnoses, or dietary treatment plans. Consult a qualified healthcare professional before beginning any intensive dietary or exercise program.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">10</span>
              <span>Google Maps Platform Terms & Map ID Attribution</span>
            </h2>
            <p>
              ChatMaps incorporates mapping components powered by the Google Maps Platform JavaScript API under dedicated Map ID configurations. By using ChatMaps, you agree to comply with the{' '}
              <a
                href="https://maps.google.com/help/terms_maps/"
                target="_blank"
                rel="noreferrer"
                className="text-orange-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Google Maps Platform Additional Terms of Service</span>
                <ExternalLink className="w-3 h-3" />
              </a>{' '}
              and the general Google Privacy Policy.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">11</span>
              <span>User Content, Photos & License Grant</span>
            </h2>
            <p>
              You retain all ownership rights in photographs, menu descriptions, and reviews you submit to ChatMaps. However, by uploading content, you grant Airaspark Industries a worldwide, non-exclusive, royalty-free, transferable license to display, reproduce, distribute, and format that content for the purpose of operating and promoting ChatMaps.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">12</span>
              <span>Airaspark Industries Proprietary Rights</span>
            </h2>
            <p>
              All software, logos, trademarks, database schemas, user interface designs, animations, vector graphics, and branding assets comprising ChatMaps are the exclusive proprietary property of Airaspark Industries. You may not copy, reverse engineer, scrape, or redistribute any part of the service without explicit written permission.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">13</span>
              <span>Prohibited Activities</span>
            </h2>
            <p>
              Users agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Employ automated scripts, bots, spiders, or scrapers to harvest vendor data, menus, or customer details.</li>
              <li>Inject malicious scripts, viruses, or cross-site scripting (XSS) payloads into reviews, profile names, or contact forms.</li>
              <li>Impersonate another individual, vendor owner, or ChatMaps administrator.</li>
              <li>Interfere with or compromise the security, integrity, or dev server network infrastructure of ChatMaps.</li>
            </ul>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">14</span>
              <span>Third-Party Links, Integrations & Services</span>
            </h2>
            <p>
              ChatMaps may link to external websites, social profiles, navigation directions, or vendor telephone dials. ChatMaps is not responsible for the privacy practices, content, or terms of third-party platforms.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">15</span>
              <span>Account Deletion, Suspension & Termination</span>
            </h2>
            <p>
              You may terminate your account at any time by following the instructions on our{' '}
              <Link to="/delete-account" className="text-orange-600 font-bold hover:underline">
                Account Deletion Page (/delete-account)
              </Link>.
            </p>
            <p>
              ChatMaps reserves the right to suspend or terminate accounts that breach these Terms, submit fraudulent listings, or engage in abusive activity, without prior notice.
            </p>
          </section>

          {/* Section 16 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">16</span>
              <span>Disclaimers & "As-Is" Warranty</span>
            </h2>
            <p>
              ChatMaps is provided strictly on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, implied, statutory, or otherwise, including implied warranties of merchantability, fitness for a particular culinary purpose, and non-infringement. We do not warrant that stall listings will always be error-free or uninterrupted.
            </p>
          </section>

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">17</span>
              <span>Limitation of Liability & Food Safety</span>
            </h2>
            <p>
              ChatMaps operates solely as an information discovery and geolocation platform connecting customers with independent street food vendors. ChatMaps does not prepare food, operate physical food stalls, inspect ingredients on-site, or act as an employer of vendors.
            </p>
            <p>
              To the maximum extent permitted by applicable Indian law, Airaspark Industries shall not be liable for any indirect, incidental, special, consequential, or punitive damages, nor for any foodborne illness, allergic reactions, food quality discrepancies, or personal injury arising from dining at any third-party food cart or stall listed on ChatMaps.
            </p>
          </section>

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">18</span>
              <span>Governing Law, Dispute Resolution & Contact Information</span>
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the Republic of India. In the event of any dispute, claim, or controversy arising out of or relating to these Terms or your use of ChatMaps, the parties agree to submit to the exclusive jurisdiction of the competent courts located in <strong>Bengaluru, Karnataka, India</strong>.
            </p>
            <p>
              For legal inquiries, dispute notifications, or questions regarding these Terms, contact us:
            </p>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-1.5 text-xs">
              <div><strong>Parent Organisation:</strong> Airaspark Industries</div>
              <div><strong>Service:</strong> ChatMaps (<a href="https://chatmaps.in" className="text-orange-600 hover:underline">https://chatmaps.in</a>)</div>
              <div>
                <strong>Legal & Privacy Inquiries:</strong>{' '}
                <a href="mailto:privacy@chatmaps.in" className="text-orange-600 font-bold hover:underline">
                  privacy@chatmaps.in
                </a>
              </div>
              <div>
                <strong>General Support:</strong>{' '}
                <a href="mailto:support@chatmaps.in" className="text-orange-600 font-bold hover:underline">
                  support@chatmaps.in
                </a>
              </div>
              <div><strong>Registered Office:</strong> Bengaluru, Karnataka, India</div>
              <div>
                <strong>Online Support Portal:</strong>{' '}
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

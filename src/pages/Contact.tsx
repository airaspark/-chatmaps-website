import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  HelpCircle,
  FileQuestion,
  UserX,
  FileEdit,
  AlertOctagon,
  Globe,
  Building,
  ArrowLeft
} from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const subjectOptions = [
    'General Support',
    'Privacy Questions',
    'Account Deletion Request',
    'Personal Data Correction',
    'Privacy Complaint',
    'Vendor Verification Help'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (db) {
        // Save support inquiry to Firestore
        await addDoc(collection(db, 'supportInquiries'), {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject,
          message: message.trim(),
          createdAt: new Date().toISOString(),
          status: 'pending'
        });
      } else {
        // Local storage record
        const key = 'chatmaps_contact_messages';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({
          id: 'msg_' + Date.now(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject,
          message: message.trim(),
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(existing));
      }

      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please email privacy@chatmaps.in directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-stone-50 dark:bg-stone-950 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 text-stone-800 dark:text-stone-200 transition-colors">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-orange-600 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span>/</span>
          <span className="text-stone-800 dark:text-stone-200">Contact & Privacy Support</span>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            Airaspark Industries • ChatMaps Support Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Contact & Privacy Support
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
            Need help with your food cart listing, have a privacy inquiry, or wish to request personal data correction? We are here to assist.
          </p>
        </div>

        {/* Organisation Details & Privacy Desk Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 bg-stone-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-1.5 border-b border-stone-800 pb-4">
                <span className="text-[10px] uppercase font-bold text-orange-500 tracking-wider">
                  Official Registry
                </span>
                <h3 className="text-xl font-bold">ChatMaps Support Desk</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Operated by Airaspark Industries. Committed to user privacy, fair food artisan representation, and data protection.
                </p>
              </div>

              {/* Required Details List */}
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-400 block text-[10px] uppercase">Application & Parent</span>
                    <p className="font-bold text-white text-sm">ChatMaps</p>
                    <p className="text-stone-400">Parent: Airaspark Industries</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-400 block text-[10px] uppercase">Privacy & Legal Email</span>
                    <a
                      href="mailto:privacy@chatmaps.in"
                      className="text-orange-400 font-bold hover:underline text-sm block"
                    >
                      privacy@chatmaps.in
                    </a>
                    <a
                      href="mailto:support@chatmaps.in"
                      className="text-stone-400 hover:text-white text-xs"
                    >
                      support@chatmaps.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-400 block text-[10px] uppercase">Official Website</span>
                    <a
                      href="https://chatmaps.in"
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-400 hover:underline font-semibold"
                    >
                      https://chatmaps.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-400 block text-[10px] uppercase">Registered Location</span>
                    <p className="text-white font-medium">Bengaluru, Karnataka, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-400">
              Response SLA: Inquiries are acknowledged within 24–48 business hours.
            </div>
          </div>

          {/* Contact & Support Form */}
          <div className="md:col-span-7 bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-xl space-y-5">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100">
                Send a Message to Support
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Fill in the details below and our team will get in touch directly.
              </p>
            </div>

            {submitted && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Message Dispatched Successfully!</strong>
                  Your support request has been logged. Our privacy & operations team will respond to <span className="font-mono">{email}</span> shortly.
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ananya Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Subject / Category *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 outline-none focus:border-orange-500 cursor-pointer"
                >
                  {subjectOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, data request, or stall details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Inquiry...' : 'Submit Support Inquiry'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Dedicated Support Sections */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">
            Dedicated Privacy & Support Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. General Support */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                1. General Support
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                App navigation assistance, progressive web app installation help, and street food recommendations.
              </p>
              <a href="mailto:support@chatmaps.in?subject=General%20Support" className="text-xs font-bold text-orange-600 hover:underline block pt-1">
                support@chatmaps.in →
              </a>
            </div>

            {/* 2. Privacy Questions */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                <FileQuestion className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                2. Privacy Questions
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Inquiries regarding data encryption, Google Cloud Firestore storage, and location privacy policies.
              </p>
              <a href="mailto:privacy@chatmaps.in?subject=Privacy%20Question" className="text-xs font-bold text-orange-600 hover:underline block pt-1">
                privacy@chatmaps.in →
              </a>
            </div>

            {/* 3. Account Deletion Requests */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
                <UserX className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                3. Account Deletion Requests
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Permanent erasure of Firebase authentication accounts, Firestore profiles, and associated data.
              </p>
              <Link to="/delete-account" className="text-xs font-bold text-rose-600 hover:underline block pt-1">
                Open Deletion Portal →
              </Link>
            </div>

            {/* 4. Personal Data Correction Requests */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                <FileEdit className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                4. Data Correction Requests
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Rectify erroneous vendor stall coordinates, address typos, or update contact telephone numbers.
              </p>
              <a href="mailto:privacy@chatmaps.in?subject=Data%20Correction%20Request" className="text-xs font-bold text-orange-600 hover:underline block pt-1">
                Request Correction →
              </a>
            </div>

            {/* 5. Privacy Complaints */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                5. Privacy Complaints
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Escalations directly to our Data Protection Grievance Officer in Bengaluru, Karnataka, India.
              </p>
              <a href="mailto:privacy@chatmaps.in?subject=Grievance%20Complaint" className="text-xs font-bold text-orange-600 hover:underline block pt-1">
                Submit Grievance →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

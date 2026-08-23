"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed">We collect information you provide directly: phone number, name, email, and payment details. We also collect usage data including booking history, match replays viewed, and device information.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed">Your information is used to provide our services, process payments, send booking confirmations, and improve the platform. We do not sell your personal data to third parties.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Video Data</h2>
            <p className="text-slate-600 leading-relaxed">Match recordings are stored securely and are only accessible to booked players and stadium owners. Videos are automatically deleted after the retention period unless extended by the player. Minor protection includes automatic face-blurring.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">We use industry-standard encryption, RLS policies, and secure infrastructure to protect your data. All payments are processed through certified payment processors.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed">You can access, update, or delete your account data at any time. Contact us at privacy@etsmartfields.com for any data-related requests.</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-12">Last updated: August 2026</p>
      </div>
    </div>
  );
}

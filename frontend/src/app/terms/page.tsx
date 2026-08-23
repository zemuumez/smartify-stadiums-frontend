"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">By using ET Smart Fields, you agree to these terms. If you are a stadium owner, additional terms apply to your subscription and microsite.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Booking & Payments</h2>
            <p className="text-slate-600 leading-relaxed">Bookings are confirmed upon successful payment. Cancellation policies vary by stadium. Refunds are processed within 5-7 business days for eligible cancellations.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Video Content</h2>
            <p className="text-slate-600 leading-relaxed">Match recordings are the property of the stadium owner. Players receive a license to view, download, and share their personal match footage for non-commercial purposes.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Stadium Owner Responsibilities</h2>
            <p className="text-slate-600 leading-relaxed">Stadium owners are responsible for maintaining accurate availability, camera systems, and field conditions. ULS verification requires ongoing compliance with quality standards.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">ET Smart Fields facilitates bookings between players and stadiums. We are not liable for injuries, facility conditions, or disputes between parties.</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-12">Last updated: August 2026</p>
      </div>
    </div>
  );
}

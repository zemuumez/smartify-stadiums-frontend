"use client";

import { useState } from "react";
import { Save, Key, Globe, Bell } from "lucide-react";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Key size={18} /> API Keys</h3>
        <div className="space-y-4">
          {[
            { label: "Chapa Secret Key", placeholder: "CHAPA_SECRET_KEY_HERE" },
            { label: "Chapa Webhook Secret", placeholder: "CHAPA_WEBHOOK_SECRET_HERE" },
            { label: "SMS Provider Key", placeholder: "SMS_API_KEY" },
          ].map((key) => (
            <div key={key.label}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{key.label}</label>
              <input type="password" placeholder={key.placeholder} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-green-500 outline-none text-sm" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 rounded-2xl bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Globe size={18} /> Platform Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
            <input defaultValue="ET Smart Fields" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-green-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
            <input defaultValue="support@etsmartfields.com" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-green-500 outline-none text-sm" />
          </div>
        </div>
      </div>
      {saved && <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">Settings saved successfully!</div>}
      <button onClick={() => setSaved(true)} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
        <Save size={18} /> Save Settings
      </button>
    </div>
  );
}

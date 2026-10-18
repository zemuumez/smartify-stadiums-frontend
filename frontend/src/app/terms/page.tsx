"use client";

import { useI18n } from "@/i18n/provider";

export default function TermsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-slate-900 mb-6">{t("termsTitle")}</h1>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed mb-8">
          {t("termsDraftNotice")}
        </div>
        <div className="prose prose-slate max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t("termsSec1Title")}</h2>
            <p className="text-slate-600 leading-relaxed">{t("termsSec1Body")}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t("termsSec2Title")}</h2>
            <p className="text-slate-600 leading-relaxed">{t("termsSec2Body")}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t("termsSec3Title")}</h2>
            <p className="text-slate-600 leading-relaxed">{t("termsSec3Body")}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t("termsSec4Title")}</h2>
            <p className="text-slate-600 leading-relaxed">{t("termsSec4Body")}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">{t("termsSec5Title")}</h2>
            <p className="text-slate-600 leading-relaxed">{t("termsSec5Body")}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-12">{t("lastUpdatedAugust2026")}</p>
      </div>
    </div>
  );
}

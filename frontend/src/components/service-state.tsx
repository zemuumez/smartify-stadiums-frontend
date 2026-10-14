'use client';
import { useLanguage } from '@/i18n/provider';
import { errorCode } from '@/services/errors';
import { isDemoMode } from '@/services/config';
export function ServiceErrorMessage({ error, retry }: { error: unknown; retry?: () => void }) {
  const { t } = useLanguage();
  return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"><p>{t(`error.${errorCode(error)}`)}</p>{retry && <button type="button" onClick={retry} className="mt-2 min-h-11 underline">{t('retry')}</button>}</div>;
}
export function Loading() { const { t } = useLanguage(); return <p role="status" className="p-6 text-center">{t('loading')}</p>; }
export function Empty() { const { t } = useLanguage(); return <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">{t('empty')}</p>; }
export function DemoNotice() { const { t } = useLanguage(); return isDemoMode ? <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{t('demo')}</p> : null; }

'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { useLanguage } from '@/i18n/provider';
import { safeReturnPath } from '@/i18n/catalog';
import { isDemoMode } from '@/services/config';
import type { Account } from '@/services/contracts';
import { DemoNotice, ServiceErrorMessage } from './service-state';

export function AuthForm({ registration = false, owner = false }: { registration?: boolean; owner?: boolean }) {
  const { t } = useLanguage(); const router = useRouter(); const params = useSearchParams();
  const auth = useAuthStore();
  const [phone, setPhone] = useState(''); const [name, setName] = useState(''); const [code, setCode] = useState('');
  const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState<unknown>();
  const [demoAccounts, setDemoAccounts] = useState<{ id: string; role: string; name: string }[]>([]);
  useEffect(() => { let active = true; if (isDemoMode) void import('@/demo/account-options').then(module => { if (active) setDemoAccounts(module.demoAccountOptions); }); return () => { active = false; }; }, []);
  const proceed = (user: Account) => router.push(safeReturnPath(params.get('returnTo'), user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/dashboard' : '/bookings'));
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setError(undefined);
    try {
      if (!sent) { await auth.requestOTP(phone, registration ? 'register' : 'login'); setSent(true); }
      else proceed(registration ? await auth.register(phone, code, name, owner ? 'owner' : 'player') : await auth.login(phone, code));
    } catch (error) { setError(error); } finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-lg px-4 pb-28 pt-28"><div className="panel">
    <Link href="/" className="font-black text-green-900">ET Smart Fields</Link>
    <h1 className="mt-5 text-3xl font-bold">{t(registration ? 'register' : 'signIn')}</h1>
    <div className="mt-5"><DemoNotice /></div>
    {error ? <ServiceErrorMessage error={error} /> : null}
    <form onSubmit={submit} className="mt-5 space-y-4">
      {registration && <label className="form-label">{t('name')}<input className="form-input" autoComplete="name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} disabled={busy} /></label>}
      <label className="form-label">{t('phone')}<input className="form-input" type="tel" autoComplete="tel" inputMode="tel" placeholder="+251…" required value={phone} onChange={e => setPhone(e.target.value)} disabled={busy || sent} /></label>
      {sent && <label className="form-label">{t('code')}<input className="form-input" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value)} disabled={busy} /></label>}
      <button disabled={busy} className="action w-full" type="submit">{t(busy ? 'loading' : sent ? 'verify' : 'sendCode')}</button>
      {sent && <button type="button" className="min-h-11 underline" onClick={() => { setSent(false); setCode(''); }}>{t('resend')}</button>}
    </form>
    <Link className="mt-4 inline-block min-h-11 underline" href={registration ? '/auth/login' : '/auth/register'}>{t(registration ? 'signIn' : 'register')}</Link>
    {isDemoMode && <div className="mt-4 border-t pt-4"><p className="mb-3 text-sm">{t('demoCode')}</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{demoAccounts.map(account => <button key={account.id} disabled={busy} className="min-h-11 rounded-xl border border-green-800 px-3 py-2 text-left text-sm" onClick={async () => { setBusy(true); setError(undefined); try { proceed(await auth.selectDemo(account.id)); } catch (error) { setError(error); } finally { setBusy(false); } }}>{account.name}<span className="block text-xs">{t(account.role as 'player' | 'owner' | 'admin')}</span></button>)}</div></div>}
  </div></section>;
}

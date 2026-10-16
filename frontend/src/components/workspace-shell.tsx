'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AccessGate } from './access-gate';
import { DemoNotice, ServiceErrorMessage } from './service-state';
import { useAuthStore } from '@/lib/auth-store';
import { useLanguage } from '@/i18n/provider';
import type { MessageKey } from '@/i18n/en';
const ownerLinks: [string, MessageKey][] = [['/dashboard', 'overview'], ['/dashboard/bookings', 'ownerBookings'], ['/dashboard/stadiums', 'venues'], ['/dashboard/fields', 'fields'], ['/dashboard/microsite', 'microsite'], ['/dashboard/cameras', 'cameras'], ['/dashboard/analytics', 'analytics'], ['/dashboard/billing', 'billing'], ['/dashboard/settings', 'settings']];
const adminLinks: [string, MessageKey][] = [['/admin', 'overview'], ['/admin/stadiums', 'venues'], ['/admin/users', 'users'], ['/admin/cameras', 'cameras'], ['/admin/analytics', 'analytics'], ['/admin/settings', 'settings']];
export function WorkspaceShell({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const { t } = useLanguage(); const pathname = usePathname(); const { user, logout } = useAuthStore();
  const [error, setError] = useState<unknown>();
  if (pathname === '/admin/login') return children;
  return <div className="min-h-screen bg-[#f4f3ef] pb-24"><header className="border-b bg-white px-4 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><Link href="/" className="font-black text-green-900">ET Smart Fields</Link><span>{t(admin ? 'adminPortal' : 'ownerPortal')}</span>{user && <button className="min-h-11 rounded-xl border px-4" onClick={async () => { setError(undefined); try { await logout(); } catch (error) { setError(error); } }}>{t('signOut')}</button>}</div></header>
    <AccessGate roles={admin ? ['admin'] : ['owner', 'admin']}><div className="mx-auto max-w-7xl p-4 sm:p-8"><DemoNotice />{error ? <ServiceErrorMessage error={error} /> : null}<nav aria-label={t('menu')} className="mb-6 flex flex-wrap gap-2">{(admin ? adminLinks : ownerLinks).map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className={`min-h-11 rounded-xl border px-4 py-3 text-sm font-semibold ${pathname === href ? 'bg-green-900 text-white' : 'bg-white text-green-950'}`}>{t(label)}</Link>)}</nav><div className="min-w-0">{children}</div></div></AccessGate>
  </div>;
}

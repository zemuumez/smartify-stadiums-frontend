'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Role } from '@/services/contracts';
import { useAuthStore } from '@/lib/auth-store';
import { useLanguage } from '@/i18n/provider';
import { Loading, ServiceErrorMessage } from './service-state';
export function AccessGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, isLoading, error, loadUser } = useAuthStore();
  const { t } = useLanguage(); const pathname = usePathname();
  if (isLoading) return <Loading />;
  if (error) return <ServiceErrorMessage error={error} retry={() => void loadUser()} />;
  if (!user) return <section className="mx-auto max-w-lg p-6"><p className="mb-4">{t('accountRequired')}</p><Link className="action" href={`/auth/login?returnTo=${encodeURIComponent(pathname)}`}>{t('signIn')}</Link></section>;
  if (!roles.includes(user.role)) return <section className="p-6"><p role="alert">{t('forbidden')}</p><Link href="/" className="underline">{t('returnHome')}</Link></section>;
  return children;
}

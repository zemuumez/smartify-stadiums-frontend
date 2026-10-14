import { en } from './en';
import { am } from './am';
export const languages = { en: { label: 'English', intl: 'en-ET', messages: en }, am: { label: 'አማርኛ', intl: 'am-ET', messages: am } } as const;
export type Locale = keyof typeof languages;
export function isLocale(value: string | null): value is Locale { return value !== null && Object.hasOwn(languages, value); }
export function safeReturnPath(value: string | null, fallback = '/bookings') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return fallback;
  try { const url = new URL(value, 'https://local.invalid'); return url.origin === 'https://local.invalid' ? `${url.pathname}${url.search}${url.hash}` : fallback; } catch { return fallback; }
}

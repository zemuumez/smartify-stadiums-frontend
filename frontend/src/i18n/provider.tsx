'use client';
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { isLocale, languages, type Locale } from './catalog';
import type { MessageKey } from './en';
const KEY = 'etsf-locale';
const listeners = new Set<() => void>();
let memoryLocale: Locale = 'en';
function snapshot(): Locale { try { const saved = localStorage.getItem(KEY); return isLocale(saved) ? saved : memoryLocale; } catch { return memoryLocale; } }
function subscribe(listener: () => void) { listeners.add(listener); window.addEventListener('storage', listener); return () => { listeners.delete(listener); window.removeEventListener('storage', listener); }; }
const Context = createContext<{ locale: Locale; setLocale: (locale: Locale) => void } | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, snapshot, () => 'en' as Locale);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const setLocale = (next: Locale) => { memoryLocale = next; try { localStorage.setItem(KEY, next); } catch { /* In-memory preference still works. */ } listeners.forEach(listener => listener()); };
  return <Context.Provider value={{ locale, setLocale }}>{children}</Context.Provider>;
}
export function useLanguage() {
  const context = useContext(Context);
  if (!context) throw new Error('LanguageProvider is required');
  const { locale } = context;
  return {
    ...context,
    t: (key: MessageKey): string => languages[locale].messages[key],
    money: (minor: number) => new Intl.NumberFormat(languages[locale].intl, { style: 'currency', currency: 'ETB' }).format(minor / 100),
    date: (value: string) => new Intl.DateTimeFormat(languages[locale].intl, { dateStyle: 'medium', timeZone: 'Africa/Addis_Ababa', calendar: 'gregory' }).format(new Date(`${value}T12:00:00+03:00`)),
  };
}
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  return <label className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-[60] flex items-center gap-2 rounded-2xl border border-emerald-900/20 bg-white px-3 text-sm text-slate-900 shadow-lg lg:bottom-4">
    <span className="sr-only">{t('language')}</span>
    <select aria-label={t('language')} value={locale} onChange={event => { if (isLocale(event.target.value)) setLocale(event.target.value); }} className="min-h-11 max-w-36 bg-transparent py-2 focus-visible:outline-2 focus-visible:outline-green-700">
      {Object.entries(languages).map(([id, language]) => <option key={id} value={id}>{language.label}</option>)}
    </select>
  </label>;
}

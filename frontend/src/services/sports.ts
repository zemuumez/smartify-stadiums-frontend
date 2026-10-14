import type { Sport } from './contracts';
export const supportedSports: readonly Sport[] = ['football', 'basketball', 'volleyball', 'badminton', 'tennis', 'futsal'];
export function isSport(value: string): value is Sport { return supportedSports.includes(value as Sport); }
export function venueToday(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Addis_Ababa', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
export function hourLabel(hour: number) { return `${String(hour).padStart(2, '0')}:00`; }

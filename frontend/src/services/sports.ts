import type { Sport } from './contracts';
export const supportedSports: readonly Sport[] = ['football', 'basketball', 'volleyball', 'badminton', 'tennis', 'futsal'];
export function isSport(value: string): value is Sport { return supportedSports.includes(value as Sport); }
export function venueToday(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Addis_Ababa', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
export function hourLabel(hour: number) { return `${String(hour).padStart(2, '0')}:00`; }
export function parseDateParts(dateStr: string): [number, number, number] {
  const [y, m, d] = dateStr.split('-').map(Number);
  return [y, m, d];
}
export function formatDateParts(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export function shiftDays(dateStr: string, days: number): string {
  const [y, m, d] = parseDateParts(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return formatDateParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}
export function getWeekDays(centerDate: string): string[] {
  const [y, m, d] = parseDateParts(centerDate);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const day = dt.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(y, m - 1, d + diffToMonday, 12, 0, 0));
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + i, 12, 0, 0));
    result.push(formatDateParts(cur.getUTCFullYear(), cur.getUTCMonth() + 1, cur.getUTCDate()));
  }
  return result;
}

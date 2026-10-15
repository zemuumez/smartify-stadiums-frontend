import type { Booking, Field, Sport } from './contracts';
import { quoteMinor } from './bookings.service';

export const supportedSports: readonly Sport[] = ['football', 'basketball', 'volleyball', 'badminton', 'tennis', 'futsal'];
export function isSport(value: string): value is Sport { return supportedSports.includes(value as Sport); }
export function venueToday(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Addis_Ababa', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
export function hourLabel(hour: number) { return `${String(hour).padStart(2, '0')}:00`; }

export interface BookingFilterCriteria {
  owner: boolean;
  bookingId?: string;
  effectiveVenueId?: string;
  selectedFieldId?: string;
  viewMode?: 'day' | 'week';
  weekDays?: string[];
  date?: string;
}

export function isValidDate(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function parseDateParts(dateStr: string): [number, number, number] {
  const safeStr = isValidDate(dateStr) ? dateStr : venueToday();
  const [y, m, d] = safeStr.split('-').map(Number);
  return [y, m, d];
}

export function formatDateParts(y: number, m: number, d: number): string {
  if (isNaN(y) || isNaN(m) || isNaN(d)) return venueToday();
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function shiftDays(dateStr: string, days: number): string {
  const [y, m, d] = parseDateParts(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d + (Number.isFinite(days) ? days : 0), 12, 0, 0));
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

export function matchesBookingCriteria(b: Booking, criteria: BookingFilterCriteria): boolean {
  if (criteria.bookingId) return b.id === criteria.bookingId;
  if (!criteria.owner) return true;
  if (criteria.effectiveVenueId && b.venueId !== criteria.effectiveVenueId) return false;
  if (criteria.selectedFieldId && b.fieldId !== criteria.selectedFieldId) return false;
  if (criteria.viewMode === 'week') {
    return Array.isArray(criteria.weekDays) && criteria.weekDays.includes(b.date);
  }
  return criteria.date ? b.date === criteria.date : true;
}

export function resolveTargetCourt(fields: readonly Field[], selectedFieldId?: string): string {
  if (selectedFieldId && fields.some(f => f.id === selectedFieldId)) {
    return selectedFieldId;
  }
  return fields[0]?.id || '';
}

export function computeCourtQuote(field: Field | undefined, startHour: number, endHour: number): number | null {
  const rate = field?.hourlyRateMinor;
  if (rate === undefined || endHour <= startHour) return null;
  try {
    return quoteMinor(rate, startHour, endHour);
  } catch {
    return null;
  }
}

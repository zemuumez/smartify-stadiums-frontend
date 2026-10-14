import type { Booking, BookingInput, Closure, Slot, Transport } from './contracts';
import { ServiceError } from './errors';
export function validateInterval(date: string, start: number, end: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 24 || end <= start) throw new ServiceError('validation');
}
export function quoteMinor(rate: number, start: number, end: number) {
  if (!Number.isSafeInteger(rate) || rate < 0 || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 24 || end <= start || !Number.isSafeInteger(rate * (end - start))) throw new ServiceError('validation');
  return rate * (end - start);
}
export function createBookingsService(transport: Transport) {
  return {
    list: (signal?: AbortSignal) => transport.request<Booking[]>('/bookings', { signal }),
    availability: (fieldId: string, date: string, signal?: AbortSignal) => transport.request<Slot[]>(`/fields/${encodeURIComponent(fieldId)}/availability?date=${encodeURIComponent(date)}`, { signal }),
    create: (input: BookingInput) => {
      validateInterval(input.date, input.startHour, input.endHour);
      if (!input.idempotencyKey) throw new ServiceError('validation');
      return transport.request<Booking>('/bookings', { method: 'POST', body: input, idempotencyKey: input.idempotencyKey });
    },
    cancel: (id: string) => transport.request<Booking>(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
    closures: (venueId: string) => transport.request<Closure[]>(`/owner/stadiums/${encodeURIComponent(venueId)}/closures`),
    close: (input: Omit<Closure, 'id'>) => {
      validateInterval(input.date, input.startHour, input.endHour);
      return transport.request<Closure>('/owner/closures', { method: 'POST', body: input });
    },
  };
}

import type {
  Analytics,
  BookingFinancialSummary,
  CommercialPolicy,
  GatewaySimulationInput,
  Invoice,
  PaymentTransaction,
  RefundBookingInput,
  SettleBookingInput,
  Sport,
  Transport,
} from './contracts';

export interface OwnerAnalyticsParams {
  venueId?: string;
  sport?: Sport;
  dateFrom?: string;
  dateTo?: string;
  metricDateType?: 'booking_date' | 'transaction_date';
}

export function createBillingService(transport: Transport) {
  return {
    policy: (signal?: AbortSignal) => transport.request<CommercialPolicy>('/commercial-policy', { signal }),
    invoices: (params?: { venueId?: string }, signal?: AbortSignal) => {
      const q = params?.venueId ? `?venueId=${encodeURIComponent(params.venueId)}` : '';
      return transport.request<Invoice[]>(`/owner/invoices${q}`, { signal });
    },
    analytics: (params?: OwnerAnalyticsParams, signal?: AbortSignal) => {
      const sp = new URLSearchParams();
      if (params?.venueId) sp.set('venueId', params.venueId);
      if (params?.sport) sp.set('sport', params.sport);
      if (params?.dateFrom) sp.set('dateFrom', params.dateFrom);
      if (params?.dateTo) sp.set('dateTo', params.dateTo);
      if (params?.metricDateType) sp.set('metricDateType', params.metricDateType);
      const query = sp.toString() ? `?${sp.toString()}` : '';
      return transport.request<Analytics>(`/owner/analytics${query}`, { signal });
    },
    settleBooking: (bookingId: string, input: SettleBookingInput, idempotencyKey?: string) =>
      transport.request<{ transaction: PaymentTransaction; summary: BookingFinancialSummary }>(
        `/owner/bookings/${encodeURIComponent(bookingId)}/settle`,
        { method: 'POST', body: input, idempotencyKey }
      ),
    refundBooking: (bookingId: string, input: RefundBookingInput, idempotencyKey?: string) =>
      transport.request<{ transaction: PaymentTransaction; summary: BookingFinancialSummary }>(
        `/owner/bookings/${encodeURIComponent(bookingId)}/refund`,
        { method: 'POST', body: input, idempotencyKey }
      ),
    bookingFinancials: (bookingId: string, signal?: AbortSignal) =>
      transport.request<BookingFinancialSummary>(`/bookings/${encodeURIComponent(bookingId)}/financials`, { signal }),
    venueTransactions: (venueId: string, signal?: AbortSignal) =>
      transport.request<PaymentTransaction[]>(`/owner/venues/${encodeURIComponent(venueId)}/transactions`, { signal }),
    simulateGateway: (bookingId: string, input: GatewaySimulationInput, idempotencyKey?: string) =>
      transport.request<{ transaction: PaymentTransaction; summary: BookingFinancialSummary }>(
        `/bookings/${encodeURIComponent(bookingId)}/simulate-gateway`,
        { method: 'POST', body: input, idempotencyKey }
      ),
  };
}

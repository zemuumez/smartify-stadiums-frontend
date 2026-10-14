import type { Analytics, CommercialPolicy, Invoice, Transport } from './contracts';
export function createBillingService(transport: Transport) {
  return {
    policy: () => transport.request<CommercialPolicy>('/commercial-policy'),
    invoices: () => transport.request<Invoice[]>('/owner/invoices'),
    analytics: () => transport.request<Analytics>('/owner/analytics'),
  };
}

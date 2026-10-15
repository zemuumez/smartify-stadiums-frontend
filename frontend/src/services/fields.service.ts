import type { Field, Transport } from './contracts';
export type FieldInput = Omit<Field, 'id'>;
export function createFieldsService(transport: Transport) {
  return {
    list: (signal?: AbortSignal) => transport.request<Field[]>('/owner/fields', { signal }),
    create: (input: FieldInput) => transport.request<Field>('/owner/fields', { method: 'POST', body: input }),
    update: (id: string, input: FieldInput) => transport.request<Field>(`/owner/fields/${encodeURIComponent(id)}`, { method: 'PATCH', body: input }),
  };
}

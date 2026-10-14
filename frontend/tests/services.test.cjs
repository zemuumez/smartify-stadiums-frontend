const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDemoTransport } = require('../.test-build/demo/transport');
const { createServices } = require('../.test-build/services/create-services');
const { createHttpTransport } = require('../.test-build/services/http');
const { resolveMode } = require('../.test-build/services/config');
const { quoteMinor } = require('../.test-build/services/bookings.service');
const { normalizePhone } = require('../.test-build/services/auth.service');
const setup = () => { const transport = createDemoTransport(); return { transport, ...createServices(transport) }; };
const input = (overrides = {}) => ({ fieldId: 'field-2', sport: 'basketball', date: '2099-01-01', startHour: 10, endHour: 12, idempotencyKey: crypto.randomUUID(), ...overrides });
const rejects = (operation, code) => assert.rejects(operation, error => error.code === code);

test('live is default, invalid modes fail closed', () => {
  assert.equal(resolveMode(undefined), 'api'); assert.equal(resolveMode('demo'), 'demo');
  assert.throws(() => resolveMode('typo'), { code: 'configuration' });
});
test('phone normalization and duration quotes reject malformed inputs', () => {
  assert.equal(normalizePhone('0911 234 567'), '+251911234567');
  assert.throws(() => normalizePhone('123'), { code: 'validation' });
  assert.equal(quoteMinor(150000, 10, 12), 300000);
  assert.throws(() => quoteMinor(150000, 12, 10), { code: 'validation' });
});
test('unknown venues never resolve to a default and all six sports exist', async () => {
  const s = setup(); const venues = await s.venues.list();
  assert.equal(new Set(venues.flatMap(v => v.sports)).size, 6);
  await rejects(s.venues.get('missing'), 'not_found');
  venues[0].name = 'mutated'; assert.notEqual((await s.venues.list())[0].name, 'mutated');
});
test('invalid or unrequested OTP does not authenticate; OTP is single use', async () => {
  const s = setup(); await rejects(s.auth.login('0911234567', '123456'), 'validation');
  await s.auth.requestOTP('0911234567'); await rejects(s.auth.login('0911234567', '000000'), 'validation');
  await rejects(s.auth.current(), 'unauthorized');
  assert.equal((await s.auth.login('0911234567', '123456')).role, 'player');
  await s.auth.logout(); await rejects(s.auth.login('0911234567', '123456'), 'validation');
});
test('booking persists across player and owner views with unpaid settlement', async () => {
  const s = setup(); s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input()); assert.equal(booking.totalMinor, 300000); assert.equal(booking.paymentStatus, 'unpaid');
  s.transport.selectAccount('owner-1'); assert.equal((await s.bookings.list())[0].id, booking.id);
  assert.equal((await s.billing.analytics()).collectedMinor, 0);
  s.transport.selectAccount('owner-2'); assert.equal((await s.bookings.list()).length, 0);
  await rejects(s.bookings.cancel(booking.id), 'forbidden');
});
test('shared court prevents overlap across sports, adjacent slots are permitted', async () => {
  const s = setup(); s.transport.selectAccount('player-1');
  const results = await Promise.allSettled([s.bookings.create(input()), s.bookings.create(input({ sport: 'futsal' }))]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  await s.bookings.create(input({ startHour: 12, endHour: 13 }));
  await rejects(s.bookings.create(input({ sport: 'tennis' })), 'validation');
});
test('idempotency returns same booking; key reuse with different request is rejected', async () => {
  const s = setup(); s.transport.selectAccount('player-1'); const request = input();
  const first = await s.bookings.create(request); assert.equal((await s.bookings.create(request)).id, first.id);
  await rejects(s.bookings.create({ ...request, endHour: 13 }), 'conflict');
});
test('cancellation frees slots and closures reject overlapping reservations', async () => {
  const s = setup(); s.transport.selectAccount('player-1'); const booking = await s.bookings.create(input());
  s.transport.selectAccount('owner-1');
  const closure = { fieldId: 'field-2', date: '2099-01-01', startHour: 10, endHour: 12, reason: 'Maintenance' };
  await rejects(s.bookings.close(closure), 'conflict');
  await s.bookings.cancel(booking.id); await s.bookings.close(closure);
  s.transport.selectAccount('player-1'); await rejects(s.bookings.create(input()), 'conflict');
});
test('drafts do not leak before publishing, ownership is enforced in simulator', async () => {
  const s = setup(); s.transport.selectAccount('owner-1'); const site = await s.content.draft('venue-1');
  await s.content.save({ ...site, tagline: 'Changed title' });
  assert.notEqual((await s.content.get('venue-1')).tagline, 'Changed title');
  await s.content.publish('venue-1'); assert.equal((await s.content.get('venue-1')).tagline, 'Changed title');
  await rejects(s.content.draft('venue-2'), 'forbidden');
  await rejects(s.admin.users(), 'forbidden');
});
test('commercial policy is explicitly unset', async () => {
  assert.deepEqual(await setup().billing.policy(), { subscriptionPriceMinor: null, bookingCommissionPercent: null, currency: 'ETB' });
});
test('HTTP failure never becomes demo success and writes are not retried', async () => {
  const calls = [];
  const transport = createHttpTransport('/api/v1', async (url, init) => {
    calls.push([url, init]);
    return url.endsWith('/csrf') ? Response.json({ token: 'csrf' }) : Response.json({ secret: 'do not expose' }, { status: 401 });
  });
  await rejects(transport.request('/bookings', { method: 'POST', body: {}, idempotencyKey: 'key' }), 'unauthorized');
  assert.equal(calls.length, 2); assert.equal(calls[1][1].credentials, 'include');
  assert.equal(calls[1][1].headers['X-CSRF-Token'], 'csrf'); assert.equal(calls[1][1].headers['Idempotency-Key'], 'key');
});
test('unsafe URLs, expired request and missing CSRF are rejected', async () => {
  assert.throws(() => createHttpTransport('http://untrusted.example'), { code: 'configuration' });
  const transport = createHttpTransport('/api/v1', async () => Response.json({}));
  await rejects(transport.request('//untrusted.example'), 'configuration');
  await rejects(transport.request('/bookings', { method: 'POST' }), 'server');
  await rejects(transport.request('/bookings', { signal: AbortSignal.abort() }), 'cancelled');
});

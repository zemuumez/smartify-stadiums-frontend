const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDemoTransport } = require('../.test-build/demo/transport');
const { createServices } = require('../.test-build/services/create-services');
const { createHttpTransport } = require('../.test-build/services/http');
const { resolveMode } = require('../.test-build/services/config');
const { quoteMinor } = require('../.test-build/services/bookings.service');
const { normalizePhone } = require('../.test-build/services/auth.service');
const {
  shiftDays,
  getWeekDays,
  matchesBookingCriteria,
  resolveTargetCourt,
  computeCourtQuote,
  isValidDate,
} = require('../.test-build/services/sports');
const setup = () => { const transport = createDemoTransport(); return { transport, ...createServices(transport) }; };
const input = (overrides = {}) => ({ fieldId: 'field-2', sport: 'basketball', date: '2099-01-01', startHour: 10, endHour: 12, idempotencyKey: crypto.randomUUID(), ...overrides });
const rejects = (operation, code) => assert.rejects(operation, error => error.code === code);

test('court edits are tenant scoped and cannot invalidate a future reservation', async () => {
  const s = setup(); s.transport.selectAccount('player-1');
  await s.bookings.create(input());
  s.transport.selectAccount('owner-1');
  const court = (await s.fields.list()).find(f => f.id === 'field-2');
  await rejects(s.fields.update(court.id, { ...court, active: false }), 'conflict');
  await rejects(s.fields.update(court.id, { ...court, sports: ['futsal'] }), 'conflict');
  const updated = await s.fields.update(court.id, { ...court, name: 'Renamed court', id: 'tampered' });
  assert.equal(updated.id, court.id);
  assert.equal((await s.venues.fields('venue-1')).find(f => f.id === court.id).name, 'Renamed court');
  s.transport.selectAccount('owner-2');
  await rejects(s.fields.update(court.id, court), 'forbidden');
});

test('venue onboarding stays private until administrator approval and publication', async () => {
  const s = setup(); s.transport.selectAccount('owner-1');
  const venue = await s.venues.create({ name: 'New sports center', city: 'Addis Ababa', address: 'Bole', phone: '+251922345678', description: 'Multi-sport venue' });
  assert.equal(venue.status, 'pending');
  assert.equal((await s.venues.list()).some(v => v.id === venue.id), false);
  const draft = await s.content.draft(venue.id);
  assert.equal(draft.published, false);
  await rejects(s.content.publish(venue.id), 'conflict');
  await rejects(s.admin.review(venue.id, 'active', 'Verified'), 'forbidden');
  s.transport.selectAccount('admin-1');
  await s.admin.review(venue.id, 'active', 'Reviewed venue submission');
  assert.ok((await s.admin.audit()).some(a => a.resourceId === venue.id));
  s.transport.selectAccount('owner-1');
  await s.content.publish(venue.id);
  assert.equal((await s.content.get(venue.id)).published, true);
});

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
const { tenantFromHost, micrositeUrl } = require('../.test-build/services/tenant-routing');
test('tenant host resolution validates exact domain boundaries and never picks a default stadium', () => {
  assert.equal(tenantFromHost('bambis-meda.example.com','example.com'),'bambis-meda');
  assert.equal(tenantFromHost('unity-complex.localhost:3000','localhost:3000'),'unity-complex');
  for (const host of ['example.com','www.example.com','api.example.com','bambis.example.com.evil.test','nested.bambis.example.com','bad_slug.example.com']) assert.equal(tenantFromHost(host,'example.com'),null);
  const previous=process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  try { process.env.NEXT_PUBLIC_ROOT_DOMAIN='example.com'; assert.equal(micrositeUrl('unity-complex',true),'https://unity-complex.example.com/?book=1'); }
  finally { if(previous===undefined)delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;else process.env.NEXT_PUBLIC_ROOT_DOMAIN=previous; }
});
test('all six venues have distinct sites, fields, owners and tenant-scoped CMS publication', async () => {
  const s=setup();const venues=await s.venues.list();assert.equal(venues.length,6);
  assert.equal(new Set(venues.map(v=>v.ownerId)).size,6);
  for(const venue of venues){const site=await s.content.get(venue.id);assert.equal(site.venueId,venue.id);assert.ok(site.highlights.every(h=>h.id.startsWith(venue.id)));assert.ok((await s.venues.fields(venue.id)).every(f=>f.venueId===venue.id));}
  s.transport.selectAccount('owner-2');const draft=await s.content.draft('venue-2');
  draft.highlights[0].title='Unity edited highlight';draft.events[0].title='Unity edited event';await s.content.save(draft);
  assert.notEqual((await s.content.get('venue-2')).highlights[0].title,'Unity edited highlight');
  await rejects(s.content.save({...draft,venueId:'venue-1'}),'forbidden');
  await s.content.publish('venue-2');assert.equal((await s.content.get('venue-2')).events[0].title,'Unity edited event');
  assert.notEqual((await s.content.get('venue-1')).events[0].title,'Unity edited event');
  await rejects(s.content.save({...draft,highlights:[{...draft.highlights[0],playbackUrl:'javascript:alert(1)'}]}),'validation');
});
test('Next proxy rewrites tenant home and CMS while blocking a different tenant path', () => {
  const { NextRequest } = require('next/server');const { proxy } = require('../.test-build/proxy');
  const previous=process.env.NEXT_PUBLIC_ROOT_DOMAIN;process.env.NEXT_PUBLIC_ROOT_DOMAIN='example.com';
  try {
    const request=path=>new NextRequest(`https://unity-complex.example.com${path}`,{headers:{host:'unity-complex.example.com'}});
    assert.equal(new URL(proxy(request('/')).headers.get('x-middleware-rewrite')).pathname,'/s/unity-complex');
    const cms=new URL(proxy(request('/cms')).headers.get('x-middleware-rewrite'));assert.equal(cms.pathname,'/s/unity-complex/manage');assert.equal(cms.searchParams.get('tab'),'cms');
    assert.equal(proxy(request('/s/bambis-meda')).status,404);
  } finally {if(previous===undefined)delete process.env.NEXT_PUBLIC_ROOT_DOMAIN;else process.env.NEXT_PUBLIC_ROOT_DOMAIN=previous;}
});

test('owner walk-in blocks player availability, preserves tenant boundaries and rejects unauthorized actors', async () => {
  const s = setup();
  // Anonymous attempt
  await rejects(s.bookings.createWalkIn({ venueId: 'venue-1', fieldId: 'field-1', sport: 'football', date: '2099-01-01', startHour: 10, endHour: 12, guestName: 'Guest Team', idempotencyKey: crypto.randomUUID() }), 'unauthorized');

  // Player attempt
  s.transport.selectAccount('player-1');
  await rejects(s.bookings.createWalkIn({ venueId: 'venue-1', fieldId: 'field-1', sport: 'football', date: '2099-01-01', startHour: 10, endHour: 12, guestName: 'Guest Team', idempotencyKey: crypto.randomUUID() }), 'forbidden');

  // Unrelated owner attempt (owner-2 owns venue-2, trying on venue-1)
  s.transport.selectAccount('owner-2');
  await rejects(s.bookings.createWalkIn({ venueId: 'venue-1', fieldId: 'field-1', sport: 'football', date: '2099-01-01', startHour: 10, endHour: 12, guestName: 'Guest Team', idempotencyKey: crypto.randomUUID() }), 'forbidden');

  // Foreign resource ID (owner-1 owns venue-1, field-3 belongs to venue-2)
  s.transport.selectAccount('owner-1');
  await rejects(s.bookings.createWalkIn({ venueId: 'venue-1', fieldId: 'field-3', sport: 'volleyball', date: '2099-01-01', startHour: 10, endHour: 12, guestName: 'Guest Team', idempotencyKey: crypto.randomUUID() }), 'validation');

  // Authorized owner creates walk-in at venue-1
  const key = crypto.randomUUID();
  const walkIn = await s.bookings.createWalkIn({ venueId: 'venue-1', fieldId: 'field-1', sport: 'football', date: '2099-01-01', startHour: 10, endHour: 12, guestName: 'Walk-in Lions', guestPhone: '+251911000000', idempotencyKey: key });
  assert.equal(walkIn.source, 'walk_in');
  assert.equal(walkIn.guestName, 'Walk-in Lions');
  assert.equal(walkIn.paymentStatus, 'unpaid');
  assert.equal(walkIn.totalMinor, 500000);

  // Idempotency: exact same call returns same walkIn
  const replayed = await s.bookings.createWalkIn({ venueId: 'venue-1', fieldId: 'field-1', sport: 'football', date: '2099-01-01', startHour: 10, endHour: 12, guestName: 'Walk-in Lions', guestPhone: '+251911000000', idempotencyKey: key });
  assert.equal(replayed.id, walkIn.id);

  // Idempotency key reuse with different parameters fails
  await rejects(s.bookings.createWalkIn({ venueId: 'venue-1', fieldId: 'field-1', sport: 'football', date: '2099-01-01', startHour: 12, endHour: 14, guestName: 'Walk-in Lions', idempotencyKey: key }), 'conflict');

  // Appears in owner-1 schedule
  const ownerBookings = await s.bookings.list();
  assert.ok(ownerBookings.some(b => b.id === walkIn.id));

  // Does NOT leak into player-1 bookings
  s.transport.selectAccount('player-1');
  const playerBookings = await s.bookings.list();
  assert.equal(playerBookings.some(b => b.id === walkIn.id), false);

  // Interval disappears from player availability at field-1
  const slots = await s.bookings.availability('field-1', '2099-01-01');
  const slot10 = slots.find(sl => sl.startHour === 10);
  const slot11 = slots.find(sl => sl.startHour === 11);
  const slot12 = slots.find(sl => sl.startHour === 12);
  assert.equal(slot10.available, false);
  assert.equal(slot11.available, false);
  assert.equal(slot12.available, true);

  // Venue-2 (owner-2) is completely unaffected
  const v2Slots = await s.bookings.availability('field-3', '2099-01-01');
  assert.ok(v2Slots.find(sl => sl.startHour === 10).available);
});

test('multi-sport conflict on shared physical court applies to online and walk-in bookings', async () => {
  const s = setup();
  // field-2 is hardwood indoor court supporting basketball and futsal
  s.transport.selectAccount('owner-1');
  await s.bookings.createWalkIn({ venueId: 'venue-1', fieldId: 'field-2', sport: 'basketball', date: '2099-02-01', startHour: 14, endHour: 16, guestName: 'Basketball Team', idempotencyKey: crypto.randomUUID() });

  // Player attempts futsal online on the same physical field during the same interval -> conflict
  s.transport.selectAccount('player-1');
  await rejects(s.bookings.create({ fieldId: 'field-2', sport: 'futsal', date: '2099-02-01', startHour: 15, endHour: 17, idempotencyKey: crypto.randomUUID() }), 'conflict');

  // Separate physical court (field-1) is not affected
  const field1Booking = await s.bookings.create({ fieldId: 'field-1', sport: 'football', date: '2099-02-01', startHour: 14, endHour: 16, idempotencyKey: crypto.randomUUID() });
  assert.ok(field1Booking.id);
});

test('safe rescheduling preserves ID, recalculates quote, shifts availability, and enforces permissions and policy', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input({ startHour: 8, endHour: 10 }));
  assert.equal(booking.totalMinor, 300000);

  // Unrelated owner (owner-2) cannot reschedule venue-1's booking
  s.transport.selectAccount('owner-2');
  await rejects(s.bookings.reschedule(booking.id, { date: '2099-01-01', startHour: 14, endHour: 17, idempotencyKey: crypto.randomUUID() }), 'forbidden');

  // Player-1 reschedules to 3 hours (14 to 17) on the same court
  s.transport.selectAccount('player-1');
  const reschedKey = crypto.randomUUID();
  const moved = await s.bookings.reschedule(booking.id, { date: '2099-01-01', startHour: 14, endHour: 17, idempotencyKey: reschedKey });
  assert.equal(moved.id, booking.id);
  assert.equal(moved.startHour, 14);
  assert.equal(moved.endHour, 17);
  assert.equal(moved.totalMinor, 450000);
  assert.deepEqual(moved.originalSchedule, { date: '2099-01-01', startHour: 8, endHour: 10 });
  assert.ok(moved.rescheduledAt);

  // Idempotency: replay returns exact same outcome
  const replayed = await s.bookings.reschedule(booking.id, { date: '2099-01-01', startHour: 14, endHour: 17, idempotencyKey: reschedKey });
  assert.equal(replayed.id, booking.id);
  assert.equal(replayed.startHour, 14);

  // Old slot (8-10) is released and now available
  const slots = await s.bookings.availability('field-2', '2099-01-01');
  assert.equal(slots.find(sl => sl.startHour === 8).available, true);
  assert.equal(slots.find(sl => sl.startHour === 9).available, true);

  // New slot (14-17) is occupied and unavailable
  assert.equal(slots.find(sl => sl.startHour === 14).available, false);
  assert.equal(slots.find(sl => sl.startHour === 15).available, false);
  assert.equal(slots.find(sl => sl.startHour === 16).available, false);

  // Owner of venue-1 can also reschedule the booking
  s.transport.selectAccount('owner-1');
  const ownerMoved = await s.bookings.reschedule(booking.id, { date: '2099-01-01', startHour: 18, endHour: 20, idempotencyKey: crypto.randomUUID() });
  assert.equal(ownerMoved.startHour, 18);
  assert.equal(ownerMoved.endHour, 20);

  // Ineligible move: conflict with existing closure
  await s.bookings.close({ fieldId: 'field-2', date: '2099-01-02', startHour: 10, endHour: 12, reason: 'Maintenance' });
  await rejects(s.bookings.reschedule(booking.id, { date: '2099-01-02', startHour: 10, endHour: 12, idempotencyKey: crypto.randomUUID() }), 'conflict');

  // Ineligible move: outside court hours (court closes at 22, open at 6)
  await rejects(s.bookings.reschedule(booking.id, { date: '2099-01-03', startHour: 21, endHour: 23, idempotencyKey: crypto.randomUUID() }), 'validation');

  // Ineligible move: past slot
  await rejects(s.bookings.reschedule(booking.id, { date: '2020-01-01', startHour: 10, endHour: 12, idempotencyKey: crypto.randomUUID() }), 'validation');

  // Ineligible move: cancelled booking cannot be rescheduled
  await s.bookings.cancel(booking.id);
  await rejects(s.bookings.reschedule(booking.id, { date: '2099-01-03', startHour: 10, endHour: 12, idempotencyKey: crypto.randomUUID() }), 'conflict');
});

test('calendar navigation and week generation are timezone-safe and Monday-based', () => {
  // Shifting days forward and backward
  assert.equal(shiftDays('2026-10-15', 1), '2026-10-16');
  assert.equal(shiftDays('2026-10-15', -1), '2026-10-14');
  assert.equal(shiftDays('2026-10-15', 7), '2026-10-22');
  assert.equal(shiftDays('2026-10-15', -7), '2026-10-08');

  // Month and leap year boundary shifts
  assert.equal(shiftDays('2026-10-31', 1), '2026-11-01');
  assert.equal(shiftDays('2026-11-01', -1), '2026-10-31');
  assert.equal(shiftDays('2024-02-28', 1), '2024-02-29'); // leap year
  assert.equal(shiftDays('2024-02-29', 1), '2024-03-01');

  // Week calculation strictly starts on Monday and contains 7 sequential days
  // 2026-10-18 is Sunday; week must start on Monday 2026-10-12, NOT Sunday 2026-10-18
  const weekFromSunday = getWeekDays('2026-10-18');
  assert.equal(weekFromSunday.length, 7);
  assert.equal(weekFromSunday[0], '2026-10-12'); // Monday
  assert.equal(weekFromSunday[6], '2026-10-18'); // Sunday

  // 2026-10-12 is Monday
  const weekFromMonday = getWeekDays('2026-10-12');
  assert.deepEqual(weekFromMonday, weekFromSunday);

  // 2026-10-14 is Wednesday
  const weekFromWednesday = getWeekDays('2026-10-14');
  assert.deepEqual(weekFromWednesday, weekFromSunday);

  // Cleared or invalid date inputs must safely fallback to venueToday without crashing
  assert.equal(isValidDate(''), false);
  assert.equal(isValidDate(null), false);
  assert.equal(isValidDate('invalid-date'), false);
  assert.equal(isValidDate('2026-10-15'), true);

  const safeWeekFromEmpty = getWeekDays('');
  assert.equal(safeWeekFromEmpty.length, 7);
  assert.ok(safeWeekFromEmpty.every(d => isValidDate(d)));

  const safeShiftFromEmpty = shiftDays('', 1);
  assert.ok(isValidDate(safeShiftFromEmpty));
});

test('player bookings remain visible across multiple venues and future dates without owner venue/day filter restrictions', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');

  // Create booking at venue-1 on future date
  const b1 = await s.bookings.create(input({ fieldId: 'field-1', sport: 'football', date: '2099-01-01', startHour: 8, endHour: 10 }));
  // Create booking at venue-2 on a different future date
  const b2 = await s.bookings.create(input({ fieldId: 'field-3', sport: 'volleyball', date: '2099-05-15', startHour: 14, endHour: 16 }));
  // Create booking at venue-1 on a third future date
  const b3 = await s.bookings.create(input({ fieldId: 'field-2', sport: 'basketball', date: '2099-12-31', startHour: 18, endHour: 20 }));

  const playerBookings = await s.bookings.list();
  const playerIds = playerBookings.map(b => b.id);
  assert.ok(playerIds.includes(b1.id));
  assert.ok(playerIds.includes(b2.id));
  assert.ok(playerIds.includes(b3.id));

  // Verify the booking-list filter logic using the shared production matchesBookingCriteria function:
  // For players (!owner), all bookings are visible unless filtered by a specific bookingId query param
  const visibleToPlayer = playerBookings.filter(b => matchesBookingCriteria(b, {
    owner: false,
    effectiveVenueId: 'venue-1',
    date: '2026-10-15', // today
    viewMode: 'day',
    weekDays: getWeekDays('2026-10-15'),
  }));
  assert.equal(visibleToPlayer.length, playerBookings.length);

  // In contrast, owner mode filters strictly by venue and date
  const visibleToOwner = playerBookings.filter(b => matchesBookingCriteria(b, {
    owner: true,
    effectiveVenueId: 'venue-1',
    date: '2099-01-01',
    viewMode: 'day',
    weekDays: getWeekDays('2099-01-01'),
  }));
  assert.equal(visibleToOwner.some(b => b.id === b1.id), true);
  assert.equal(visibleToOwner.some(b => b.id === b2.id), false); // venue-2 excluded
});

test('venue-switch closure targeting prevents cross-venue field closures and enforces tenant bounds', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');

  // Owner 1 owns venue-1 (field-1, field-2)
  const venue1Closure = await s.bookings.close({
    fieldId: 'field-1',
    date: '2099-06-01',
    startHour: 10,
    endHour: 12,
    reason: 'Pitch renovation',
  });
  assert.ok(venue1Closure.id);

  // If a closure targets a court from another venue (e.g. field-3 belonging to venue-2), it is rejected
  await rejects(
    s.bookings.close({
      fieldId: 'field-3',
      date: '2099-06-01',
      startHour: 10,
      endHour: 12,
      reason: 'Cross-venue closure attempt',
    }),
    'forbidden'
  );

  // Component logic test: exercise production resolveTargetCourt helper directly
  const venue1Fields = [{ id: 'field-1', venueId: 'venue-1' }, { id: 'field-2', venueId: 'venue-1' }];
  const venue2Fields = [{ id: 'field-3', venueId: 'venue-2' }, { id: 'field-4', venueId: 'venue-2' }];

  let currentFieldSelection = 'field-1';
  // Venue switches: fields becomes venue2Fields
  assert.equal(resolveTargetCourt(venue2Fields, currentFieldSelection), 'field-3');
  assert.notEqual(resolveTargetCourt(venue2Fields, currentFieldSelection), 'field-1');
});

test('rescheduling quote computation rejects missing court pricing without fallback rate', () => {
  // Exercise shared production computeCourtQuote function directly
  assert.equal(computeCourtQuote(undefined, 10, 12), null);
  assert.equal(computeCourtQuote({ hourlyRateMinor: undefined }, 10, 12), null);
  assert.equal(computeCourtQuote({ hourlyRateMinor: 200000 }, 10, 12), 400000);
});

test('unpublish removes public microsite while preserving draft, venue active status, courts, and bookings', async () => {
  const s = setup();
  // 1. Setup an existing booking on venue-1
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input());
  assert.equal(booking.venueId, 'venue-1');

  // 2. Owner-1 verifies initial published state
  s.transport.selectAccount('owner-1');
  const initialDraft = await s.content.draft('venue-1');
  assert.equal(initialDraft.published, true);
  const initialPublic = await s.content.get('venue-1');
  assert.equal(initialPublic.published, true);

  // 3. Owner-1 unpublishes the venue microsite
  const unpublishedDraft = await s.content.unpublish('venue-1');
  assert.equal(unpublishedDraft.published, false);

  // 4. Public access now returns not_found
  await rejects(s.content.get('venue-1'), 'not_found');

  // 5. Operational data is untouched: venue is still active, courts exist, and booking is intact
  const venue = await s.venues.get('venue-1');
  assert.equal(venue.status, 'active');
  const courts = await s.venues.fields('venue-1');
  assert.ok(courts.length > 0);
  s.transport.selectAccount('player-1');
  const playerBookings = await s.bookings.list();
  assert.ok(playerBookings.some(b => b.id === booking.id && b.status === 'confirmed'));

  // 6. Owner-1 can view draft and republish at any time
  s.transport.selectAccount('owner-1');
  const reloadedDraft = await s.content.draft('venue-1');
  assert.equal(reloadedDraft.published, false);
  const republishedSite = await s.content.publish('venue-1');
  assert.equal(republishedSite.published, true);
  assert.equal((await s.content.get('venue-1')).published, true);
});

test('unauthorized and cross-tenant access to draft, preview, publish, and unpublish is strictly denied', async () => {
  const s = setup();
  // 1. Anonymous visitor cannot access owner draft or publish/unpublish
  await rejects(s.content.draft('venue-1'), 'unauthorized');
  await rejects(s.content.publish('venue-1'), 'unauthorized');
  await rejects(s.content.unpublish('venue-1'), 'unauthorized');

  // 2. Player-1 cannot access owner draft or publish/unpublish
  s.transport.selectAccount('player-1');
  await rejects(s.content.draft('venue-1'), 'forbidden');
  await rejects(s.content.publish('venue-1'), 'forbidden');
  await rejects(s.content.unpublish('venue-1'), 'forbidden');

  // 3. Owner-2 (Unity Sports Complex) cannot access or modify Venue-1 (Bambis Meda)
  s.transport.selectAccount('owner-2');
  await rejects(s.content.draft('venue-1'), 'forbidden');
  await rejects(s.content.save({ venueId: 'venue-1', tagline: 'Hacked', description: 'Desc', primaryColor: '#123456', published: false, updatedAt: '' }), 'forbidden');
  await rejects(s.content.publish('venue-1'), 'forbidden');
  await rejects(s.content.unpublish('venue-1'), 'forbidden');

  // Owner-2 CAN access and manage their own venue (venue-2)
  const venue2Draft = await s.content.draft('venue-2');
  assert.equal(venue2Draft.venueId, 'venue-2');
});

test('microsite validation rejects invalid colors, hero URLs, and lengths while keeping draft intact', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');
  const draft = await s.content.draft('venue-1');
  const originalTagline = draft.tagline;

  // Invalid hex color
  await rejects(s.content.save({ ...draft, primaryColor: 'invalid-color' }), 'validation');
  // Invalid hero image (e.g. ftp protocol)
  await rejects(s.content.save({ ...draft, heroImage: 'ftp://bad-host.com/img.jpg' }), 'validation');
  // Insecure http video URL
  await rejects(s.content.save({ ...draft, highlights: [{ id: 'h1', title: 'Test', teams: '', duration: '1:00', playbackUrl: 'http://insecure.com/video.mp4' }] }), 'validation');
  // Excessively long announcement (> 200 chars)
  await rejects(s.content.save({ ...draft, announcement: 'A'.repeat(250) }), 'validation');

  // Draft remains uncorrupted
  const currentDraft = await s.content.draft('venue-1');
  assert.equal(currentDraft.tagline, originalTagline);
});

test('editorial identity fields update in draft without modifying court rates or inventory', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');
  const initialCourts = await s.venues.fields('venue-1');
  const initialRates = initialCourts.map(c => c.hourlyRateMinor);

  const draft = await s.content.draft('venue-1');
  await s.content.save({
    ...draft,
    tagline: 'Updated Stadium Tagline',
    heroImage: '/custom-hero.jpg',
    announcement: 'Special weekend tournament scheduled!',
  });

  const updatedDraft = await s.content.draft('venue-1');
  assert.equal(updatedDraft.tagline, 'Updated Stadium Tagline');
  assert.equal(updatedDraft.heroImage, '/custom-hero.jpg');
  assert.equal(updatedDraft.announcement, 'Special weekend tournament scheduled!');

  // Operational court rates and counts remain exactly the same
  const courtsAfter = await s.venues.fields('venue-1');
  assert.equal(courtsAfter.length, initialCourts.length);
  assert.deepEqual(courtsAfter.map(c => c.hourlyRateMinor), initialRates);
});



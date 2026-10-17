const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createDemoTransport } = require('../.test-build/demo/transport');
const { createServices } = require('../.test-build/services/create-services');

const setup = () => {
  const transport = createDemoTransport();
  return { transport, ...createServices(transport) };
};

const input = (overrides = {}) => ({
  fieldId: 'field-2',
  sport: 'basketball',
  date: '2099-05-15',
  startHour: 10,
  endHour: 12,
  idempotencyKey: crypto.randomUUID(),
  ...overrides,
});

const rejects = (operation, code) => assert.rejects(operation, error => error.code === code);

test('commercial policy is explicitly unset and leaves unapproved fees unconfigured', async () => {
  const s = setup();
  const policy = await s.billing.policy();
  assert.equal(policy.subscriptionPriceMinor, null);
  assert.equal(policy.bookingCommissionPercent, null);
  assert.equal(policy.currency, 'ETB');
});

test('manual settlement creates integer minor transactions and derives dynamic booking payment status', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input());
  assert.equal(booking.totalMinor, 300000); // 2 hours * 1500 ETB/hr = 3000.00 ETB
  assert.equal(booking.currency, 'ETB');
  assert.equal(booking.paymentStatus, 'unpaid');

  // Owner of venue-1 inspects booking financials before settlement
  s.transport.selectAccount('owner-1');
  const initialFin = await s.billing.bookingFinancials(booking.id);
  assert.equal(initialFin.totalPriceMinor, 300000);
  assert.equal(initialFin.collectedMinor, 0);
  assert.equal(initialFin.refundedMinor, 0);
  assert.equal(initialFin.netCollectedMinor, 0);
  assert.equal(initialFin.outstandingMinor, 300000);
  assert.equal(initialFin.paymentStatus, 'unpaid');
  assert.equal(initialFin.transactions.length, 0);

  // Partial manual collection: 1000.00 ETB (100000 minor)
  const settle1 = await s.billing.settleBooking(booking.id, {
    amountMinor: 100000,
    method: 'cash',
    notes: 'Initial cash deposit at stadium counter',
  });
  assert.equal(settle1.transaction.type, 'collection');
  assert.equal(settle1.transaction.method, 'cash');
  assert.equal(settle1.transaction.amountMinor, 100000);
  assert.equal(settle1.transaction.currency, 'ETB');
  assert.equal(settle1.summary.collectedMinor, 100000);
  assert.equal(settle1.summary.outstandingMinor, 200000);
  assert.equal(settle1.summary.paymentStatus, 'partially_paid');

  // Verify booking list reflects dynamic partial payment status
  const updatedList = await s.bookings.list();
  const foundBooking = updatedList.find(b => b.id === booking.id);
  assert.equal(foundBooking.paymentStatus, 'partially_paid');

  // Settle remaining 2000.00 ETB (200000 minor)
  const settle2 = await s.billing.settleBooking(booking.id, {
    amountMinor: 200000,
    method: 'telebirr_manual',
    reference: 'TX-TB-889922',
  });
  assert.equal(settle2.summary.collectedMinor, 300000);
  assert.equal(settle2.summary.outstandingMinor, 0);
  assert.equal(settle2.summary.paymentStatus, 'paid');
  assert.equal(settle2.summary.transactions.length, 2);
});

test('overpayment is strictly rejected with validation error', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input());

  s.transport.selectAccount('owner-1');
  // Attempting to collect 3001.00 ETB when total is 3000.00 ETB
  await rejects(
    s.billing.settleBooking(booking.id, {
      amountMinor: 300100,
      method: 'cash',
    }),
    'validation'
  );

  // Partial collection of 2500.00 ETB
  await s.billing.settleBooking(booking.id, {
    amountMinor: 250000,
    method: 'pos',
  });

  // Attempting to collect another 600.00 ETB when outstanding is only 500.00 ETB
  await rejects(
    s.billing.settleBooking(booking.id, {
      amountMinor: 60000,
      method: 'pos',
    }),
    'validation'
  );
});

test('settlement and refund mutations are idempotent and prevent double-execution', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input());

  s.transport.selectAccount('owner-1');
  const idempotencyKey = 'key-settle-12345';
  const settleA = await s.billing.settleBooking(
    booking.id,
    { amountMinor: 150000, method: 'cash' },
    idempotencyKey
  );
  assert.equal(settleA.summary.collectedMinor, 150000);

  // Re-submitting with identical idempotencyKey
  const settleB = await s.billing.settleBooking(
    booking.id,
    { amountMinor: 150000, method: 'cash' },
    idempotencyKey
  );
  assert.equal(settleB.transaction.id, settleA.transaction.id);
  assert.equal(settleB.summary.collectedMinor, 150000); // Did not double to 300000

  // Refund idempotency
  const refundKey = 'key-refund-67890';
  const refundA = await s.billing.refundBooking(
    booking.id,
    { amountMinor: 50000, reason: 'Customer requested 1 hour cancellation' },
    refundKey
  );
  assert.equal(refundA.summary.refundedMinor, 50000);
  assert.equal(refundA.summary.netCollectedMinor, 100000);

  const refundB = await s.billing.refundBooking(
    booking.id,
    { amountMinor: 50000, reason: 'Customer requested 1 hour cancellation' },
    refundKey
  );
  assert.equal(refundB.transaction.id, refundA.transaction.id);
  assert.equal(refundB.summary.refundedMinor, 50000); // Did not double to 100000
});

test('refund limits are enforced against net collected funds and preserve correction records', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input());

  s.transport.selectAccount('owner-1');
  // Attempting refund on uncollected booking is rejected
  await rejects(
    s.billing.refundBooking(booking.id, {
      amountMinor: 10000,
      reason: 'No money collected',
    }),
    'validation'
  );

  // Collect 2000.00 ETB
  await s.billing.settleBooking(booking.id, {
    amountMinor: 200000,
    method: 'bank_transfer',
  });

  // Attempting refund of 2500.00 ETB when net collected is 2000.00 ETB is rejected
  await rejects(
    s.billing.refundBooking(booking.id, {
      amountMinor: 250000,
      reason: 'Excessive refund',
    }),
    'validation'
  );

  // Partial refund of 1000.00 ETB succeeds
  const ref1 = await s.billing.refundBooking(booking.id, {
    amountMinor: 100000,
    reason: 'Rain interruption partial refund',
  });
  assert.equal(ref1.transaction.type, 'refund');
  assert.equal(ref1.summary.netCollectedMinor, 100000);
  assert.equal(ref1.summary.paymentStatus, 'partially_refunded');

  // Attempting another refund of 1500.00 ETB when remaining net collected is 1000.00 ETB is rejected
  await rejects(
    s.billing.refundBooking(booking.id, {
      amountMinor: 150000,
      reason: 'Too much',
    }),
    'validation'
  );

  // Refund remaining 1000.00 ETB
  const ref2 = await s.billing.refundBooking(booking.id, {
    amountMinor: 100000,
    reason: 'Full remaining refund',
  });
  assert.equal(ref2.summary.netCollectedMinor, 0);
  assert.equal(ref2.summary.refundedMinor, 200000);
  assert.equal(ref2.summary.paymentStatus, 'refunded');

  // Venue transaction history preserves all collection and refund records
  const venueTxs = await s.billing.venueTransactions('venue-1');
  const bTxs = venueTxs.filter(t => t.bookingId === booking.id);
  assert.equal(bTxs.length, 3); // 1 collection + 2 refunds
});

test('booking cancellation is decoupled from refund execution: cancelling does not automatically refund', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input());

  s.transport.selectAccount('owner-1');
  // Settle in full
  await s.billing.settleBooking(booking.id, {
    amountMinor: 300000,
    method: 'cash',
  });

  // Player cancels the future booking
  s.transport.selectAccount('player-1');
  const cancelled = await s.bookings.cancel(booking.id);
  assert.equal(cancelled.status, 'cancelled');

  // Financial records remain completely intact and NOT refunded automatically
  const fin = await s.billing.bookingFinancials(booking.id);
  assert.equal(fin.totalPriceMinor, 300000);
  assert.equal(fin.collectedMinor, 300000);
  assert.equal(fin.refundedMinor, 0);
  assert.equal(fin.netCollectedMinor, 300000);
  assert.equal(fin.paymentStatus, 'paid'); // Still paid because no refund occurred

  // Owner may choose to issue explicit refund after cancellation
  s.transport.selectAccount('owner-1');
  const refund = await s.billing.refundBooking(booking.id, {
    amountMinor: 300000,
    reason: 'Owner agreed to full refund after cancellation',
  });
  assert.equal(refund.summary.netCollectedMinor, 0);
  assert.equal(refund.summary.refundedMinor, 300000);
  assert.equal(refund.summary.paymentStatus, 'refunded');
});

test('cross-tenant and unauthorized actors cannot settle, refund, or view other venues transactions', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input()); // venue-1 booking

  // Player cannot record settlements or refunds
  await rejects(
    s.billing.settleBooking(booking.id, { amountMinor: 100000, method: 'cash' }),
    'forbidden'
  );
  await rejects(
    s.billing.refundBooking(booking.id, { amountMinor: 100000, reason: 'test' }),
    'forbidden'
  );
  await rejects(s.billing.venueTransactions('venue-1'), 'forbidden');

  // Owner of venue-2 (Dawit Tadesse) cannot settle or refund venue-1 bookings
  s.transport.selectAccount('owner-2');
  await rejects(
    s.billing.settleBooking(booking.id, { amountMinor: 100000, method: 'cash' }),
    'forbidden'
  );
  await rejects(
    s.billing.refundBooking(booking.id, { amountMinor: 100000, reason: 'test' }),
    'forbidden'
  );
  await rejects(s.billing.venueTransactions('venue-1'), 'forbidden');

  // Player can inspect financials for their own booking
  s.transport.selectAccount('player-1');
  const playerView = await s.billing.bookingFinancials(booking.id);
  assert.equal(playerView.bookingId, booking.id);

  // Player-2 cannot inspect player-1's booking financials
  s.transport.selectAccount('player-2');
  await rejects(s.billing.bookingFinancials(booking.id), 'forbidden');
});

test('simulated gateway payments support telebirr and cbe_birr with explicit success and failure simulation', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input());

  // Simulate payment decline/timeout
  const failRes = await s.billing.simulateGateway(booking.id, {
    method: 'telebirr_gateway',
    simulateOutcome: 'failure',
  });
  assert.equal(failRes.transaction.status, 'failed');
  assert.equal(failRes.summary.outstandingMinor, 300000);
  assert.equal(failRes.summary.paymentStatus, 'failed');

  // Retry with success
  const successRes = await s.billing.simulateGateway(booking.id, {
    method: 'cbe_birr',
    simulateOutcome: 'success',
  });
  assert.equal(successRes.transaction.status, 'succeeded');
  assert.equal(successRes.summary.outstandingMinor, 0);
  assert.equal(successRes.summary.netCollectedMinor, 300000);
  assert.equal(successRes.summary.paymentStatus, 'paid');

  // Attempting gateway simulation when balance is 0 is rejected with conflict
  await rejects(
    s.billing.simulateGateway(booking.id, { method: 'telebirr_gateway', simulateOutcome: 'success' }),
    'conflict'
  );
});

test('subscription invoices are distinct from booking receipts and reflect unset provisional policy', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');

  const invoices = await s.billing.invoices();
  assert.ok(invoices.length > 0, 'Owner should see invoices for their venues');
  for (const inv of invoices) {
    assert.equal(inv.venueId, 'venue-1');
    assert.equal(inv.status, 'not_configured');
    assert.equal(inv.totalMinor, null, 'Unapproved fees must remain unset, not zero');
    assert.ok(inv.lineItems && inv.lineItems.length > 0);
    for (const line of inv.lineItems) {
      assert.equal(line.totalMinor, null);
    }
  }

  // Add regression test with stored invoices belonging to both owners
  // We can populate state.invoices via transport or demo storage simulation
  const storedInv1 = {
    id: 'INV-STORED-V1',
    venueId: 'venue-1',
    venueName: 'Bambis Meda Stadium',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    totalMinor: null,
    currency: 'ETB',
    status: 'not_configured',
    lineItems: [],
    issuedAt: '2026-09-01T00:00:00Z',
    notes: 'Stored invoice for owner 1',
  };
  const storedInv2 = {
    id: 'INV-STORED-V2',
    venueId: 'venue-2',
    venueName: 'Unity Sports Complex',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    totalMinor: null,
    currency: 'ETB',
    status: 'not_configured',
    lineItems: [],
    issuedAt: '2026-09-01T00:00:00Z',
    notes: 'Stored invoice for owner 2',
  };

  // Inject stored invoices for both owners
  // The simulator keeps state.invoices
  const { createFixtures } = require('../.test-build/demo/fixtures');
  const memStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = String(val); },
    removeItem(key) { delete this._data[key]; },
  };
  const initialData = createFixtures();
  initialData.invoices = [storedInv1, storedInv2];
  memStorage.setItem('etsf-demo-v2', JSON.stringify(initialData));
  const tWithStored = createDemoTransport(memStorage);
  const sStored = { ...createServices(tWithStored), transport: tWithStored };

  // Owner 1 requests invoices: receives ONLY stored invoice for venue-1, never venue-2
  sStored.transport.selectAccount('owner-1');
  const owner1Invoices = await sStored.billing.invoices();
  assert.equal(owner1Invoices.length, 1);
  assert.equal(owner1Invoices[0].id, 'INV-STORED-V1');
  assert.equal(owner1Invoices[0].venueId, 'venue-1');

  // Owner 1 explicitly requests venue-2 invoice: rejected with forbidden
  await rejects(sStored.billing.invoices({ venueId: 'venue-2' }), 'forbidden');

  // Owner 2 requests invoices: receives ONLY stored invoice for venue-2, never venue-1
  sStored.transport.selectAccount('owner-2');
  const owner2Invoices = await sStored.billing.invoices();
  assert.equal(owner2Invoices.length, 1);
  assert.equal(owner2Invoices[0].id, 'INV-STORED-V2');
  assert.equal(owner2Invoices[0].venueId, 'venue-2');

  // Owner 2 explicitly requests venue-1 invoice: rejected with forbidden
  await rejects(sStored.billing.invoices({ venueId: 'venue-1' }), 'forbidden');
});

test('owner analytics derives booking value, collections, refunds, and supports venue/sport/date filters', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input({ date: '2026-10-25' }));

  s.transport.selectAccount('owner-1');
  // Settle half the booking
  await s.billing.settleBooking(booking.id, {
    amountMinor: 150000,
    method: 'pos',
  });

  // Query analytics for owner-1
  const res = await s.billing.analytics({ venueId: 'venue-1' });
  assert.ok(res.detailed);
  const d = res.detailed;
  assert.ok(d.grossBookingValueMinor >= 300000);
  assert.ok(d.recordedCollectionsMinor >= 150000);
  assert.equal(d.provisionalCommissionPercent, null, 'Commission must remain unset');
  assert.equal(d.provisionalCommissionAmountMinor, null, 'Commission amount must remain unset');

  // Sport filter: basketball has bookings, football has 0
  const basketballAnalytics = await s.billing.analytics({ sport: 'basketball' });
  assert.ok(basketballAnalytics.detailed.grossBookingValueMinor > 0);
  assert.equal(basketballAnalytics.detailed.sportBreakdown.basketball.bookings, 1);

  const footballAnalytics = await s.billing.analytics({ sport: 'football' });
  assert.equal(footballAnalytics.detailed.grossBookingValueMinor, 0);

  // Zero activity filter for future far-out date
  const zeroAnalytics = await s.billing.analytics({ dateFrom: '2099-01-01', dateTo: '2099-01-02' });
  assert.equal(zeroAnalytics.bookings, 0);
  assert.equal(zeroAnalytics.collectedMinor, 0);
  assert.equal(zeroAnalytics.detailed.grossBookingValueMinor, 0);

  // Metric date basis: transaction date vs booking date
  const txDateAnalytics = await s.billing.analytics({ metricDateType: 'transaction_date' });
  assert.ok(txDateAnalytics.detailed.recordedCollectionsMinor >= 150000);
});

test('admin analytics aggregates platform-wide metrics and denies unauthorized users', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  await s.bookings.create(input());

  s.transport.selectAccount('admin-1');

  const adminReport = await s.admin.analytics();
  assert.ok(adminReport.grossBookingValueMinor > 0);
  assert.ok(adminReport.sportBreakdown);
  assert.equal(adminReport.provisionalCommissionPercent, null);

  // Filter platform report by venue
  const venue1Report = await s.admin.analytics({ venueId: 'venue-1' });
  assert.equal(venue1Report.venueId, 'venue-1');

  // Non-admin denial
  s.transport.selectAccount('owner-1');
  await rejects(s.admin.analytics(), 'forbidden');

  s.transport.selectAccount('player-1');
  await rejects(s.admin.analytics(), 'forbidden');
});

test('venue review lifecycle: submit -> request_changes -> resubmit -> approve -> suspend -> reinstate', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');

  // Create a new venue (starts in pending status submitted for review)
  const venue = await s.venues.create({
    name: 'Bole Champions Arena',
    city: 'Addis Ababa',
    address: 'Bole Subcity, Woreda 03',
    phone: '+251911223344',
    description: 'Modern sports facility',
  });
  assert.equal(venue.status, 'pending');

  // Review history visible to owner
  let ownerHistory = await s.venues.reviews(venue.id);
  assert.equal(ownerHistory.length, 1);
  assert.equal(ownerHistory[0].action, 'submit');

  // Admin inspects and requests changes
  s.transport.selectAccount('admin-1');

  // Missing reason on request_changes should fail validation
  await rejects(
    s.admin.reviewAction(venue.id, { action: 'request_changes', reason: '   ' }),
    'validation'
  );

  const reqChangesRes = await s.admin.reviewAction(venue.id, {
    action: 'request_changes',
    reason: 'Please upload commercial operating license and fire inspection certificate',
    notes: 'Internal flag: contact safety division',
  });
  assert.equal(reqChangesRes.venue.status, 'changes_requested');
  assert.equal(reqChangesRes.review.action, 'request_changes');

  // Owner resubmits
  s.transport.selectAccount('owner-1');
  const resubmitRes = await s.venues.submitForReview(venue.id, 'Attached certificate #9921');
  assert.equal(resubmitRes.venue.status, 'pending');

  // Admin approves venue
  s.transport.selectAccount('admin-1');
  const approveRes = await s.admin.reviewAction(venue.id, {
    action: 'approve',
    reason: 'All documentation verified',
  });
  assert.equal(approveRes.venue.status, 'active');

  // Admin suspends venue for noise violation
  const suspendRes = await s.admin.reviewAction(venue.id, {
    action: 'suspend',
    reason: 'Subcity environmental compliance suspension pending decibel test',
  });
  assert.equal(suspendRes.venue.status, 'suspended');

  // Admin reinstates venue
  const reinstateRes = await s.admin.reviewAction(venue.id, {
    action: 'reinstate',
    reason: 'Acoustic baffling installed and approved',
  });
  assert.equal(reinstateRes.venue.status, 'active');

  // Admin review history contains all transitions
  const adminHistory = await s.admin.reviews(venue.id);
  assert.equal(adminHistory.length, 6);
  assert.equal(adminHistory[0].action, 'reinstate'); // reverse chronological
  assert.equal(adminHistory[1].action, 'suspend');
  assert.equal(adminHistory[2].action, 'approve');
});

test('venue suspension stops new public discovery and bookings while preserving existing bookings and ledger', async () => {
  const s = setup();

  // Create booking while venue-1 is active
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input({ date: '2026-10-25' }));
  assert.equal(booking.status, 'confirmed');

  // Settle booking
  s.transport.selectAccount('owner-1');
  const settlement = await s.billing.settleBooking(booking.id, {
    amountMinor: 100000,
    method: 'cash',
  });
  assert.equal(settlement.transaction.status, 'recorded');

  // Admin suspends venue-1
  s.transport.selectAccount('admin-1');
  await s.admin.reviewAction('venue-1', {
    action: 'suspend',
    reason: 'Emergency turf maintenance required',
  });

  // Invariant 1: Suspended venue is hidden from public directory
  s.transport.selectAccount('player-1');
  const publicVenues = await s.venues.list();
  assert.ok(!publicVenues.some(v => v.id === 'venue-1'), 'Suspended venue must not appear in directory');

  // Invariant 2: Direct public lookup fails with not_found (404)
  await rejects(s.venues.get('bambis-super-sport'), 'not_found');

  // Invariant 3: Attempting new public booking fails
  await rejects(s.bookings.create(input({ date: '2026-10-26' })), 'not_found');

  // Invariant 4: Walk-ins at suspended venue are rejected with conflict
  s.transport.selectAccount('owner-1');
  await rejects(
    s.bookings.createWalkIn({
      venueId: 'venue-1',
      fieldId: 'field-1',
      guestName: 'Walk-in Guest',
      sport: 'basketball',
      date: '2026-10-26',
      startHour: 10,
      endHour: 11,
      idempotencyKey: 'walkin-suspended-attempt',
    }),
    'conflict'
  );

  // Invariant 5: Existing booking and financial records are NOT cancelled or erased
  const existingBooking = (await s.bookings.list()).find(b => b.id === booking.id);
  assert.ok(existingBooking, 'Existing booking must remain accessible');
  assert.equal(existingBooking.status, 'confirmed', 'Existing booking must NOT be silently cancelled');

  const financials = await s.billing.bookingFinancials(booking.id);
  assert.equal(financials.collectedMinor, 100000, 'Existing payment records must be preserved');
  assert.equal(financials.refundedMinor, 0, 'No automatic refunds on suspension');

  // Invariant 6: Owner retains authorized resolution access to dashboard and review history
  const ownedVenues = await s.venues.owned();
  const v1 = ownedVenues.find(v => v.id === 'venue-1');
  assert.ok(v1);
  assert.equal(v1.status, 'suspended');

  const v1Reviews = await s.venues.reviews('venue-1');
  assert.ok(v1Reviews.length > 0);
  assert.equal(v1Reviews[0].action, 'suspend');
});

test('camera certification is independent of venue review and suspension', async () => {
  const s = setup();

  // Inspect existing camera at venue-1
  s.transport.selectAccount('owner-1');
  const cameras = await s.media.cameras('venue-1');
  const cam = cameras[0];
  assert.ok(cam);

  // Admin certifies camera
  s.transport.selectAccount('admin-1');
  const certRes = await s.media.certifyCamera(cam.id, {
    certificationStatus: 'passed',
    notes: 'Mount and FOV verified',
  });
  assert.equal(certRes.certificationStatus, 'passed');

  // Suspend the venue
  await s.admin.reviewAction('venue-1', {
    action: 'suspend',
    reason: 'Administrative inspection',
  });

  // Verify camera certification remains 'passed', NOT revoked
  s.transport.selectAccount('owner-1');
  const camAfterSuspend = (await s.media.cameras('venue-1')).find(c => c.id === cam.id);
  assert.equal(camAfterSuspend.certificationStatus, 'passed', 'Camera certification must be independent of venue suspension');

  // Reinstate venue
  s.transport.selectAccount('admin-1');
  await s.admin.reviewAction('venue-1', {
    action: 'reinstate',
    reason: 'Inspection complete',
  });

  // Camera certification still 'passed'
  s.transport.selectAccount('owner-1');
  const camAfterReinstate = (await s.media.cameras('venue-1')).find(c => c.id === cam.id);
  assert.equal(camAfterReinstate.certificationStatus, 'passed');
});

test('account moderation enforces admin self-lockout and last-admin protections', async () => {
  const s = setup();
  s.transport.selectAccount('admin-1');

  // Moderate player-2 to suspended
  await rejects(
    s.admin.moderateUser('player-2', { status: 'suspended', reason: '   ' }),
    'validation'
  );

  const modRes = await s.admin.moderateUser('player-2', {
    status: 'suspended',
    reason: 'Chargeback dispute investigation',
  });
  assert.equal(modRes.status, 'suspended');

  // Invariant 1: Admin self-lockout protection
  await rejects(
    s.admin.moderateUser('admin-1', { status: 'suspended', reason: 'Self suspension attempt' }),
    'conflict'
  );

  // Invariant 2: Suspend second admin (admin-2)
  const suspendAdmin2 = await s.admin.moderateUser('admin-2', {
    status: 'suspended',
    reason: 'Temporary leave',
  });
  assert.equal(suspendAdmin2.status, 'suspended');

  // Now admin-1 is the only active admin remaining
  // Attempting to suspend the last active admin is blocked
  await rejects(
    s.admin.moderateUser('admin-1', { status: 'suspended', reason: 'Suspend last admin' }),
    'conflict'
  );

  // Reinstate admin-2
  const reinstateAdmin2 = await s.admin.moderateUser('admin-2', {
    status: 'active',
    reason: 'Returned from leave',
  });
  assert.equal(reinstateAdmin2.status, 'active');

  // Non-admins cannot moderate accounts
  s.transport.selectAccount('player-1');
  await rejects(
    s.admin.moderateUser('player-3', { status: 'suspended', reason: 'Unauthorized' }),
    'forbidden'
  );
});

test('account suspension denies operations at the service layer, not just hidden UI', async () => {
  const s = setup();

  // Admin suspends player-2
  s.transport.selectAccount('admin-1');
  await s.admin.moderateUser('player-2', {
    status: 'suspended',
    reason: 'Suspension for operational test',
  });

  // Switch to suspended player-2
  s.transport.selectAccount('player-2');

  // Attempting to create booking is rejected with forbidden
  await rejects(s.bookings.create(input()), 'forbidden');

  // Attempting to create team is rejected with forbidden
  await rejects(
    s.teams.create({
      name: 'Forbidden Squad',
      sport: 'football',
      city: 'Addis Ababa',
    }),
    'forbidden'
  );

  // Attempting to join team is rejected with forbidden
  await rejects(s.teams.join('team-1'), 'forbidden');

  // Attempting to submit a support case is rejected with forbidden
  await rejects(
    s.support.create({
      category: 'general',
      subject: 'Suspended inquiry',
      message: 'Can I play?',
    }),
    'forbidden'
  );

  // Admin reinstates player-2
  s.transport.selectAccount('admin-1');
  await s.admin.moderateUser('player-2', {
    status: 'active',
    reason: 'Account reinstated after review',
  });

  // Player-2 can now perform operations normally
  s.transport.selectAccount('player-2');
  const validBooking = await s.bookings.create(input());
  assert.ok(validBooking.id);
  assert.equal(validBooking.playerId, 'player-2');
});

test('support cases enforce role boundaries and strip internal staff notes for non-admins', async () => {
  const s = setup();

  // Test seeded case-1 (linked to player-1 and venue-1)
  // Admin-1 views case-1: sees all 3 messages including msg-2 (internal staff note)
  s.transport.selectAccount('admin-1');
  const adminCase = await s.support.get('case-1');
  assert.equal(adminCase.messages.length, 3);
  assert.ok(adminCase.messages.some(m => m.isInternal === true), 'Admin must see internal notes');

  // Player-1 (author) views case-1: sees only 2 messages, internal staff note is stripped
  s.transport.selectAccount('player-1');
  const playerCase = await s.support.get('case-1');
  assert.equal(playerCase.messages.length, 2);
  assert.ok(!playerCase.messages.some(m => m.isInternal === true), 'Player must NOT see internal staff notes');

  // Owner-1 (owner of venue-1) views case-1: permitted, sees only 2 messages, internal staff note stripped
  s.transport.selectAccount('owner-1');
  const ownerCase = await s.support.get('case-1');
  assert.equal(ownerCase.messages.length, 2);
  assert.ok(!ownerCase.messages.some(m => m.isInternal === true), 'Owner must NOT see internal staff notes');

  // Player-2 (unrelated) views case-1: rejected with forbidden
  s.transport.selectAccount('player-2');
  await rejects(s.support.get('case-1'), 'forbidden');

  // Non-admins cannot post internal notes
  s.transport.selectAccount('player-1');
  await rejects(
    s.support.addMessage('case-1', {
      message: 'Sneaking an internal note',
      isInternal: true,
    }),
    'forbidden'
  );

  // Player-1 posts regular reply
  const playerMsg = await s.support.addMessage('case-1', {
    message: 'Thank you for confirming the floodlights.',
  });
  assert.equal(playerMsg.isInternal, false);

  // Admin posts a new internal staff note
  s.transport.selectAccount('admin-1');
  const adminInternalNote = await s.support.addMessage('case-1', {
    message: 'Staff check: generator fuel level verified at 95%.',
    isInternal: true,
  });
  assert.equal(adminInternalNote.isInternal, true);

  // Admin updates case status to resolved
  const resolvedCase = await s.support.update('case-1', { status: 'resolved' });
  assert.equal(resolvedCase.status, 'resolved');
  assert.ok(resolvedCase.resolvedAt);

  // Player-1 creates a new case linked to their booking
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create(input({ date: '2026-10-30' }));
  const newCase = await s.support.create({
    bookingId: booking.id,
    category: 'refund_request',
    subject: 'Request refund for rained out session',
    message: 'Heavy rain flooded outdoor court.',
    priority: 'high',
  });
  assert.equal(newCase.status, 'open');
  assert.equal(newCase.authorId, 'player-1');
  assert.equal(newCase.messages.length, 1);

  // Author closes their own case
  const closedCase = await s.support.update(newCase.id, { status: 'closed' });
  assert.equal(closedCase.status, 'closed');
  assert.ok(closedCase.resolvedAt);

  // Unrelated player (player-2) cannot call support.update on case-1 (even with empty payload)
  s.transport.selectAccount('player-2');
  await rejects(s.support.update('case-1', {}), 'forbidden');

  // Player-2 cannot create a case linking Player-1's booking
  await rejects(
    s.support.create({
      bookingId: booking.id,
      category: 'booking_dispute',
      subject: 'Dispute another player booking',
      message: 'Trying to link someone elses booking',
    }),
    'forbidden'
  );

  // Creating a case with inconsistent bookingId and venueId is rejected with validation error
  s.transport.selectAccount('player-1');
  await rejects(
    s.support.create({
      venueId: 'venue-2',
      bookingId: booking.id, // belongs to venue-1
      category: 'booking_dispute',
      subject: 'Inconsistent booking and venue',
      message: 'Mismatched venue and booking',
    }),
    'validation'
  );

  // Admin adds an internal note to newCase, then player-1 updates it: player must NOT receive internal note
  s.transport.selectAccount('admin-1');
  await s.support.addMessage(newCase.id, {
    message: 'Staff investigation note: confirmed weather report.',
    isInternal: true,
  });
  s.transport.selectAccount('player-1');
  const sanitizedUpdatedCase = await s.support.update(newCase.id, {});
  assert.ok(
    !sanitizedUpdatedCase.messages.some(m => m.isInternal),
    'Non-admin update response must sanitize internal notes'
  );
});





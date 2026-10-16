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

  // Cross-tenant invoice isolation: owner-2 cannot request owner-1's invoices
  s.transport.selectAccount('owner-2');
  const owner2Invoices = await s.billing.invoices({ venueId: 'venue-1' });
  assert.equal(owner2Invoices.length, 0);
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



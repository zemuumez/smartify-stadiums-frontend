const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDemoTransport } = require('../.test-build/demo/transport');
const { createServices } = require('../.test-build/services/create-services');

const setup = () => {
  const transport = createDemoTransport();
  return { transport, ...createServices(transport) };
};

const rejects = (operation, code) =>
  assert.rejects(operation, (error) => {
    assert.equal(error.code, code);
    return true;
  });

test('team creation assigns captain and initializes roster with creator', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');

  const team = await s.teams.create({
    name: 'Bole Warriors',
    sport: 'football',
    city: 'Addis Ababa',
    description: 'Bole neighborhood football club',
  });

  assert.ok(team.id);
  assert.equal(team.name, 'Bole Warriors');
  assert.equal(team.sport, 'football');
  assert.equal(team.city, 'Addis Ababa');
  assert.equal(team.captainId, 'player-1');
  assert.equal(team.captainName, 'Abebe Kebede');
  assert.deepEqual(team.memberIds, ['player-1']);

  const fetched = await s.teams.get(team.id);
  assert.equal(fetched.id, team.id);
  assert.equal(fetched.name, 'Bole Warriors');
});

test('team creation validates inputs', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');

  await rejects(
    s.teams.create({ name: '', sport: 'football', city: 'Addis Ababa' }),
    'validation'
  );
  await rejects(
    s.teams.create({ name: 'Valid', sport: 'cricket', city: 'Addis Ababa' }),
    'validation'
  );
  await rejects(
    s.teams.create({ name: 'Valid', sport: 'football', city: '' }),
    'validation'
  );
});

test('team join requests, approval, rejection, and duplicate prevention', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const team = await s.teams.create({
    name: 'Addis Strikers',
    sport: 'football',
    city: 'Addis Ababa',
  });

  // Captain cannot join their own team (already a member)
  await rejects(s.teams.join(team.id), 'conflict');

  // player-2 submits join request
  s.transport.selectAccount('player-2');
  const req = await s.teams.join(team.id);
  assert.equal(req.teamId, team.id);
  assert.equal(req.playerId, 'player-2');
  assert.equal(req.playerName, 'Sara Mengistu');
  assert.equal(req.status, 'pending');

  // Duplicate join request is rejected
  await rejects(s.teams.join(team.id), 'conflict');

  // Non-captain cannot list or moderate requests
  await rejects(s.teams.listRequests(team.id), 'forbidden');
  await rejects(s.teams.approveRequest(team.id, req.id), 'forbidden');
  await rejects(s.teams.rejectRequest(team.id, req.id), 'forbidden');

  // Captain reviews requests
  s.transport.selectAccount('player-1');
  const pendingRequests = await s.teams.listRequests(team.id);
  assert.equal(pendingRequests.length, 1);
  assert.equal(pendingRequests[0].id, req.id);

  // Captain rejects request
  const rejected = await s.teams.rejectRequest(team.id, req.id);
  assert.equal(rejected.status, 'rejected');

  // player-2 can now submit a fresh request after previous was rejected
  s.transport.selectAccount('player-2');
  const req2 = await s.teams.join(team.id);
  assert.equal(req2.status, 'pending');

  // Captain approves request
  s.transport.selectAccount('player-1');
  const updatedTeam = await s.teams.approveRequest(team.id, req2.id);
  assert.ok(updatedTeam.memberIds.includes('player-2'));
  assert.ok(updatedTeam.memberIds.includes('player-1'));

  // Approving already approved request is rejected
  await rejects(s.teams.approveRequest(team.id, req2.id), 'conflict');
});

test('team roster management: leaving and member removal', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const team = await s.teams.create({
    name: 'Meskel United',
    sport: 'football',
    city: 'Addis Ababa',
  });

  s.transport.selectAccount('player-2');
  const req = await s.teams.join(team.id);

  s.transport.selectAccount('player-1');
  await s.teams.approveRequest(team.id, req.id);

  // Non-captain cannot remove members
  s.transport.selectAccount('player-2');
  await rejects(s.teams.removeMember(team.id, 'player-1'), 'forbidden');

  // Member can leave
  const leaveRes = await s.teams.leave(team.id);
  assert.equal(leaveRes.success, true);
  const teamAfterLeave = await s.teams.get(team.id);
  assert.equal(teamAfterLeave.memberIds.includes('player-2'), false);

  // Leaving when not a member is forbidden
  await rejects(s.teams.leave(team.id), 'forbidden');

  // Sole captain leaving deletes the team
  s.transport.selectAccount('player-1');
  await s.teams.leave(team.id);
  await rejects(s.teams.get(team.id), 'not_found');
});

test('team bookings validate captain authority, matching sport, and derive authoritative team name', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');

  // Bole Lions FC is seeded with sport: 'football', captainId: 'player-1'
  const team = (await s.teams.list()).find((t) => t.id === 'team-1');
  assert.ok(team);
  assert.equal(team.sport, 'football');
  assert.equal(team.captainId, 'player-1');

  // player-1 (captain) books a football court (field-1 is football)
  const booking = await s.bookings.create({
    fieldId: 'field-1',
    sport: 'football',
    date: '2099-06-01',
    startHour: 10,
    endHour: 12,
    idempotencyKey: crypto.randomUUID(),
    teamId: team.id,
    teamName: 'Tampered Attacker Name', // must be overridden by authoritative name
  });

  assert.equal(booking.teamId, team.id);
  assert.equal(booking.teamName, 'Bole Lions FC'); // authoritative!

  // Non-captain (player-2) attempting to book on behalf of team-1 is rejected
  s.transport.selectAccount('player-2');
  await rejects(
    s.bookings.create({
      fieldId: 'field-1',
      sport: 'football',
      date: '2099-06-02',
      startHour: 10,
      endHour: 12,
      idempotencyKey: crypto.randomUUID(),
      teamId: team.id,
    }),
    'forbidden'
  );

  // Captain attempting to book a court for incompatible sport is rejected
  // field-2 is basketball, but team-1 is football
  s.transport.selectAccount('player-1');
  await rejects(
    s.bookings.create({
      fieldId: 'field-2',
      sport: 'basketball',
      date: '2099-06-03',
      startHour: 10,
      endHour: 12,
      idempotencyKey: crypto.randomUUID(),
      teamId: team.id,
    }),
    'validation'
  );
});

test('team bookings visibility enforces member vs public privacy boundaries', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const team = (await s.teams.list()).find((t) => t.id === 'team-1');

  await s.bookings.create({
    fieldId: 'field-1',
    sport: 'football',
    date: '2099-07-01',
    startHour: 14,
    endHour: 16,
    idempotencyKey: crypto.randomUUID(),
    teamId: team.id,
  });

  // Captain/member view: includes full financial details
  const memberBookings = await s.teams.listBookings(team.id);
  assert.equal(memberBookings.length, 1);
  assert.ok(memberBookings[0].totalMinor > 0);
  assert.equal(memberBookings[0].paymentStatus, 'unpaid');

  // Public/non-member view: financial and private fields omitted
  s.transport.selectAccount('player-2');
  const publicBookings = await s.teams.listBookings(team.id);
  assert.equal(publicBookings.length, 1);
  assert.equal(publicBookings[0].id, memberBookings[0].id);
  assert.equal(publicBookings[0].sport, 'football');
  assert.equal(publicBookings[0].date, '2099-07-01');
  assert.equal(publicBookings[0].startHour, 14);
  assert.equal(publicBookings[0].endHour, 16);
  assert.equal(publicBookings[0].totalMinor, undefined);
  assert.equal(publicBookings[0].paymentStatus, undefined);
});

test('venue events list and detail model participation format and dynamic capacity', async () => {
  const s = setup();
  // venue-1 has seeded site events
  const events = await s.events.list('venue-1');
  assert.ok(events.length > 0);

  const tournament = events.find((e) => e.id === 'venue-1-event-0');
  assert.ok(tournament);
  assert.equal(tournament.format, 'team');
  assert.equal(tournament.spots, 6);
  assert.equal(tournament.registeredCount, 0);
  assert.equal(tournament.availableSpots, 6);
  assert.equal(tournament.isFull, false);
  assert.equal(tournament.isClosed, false);
  assert.equal(tournament.myRegistration, null);

  const detail = await s.events.get('venue-1', 'venue-1-event-0');
  assert.equal(detail.id, 'venue-1-event-0');
  assert.equal(detail.format, 'team');
  assert.equal(detail.availableSpots, 6);
});

test('event registrations across team, singles, and doubles formats with duplicate prevention and spot updates', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');

  // Register for team event: 'venue-1-event-0' (football team tournament)
  const team = (await s.teams.list()).find((t) => t.id === 'team-1');
  const reg1 = await s.events.register('venue-1', 'venue-1-event-0', { teamId: team.id });
  assert.equal(reg1.eventId, 'venue-1-event-0');
  assert.equal(reg1.format, 'team');
  assert.equal(reg1.teamId, team.id);
  assert.equal(reg1.teamName, 'Bole Lions FC');
  assert.equal(reg1.status, 'registered');

  // Dynamic capacity decrements
  const eventAfter = await s.events.get('venue-1', 'venue-1-event-0');
  assert.equal(eventAfter.registeredCount, 1);
  assert.equal(eventAfter.availableSpots, 5);
  assert.equal(eventAfter.myRegistration.id, reg1.id);

  // Duplicate registration for same team is rejected
  await rejects(
    s.events.register('venue-1', 'venue-1-event-0', { teamId: team.id }),
    'conflict'
  );

  // Non-captain cannot register team
  s.transport.selectAccount('player-2');
  await rejects(
    s.events.register('venue-1', 'venue-1-event-0', { teamId: team.id }),
    'forbidden'
  );

  // Registering for singles format event: venue-2-event-2 at venue-2 (tennis singles)
  const tennisClinic = await s.events.get('venue-2', 'venue-2-event-2');
  assert.equal(tennisClinic.format, 'singles');
  assert.equal(tennisClinic.availableSpots, 6);

  const regSingles = await s.events.register('venue-2', 'venue-2-event-2');
  assert.equal(regSingles.format, 'singles');
  assert.equal(regSingles.playerName, 'Sara Mengistu');
  assert.equal(regSingles.status, 'registered');

  // Duplicate registration for singles is rejected
  await rejects(s.events.register('venue-2', 'venue-2-event-2'), 'conflict');

  const tennisAfter = await s.events.get('venue-2', 'venue-2-event-2');
  assert.equal(tennisAfter.registeredCount, 1);
  assert.equal(tennisAfter.availableSpots, 5);
});

test('event registration cancellation restores available spots once', async () => {
  const s = setup();
  s.transport.selectAccount('player-2');

  const reg = await s.events.register('venue-2', 'venue-2-event-2');
  const beforeCancel = await s.events.get('venue-2', 'venue-2-event-2');
  assert.equal(beforeCancel.availableSpots, 5);

  // Cancel registration
  const cancelled = await s.events.cancel('venue-2', 'venue-2-event-2', reg.id);
  assert.equal(cancelled.status, 'cancelled');

  // Spots restored
  const afterCancel = await s.events.get('venue-2', 'venue-2-event-2');
  assert.equal(afterCancel.availableSpots, 6);
  assert.equal(afterCancel.registeredCount, 0);

  // Cancelling again is rejected
  await rejects(s.events.cancel('venue-2', 'venue-2-event-2', reg.id), 'conflict');

  // Non-registered user cannot cancel another user's registration
  s.transport.selectAccount('player-1');
  const reg2 = await s.events.register('venue-2', 'venue-2-event-2');
  s.transport.selectAccount('player-2');
  await rejects(s.events.cancel('venue-2', 'venue-2-event-2', reg2.id), 'forbidden');
});

test('CMS edits preserve registrations and reject deleting registered events or shrinking capacity', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const team = (await s.teams.list()).find((t) => t.id === 'team-1');

  // Register for venue-1-event-0 at venue-1
  await s.events.register('venue-1', 'venue-1-event-0', { teamId: team.id });

  // Venue owner attempts CMS edits
  s.transport.selectAccount('owner-1');
  const draft = await s.content.draft('venue-1');

  // Attempt 1: Delete venue-1-event-0 (which has active registration) -> must reject with conflict
  const eventsWithoutEvent0 = (draft.events || []).filter((e) => e.id !== 'venue-1-event-0');
  await rejects(
    s.content.save({ ...draft, events: eventsWithoutEvent0 }),
    'conflict'
  );

  // Attempt 2: Shrink venue-1-event-0 capacity below current registrations (registeredCount is 1, so spots = 0 must fail)
  const shrunkEvents = (draft.events || []).map((e) =>
    e.id === 'venue-1-event-0' ? { ...e, spots: 0 } : e
  );
  await rejects(
    s.content.save({ ...draft, events: shrunkEvents }),
    'conflict'
  );

  // Attempt 3: Change sport of registered event -> must reject with conflict
  const changedSportEvents = (draft.events || []).map((e) =>
    e.id === 'venue-1-event-0' ? { ...e, sport: 'basketball' } : e
  );
  await rejects(
    s.content.save({ ...draft, events: changedSportEvents }),
    'conflict'
  );

  // Attempt 4: Safe update (e.g. update announcement and add a new event) -> succeeds
  const updatedDraft = await s.content.save({
    ...draft,
    announcement: 'Upcoming championship next weekend!',
  });
  assert.equal(updatedDraft.announcement, 'Upcoming championship next weekend!');

  // Registrations and capacity for venue-1-event-0 remain fully intact!
  const event0 = await s.events.get('venue-1', 'venue-1-event-0');
  assert.equal(event0.registeredCount, 1);
  assert.equal(event0.availableSpots, 5);

  // Attempt 5: Deleting an event with ZERO registrations (venue-1-event-1) -> succeeds safely
  const withoutUnregisteredEvent = updatedDraft.events.filter((e) => e.id !== 'venue-1-event-1');
  const safeDeleteDraft = await s.content.save({
    ...updatedDraft,
    events: withoutUnregisteredEvent,
  });
  assert.equal(safeDeleteDraft.events.some((e) => e.id === 'venue-1-event-1'), false);
  assert.equal(safeDeleteDraft.events.some((e) => e.id === 'venue-1-event-0'), true);
});

test('doubles format requires partner name and enforces duplicate prevention', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');

  // venue-2-event-1 is badminton doubles
  const event = await s.events.get('venue-2', 'venue-2-event-1');
  assert.equal(event.format, 'doubles');

  const reg = await s.events.register('venue-2', 'venue-2-event-1', {
    partnerName: 'Dawit Tadesse',
  });
  assert.equal(reg.format, 'doubles');
  assert.equal(reg.partnerName, 'Dawit Tadesse');
  assert.equal(reg.playerName, 'Abebe Kebede');

  // Duplicate registration for same player is rejected
  await rejects(
    s.events.register('venue-2', 'venue-2-event-1', { partnerName: 'Another Partner' }),
    'conflict'
  );
});

test('event registration rejects full capacity and closed events', async () => {
  const s = setup();
  // Create an event with spots: 1 in venue-1 draft and publish it
  s.transport.selectAccount('owner-1');
  const draft = await s.content.draft('venue-1');
  const smallEvent = {
    id: 'venue-1-small-cup',
    title: '1-Spot Quick Cup',
    sport: 'tennis',
    format: 'singles',
    date: '2028-10-10',
    time: '12:00',
    spots: 1,
  };
  const closedEvent = {
    id: 'venue-1-past-cup',
    title: 'Past Cup',
    sport: 'tennis',
    format: 'singles',
    date: '2020-01-01',
    time: '12:00',
    spots: 10,
  };
  await s.content.save({
    ...draft,
    events: [...draft.events, smallEvent, closedEvent],
  });
  await s.content.publish('venue-1');

  // Register 1st player for smallEvent -> capacity reaches 0
  s.transport.selectAccount('player-1');
  await s.events.register('venue-1', 'venue-1-small-cup');

  const detail = await s.events.get('venue-1', 'venue-1-small-cup');
  assert.equal(detail.availableSpots, 0);
  assert.equal(detail.isFull, true);

  // 2nd player attempts to register for smallEvent -> rejects with conflict (full)
  s.transport.selectAccount('player-2');
  await rejects(
    s.events.register('venue-1', 'venue-1-small-cup'),
    'conflict'
  );

  // Player attempts to register for past event -> rejects with conflict (closed)
  await rejects(
    s.events.register('venue-1', 'venue-1-past-cup'),
    'conflict'
  );
});


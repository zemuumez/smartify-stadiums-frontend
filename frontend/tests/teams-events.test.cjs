const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDemoTransport } = require('../.test-build/demo/transport');
const { createServices } = require('../.test-build/services/create-services');
const { fetchTeamDetailData, isGuestAuthError } = require('../.test-build/services/teams.service');
const { resolveVenueSiteEvents, resolveEffectiveEvent } = require('../.test-build/services/events.service');
const { useServiceQuery, areQueryKeysEqual } = require('../.test-build/lib/use-service-query');

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

  // Captain/member view: includes full financial details and booking references
  const memberBookings = await s.teams.listBookings(team.id);
  assert.equal(memberBookings.length, 1);
  assert.ok(memberBookings[0].matchId);
  assert.ok(memberBookings[0].bookingId);
  assert.ok(memberBookings[0].totalMinor > 0);
  assert.equal(memberBookings[0].paymentStatus, 'unpaid');

  // Public/non-member view: dedicated PublicTeamMatch DTO, private fields omitted
  s.transport.selectAccount('player-2');
  const publicBookings = await s.teams.listBookings(team.id);
  assert.equal(publicBookings.length, 1);
  assert.ok(publicBookings[0].matchId);
  assert.equal(publicBookings[0].id, undefined);
  assert.equal(publicBookings[0].bookingId, undefined);
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

  // Missing or blank partnerName must reject with validation error
  await rejects(s.events.register('venue-2', 'venue-2-event-1'), 'validation');
  await rejects(s.events.register('venue-2', 'venue-2-event-1', {}), 'validation');
  await rejects(s.events.register('venue-2', 'venue-2-event-1', { partnerName: '' }), 'validation');
  await rejects(s.events.register('venue-2', 'venue-2-event-1', { partnerName: '   ' }), 'validation');

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

test('teamsService.myRequest returns pending join request and persists across reconstructed storage reload', async () => {
  const store = new Map();
  const mockStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
  };

  // Session 1: create team, submit join request
  const transport1 = createDemoTransport(mockStorage);
  const s1 = { transport: transport1, ...createServices(transport1) };
  transport1.selectAccount('player-1');
  const team = await s1.teams.create({
    name: 'Gerji Hoops',
    sport: 'basketball',
    city: 'Addis Ababa',
  });

  transport1.selectAccount('player-2');
  const noReqBefore = await s1.teams.myRequest(team.id);
  assert.equal(noReqBefore, null);

  await s1.teams.join(team.id);
  const req1 = await s1.teams.myRequest(team.id);
  assert.ok(req1);
  assert.equal(req1.status, 'pending');

  // Session 2: completely new transport instantiated from persisted mockStorage (simulating hard reload)
  const transport2 = createDemoTransport(mockStorage);
  const s2 = { transport: transport2, ...createServices(transport2) };
  transport2.selectAccount('player-2');
  const reloadedReq = await s2.teams.myRequest(team.id);
  assert.ok(reloadedReq);
  assert.equal(reloadedReq.teamId, team.id);
  assert.equal(reloadedReq.playerId, 'player-2');
  assert.equal(reloadedReq.status, 'pending');

  // Captain approves in Session 2
  transport2.selectAccount('player-1');
  await s2.teams.approveRequest(team.id, reloadedReq.id);

  // Reconstructed Session 3 verifies membership is restored and request clears
  const transport3 = createDemoTransport(mockStorage);
  const s3 = { transport: transport3, ...createServices(transport3) };
  transport3.selectAccount('player-2');
  const reqAfterApproval = await s3.teams.myRequest(team.id);
  assert.equal(reqAfterApproval, null);
});

test('publication revalidates event registrations against draft deletions and mutations', async () => {
  const s = setup();
  // 1. Owner saves draft deleting venue-1-event-0 (at this point, event has 0 registrations, so draft save succeeds)
  s.transport.selectAccount('owner-1');
  const draft = await s.content.draft('venue-1');
  const withoutEvent0 = (draft.events || []).filter((e) => e.id !== 'venue-1-event-0');
  await s.content.save({ ...draft, events: withoutEvent0 });

  // 2. While draft is pending, a player registers against the still-published venue-1-event-0
  s.transport.selectAccount('player-1');
  const team = (await s.teams.list()).find((t) => t.id === 'team-1');
  await s.events.register('venue-1', 'venue-1-event-0', { teamId: team.id });

  // Verify registration exists on live event
  const detailBefore = await s.events.get('venue-1', 'venue-1-event-0');
  assert.equal(detailBefore.registeredCount, 1);

  // 3. Owner attempts to publish the draft that deletes venue-1-event-0 -> MUST reject with conflict!
  s.transport.selectAccount('owner-1');
  await rejects(s.content.publish('venue-1'), 'conflict');

  // Cancellation remains working because publication was rejected and event was NOT removed!
  s.transport.selectAccount('player-1');
  const cancelRes = await s.events.cancel('venue-1', 'venue-1-event-0', detailBefore.myRegistration.id);
  assert.equal(cancelRes.status, 'cancelled');
});

test('resolveVenueSiteEvents renders draft events in preview and resolveEffectiveEvent resolves fresh registrations without stale snapshot', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');
  const draft = await s.content.draft('venue-1');

  const newDraftEvent = {
    id: 'venue-1-draft-only-event',
    title: 'Unpublished Draft Tournament',
    sport: 'football',
    format: 'team',
    date: '2028-11-01',
    time: '15:00',
    spots: 8,
  };
  await s.content.save({
    ...draft,
    events: [...draft.events, newDraftEvent],
  });

  const venue = await s.venues.get('bambis-meda');
  const updatedDraft = await s.content.draft('venue-1');

  // Preview renderer path: resolves unpublished draft event faithfully
  const previewEvents = resolveVenueSiteEvents(venue, updatedDraft, { isDraftPreview: true, previewSite: updatedDraft });
  const previewFound = previewEvents.find((e) => e.id === 'venue-1-draft-only-event');
  assert.ok(previewFound);
  assert.equal(previewFound.title, 'Unpublished Draft Tournament');
  assert.equal(previewFound.availableSpots, 8);
  assert.equal(previewFound.registeredCount, 0);

  // Live renderer path: live events list does NOT include unpublished draft event
  const liveEvents = await s.events.list('venue-1');
  const liveResolved = resolveVenueSiteEvents(venue, updatedDraft, { liveEvents });
  assert.equal(liveResolved.some((e) => e.id === 'venue-1-draft-only-event'), false);

  // Test resolveEffectiveEvent avoiding stale snapshots:
  // Before registration:
  const eventBefore = liveResolved.find((e) => e.id === 'venue-1-event-0');
  assert.equal(eventBefore.availableSpots, 6);
  assert.equal(eventBefore.registeredCount, 0);

  // Player registers:
  s.transport.selectAccount('player-1');
  const team = (await s.teams.list()).find((t) => t.id === 'team-1');
  await s.events.register('venue-1', 'venue-1-event-0', { teamId: team.id });

  // Refreshed live list:
  const refreshedLive = await s.events.list('venue-1');
  const refreshedResolved = resolveVenueSiteEvents(venue, updatedDraft, { liveEvents: refreshedLive });

  // Calling resolveEffectiveEvent by ID returns the FRESH object with registration details intact:
  const effective = resolveEffectiveEvent('venue-1-event-0', refreshedResolved);
  assert.ok(effective);
  assert.equal(effective.availableSpots, 5);
  assert.equal(effective.registeredCount, 1);
  assert.ok(effective.myRegistration);
  assert.equal(effective.myRegistration.teamId, team.id);
  assert.notEqual(effective, eventBefore); // NOT the stale pre-registration snapshot object!

  // Failure handling: querying events for nonexistent venue throws not_found instead of inventing zero registrations
  await rejects(s.events.list('nonexistent-venue'), 'not_found');
  await rejects(s.events.get('nonexistent-venue', 'some-event'), 'not_found');
});

test('fetchTeamDetailData distinguishes guest auth from operational failures and exposes errors with retry', async () => {
  const s = setup();
  s.transport.selectAccount('player-1');
  const team = await s.teams.create({
    name: 'Summit Athletics',
    sport: 'basketball',
    city: 'Addis Ababa',
  });

  // 1. Genuine guest auth (401 unauthorized): returns me: null, does NOT throw
  const guestResult = await fetchTeamDetailData(team.id, {
    auth: { current: async () => { const err = new Error('Unauthorized'); err.code = 'unauthorized'; err.status = 401; throw err; } },
    teams: s.teams,
  });
  assert.equal(guestResult.me, null);
  assert.equal(guestResult.team.id, team.id);
  assert.equal(guestResult.myRequest, null);

  // 2. Real auth service failure (e.g. 500 / network error): MUST throw and NOT disguise as guest!
  await assert.rejects(
    fetchTeamDetailData(team.id, {
      auth: { current: async () => { const err = new Error('Service Unavailable'); err.code = 'internal'; err.status = 500; throw err; } },
      teams: s.teams,
    }),
    (err) => err.status === 500
  );

  // 3. Captain request listing failure: MUST throw and NOT present as empty requests!
  await assert.rejects(
    fetchTeamDetailData(team.id, {
      auth: { current: async () => ({ id: 'player-1', full_name: 'Abebe Kebede', role: 'player' }) },
      teams: {
        ...s.teams,
        listRequests: async () => { const err = new Error('Requests query failed'); err.code = 'failed'; throw err; },
      },
    }),
    (err) => err.code === 'failed'
  );

  // 4. Personal join request query failure: MUST throw and NOT present as missing request (Join button)!
  await assert.rejects(
    fetchTeamDetailData(team.id, {
      auth: { current: async () => ({ id: 'player-2', full_name: 'Sara Mengistu', role: 'player' }) },
      teams: {
        ...s.teams,
        myRequest: async () => { const err = new Error('My request query failed'); err.code = 'failed'; throw err; },
      },
    }),
    (err) => err.code === 'failed'
  );
});

function createHookHarness() {
  const React = require('react');
  const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE || React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  let hooks = [];
  let hookIndex = 0;
  let activeEffects = [];
  let cleanups = [];
  let currentRenderResult = null;

  const dispatcher = {
    useState(initial) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setState = (action) => {
        const next = typeof action === 'function' ? action(hooks[idx]) : action;
        hooks[idx] = next;
      };
      return [hooks[idx], setState];
    },
    useRef(initial) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { current: initial };
      }
      return hooks[idx];
    },
    useCallback(fn, deps) {
      const idx = hookIndex++;
      const prev = hooks[idx];
      if (prev && deps && prev.deps.every((d, i) => Object.is(d, deps[i]))) {
        return prev.fn;
      }
      hooks[idx] = { fn, deps };
      return fn;
    },
    useEffect(effect, deps) {
      const idx = hookIndex++;
      const prev = hooks[idx];
      const hasChanged = !prev || !deps || !prev.deps || !prev.deps.every((d, i) => Object.is(d, deps[i]));
      if (hasChanged) {
        hooks[idx] = { deps };
        activeEffects.push({ idx, effect });
      }
    },
  };

  function render(Component, props) {
    hookIndex = 0;
    const prevDispatcher = internals.H;
    internals.H = dispatcher;
    try {
      currentRenderResult = Component(props);
      return currentRenderResult;
    } finally {
      internals.H = prevDispatcher;
    }
  }

  async function flushEffects() {
    const toRun = [...activeEffects];
    activeEffects = [];
    for (const { idx, effect } of toRun) {
      if (cleanups[idx]) {
        try { cleanups[idx](); } catch {}
        cleanups[idx] = undefined;
      }
      const cleanup = effect();
      if (typeof cleanup === 'function') {
        cleanups[idx] = cleanup;
      }
    }
    // Allow microtasks scheduled by effects (Promise.resolve().then) to run
    await new Promise(r => setTimeout(r, 10));
  }

  return { render, flushEffects, getLast: () => currentRenderResult };
}

test('useServiceQuery hook lifecycle: same-resource reload preserves data while resource switch resets data immediately', async () => {
  const harness = createHookHarness();

  // Test Consumer simulating VenueSite / TeamDetail lifecycle
  function ConsumerComponent(props) {
    const query = useServiceQuery(props.loader, props.key);
    // Simulating consumer loading guard: if (query.loading && !query.data) return <Loading />;
    const rendersLoadingSkeleton = query.loading && !query.data;
    // Actionable controls displayed only when data is present
    const rendersActionableControls = Boolean(query.data);
    return { ...query, rendersLoadingSkeleton, rendersActionableControls };
  }

  // --- CASE 1: Successful registration refresh retains confirmation (same-resource refresh) ---
  let resolveEventInitial;
  const initialEventPromise = new Promise(r => { resolveEventInitial = r; });
  let result = harness.render(ConsumerComponent, {
    key: ['venue-site', 'bambis-meda', false],
    loader: () => initialEventPromise,
  });

  // On first mount: loading is true, data is undefined, skeleton is displayed
  assert.equal(result.loading, true);
  assert.equal(result.data, undefined);
  assert.equal(result.rendersLoadingSkeleton, true);
  assert.equal(result.rendersActionableControls, false);
  await harness.flushEffects();

  // Initial event details load resolves
  const initialData = { venueId: 'venue-1', eventId: 'ev-1', spotsOpen: 5, myRegistration: null };
  resolveEventInitial(initialData);
  await new Promise(r => setTimeout(r, 10));
  result = harness.render(ConsumerComponent, {
    key: ['venue-site', 'bambis-meda', false],
    loader: () => initialEventPromise,
  });

  assert.equal(result.loading, false);
  assert.deepEqual(result.data, initialData);
  assert.equal(result.rendersLoadingSkeleton, false);
  assert.equal(result.rendersActionableControls, true);

  // Player registers for event -> triggers query.reload()
  let resolveEventReload;
  const reloadPromise = new Promise(r => { resolveEventReload = r; });
  result = harness.render(ConsumerComponent, {
    key: ['venue-site', 'bambis-meda', false],
    loader: () => reloadPromise,
  });
  result.reload();
  await harness.flushEffects();

  result = harness.render(ConsumerComponent, {
    key: ['venue-site', 'bambis-meda', false],
    loader: () => reloadPromise,
  });
  assert.equal(result.loading, true);
  assert.deepEqual(result.data, initialData, 'Previous event data MUST be preserved during same-resource reload');
  assert.equal(result.rendersLoadingSkeleton, false, 'Loading skeleton MUST NOT unmount the dialog during reload');
  assert.equal(result.rendersActionableControls, true);

  // Reload completes with fresh registration state
  const refreshedData = { venueId: 'venue-1', eventId: 'ev-1', spotsOpen: 4, myRegistration: { id: 'reg-1' } };
  resolveEventReload(refreshedData);
  await new Promise(r => setTimeout(r, 10));
  result = harness.render(ConsumerComponent, {
    key: ['venue-site', 'bambis-meda', false],
    loader: () => reloadPromise,
  });
  assert.equal(result.loading, false);
  assert.deepEqual(result.data, refreshedData);

  // --- CASE 2: Switching resources with a delayed response never displays previous resource\'s actionable data ---
  const harness2 = createHookHarness();
  let resolveTeam1;
  const team1Promise = new Promise(r => { resolveTeam1 = r; });
  let result2 = harness2.render(ConsumerComponent, {
    key: 'team-1',
    loader: () => team1Promise,
  });
  await harness2.flushEffects();

  resolveTeam1({ id: 'team-1', name: 'Bole Lions FC', captain: 'Abebe', canLeave: true });
  await new Promise(r => setTimeout(r, 10));
  result2 = harness2.render(ConsumerComponent, {
    key: 'team-1',
    loader: () => team1Promise,
  });
  assert.equal(result2.data.name, 'Bole Lions FC');
  assert.equal(result2.rendersActionableControls, true);

  // User navigates / switches to team-2, where the backend response is delayed
  let resolveTeam2;
  const team2Promise = new Promise(r => { resolveTeam2 = r; });
  result2 = harness2.render(ConsumerComponent, {
    key: 'team-2',
    loader: () => team2Promise,
  });

  // IMMEDIATELY upon switching key, previous data MUST be reset to undefined!
  assert.equal(result2.data, undefined, 'Previous resource data MUST NOT leak when query key changes');
  assert.equal(result2.loading, true);
  assert.equal(result2.rendersLoadingSkeleton, true, 'Consumer MUST render loading skeleton when switching resources');
  assert.equal(result2.rendersActionableControls, false, 'Previous resource actionable controls MUST NEVER be displayed');

  // Even after effects run and while response is still delayed in flight:
  await harness2.flushEffects();
  result2 = harness2.render(ConsumerComponent, {
    key: 'team-2',
    loader: () => team2Promise,
  });
  assert.equal(result2.data, undefined);
  assert.equal(result2.loading, true);
  assert.equal(result2.rendersLoadingSkeleton, true);
  assert.equal(result2.rendersActionableControls, false);

  // Once team-2 resolves, team-2 data is displayed
  resolveTeam2({ id: 'team-2', name: 'Summit Athletics', captain: 'Sara', canLeave: false });
  await new Promise(r => setTimeout(r, 10));
  result2 = harness2.render(ConsumerComponent, {
    key: 'team-2',
    loader: () => team2Promise,
  });
  assert.equal(result2.loading, false);
  assert.equal(result2.data.name, 'Summit Athletics');
  assert.equal(result2.rendersActionableControls, true);
});





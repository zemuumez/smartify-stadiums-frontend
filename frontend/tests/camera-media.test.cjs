/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createServices } = require('../.test-build/services/create-services');
const { createDemoTransport } = require('../.test-build/demo/transport');

function setup() {
  const transport = createDemoTransport();
  return { ...createServices(transport), transport };
}

async function rejects(promise, expectedCode) {
  try {
    await promise;
    assert.fail(`Expected failure with code: ${expectedCode}`);
  } catch (error) {
    if (expectedCode) {
      assert.equal(error?.code, expectedCode, `Expected code "${expectedCode}", got "${error?.code}"`);
    }
  }
}

test('two owners cannot inspect or mutate each other cameras', async () => {
  const s = setup();

  // Owner 1 (Fatima @ Bambis Meda, venue-1)
  s.transport.selectAccount('owner-1');
  const owner1Cameras = await s.media.cameras();
  assert.ok(owner1Cameras.length >= 2, 'Owner 1 should see venue-1 cameras');
  assert.ok(owner1Cameras.every(c => c.venueId === 'venue-1'), 'Owner 1 cameras must strictly belong to venue-1');

  // Owner 2 (Dawit @ Unity Sports Complex, venue-2)
  s.transport.selectAccount('owner-2');
  const owner2Cameras = await s.media.cameras();
  assert.ok(owner2Cameras.length >= 1, 'Owner 2 should see venue-2 cameras');
  assert.ok(owner2Cameras.every(c => c.venueId === 'venue-2'), 'Owner 2 cameras must strictly belong to venue-2');

  // Cross-tenant inspection by query param is denied
  s.transport.selectAccount('owner-1');
  await rejects(s.media.cameras('venue-2'), 'forbidden');

  s.transport.selectAccount('owner-2');
  await rejects(s.media.cameras('venue-1'), 'forbidden');

  // Cross-tenant mutation: Owner 1 cannot edit Owner 2 camera
  s.transport.selectAccount('owner-1');
  await rejects(s.media.updateCamera('camera-unity-1', { name: 'Tampered Name', fieldId: 'field-1', model: 'Veo' }), 'forbidden');

  // Owner cannot register camera for another venue
  await rejects(s.media.registerCamera({
    venueId: 'venue-2',
    fieldId: 'field-5',
    name: 'Unauthorized Camera',
    model: 'Veo Cam 3',
  }), 'forbidden');

  // Owner cannot assign camera to field belonging to another venue
  await rejects(s.media.registerCamera({
    venueId: 'venue-1',
    fieldId: 'field-5', // field-5 belongs to venue-2
    name: 'Mismatched Field Camera',
    model: 'Veo Cam 3',
  }), 'validation');
});

test('camera certification requires admin and separates certification from connectivity', async () => {
  const s = setup();

  // Owner cannot self-certify
  s.transport.selectAccount('owner-1');
  await rejects(s.media.certifyCamera('camera-2', {
    certificationStatus: 'passed',
  }), 'forbidden');

  // Admin certifies camera
  s.transport.selectAccount('admin-1');
  const passedCam = await s.media.certifyCamera('camera-2', {
    certificationStatus: 'passed',
  });
  assert.equal(passedCam.certificationStatus, 'passed');
  assert.equal(passedCam.status, 'certified');
  assert.equal(passedCam.certifiedBy, 'admin-1');
  assert.ok(passedCam.certifiedAt);

  // Admin marks camera failed with reason and recovery guidance
  const failedCam = await s.media.certifyCamera('camera-2', {
    certificationStatus: 'failed',
    failureReason: 'Lens flare detected from east floodlight',
    recoveryGuidance: 'Install lens hood or shift mount 2m south',
  });
  assert.equal(failedCam.certificationStatus, 'failed');
  assert.equal(failedCam.failureReason, 'Lens flare detected from east floodlight');
  assert.equal(failedCam.recoveryGuidance, 'Install lens hood or shift mount 2m south');

  // Operational connectivity remains separate (camera is still offline/online regardless of certification)
  s.transport.selectAccount('owner-1');
  const ownerViews = await s.media.cameras();
  const cam2 = ownerViews.find(c => c.id === 'camera-2');
  assert.ok(cam2);
  assert.equal(cam2.certificationStatus, 'failed');
  assert.equal(cam2.connectivityStatus, 'offline');
  assert.equal(cam2.failureReason, 'Lens flare detected from east floodlight');
  assert.equal(cam2.recoveryGuidance, 'Install lens hood or shift mount 2m south');
});

test('two owners cannot inspect or mutate each other recordings', async () => {
  const s = setup();

  // Owner 1 recordings
  s.transport.selectAccount('owner-1');
  const recs1 = await s.media.recordings();
  assert.ok(recs1.length >= 3, 'Owner 1 should see venue-1 recordings');
  assert.ok(recs1.every(r => r.venueId === 'venue-1'), 'All recordings must belong to venue-1');

  // Owner 2 recordings
  s.transport.selectAccount('owner-2');
  const recs2 = await s.media.recordings();
  assert.ok(recs2.length >= 1, 'Owner 2 should see venue-2 recordings');
  assert.ok(recs2.every(r => r.venueId === 'venue-2'), 'All recordings must belong to venue-2');

  // Cross-tenant detail access is denied
  s.transport.selectAccount('owner-1');
  await rejects(s.media.recordingDetail('rec-unity-1'), 'forbidden');

  s.transport.selectAccount('owner-2');
  await rejects(s.media.recordingDetail('rec-1'), 'forbidden');

  // Cross-tenant mutation (retry, consent, publication) is denied
  s.transport.selectAccount('owner-1');
  await rejects(s.media.retryRecording('rec-unity-1'), 'forbidden');
  await rejects(s.media.updateConsent('rec-unity-1', { status: 'denied' }), 'forbidden');
  await rejects(s.media.updatePublication('rec-unity-1', { visibility: 'public', ownerApproved: true }), 'forbidden');
});

test('booking resolves to its correct recording and honest scheduled state', async () => {
  const s = setup();

  // Player 1 creates booking
  s.transport.selectAccount('player-1');
  const booking = await s.bookings.create({
    fieldId: 'field-1',
    sport: 'football',
    date: '2026-10-22',
    startHour: 14,
    endHour: 16,
    idempotencyKey: 'booking-rec-test-1',
  });

  // Booking starts with honest scheduled state, NOT auto-manufactured ready
  const replay = await s.media.bookingReplay(booking.id);
  assert.ok(replay);
  assert.equal(replay.bookingId, booking.id);
  assert.equal(replay.sport, 'football');
  assert.equal(replay.canPlay, false);
  assert.equal(replay.entitlementStatus, 'processing');
  assert.equal(replay.playbackUrl, null);
  assert.ok(replay.reason?.includes('scheduled'));

  // Recording detail verifies pending consent and pending blur
  s.transport.selectAccount('owner-1');
  const rec = await s.media.recordingDetail(replay.recordingId);
  assert.equal(rec.status, 'scheduled');
  assert.equal(rec.playbackUrl, null);
  assert.equal(rec.consent.status, 'pending');
  assert.equal(rec.privacy.faceBlurStatus, 'pending');

  // Explicit demo controls advance recording to ready
  await s.media.advanceRecordingDemoState(rec.id, 'ready');

  // Player now sees playable media
  s.transport.selectAccount('player-1');
  const readyReplay = await s.media.bookingReplay(booking.id);
  assert.equal(readyReplay.canPlay, true);
  assert.equal(readyReplay.entitlementStatus, 'entitled');
  assert.ok(readyReplay.playbackUrl?.startsWith('https://'));

  // Another player cannot access private booking replay
  s.transport.selectAccount('player-2');
  await rejects(s.media.bookingReplay(booking.id), 'forbidden');

  // Owner of venue can access recording replay
  s.transport.selectAccount('owner-1');
  const ownerReplay = await s.media.bookingReplay(booking.id);
  assert.equal(ownerReplay.canPlay, true);

  // Different owner is denied
  s.transport.selectAccount('owner-2');
  await rejects(s.media.bookingReplay(booking.id), 'forbidden');
});

test('recording lifecycle, failure information, and retry transitions', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');

  // rec-3 is initially in failed state
  const failedRec = await s.media.recordingDetail('rec-3');
  assert.equal(failedRec.status, 'failed');
  assert.equal(failedRec.retryEligible, true);
  assert.ok(failedRec.failureReason);

  // Player views failed replay -> honest failed state, does not pretend to play
  s.transport.selectAccount('player-1');
  const failedReplay = await s.media.bookingReplay('booking-rec-3');
  assert.equal(failedReplay.canPlay, false);
  assert.equal(failedReplay.playbackUrl, null);
  assert.equal(failedReplay.entitlementStatus, 'failed');
  assert.ok(failedReplay.reason?.includes('Transcoder'));

  // Owner retries failed recording
  s.transport.selectAccount('owner-1');
  const retriedRec = await s.media.retryRecording('rec-3');
  assert.equal(retriedRec.status, 'ready');
  assert.equal(retriedRec.retryEligible, false);
  assert.ok(retriedRec.playbackUrl);

  // Re-attempting retry on ready recording is rejected
  await rejects(s.media.retryRecording('rec-3'), 'conflict');

  // Player now sees playable media
  s.transport.selectAccount('player-1');
  const recoveredReplay = await s.media.bookingReplay('booking-rec-3');
  assert.equal(recoveredReplay.canPlay, true);
  assert.equal(recoveredReplay.entitlementStatus, 'entitled');
  assert.ok(recoveredReplay.playbackUrl);
});

test('processing and unavailable states do not pretend to play', async () => {
  const s = setup();

  // rec-4 is in processing state
  s.transport.selectAccount('player-1');
  const processingReplay = await s.media.bookingReplay('booking-rec-4');
  assert.equal(processingReplay.canPlay, false);
  assert.equal(processingReplay.playbackUrl, null);
  assert.equal(processingReplay.entitlementStatus, 'processing');
  assert.ok(processingReplay.reason);
});

test('team member access requires explicit entitlement and does not grant blanket access', async () => {
  const s = setup();

  // rec-2 is a private team scrimmage for Addis Hoops (team-2)
  // player-1 is the captain -> entitled
  s.transport.selectAccount('player-1');
  const captainReplay = await s.media.bookingReplay('booking-rec-2');
  assert.equal(captainReplay.canPlay, true);

  // player-2 is not on the roster -> forbidden
  s.transport.selectAccount('player-2');
  await rejects(s.media.bookingReplay('booking-rec-2'), 'forbidden');

  // player-2 requests to join team-2 and is approved
  await s.teams.join('team-2');
  s.transport.selectAccount('player-1');
  const requests = await s.teams.listRequests('team-2');
  await s.teams.approveRequest('team-2', requests[0].id);

  // Member on team roster alone DOES NOT get blanket access to private recordings
  s.transport.selectAccount('player-2');
  await rejects(s.media.bookingReplay('booking-rec-2'), 'forbidden');

  // Owner grants explicit entitlement record to player-2
  s.transport.selectAccount('owner-1');
  const entitlement = await s.media.grantReplayEntitlement('rec-2', { userId: 'player-2' });
  assert.equal(entitlement.userId, 'player-2');
  assert.equal(entitlement.recordingId, 'rec-2');

  // Now player-2 is explicitly entitled and can play
  s.transport.selectAccount('player-2');
  const memberReplay = await s.media.bookingReplay('booking-rec-2');
  assert.equal(memberReplay.canPlay, true);
  assert.equal(memberReplay.entitlementStatus, 'entitled');
});

test('missing or revoked consent or incomplete privacy blur blocks publication', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');

  // rec-2 has pending consent and pending blur -> publication MUST fail
  const rec2 = await s.media.recordingDetail('rec-2');
  assert.equal(rec2.consent.status, 'pending');
  assert.equal(rec2.privacy.faceBlurStatus, 'pending');

  await rejects(s.media.updatePublication('rec-2', {
    visibility: 'public',
    ownerApproved: true,
  }), 'validation');

  // Grant participant consent
  await s.media.updateConsent('rec-2', { status: 'granted' });

  // Blur is still pending -> publication still blocked!
  await rejects(s.media.updatePublication('rec-2', {
    visibility: 'public',
    ownerApproved: true,
  }), 'validation');

  // Complete privacy face blur
  await s.media.completePrivacyBlur('rec-2');

  // Without owner approval -> publication blocked!
  await rejects(s.media.updatePublication('rec-2', {
    visibility: 'public',
    ownerApproved: false,
  }), 'validation');

  // Now with owner approval, consent, and blur -> publication succeeds!
  const publishedRec = await s.media.updatePublication('rec-2', {
    visibility: 'public',
    ownerApproved: true,
  });
  assert.equal(publishedRec.publication.visibility, 'public');
  assert.equal(publishedRec.publication.ownerApproved, true);
  assert.ok(publishedRec.publication.publishedAt);
});

test('minor guardian consent is enforced before publication', async () => {
  const s = setup();
  s.transport.selectAccount('owner-1');

  // rec-5 has requiresGuardian: true and guardianConsentStatus: 'pending'
  const rec5 = await s.media.recordingDetail('rec-5');
  assert.equal(rec5.consent.requiresGuardian, true);
  assert.equal(rec5.consent.guardianConsentStatus, 'pending');

  // Attempting to publish without guardian consent is blocked
  await rejects(s.media.updatePublication('rec-5', {
    visibility: 'public',
    ownerApproved: true,
  }), 'validation');

  // Grant guardian consent
  await s.media.updateConsent('rec-5', {
    status: 'granted',
    guardianConsentStatus: 'granted',
  });

  // Now publication succeeds
  const publishedRec5 = await s.media.updatePublication('rec-5', {
    visibility: 'public',
    ownerApproved: true,
  });
  assert.equal(publishedRec5.publication.visibility, 'public');
});

test('public listings contain only permitted published media and unpublication removes exposure', async () => {
  const s = setup();

  // Public highlights for venue-1 (accessible by any visitor without credentials)
  const initialHighlights = await s.media.venueHighlights('venue-1');
  assert.ok(initialHighlights.length >= 1, 'Should list published public highlights');
  assert.ok(initialHighlights.every(h => !h.playbackUrl.includes('insecure')), 'Must have valid playback URL');

  // rec-1 is initially public
  assert.ok(initialHighlights.some(h => h.recordingId === 'rec-1'));

  // Owner unpublishes rec-1
  s.transport.selectAccount('owner-1');
  const unpublished = await s.media.unpublishRecording('rec-1', 'Editorial rotation');
  assert.equal(unpublished.publication.visibility, 'private');
  assert.equal(unpublished.publication.unpublishReason, 'Editorial rotation');

  // Visitor checks highlights again -> rec-1 is completely removed!
  const updatedHighlights = await s.media.venueHighlights('venue-1');
  assert.equal(updatedHighlights.some(h => h.recordingId === 'rec-1'), false);

  // But the operational match recording is retained for owner and booking player
  const retainedRec = await s.media.recordingDetail('rec-1');
  assert.ok(retainedRec, 'Operational recording must be preserved');
  assert.equal(retainedRec.status, 'ready');

  s.transport.selectAccount('player-1');
  const playerReplay = await s.media.bookingReplay('booking-rec-1');
  assert.equal(playerReplay.canPlay, true, 'Booking player retains private playback access');
});

test('demo changes survive storage reconstruction and reload', async () => {
  const store = new Map();
  const mockStorage = {
    getItem: k => store.get(k) || null,
    setItem: (k, v) => store.set(k, v),
    removeItem: k => store.delete(k),
  };

  // Session 1: Owner 1 registers a camera and changes consent
  const t1 = createDemoTransport(mockStorage);
  const s1 = createServices(t1);
  t1.selectAccount('owner-1');

  const newCam = await s1.media.registerCamera({
    venueId: 'venue-1',
    fieldId: 'field-1',
    name: 'Persistent Test Cam',
    model: 'Veo Cam 3',
  });
  assert.ok(newCam.id);

  await s1.media.updateConsent('rec-2', { status: 'granted' });

  // Session 2: Reconstruct new transport from same storage (hard reload)
  const t2 = createDemoTransport(mockStorage);
  const s2 = createServices(t2);
  t2.selectAccount('owner-1');

  const reloadedCameras = await s2.media.cameras();
  const foundCam = reloadedCameras.find(c => c.id === newCam.id);
  assert.ok(foundCam, 'Registered camera must persist across reload');
  assert.equal(foundCam.name, 'Persistent Test Cam');

  const reloadedRec2 = await s2.media.recordingDetail('rec-2');
  assert.equal(reloadedRec2.consent.status, 'granted', 'Consent change must persist across reload');
});

test('replay GET requests do not manufacture recordings or grant consent', async () => {
  const s = setup();

  // Create a real booking on field-7 (which has camera: false)
  s.transport.selectAccount('player-1');
  const unrecordedBooking = await s.bookings.create({
    fieldId: 'field-7',
    sport: 'volleyball',
    date: '2026-10-25',
    startHour: 10,
    endHour: 12,
    idempotencyKey: 'booking-unrecorded-field',
  });

  s.transport.selectAccount('owner-1');
  const recordingsBefore = (await s.media.recordings()).length;

  // Requesting replay for an unrecorded booking returns unavailable and does NOT add to recordings list
  s.transport.selectAccount('player-1');
  const unavailable = await s.media.bookingReplay(unrecordedBooking.id);
  assert.equal(unavailable.canPlay, false);
  assert.equal(unavailable.entitlementStatus, 'unavailable');
  assert.ok(unavailable.reason?.includes('No match recording exists'));

  // Ensure no new recording was manufactured
  s.transport.selectAccount('owner-1');
  const recordingsAfter = (await s.media.recordings()).length;
  assert.equal(recordingsAfter, recordingsBefore, 'GET replay must never manufacture records');

  // Querying a completely non-existent booking throws 404
  s.transport.selectAccount('player-1');
  await rejects(s.media.bookingReplay('non-existent-booking-id'), 'not_found');
});

test('expired recordings are excluded from public highlights and CMS cannot bypass publication rules', async () => {
  const s = setup();

  // Venue 1 highlights do not include expired rec-expired-1
  const highlights = await s.media.venueHighlights('venue-1');
  assert.ok(highlights.every(h => h.recordingId !== 'rec-expired-1'), 'Expired recording must not appear in highlights');

  // Owner cannot add highlight with expired recording URL
  s.transport.selectAccount('owner-1');
  const draft = await s.content.draft('venue-1');
  const invalidDraft = {
    ...draft,
    highlights: [
      {
        id: 'hl-bypass',
        title: 'Bypass Highlight',
        teams: 'Bambis Match',
        playbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ExpiredMatch.mp4',
        duration: '10:00',
      },
    ],
  };
  await rejects(s.content.save(invalidDraft), 'validation');
});

test('administrator camera certification workflow updates status and clears guidance', async () => {
  const s = setup();

  // Admin lists all cameras across all venues
  s.transport.selectAccount('admin-1');
  const allCameras = await s.media.adminCameras();
  assert.ok(allCameras.length >= 3);

  // Admin reviews camera-2 (initially failed) and marks it passed
  const reviewed = await s.media.certifyCamera('camera-2', {
    certificationStatus: 'passed',
  });
  assert.equal(reviewed.certificationStatus, 'passed');
  assert.equal(reviewed.status, 'certified');
  assert.equal(reviewed.failureReason, undefined, 'Failure reason must be cleared on pass');
  assert.equal(reviewed.recoveryGuidance, undefined, 'Recovery guidance must be cleared on pass');

  // Owner views the camera and sees certified passed status
  s.transport.selectAccount('owner-1');
  const ownerCameras = await s.media.cameras();
  const cam2 = ownerCameras.find(c => c.id === 'camera-2');
  assert.equal(cam2.certificationStatus, 'passed');
  assert.equal(cam2.status, 'certified');
});


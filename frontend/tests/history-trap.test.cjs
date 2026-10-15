const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanHistoryTrap,
  handleTrapPopState,
  isCleaningTrapActive,
  hasDelayedTraversalPending,
  resetHistoryTrapState,
} = require('../.test-build/services/history-trap');

// Mock browser environment for unit testing history trap coordination
function setupMockWindow(initialState = {}) {
  let listeners = [];
  let backCallCount = 0;
  let pushStateCalls = [];

  const mockWindow = {
    history: {
      state: initialState,
      back() {
        backCallCount++;
      },
      pushState(state, title, url) {
        pushStateCalls.push({ state, title, url });
        mockWindow.history.state = state;
      },
    },
    addEventListener(event, handler) {
      listeners.push({ event, handler });
    },
    removeEventListener(event, handler) {
      listeners = listeners.filter(l => !(l.event === event && l.handler === handler));
    },
    dispatchPopState(newState) {
      mockWindow.history.state = newState;
      const popListeners = [...listeners.filter(l => l.event === 'popstate')];
      for (const { handler } of popListeners) {
        handler(new Event('popstate'));
      }
    },
  };

  global.window = mockWindow;

  return {
    mockWindow,
    getBackCount: () => backCallCount,
    getPushCalls: () => pushStateCalls,
    teardown: () => {
      delete global.window;
      resetHistoryTrapState();
    },
  };
}

test('cleanHistoryTrap succeeds immediately when no trap is present', async () => {
  const env = setupMockWindow({ someKey: 'val' });
  try {
    const cleaned = await cleanHistoryTrap();
    assert.equal(cleaned, true);
    assert.equal(env.getBackCount(), 0, 'history.back() should not be called when trap is absent');
  } finally {
    env.teardown();
  }
});

test('cleanHistoryTrap succeeds only after confirmed history traversal (popstate with trap cleared)', async () => {
  const env = setupMockWindow({ __cmsTrap: true });
  try {
    const promise = cleanHistoryTrap(200);
    assert.equal(isCleaningTrapActive(), true);
    assert.equal(env.getBackCount(), 1, 'history.back() must be called to pop trap');

    // Simulate browser history traversal: popstate delivers state without trap
    env.mockWindow.dispatchPopState({ someKey: 'val' });

    const cleaned = await promise;
    assert.equal(cleaned, true, 'Confirmed history traversal must resolve true');
    assert.equal(isCleaningTrapActive(), false);
    assert.equal(hasDelayedTraversalPending(), false);
  } finally {
    env.teardown();
  }
});

test('cleanHistoryTrap resolves false on timeout when popstate is missing, never authorizing navigation', async () => {
  const env = setupMockWindow({ __cmsTrap: true });
  try {
    // Timeout configured to 50ms, no popstate dispatched
    const promise = cleanHistoryTrap(50);
    assert.equal(isCleaningTrapActive(), true);
    assert.equal(env.getBackCount(), 1);

    const cleaned = await promise;
    assert.equal(cleaned, false, 'Timeout without popstate must resolve false');
    assert.equal(hasDelayedTraversalPending(), true, 'Pending delayed traversal flag must be recorded');
    assert.equal(Boolean(env.mockWindow.history.state?.__cmsTrap), true, 'Trap was not popped so state remains active');
  } finally {
    env.teardown();
  }
});

test('delayed popstate arriving after timeout is safely swallowed and restores trap if dirty', async () => {
  const env = setupMockWindow({ __cmsTrap: true });
  try {
    // 1. Initiate cleanup which times out
    const cleaned = await cleanHistoryTrap(30);
    assert.equal(cleaned, false, 'Initial timeout must return false');
    assert.equal(hasDelayedTraversalPending(), true);

    // 2. Caller aborts navigation, keeping user on editor. Editor is still dirty.
    let trapRestored = false;
    const handled = handleTrapPopState({
      isDirty: true,
      onRestoreTrap: () => {
        trapRestored = true;
        env.mockWindow.history.pushState({ __cmsTrap: true }, '', '/manage?tab=cms');
      },
    });

    // 3. Delayed popstate is intercepted:
    assert.equal(handled, true, 'Delayed traversal must be swallowed to prevent discard dialog');
    assert.equal(trapRestored, true, 'Trap must be restored to guard subsequent navigation');
    assert.equal(hasDelayedTraversalPending(), false, 'Delayed traversal flag must be cleared');
    assert.equal(Boolean(env.mockWindow.history.state?.__cmsTrap), true, 'Trap entry restored in history');
  } finally {
    env.teardown();
  }
});

test('callers preserve edits and abort navigation/unmounting when cleanHistoryTrap fails', async () => {
  const env = setupMockWindow({ __cmsTrap: true });
  try {
    let currentTab = 'cms';
    let isDirty = true;

    // Simulate handleTabChange logic
    async function handleTabChange(nextTab) {
      if (nextTab === currentTab) return;
      if (currentTab === 'cms' && isDirty) {
        // User confirmed discard
        const cleaned = await cleanHistoryTrap(30); // simulates missing/delayed popstate
        if (!cleaned) {
          // Timeout does NOT authorize unmounting or navigation
          return;
        }
      }
      isDirty = false;
      currentTab = nextTab;
    }

    await handleTabChange('bookings');

    assert.equal(currentTab, 'cms', 'Tab must NOT switch when cleanup traversal is unconfirmed');
    assert.equal(isDirty, true, 'Dirty state must be preserved when cleanup fails');
  } finally {
    env.teardown();
  }
});

test('venue switches and internal link navigation abort when cleanHistoryTrap fails', async () => {
  const env = setupMockWindow({ __cmsTrap: true });
  try {
    let selectedVenueId = 'venue-1';
    let isDirty = true;
    let navigatedUrl = null;

    // Simulate handleVenueChange logic
    async function handleVenueChange(nextId) {
      if (nextId === selectedVenueId) return;
      if (isDirty) {
        const cleaned = await cleanHistoryTrap(25);
        if (!cleaned) return;
      }
      isDirty = false;
      selectedVenueId = nextId;
    }

    // Simulate handleCaptureClick logic
    async function handleLinkClick(targetHref) {
      if (!isDirty) return;
      const cleaned = await cleanHistoryTrap(25);
      if (!cleaned) {
        return; // Abort navigation
      }
      navigatedUrl = targetHref;
    }

    // Attempt venue switch
    await handleVenueChange('venue-2');
    assert.equal(selectedVenueId, 'venue-1', 'Venue must NOT switch when cleanup fails');
    assert.equal(isDirty, true, 'Dirty edits must remain intact');

    // Attempt internal link click
    await handleLinkClick('/stadiums');
    assert.equal(navigatedUrl, null, 'Link navigation must NOT proceed when cleanup fails');
    assert.equal(isDirty, true, 'Edits must be preserved');
  } finally {
    env.teardown();
  }
});

test('concurrent callers to cleanHistoryTrap share the same in-flight traversal promise', async () => {
  const env = setupMockWindow({ __cmsTrap: true });
  try {
    const p1 = cleanHistoryTrap(200);
    const p2 = cleanHistoryTrap(200);
    assert.equal(p1, p2, 'Concurrent callers must receive the exact same Promise');
    assert.equal(env.getBackCount(), 1, 'Only one history.back() must be dispatched for concurrent callers');

    env.mockWindow.dispatchPopState({});
    const [r1, r2] = await Promise.all([p1, p2]);
    assert.equal(r1, true);
    assert.equal(r2, true);
  } finally {
    env.teardown();
  }
});

test('timeout → retry → delayed-event prevents extra Back and does not authorize retry', async () => {
  const env = setupMockWindow({ __cmsTrap: true });
  try {
    // 1. Initial cleanup times out
    const p1 = cleanHistoryTrap(25);
    assert.equal(isCleaningTrapActive(), true);
    assert.equal(env.getBackCount(), 1, 'Initial cleanup issues exactly one history.back()');

    const r1 = await p1;
    assert.equal(r1, false, 'Timed-out cleanup must resolve false');
    assert.equal(isCleaningTrapActive(), false);
    assert.equal(hasDelayedTraversalPending(), true, 'Delayed traversal flag must be pending');

    // 2. Retry while delayed traversal remains unresolved
    const retryPromise = cleanHistoryTrap(25);
    const retryResult = await retryPromise;
    assert.equal(retryResult, false, 'Retry must not authorize cleanup while delayed traversal is unresolved');
    assert.equal(env.getBackCount(), 1, 'Retry must NOT issue an additional history.back()');
    assert.equal(hasDelayedTraversalPending(), true, 'Pending flag must remain true');

    // 3. Delayed popstate arrives from first Back request
    env.mockWindow.dispatchPopState({ someOtherState: true });

    // 4. Recovery is complete: pending flag cleared, retry was NOT authorized by delayed event
    assert.equal(hasDelayedTraversalPending(), false, 'Delayed event must complete recovery and clear pending flag');
    assert.equal(env.getBackCount(), 1, 'Total history.back() calls must remain 1');

    // 5. Subsequent cleanup after recovery can proceed normally
    // If trap was restored (e.g. by dirty editor):
    env.mockWindow.history.state = { __cmsTrap: true };
    const pAfterRecovery = cleanHistoryTrap(200);
    assert.equal(env.getBackCount(), 2, 'Subsequent cleanup after recovery issues fresh history.back()');
    env.mockWindow.dispatchPopState({ clean: true });
    const rAfter = await pAfterRecovery;
    assert.equal(rAfter, true, 'Cleanup after recovery completes successfully upon confirmed popstate');
  } finally {
    env.teardown();
  }
});


/**
 * History Trap Coordination Helper
 *
 * Coordinates programmatic history cleanup (popping __cmsTrap) with navigation
 * and component unmounting, ensuring asynchronous history.back() does not race
 * with or undo intended navigation destinations.
 */

let isCleaningCmsTrap = false;
let hasPendingDelayedTraversal = false;
let cleanHistoryTrapPromise: Promise<boolean> | null = null;

export function isCleaningTrapActive(): boolean {
  return isCleaningCmsTrap;
}

export function hasDelayedTraversalPending(): boolean {
  return hasPendingDelayedTraversal;
}

export function resetHistoryTrapState(): void {
  isCleaningCmsTrap = false;
  hasPendingDelayedTraversal = false;
  cleanHistoryTrapPromise = null;
}

/**
 * Programmatically cleans up the history trap entry by invoking history.back()
 * and awaiting confirmed history traversal (via popstate).
 *
 * Returns true ONLY after confirmed history traversal where the trap is removed.
 * A timeout resolves false and does NOT authorize navigation or unmounting.
 */
export function cleanHistoryTrap(timeoutMs = 1000): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(true);
  if (!window.history.state?.__cmsTrap) {
    return Promise.resolve(true);
  }
  if (cleanHistoryTrapPromise) {
    return cleanHistoryTrapPromise;
  }

  isCleaningCmsTrap = true;
  cleanHistoryTrapPromise = new Promise<boolean>((resolve) => {
    let settled = false;

    const onPop = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        const win = typeof window !== 'undefined' ? window : null;
        if (win) {
          win.removeEventListener('popstate', onPop);
        }
        isCleaningCmsTrap = false;
        hasPendingDelayedTraversal = false;
        cleanHistoryTrapPromise = null;
        // Confirm history traversal: trap must no longer be present
        const traversalConfirmed = !win?.history?.state?.__cmsTrap;
        resolve(traversalConfirmed);
      }
    };

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        const win = typeof window !== 'undefined' ? window : null;
        if (win) {
          win.removeEventListener('popstate', onPop);
        }
        isCleaningCmsTrap = false;
        cleanHistoryTrapPromise = null;
        // A timeout must NOT authorize navigation or unmounting.
        // Record that history.back was dispatched and may arrive delayed.
        hasPendingDelayedTraversal = true;
        resolve(false);
      }
    }, timeoutMs);

    window.addEventListener('popstate', onPop);
    window.history.back();
  });

  return cleanHistoryTrapPromise;
}

/**
 * Handles popstate coordination for the history trap.
 * If a delayed traversal from a timed-out cleanup arrives, safely clears the
 * pending flag and restores the trap entry if the editor remains dirty.
 *
 * Returns true if the popstate was handled/swallowed by trap coordination.
 * Returns false if the popstate is a normal user Back/Forward event.
 */
export function handleTrapPopState(options: {
  isDirty: boolean;
  onRestoreTrap?: () => void;
}): boolean {
  if (isCleaningCmsTrap) {
    // Active programmatic cleanup in progress, swallow popstate
    return true;
  }

  if (hasPendingDelayedTraversal) {
    // Delayed traversal from timed-out cleanup arrived safely:
    hasPendingDelayedTraversal = false;
    isCleaningCmsTrap = false;
    if (options.isDirty && options.onRestoreTrap) {
      options.onRestoreTrap();
    }
    return true;
  }

  return false;
}

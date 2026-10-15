import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const chromePath = process.env.CHROME_BIN ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : (process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : 'google-chrome'));

const artifactDir = process.env.ARTIFACT_DIR || 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\029216c7-1f48-4c02-bbd3-70b84f3c51e7';
const profileDir = path.join(os.tmpdir(), 'smartify-stadiums-e2e-profile');

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.pending.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res?.exceptionDetails) {
      console.error('CDP Evaluation Exception:', res.exceptionDetails);
    }
    return res.result?.value;
  }

  async captureScreenshot(filepath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    try {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
    } catch (err) {
      console.warn('Screenshot write warning:', err.message);
    }
  }

  close() {
    this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForLoading(client) {
  for (let i = 0; i < 40; i++) {
    const isLoading = await client.evaluate(`!!document.querySelector('p[role="status"]')`);
    if (!isLoading) break;
    await sleep(150);
  }
}

async function exposeServicesToWindow(client) {
  let objectId = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const evalRes = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const k = Object.keys(document.body).find(k => k.startsWith('__reactFiber$'));
          if (!k) return null;
          let target = null;
          function walk(f) {
            if (!f || target) return;
            if (f.type?.name === 'BookingRecords') { target = f; return; }
            walk(f.child);
            walk(f.sibling);
          }
          walk(document.body[k]);
          if (!target) return null;
          let h = target.memoizedState;
          while (h) {
            if (Array.isArray(h.memoizedState) && typeof h.memoizedState[0] === 'function') {
              try {
                if (h.memoizedState[0].toString().includes('bookingsService')) {
                  return h.memoizedState[0];
                }
              } catch { /* ignored */ }
            }
            h = h.next;
          }
          return null;
        })()
      `
    });
    if (evalRes?.result?.type === 'function' && evalRes?.result?.objectId) {
      objectId = evalRes.result.objectId;
      break;
    }
    await sleep(250);
  }

  if (!objectId) throw new Error('Could not find BookingRecords bookingsService hook');

  const props = await client.send('Runtime.getProperties', {
    objectId,
    accessorPropertiesOnly: false,
    generatePreview: true
  });
  const scopesProp = props.internalProperties?.find(p => p.name === '[[Scopes]]');
  if (!scopesProp?.value?.objectId) throw new Error('Could not find [[Scopes]] on query hook');

  const scopesList = await client.send('Runtime.getProperties', { objectId: scopesProp.value.objectId });
  const scope2 = scopesList.result?.[2];
  if (!scope2?.value?.objectId) throw new Error('Could not find closure scope on query hook');

  const scope2Vars = await client.send('Runtime.getProperties', { objectId: scope2.value.objectId });
  const servicesModule = scope2Vars.result?.find(v => v.name.includes('src$2f$services$2f$index'));
  if (!servicesModule?.value?.objectId) throw new Error('Could not find services module in closure scope');

  await client.send('Runtime.callFunctionOn', {
    objectId: servicesModule.value.objectId,
    functionDeclaration: `function() { window.__SERVICES__ = this; }`
  });
}

export async function runBrowserJourneysTest() {
  console.log('================================================================');
  console.log('REPRODUCIBLE END-TO-END BROWSER TEST SUITE');
  console.log('================================================================\n');

  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch { /* ignored */ }

  const port = 9350;
  const proc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
    'about:blank'
  ]);

  await sleep(1500);

  let bambisBookingId = '';

  try {
    const targetRes = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
    const target = await targetRes.json();
    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    // STEP 0: Set clean demo session for owner-1 (Fatima Hassan, Bambis Meda Stadium)
    console.log('[STEP 0] Setup pristine demo session for owner-1 (Fatima Hassan @ Bambis Meda Stadium)...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/auth/login' });
    await sleep(1500);

    await client.evaluate(`
      (() => {
        sessionStorage.clear();
        sessionStorage.setItem('etsf-demo-session-v1', 'owner-1');
        localStorage.clear();
        localStorage.setItem('etsf-locale', 'en');
      })()
    `);

    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/bookings' });
    await waitForLoading(client);
    await exposeServicesToWindow(client);

    // =========================================================================
    // JOURNEY 1: COMPLETED WALK-IN RESERVATION
    // =========================================================================
    console.log('\n[JOURNEY 1] Completed Walk-In Reservation Journey (Bambis Meda Stadium)...');

    // Switch calendar date to 2026-10-25 first
    await client.evaluate(`
      (() => {
        const dateInput = document.querySelector('input[type="date"]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(dateInput, '2026-10-25');
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(800);
    await waitForLoading(client);

    // Open Walk-In Modal
    await client.evaluate(`
      (() => {
        const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Record walk-in'));
        if (b) b.click();
      })()
    `);
    await sleep(800);

    // Fill Walk-In Modal using robust input:not([type]), input[type="text"]
    await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        const nameInput = modal.querySelector('input:not([type]), input[type="text"]');
        const phoneInput = modal.querySelector('input[type="tel"]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');

        prototypeValue.set.call(nameInput, 'Dawit Kebede');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));

        prototypeValue.set.call(phoneInput, '0911223344');
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = modal?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(1500);

    // Wait until walk-in modal closes
    for (let i = 0; i < 20; i++) {
      const open = await client.evaluate(`!!document.querySelector('[role="dialog"]')`);
      if (!open) break;
      await sleep(150);
    }
    await waitForLoading(client);

    // Assertion: Walk-in created and card rendered in list; extract booking reference ID
    const walkinCard = await client.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article'));
        const dawitCard = cards.find(c => c.textContent?.includes('Dawit Kebede'));
        const text = dawitCard?.textContent?.trim() || '';
        const match = text.match(/Booking reference:\\s*([a-f0-9\\-]+)/i);
        return {
          found: !!dawitCard,
          text,
          bookingId: match ? match[1] : null,
          hasTime: text.includes('06:00–07:00'),
          hasPitch: text.includes('Pitch 1'),
          hasPrice: text.includes('ETB 2,500.00') || text.includes('ETB\\u00a02,500.00'),
          hasStatus: text.includes('Confirmed')
        };
      })()
    `);
    console.log('  Walk-in card created assertion:', walkinCard);
    if (!walkinCard.found || !walkinCard.hasTime || !walkinCard.hasPitch || !walkinCard.hasPrice || !walkinCard.bookingId) {
      throw new Error(`Journey 1 assertion failed: Walk-in card not rendered correctly: ${JSON.stringify(walkinCard)}`);
    }

    bambisBookingId = walkinCard.bookingId;
    console.log('  -> Recorded Bambis Walk-In Booking ID:', bambisBookingId);

    const shot1Path = path.join(artifactDir, 'journey_1_walkin_created.png');
    await client.captureScreenshot(shot1Path);
    console.log('  ✓ Screenshot captured (walk-in created):', shot1Path);

    // =========================================================================
    // JOURNEY 2: WALK-IN CONFLICT REJECTION
    // =========================================================================
    console.log('\n[JOURNEY 2] Walk-In Conflict Rejection Journey...');
    await client.evaluate(`
      (() => {
        const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Record walk-in'));
        if (b) b.click();
      })()
    `);
    await sleep(800);

    await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        const nameInput = modal?.querySelector('input:not([type]), input[type="text"]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(nameInput, 'Conflicting Player');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));

        const submitBtn = modal?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(1200);

    const conflictState = await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        const alert = modal?.querySelector('[role="alert"]');
        return {
          modalStillOpen: !!modal,
          hasAlert: !!alert,
          alertText: alert?.textContent?.trim()
        };
      })()
    `);
    console.log('  Walk-in conflict rejection assertion:', conflictState);
    if (!conflictState.modalStillOpen || !conflictState.hasAlert || !conflictState.alertText.includes('conflicts')) {
      throw new Error(`Journey 2 assertion failed: Conflict error alert not rendered: ${JSON.stringify(conflictState)}`);
    }

    const shot2Path = path.join(artifactDir, 'journey_2_walkin_conflict_rejected.png');
    await client.captureScreenshot(shot2Path);
    console.log('  ✓ Screenshot captured (walk-in conflict):', shot2Path);

    // Close conflict modal
    await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        modal?.querySelector('button[aria-label="Close"], button[aria-label="ዝጋ"]')?.click();
      })()
    `);
    await sleep(800);

    // =========================================================================
    // JOURNEY 3: TRANSPORT ERROR ON SAME VALID DATE -> RETRY -> RECOVERY
    // =========================================================================
    console.log('\n[JOURNEY 3] Transport Service Error on Valid Date -> Retry Click -> Restored Availability...');

    // Hook availability at the service/transport test layer:
    // Keep date as '2026-10-25'. Fail attempts while outage is active. Let retry request succeed after setting allowRecovery.
    await client.evaluate(`
      (() => {
        window.__origAvailability = window.__SERVICES__.bookingsService.availability;
        window.__availAttempts = 0;
        window.__allowRecovery = false;
        window.__SERVICES__.bookingsService.availability = function(fieldId, date, signal) {
          window.__availAttempts++;
          if (!window.__allowRecovery) {
            return Promise.reject(new Error('Network error: simulated availability service outage'));
          }
          return window.__origAvailability.call(this, fieldId, date, signal);
        };
      })()
    `);

    // Click Reschedule on Dawit's card
    await client.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article'));
        const dawitCard = cards.find(c => c.textContent?.includes('Dawit Kebede'));
        dawitCard?.querySelector('button')?.click();
      })()
    `);
    await sleep(1000);

    // Assert: Modal opened with valid date 2026-10-25, error alert rendered, Retry button present, 0 slots
    const errorState = await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        const dateInput = modal?.querySelector('input[type="date"]');
        const alert = modal?.querySelector('[role="alert"]');
        const retryBtn = alert?.querySelector('button');
        const slotsGrid = modal?.querySelector('.grid');
        return {
          modalOpen: !!modal,
          dateKeptSame: dateInput?.value === '2026-10-25',
          hasAlert: !!alert,
          alertText: alert?.querySelector('p')?.textContent?.trim(),
          hasRetryButton: !!retryBtn,
          retryText: retryBtn?.textContent?.trim(),
          hasSlotsGrid: !!slotsGrid,
          attempts: window.__availAttempts
        };
      })()
    `);
    console.log('  Real ServiceErrorMessage rendered on outage failure:', errorState);
    if (!errorState.modalOpen || !errorState.dateKeptSame || !errorState.hasAlert || !errorState.hasRetryButton || errorState.attempts < 1) {
      throw new Error(`Journey 3A assertion failed: Expected error alert with Retry button on unchanged date. Got: ${JSON.stringify(errorState)}`);
    }

    const shot3aPath = path.join(artifactDir, 'journey_3a_real_service_error.png');
    await client.captureScreenshot(shot3aPath);
    console.log('  ✓ Screenshot captured (real service error state):', shot3aPath);

    // Enable recovery in transport layer and click the application's Retry button (WITHOUT changing the date)
    await client.evaluate(`
      (() => {
        window.__allowRecovery = true;
        const modal = document.querySelector('[role="dialog"]');
        const retryBtn = modal?.querySelector('[role="alert"] button');
        if (retryBtn) retryBtn.click();
      })()
    `);
    await sleep(1200);

    // Assert: Attempt 2 executed, alert cleared, slots grid restored with buttons
    const recoveredSlotsState = await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        const dateInput = modal?.querySelector('input[type="date"]');
        const alert = modal?.querySelector('[role="alert"]');
        const slotButtons = Array.from(modal?.querySelectorAll('.grid button') || []).map(b => b.textContent?.trim());
        return {
          dateStillSame: dateInput?.value === '2026-10-25',
          alertCleared: !alert,
          attempts: window.__availAttempts,
          recoveredSlotsCount: slotButtons.length,
          sampleSlots: slotButtons.slice(0, 5)
        };
      })()
    `);
    console.log('  Recovered availability slots on attempt 2:', recoveredSlotsState);
    if (!recoveredSlotsState.alertCleared || recoveredSlotsState.attempts < 2 || recoveredSlotsState.recoveredSlotsCount === 0 || !recoveredSlotsState.dateStillSame) {
      throw new Error(`Journey 3B assertion failed: Slots not restored after clicking Retry. Got: ${JSON.stringify(recoveredSlotsState)}`);
    }

    const shot3bPath = path.join(artifactDir, 'journey_3b_recovered_availability.png');
    await client.captureScreenshot(shot3bPath);
    console.log('  ✓ Screenshot captured (recovered slots):', shot3bPath);

    // =========================================================================
    // JOURNEY 4: COMPLETED RESCHEDULE JOURNEY
    // =========================================================================
    console.log('\n[JOURNEY 4] Completed Reschedule Journey (10:00–12:00)...');
    await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        const numInputs = modal?.querySelectorAll('input[type="number"]');
        if (numInputs?.length >= 2) {
          const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          prototypeValue.set.call(numInputs[0], '10');
          numInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          numInputs[0].dispatchEvent(new Event('change', { bubbles: true }));

          prototypeValue.set.call(numInputs[1], '12');
          numInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          numInputs[1].dispatchEvent(new Event('change', { bubbles: true }));
        }

        modal?.querySelector('button[type="submit"]')?.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(client);

    const rescheduledCard = await client.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article'));
        const dawitCard = cards.find(c => c.textContent?.includes('Dawit Kebede'));
        return {
          found: !!dawitCard,
          hasNewTime: dawitCard?.textContent?.includes('10:00–12:00'),
          hasNewPrice: dawitCard?.textContent?.includes('ETB 5,000.00') || dawitCard?.textContent?.includes('ETB\\u00a05,000.00'),
          hasHistoryNote: dawitCard?.textContent?.includes('Rescheduled from Oct 25, 2026 · 06:00–07:00')
        };
      })()
    `);
    console.log('  Rescheduled card assertion:', rescheduledCard);
    if (!rescheduledCard.found || !rescheduledCard.hasNewTime || !rescheduledCard.hasNewPrice || !rescheduledCard.hasHistoryNote) {
      throw new Error(`Journey 4 assertion failed: Reschedule failed or card not updated: ${JSON.stringify(rescheduledCard)}`);
    }

    const shot4Path = path.join(artifactDir, 'journey_4_rescheduled_card.png');
    await client.captureScreenshot(shot4Path);
    console.log('  ✓ Screenshot captured (rescheduled card):', shot4Path);

    // =========================================================================
    // JOURNEY 5: RELOAD PERSISTENCE
    // =========================================================================
    console.log('\n[JOURNEY 5] Reload Persistence Journey (Page.reload reading sessionStorage)...');
    await client.send('Page.reload');
    await sleep(2000);
    await waitForLoading(client);

    await client.evaluate(`
      (() => {
        const dateInput = document.querySelector('input[type="date"]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(dateInput, '2026-10-25');
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(1000);
    await waitForLoading(client);

    const persistedCard = await client.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article'));
        const dawitCard = cards.find(c => c.textContent?.includes('Dawit Kebede'));
        return {
          persisted: !!dawitCard,
          hasTime: dawitCard?.textContent?.includes('10:00–12:00'),
          hasPrice: dawitCard?.textContent?.includes('ETB 5,000.00') || dawitCard?.textContent?.includes('ETB\\u00a05,000.00'),
          hasRescheduledFrom: dawitCard?.textContent?.includes('Rescheduled from Oct 25, 2026 · 06:00–07:00'),
          snippet: dawitCard?.textContent?.slice(0, 160)
        };
      })()
    `);
    console.log('  Persisted state after reload assertion:', persistedCard);
    if (!persistedCard.persisted || !persistedCard.hasTime || !persistedCard.hasPrice || !persistedCard.hasRescheduledFrom) {
      throw new Error(`Journey 5 assertion failed: Reload persistence check failed: ${JSON.stringify(persistedCard)}`);
    }

    const shot5Path = path.join(artifactDir, 'journey_5_reload_persistence.png');
    await client.captureScreenshot(shot5Path);
    console.log('  ✓ Screenshot captured (reload persistence):', shot5Path);

    // =========================================================================
    // JOURNEY 6: TWO-VENUE ISOLATION (Bambis Meda vs Unity Sports Complex)
    // =========================================================================
    console.log('\n[JOURNEY 6] Two-Venue Isolation Journey (Bambis Meda vs Unity Sports Complex)...');
    console.log('  Switching session to owner-2 (Dawit Tadesse @ Unity Sports Complex)...');
    await client.evaluate(`
      (() => {
        sessionStorage.setItem('etsf-demo-session-v1', 'owner-2');
      })()
    `);
    await client.send('Page.reload');
    await sleep(2000);
    await waitForLoading(client);

    // CRITICAL: Explicitly set the calendar date to 2026-10-25 under Unity Sports Complex
    console.log('  Setting calendar date to 2026-10-25 under Unity Sports Complex...');
    await client.evaluate(`
      (() => {
        const dateInput = document.querySelector('input[type="date"]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(dateInput, '2026-10-25');
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(1000);
    await waitForLoading(client);

    // Assert Unity date is 2026-10-25, owned venue is Unity Sports Complex, and Bambis booking is absent
    const unityOct25Check = await client.evaluate(`
      (() => {
        const dateInput = document.querySelector('input[type="date"]');
        const k = Object.keys(document.body).find(k => k.startsWith('__reactFiber$'));
        let target = null;
        function walk(f) {
          if (!f || target) return;
          if (f.type?.name === 'BookingRecords') { target = f; return; }
          walk(f.child);
          walk(f.sibling);
        }
        walk(document.body[k]);
        let h = target?.memoizedState;
        for (let i = 0; i < 9; i++) h = h?.next;
        const queryData = h?.next?.memoizedState?.data;
        const ownedVenues = queryData?.venues || [];
        const venueFields = queryData?.fields || [];
        const cards = Array.from(document.querySelectorAll('article'));
        const allCardTexts = cards.map(c => c.textContent?.trim() || '');
        const dawitLeaked = allCardTexts.some(t => t.includes('Dawit Kebede'));
        const bookingIdLeaked = allCardTexts.some(t => t.includes('${bambisBookingId}'));
        return {
          ownerId: 'owner-2',
          dateSelected: dateInput?.value,
          ownedVenueName: ownedVenues[0]?.name,
          ownedVenueId: ownedVenues[0]?.id,
          venueFieldsCount: venueFields.length,
          totalCardsOnOct25: cards.length,
          dawitLeaked,
          bookingIdLeaked
        };
      })()
    `);
    console.log('  Unity Sports Complex October 25 isolation check:', unityOct25Check);

    if (unityOct25Check.dateSelected !== '2026-10-25') {
      throw new Error(`Journey 6 assertion failed: Date was not set to 2026-10-25. Got: ${unityOct25Check.dateSelected}`);
    }
    if (unityOct25Check.ownedVenueName !== 'Unity Sports Complex' || unityOct25Check.ownedVenueId !== 'venue-2') {
      throw new Error(`Journey 6 assertion failed: Expected Unity Sports Complex (venue-2). Got: ${unityOct25Check.ownedVenueName} (${unityOct25Check.ownedVenueId})`);
    }
    if (unityOct25Check.dawitLeaked || unityOct25Check.bookingIdLeaked || unityOct25Check.totalCardsOnOct25 !== 0) {
      throw new Error(`Journey 6 assertion failed: Bambis booking leaked to Unity Sports Complex on October 25! ${JSON.stringify(unityOct25Check)}`);
    }

    const shot6Path = path.join(artifactDir, 'journey_6_venue2_isolated.png');
    await client.captureScreenshot(shot6Path);
    console.log('  ✓ Screenshot captured (Unity isolated on Oct 25):', shot6Path);

    // NOW: Switch back to owner-1 (Bambis Meda Stadium) on October 25 and verify booking remains intact
    console.log('\n  Switching session back to owner-1 (Fatima Hassan @ Bambis Meda Stadium)...');
    await client.evaluate(`
      (() => {
        sessionStorage.setItem('etsf-demo-session-v1', 'owner-1');
      })()
    `);
    await client.send('Page.reload');
    await sleep(2000);
    await waitForLoading(client);

    console.log('  Setting calendar date to 2026-10-25 under Bambis Meda Stadium...');
    await client.evaluate(`
      (() => {
        const dateInput = document.querySelector('input[type="date"]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(dateInput, '2026-10-25');
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(1000);
    await waitForLoading(client);

    const bambisRestoredCheck = await client.evaluate(`
      (() => {
        const dateInput = document.querySelector('input[type="date"]');
        const cards = Array.from(document.querySelectorAll('article'));
        const dawitCard = cards.find(c => c.textContent?.includes('${bambisBookingId}') || c.textContent?.includes('Dawit Kebede'));
        const text = dawitCard?.textContent?.trim() || '';
        return {
          ownerId: 'owner-1',
          dateSelected: dateInput?.value,
          found: !!dawitCard,
          hasExactBookingId: text.includes('${bambisBookingId}'),
          hasTime: text.includes('10:00–12:00'),
          hasPrice: text.includes('ETB 5,000.00') || text.includes('ETB\\u00a05,000.00'),
          hasHistoryNote: text.includes('Rescheduled from Oct 25, 2026 · 06:00–07:00'),
          venueText: text.includes('Bambis Meda Stadium')
        };
      })()
    `);
    console.log('  Bambis Meda Stadium October 25 restored booking check:', bambisRestoredCheck);

    if (bambisRestoredCheck.dateSelected !== '2026-10-25') {
      throw new Error(`Journey 6 assertion failed: Bambis date was not set to 2026-10-25. Got: ${bambisRestoredCheck.dateSelected}`);
    }
    if (!bambisRestoredCheck.found || !bambisRestoredCheck.hasExactBookingId || !bambisRestoredCheck.hasTime || !bambisRestoredCheck.hasPrice || !bambisRestoredCheck.hasHistoryNote) {
      throw new Error(`Journey 6 assertion failed: Booking ${bambisBookingId} not restored on Bambis Meda Stadium! ${JSON.stringify(bambisRestoredCheck)}`);
    }

    // =========================================================================
    // JOURNEY 7: PLAYER VIEW
    // =========================================================================
    console.log('\n[JOURNEY 7] Player Reservation View (player-1)...');
    await client.evaluate(`
      (() => {
        sessionStorage.setItem('etsf-demo-session-v1', 'player-1');
      })()
    `);
    await client.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(2000);
    await waitForLoading(client);

    const playerCheck = await client.evaluate(`
      (() => {
        const title = document.querySelector('h1')?.textContent;
        const walkInBtnPresent = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Record walk-in'));
        return { title, walkInBtnPresent };
      })()
    `);
    console.log('  Player view assertion:', playerCheck);
    if (!playerCheck.title || playerCheck.walkInBtnPresent) {
      throw new Error(`Journey 7 assertion failed: Player view should not have owner operations. Got: ${JSON.stringify(playerCheck)}`);
    }

    const shot7Path = path.join(artifactDir, 'journey_7_player_view.png');
    await client.captureScreenshot(shot7Path);
    console.log('  ✓ Screenshot captured (player view):', shot7Path);

    client.close();
    proc.kill();
    console.log('\n================================================================');
    console.log('ALL GENUINE BROWSER JOURNEYS VERIFIED AND ASSERTED SUCCESSFULLY!');
    console.log('================================================================');
    return true;
  } catch (err) {
    console.error('Test execution error:', err);
    proc.kill();
    throw err;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  runBrowserJourneysTest()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

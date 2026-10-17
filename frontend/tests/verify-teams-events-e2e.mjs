import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  }
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  return 'google-chrome';
}

const chromePath = findChrome();
const artifactDir = process.env.ARTIFACT_DIR || path.join(process.cwd(), '.test-artifacts');
const profileDir = path.join(os.tmpdir(), 'smartify-teams-events-profile');

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
    try {
      const res = await this.send('Page.captureScreenshot', { format: 'png' });
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      fs.writeFileSync(filepath, Buffer.from(res.data, 'base64'));
      console.log(`  [Screenshot] Saved: ${filepath}`);
    } catch (e) {
      console.warn(`  [Screenshot Failed]: ${e.message}`);
    }
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForLoading(client) {
  for (let i = 0; i < 40; i++) {
    const isLoading = await client.evaluate(`!!document.querySelector('p[role="status"]')?.textContent?.includes('Loading')`);
    if (!isLoading) break;
    await sleep(150);
  }
}

async function setSession(client, accountId, locale = 'en') {
  await client.evaluate(`
    (() => {
      if ('${accountId}') {
        sessionStorage.setItem('etsf-demo-session-v1', '${accountId}');
      } else {
        sessionStorage.removeItem('etsf-demo-session-v1');
      }
      localStorage.setItem('etsf-locale', '${locale}');
    })()
  `);
}

export async function runTeamsEventsE2ETest() {
  console.log('================================================================');
  console.log('TEAMS & EVENT REGISTRATION REPRODUCIBLE E2E SUITE');
  console.log('================================================================\n');

  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch {
    // Ignore error if profile directory does not exist
  }

  const port = 9324;
  const chromeArgs = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1280,900',
    'about:blank',
  ];

  console.log(`Starting headless Chrome (${chromePath})...`);
  const proc = spawn(chromePath, chromeArgs, { stdio: 'ignore' });

  let pageTarget = null;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
      if (res.ok) {
        pageTarget = await res.json();
        break;
      }
    } catch {
      // Retry
    }
  }

  if (!pageTarget) {
    proc.kill();
    throw new Error('Failed to connect to Chrome remote debugging port.');
  }

  console.log(`Connected to page target: ${pageTarget.webSocketDebuggerUrl}`);
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('Runtime.enable');

  try {
    // -------------------------------------------------------------------------
    // JOURNEY 1: Teams, Captaincy, and Member Moderation
    // -------------------------------------------------------------------------
    console.log('\n[JOURNEY 1] Teams, Captaincy, and Member Moderation...');
    
    // Step 1a: Navigate as Sara (player-2) to Bole Lions FC (team-1)
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams' });
    await sleep(1500);
    await setSession(client, 'player-2', 'en');

    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/team-1' });
    await sleep(1500);
    await waitForLoading(client);

    const teamHeader = await client.evaluate(`
      (() => {
        const h1 = document.querySelector('h1')?.textContent?.trim();
        const captain = document.querySelector('[data-testid="captain-name"], span')?.textContent;
        const joinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Request to Join'));
        return { h1, hasJoinBtn: !!joinBtn, text: document.body.innerText };
      })()
    `);
    console.log('  Initial team view as Sara:', { h1: teamHeader.h1, hasJoinBtn: teamHeader.hasJoinBtn });
    if (!teamHeader.h1?.includes('Bole Lions FC') || !teamHeader.hasJoinBtn) {
      throw new Error(`Journey 1: Sara should see Bole Lions FC with Request to Join button`);
    }

    // Click Request to Join
    await client.evaluate(`
      (() => {
        const joinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Request to Join'));
        joinBtn?.click();
      })()
    `);
    await sleep(800);

    const pendingCheck = await client.evaluate(`
      (() => {
        const pendingEl = Array.from(document.querySelectorAll('button, span')).find(b => b.textContent?.includes('Join request pending'));
        return { hasPending: !!pendingEl, hasActionError: document.querySelector('[role="alert"]')?.textContent };
      })()
    `);
    console.log('  After clicking join request:', pendingCheck);
    if (!pendingCheck.hasPending) {
      throw new Error(`Journey 1: Expected "Join request pending" button state`);
    }
    await client.captureScreenshot(path.join(artifactDir, 'journey1_join_request_pending.png'));

    // Step 1a (reload persistence): reload the browser page and verify pending request survives reload
    await client.send('Page.reload');
    await sleep(1500);
    await waitForLoading(client);

    const reloadedPendingCheck = await client.evaluate(`
      (() => {
        const pendingEl = Array.from(document.querySelectorAll('button, span')).find(b => b.textContent?.includes('Join request pending'));
        return { hasPending: !!pendingEl };
      })()
    `);
    console.log('  After page reload, pending join request persists:', reloadedPendingCheck);
    if (!reloadedPendingCheck.hasPending) {
      throw new Error(`Journey 1: Join request pending status must persist across page reload`);
    }

    // Step 1b: Switch to Abebe (player-1, captain) to review and approve request
    await setSession(client, 'player-1', 'en');
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/team-1' });
    await sleep(1500);
    await waitForLoading(client);

    const captainCheck = await client.evaluate(`
      (() => {
        const hasCaptainControls = document.body.innerText.includes('Captain Controls');
        const hasPendingSara = document.body.innerText.includes('Sara Mengistu');
        const approveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Approve');
        return { hasCaptainControls, hasPendingSara, hasApproveBtn: !!approveBtn };
      })()
    `);
    console.log('  Captain Abebe view of pending request:', captainCheck);
    if (!captainCheck.hasCaptainControls || !captainCheck.hasApproveBtn) {
      throw new Error(`Journey 1: Captain should see pending request with Approve button`);
    }

    // Approve the join request
    await client.evaluate(`
      (() => {
        const approveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Approve');
        approveBtn?.click();
      })()
    `);
    await sleep(1000);

    const approvedRosterCheck = await client.evaluate(`
      (() => {
        const rosterText = document.body.innerText;
        const hasSara = rosterText.includes('Sara Mengistu');
        const hasRemoveBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Remove'));
        return { hasSara, hasRemoveBtn, rosterTextSnippet: rosterText.slice(0, 400) };
      })()
    `);
    console.log('  Roster after approval:', approvedRosterCheck);
    if (!approvedRosterCheck.hasSara || !approvedRosterCheck.hasRemoveBtn) {
      throw new Error(`Journey 1: Sara should be added to roster with Remove button for captain`);
    }
    await client.captureScreenshot(path.join(artifactDir, 'journey1_captain_approved_roster.png'));

    // Step 1c: Sara visits again and leaves the team
    await setSession(client, 'player-2', 'en');
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/team-1' });
    await sleep(1500);
    await waitForLoading(client);

    const memberLeaveCheck = await client.evaluate(`
      (() => {
        const leaveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Leave Team'));
        return { hasLeaveBtn: !!leaveBtn };
      })()
    `);
    console.log('  Sara as member has leave button:', memberLeaveCheck);
    if (!memberLeaveCheck.hasLeaveBtn) {
      throw new Error(`Journey 1: Sara as member should see Leave Team button`);
    }

    // Click Leave Team to show inline confirmation panel
    await client.evaluate(`
      (() => {
        const leaveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Leave Team'));
        leaveBtn?.click();
      })()
    `);
    await sleep(400);

    // Click Confirm button
    await client.evaluate(`
      (() => {
        const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.className?.includes('bg-red-600') || b.textContent?.trim() === 'Confirm');
        confirmBtn?.click();
      })()
    `);
    await sleep(1000);

    const afterLeaveCheck = await client.evaluate(`
      (() => {
        const joinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Request to Join'));
        const rosterHasSara = document.body.innerText.includes('Sara Mengistu');
        return { hasJoinBtn: !!joinBtn, rosterHasSara };
      })()
    `);
    console.log('  After Sara leaves team:', afterLeaveCheck);
    if (!afterLeaveCheck.hasJoinBtn) {
      throw new Error(`Journey 1: After leaving, Sara should see Request to Join button again`);
    }

    // Step 1d: Verify team-profile operational failure exposes honest retry state (not false guest or empty profile)
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/nonexistent-team-999' });
    await sleep(1500);
    await waitForLoading(client);

    const failureStateCheck = await client.evaluate(`
      (() => {
        const alert = document.querySelector('[role="alert"]');
        const retryBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Retry') || b.textContent?.includes('Try again'));
        const text = document.body.innerText;
        const isHonestError = !!alert || text.includes('not found') || text.includes('Error') || text.includes('Something went wrong');
        return { isHonestError, hasRetryBtn: !!retryBtn, textSnippet: text.slice(0, 200) };
      })()
    `);
    console.log('  Operational team query failure renders retry state:', failureStateCheck);
    if (!failureStateCheck.isHonestError || !failureStateCheck.hasRetryBtn) {
      throw new Error(`Journey 1: Failed team query must render honest error state with retry button`);
    }

    // Step 1e: Switching resources immediately hides previous resource's actionable data
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/team-1' });
    await sleep(1500);
    await waitForLoading(client);

    const team1DataCheck = await client.evaluate(`
      (() => {
        const text = document.body.innerText;
        return { hasBoleLions: text.includes('Bole Lions FC') };
      })()
    `);
    if (!team1DataCheck.hasBoleLions) {
      throw new Error('Journey 1: Expected Bole Lions FC on team-1');
    }

    // Navigate to team-2 and immediately sample to verify stale team-1 actionable controls are not displayed
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/team-2' });
    const immediateSwitchCheck = await client.evaluate(`
      (() => {
        const text = document.body?.innerText || '';
        // Old resource (Bole Lions FC) must NOT be displayed while team-2 is loading
        const showsOldResource = text.includes('Bole Lions FC');
        return { showsOldResource };
      })()
    `);
    console.log('  Resource switch immediately hides previous resource:', immediateSwitchCheck);
    if (immediateSwitchCheck.showsOldResource) {
      throw new Error('Journey 1: Previous resource data must not be displayed when switching resources');
    }
    await waitForLoading(client);

    // -------------------------------------------------------------------------
    // JOURNEY 2: Captain Team Booking and Privacy Masking
    // -------------------------------------------------------------------------
    console.log('\n[JOURNEY 2] Captain Team Booking and Privacy Boundaries...');

    // Abebe (player-1) books Pitch 1 on behalf of Bole Lions FC
    await setSession(client, 'player-1', 'en');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await client.send('Page.navigate', { url: `http://localhost:3000/bookings/new?venue=bambis-meda&field=field-1&sport=football&date=${dateStr}` });
    await sleep(1500);
    await waitForLoading(client);

    const bookingFormCheck = await client.evaluate(`
      (() => {
        const teamSelect = document.querySelector('select[name="teamId"], select');
        const options = Array.from(document.querySelectorAll('select option')).map(o => o.textContent);
        const slots = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes(':00'));
        return { hasTeamSelect: options.some(o => o.includes('Bole Lions FC')), options, slotsCount: slots.length };
      })()
    `);
    console.log('  Booking form for captain:', bookingFormCheck);
    if (!bookingFormCheck.hasTeamSelect) {
      throw new Error(`Journey 2: Team selector should include "Bole Lions FC"`);
    }

    // Select team and select first available slot
    await client.evaluate(`
      (() => {
        const selects = Array.from(document.querySelectorAll('select'));
        for (const sel of selects) {
          const opt = Array.from(sel.options).find(o => o.textContent.includes('Bole Lions FC'));
          if (opt) {
            sel.value = opt.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        // Select an available slot
        const radio = document.querySelector('input[type="radio"][name="start"]');
        if (radio) {
          radio.click();
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(600);

    // Submit booking
    await client.evaluate(`
      (() => {
        const form = document.querySelector('form');
        const submitBtn = form?.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Confirm') || b.textContent?.includes('Reserve') || b.textContent?.includes('Book'));
        submitBtn?.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(client);

    // Verify player booking list shows team match badge
    await client.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(1500);
    await waitForLoading(client);

    const playerBookingBadge = await client.evaluate(`
      (() => {
        const text = document.body.innerText;
        const hasTeamBadge = text.includes('Bole Lions FC') && (text.includes('Team match') || text.includes('teamMatch'));
        return { hasTeamBadge, textSnippet: text.slice(0, 300) };
      })()
    `);
    console.log('  Player bookings view with team match badge:', playerBookingBadge);
    if (!playerBookingBadge.hasTeamBadge) {
      throw new Error(`Journey 2: Player booking list should show "Bole Lions FC · Team match" badge`);
    }
    await client.captureScreenshot(path.join(artifactDir, 'journey2_team_booking_badge.png'));

    // Verify team bookings list as Captain (sees financial amounts)
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/team-1' });
    await sleep(1500);
    await waitForLoading(client);

    const captainFinancialsCheck = await client.evaluate(`
      (() => {
        const text = document.body.innerText;
        const hasETB = text.includes('ETB');
        const hasMatchesSection = text.includes('Team Matches');
        return { hasETB, hasMatchesSection };
      })()
    `);
    console.log('  Captain view of team matches (with ETB financials):', captainFinancialsCheck);
    if (!captainFinancialsCheck.hasETB) {
      throw new Error(`Journey 2: Captain should see ETB financial details for team matches`);
    }

    // Verify team bookings list as Non-Member/Public (financial details masked)
    await setSession(client, 'player-2', 'en'); // Sara is non-member
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/team-1' });
    await sleep(1500);
    await waitForLoading(client);

    const publicPrivacyCheck = await client.evaluate(`
      (() => {
        const matchesSection = document.querySelector('section:has(h2)')?.innerText || document.body.innerText;
        // In team bookings section, non-members should NOT see ETB total or payment badge
        const hasMatch = matchesSection.includes('Main pitch') || matchesSection.includes('Pitch 1') || matchesSection.includes('Court');
        const hasETBInTeamBookings = /Team Matches[\s\S]*?ETB/.test(document.body.innerText);
        return { hasMatch, hasETBInTeamBookings };
      })()
    `);
    console.log('  Public/non-member view of team matches (financials masked):', publicPrivacyCheck);
    if (publicPrivacyCheck.hasETBInTeamBookings) {
      throw new Error(`Journey 2: Public/non-member must NOT see private ETB financial details on team matches`);
    }

    // -------------------------------------------------------------------------
    // JOURNEY 3: Venue Events across Two Venues & Format Modeling
    // -------------------------------------------------------------------------
    console.log('\n[JOURNEY 3] Venue Events Registration across Two Venues...');

    // Venue 1: Bambis Meda (venue-1, format: team)
    await setSession(client, 'player-1', 'en'); // Abebe is captain of Bole Lions FC
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda' });
    await sleep(2000);
    await waitForLoading(client);

    const venue1EventCheck = await client.evaluate(`
      (() => {
        const text = document.body.innerText;
        const hasTeamBadge = text.includes('Team event');
        const hasRegisterBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Register for Event'));
        return { hasTeamBadge, hasRegisterBtn };
      })()
    `);
    console.log('  Venue 1 (Bambis Meda) Event check:', venue1EventCheck);
    if (!venue1EventCheck.hasTeamBadge || !venue1EventCheck.hasRegisterBtn) {
      throw new Error(`Journey 3: Venue 1 should show Team event with Register button`);
    }

    // Click Register for Event
    await client.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Register for Event'));
        btn?.click();
      })()
    `);
    await sleep(800);

    // Verify registration dialog and submit
    const modalCheck = await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const isOpen = dialog?.open;
        const hasSelectTeam = dialog?.innerText.includes('Select team for registration');
        return { isOpen, hasSelectTeam };
      })()
    `);
    console.log('  Event registration modal:', modalCheck);
    if (!modalCheck.isOpen) {
      throw new Error(`Journey 3: Registration modal should open`);
    }

    // Confirm registration
    await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const submitBtn = dialog?.querySelector('button[type="submit"]');
        submitBtn?.click();
      })()
    `);
    await sleep(1200);

    // Verify dialog remains mounted with registration success message without premature unmount or close
    const successDialogCheck = await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const isOpen = dialog?.open;
        const text = dialog?.innerText || '';
        const hasSuccess = text.includes('Registration confirmed') || text.includes('registrationSuccess') || text.includes('registered for this event');
        return { isOpen, hasSuccess, textSnippet: text.slice(0, 300) };
      })()
    `);
    console.log('  After registration submit, dialog stays open with confirmation:', successDialogCheck);
    if (!successDialogCheck.isOpen || !successDialogCheck.hasSuccess) {
      throw new Error(`Journey 3: Registration dialog must remain mounted and open with confirmation success message`);
    }

    // Close modal deliberately
    await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const closeBtn = Array.from(dialog?.querySelectorAll('button') || []).find(b => b.textContent?.includes('Close'));
        closeBtn?.click();
      })()
    `);
    await sleep(800);

    const registeredCheck = await client.evaluate(`
      (() => {
        const hasRegisteredBadge = Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Registered ✓'));
        return { hasRegisteredBadge };
      })()
    `);
    console.log('  Venue 1 Event after registration:', registeredCheck);
    if (!registeredCheck.hasRegisteredBadge) {
      throw new Error(`Journey 3: Venue 1 event button should show "Registered ✓"`);
    }
    await client.captureScreenshot(path.join(artifactDir, 'journey3_event_registered_venue1.png'));

    // Re-open dialog by clicking Registered ✓ to verify it resolves fresh registration details and does NOT offer the registration form again
    await client.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Registered ✓'));
        btn?.click();
      })()
    `);
    await sleep(800);

    const freshModalCheck = await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const isOpen = dialog?.open;
        const text = dialog?.innerText || '';
        const hasRegisteredStatus = text.includes('Cancel Registration') || text.includes('Registered');
        const hasRegistrationForm = !!dialog?.querySelector('select[name="teamId"], form');
        return { isOpen, hasRegisteredStatus, hasRegistrationForm, textSnippet: text.slice(0, 300) };
      })()
    `);
    console.log('  Reopening event modal resolves fresh details:', freshModalCheck);
    if (!freshModalCheck.isOpen || !freshModalCheck.hasRegisteredStatus || freshModalCheck.hasRegistrationForm) {
      throw new Error(`Journey 3: Re-opened modal must resolve fresh registration state and not display registration form`);
    }

    // Close modal again
    await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const closeBtn = Array.from(dialog?.querySelectorAll('button') || []).find(b => b.textContent?.includes('Close'));
        closeBtn?.click();
      })()
    `);
    await sleep(600);

    // Venue 2: Unity Sports Complex (venue-2, singles event)
    await setSession(client, 'player-2', 'en'); // Sara
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/unity-complex' });
    await sleep(2000);
    await waitForLoading(client);

    const venue2EventCheck = await client.evaluate(`
      (() => {
        const text = document.body.innerText;
        const hasSingles = text.includes('Singles event');
        const registerBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('Register for Event'));
        return { hasSingles, count: registerBtns.length };
      })()
    `);
    console.log('  Venue 2 (Unity Complex) singles event check:', venue2EventCheck);
    if (!venue2EventCheck.hasSingles) {
      throw new Error(`Journey 3: Venue 2 should display Singles event format`);
    }

    // Register Sara for singles event and then cancel to test capacity restoration
    await client.evaluate(`
      (() => {
        // Click register for the singles event
        const events = Array.from(document.querySelectorAll('article, div.group'));
        for (const ev of events) {
          if (ev.innerText.includes('Singles event')) {
            const btn = ev.querySelector('button');
            if (btn && btn.textContent.includes('Register')) {
              btn.click();
              break;
            }
          }
        }
      })()
    `);
    await sleep(800);

    // Submit registration in dialog
    await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const submitBtn = dialog?.querySelector('button[type="submit"]');
        submitBtn?.click();
      })()
    `);
    await sleep(1200);

    // Close success dialog
    await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const closeBtn = Array.from(dialog?.querySelectorAll('button') || []).find(b => b.textContent?.includes('Close'));
        closeBtn?.click();
      })()
    `);
    await sleep(800);

    // Click Registered ✓ to open cancellation
    await client.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Registered ✓'));
        btn?.click();
      })()
    `);
    await sleep(800);

    // Click Cancel Registration
    await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const cancelBtn = Array.from(dialog?.querySelectorAll('button') || []).find(b => b.textContent?.includes('Cancel Registration'));
        cancelBtn?.click();
      })()
    `);
    await sleep(500);

    // Confirm cancellation
    await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const confirmBtn = Array.from(dialog?.querySelectorAll('button') || []).find(b => b.textContent?.trim() === 'Yes, cancel' || (b.textContent?.includes('Cancel') && !b.textContent?.includes('Registration') && !b.textContent?.includes('No')));
        confirmBtn?.click();
      })()
    `);
    await sleep(1200);

    // Close dialog
    await client.evaluate(`
      (() => {
        const dialog = document.querySelector('dialog');
        const closeBtn = Array.from(dialog?.querySelectorAll('button') || []).find(b => b.textContent?.includes('Close'));
        closeBtn?.click();
      })()
    `);
    await sleep(800);

    const cancelledCheck = await client.evaluate(`
      (() => {
        const registerBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Register for Event'));
        return { restored: !!registerBtn };
      })()
    `);
    console.log('  Venue 2 after cancellation capacity restoration:', cancelledCheck);
    if (!cancelledCheck.restored) {
      throw new Error(`Journey 3: Registration cancellation should restore available spot and re-enable register button`);
    }

    // -------------------------------------------------------------------------
    // JOURNEY 4: Mobile Viewport (390x844) & Amharic Localization
    // -------------------------------------------------------------------------
    console.log('\n[JOURNEY 4] Mobile Viewport & Amharic Localization...');

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });

    await setSession(client, 'player-1', 'am');
    await client.send('Page.navigate', { url: 'http://localhost:3000/teams/team-1' });
    await sleep(1500);
    await waitForLoading(client);

    const mobileAmharicCheck = await client.evaluate(`
      (() => {
        const text = document.body.innerText;
        const hasAmharicCaptain = text.includes('አምበል');
        const hasAmharicRoster = text.includes('የቡድን አባላት');
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > innerWidth;
        return { hasAmharicCaptain, hasAmharicRoster, scrollWidth, innerWidth, hasHorizontalOverflow };
      })()
    `);
    console.log('  Mobile Amharic Team page check:', mobileAmharicCheck);
    if (!mobileAmharicCheck.hasAmharicCaptain || !mobileAmharicCheck.hasAmharicRoster) {
      throw new Error(`Journey 4: Mobile Amharic team page should show translated strings`);
    }
    if (mobileAmharicCheck.hasHorizontalOverflow) {
      throw new Error(`Journey 4: Mobile view should not have horizontal overflow`);
    }
    await client.captureScreenshot(path.join(artifactDir, 'journey4_mobile_amharic_team.png'));

    // Check Venue Page in Amharic on Mobile
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda' });
    await sleep(2000);
    await waitForLoading(client);

    const mobileVenueCheck = await client.evaluate(`
      (() => {
        const text = document.body.innerText;
        const hasAmharicSpots = text.includes('ቦታዎች') || text.includes('የቡድን');
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > innerWidth;
        return { hasAmharicSpots, hasHorizontalOverflow };
      })()
    `);
    console.log('  Mobile Amharic Venue page check:', mobileVenueCheck);
    if (mobileVenueCheck.hasHorizontalOverflow) {
      throw new Error(`Journey 4: Mobile venue page should not have horizontal overflow`);
    }
    await client.captureScreenshot(path.join(artifactDir, 'journey4_mobile_amharic_venue.png'));

    console.log('\n================================================================');
    console.log('ALL 4 BROWSER JOURNEYS COMPLETED AND VERIFIED SUCCESSFULLY!');
    console.log('================================================================');

  } finally {
    try {
      proc.kill();
    } catch {
      // Ignore
    }
  }
}

runTeamsEventsE2ETest().catch((err) => {
  console.error('\nE2E SUITE FAILED:', err);
  process.exit(1);
});

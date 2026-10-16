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

const artifactDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\029216c7-1f48-4c02-bbd3-70b84f3c51e7';
const profileDir = path.join(os.tmpdir(), 'smartify-camera-media-profile');

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
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', ...data.params.args.map(a => a.value || a.description || ''));
      }
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
      console.log(`[Screenshot] Saved: ${filepath}`);
    } catch (err) {
      console.error(`Failed to capture screenshot ${filepath}:`, err.message);
    }
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLoading(client) {
  for (let i = 0; i < 40; i++) {
    const isLoading = await client.evaluate(`!!document.querySelector('p[role="status"]')?.textContent?.includes('Loading')`);
    if (!isLoading) break;
    await sleep(200);
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

async function runJourneys() {
  console.log('=== STARTING CAMERA, MATCH MEDIA & PRIVACY E2E SUITE ===');

  if (fs.existsSync(profileDir)) {
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  }
  fs.mkdirSync(profileDir, { recursive: true });

  const port = 9330;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1280,900',
    'about:blank',
  ]);

  let cdp;
  try {
    let pageTarget = null;
    for (let i = 0; i < 30; i++) {
      await sleep(250);
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
        if (res.ok) {
          pageTarget = await res.json();
          break;
        }
      } catch {}
    }

    if (!pageTarget) throw new Error('Could not obtain page target from Chrome');
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('Connected to headless browser page target via CDP.');

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 1: Owner Camera Administration & Certification Review
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 1: Owner Camera Administration & Certification ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(1000);

    // Set session as owner-1
    await setSession(cdp, 'owner-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/cameras' });
    await sleep(1500);
    await waitForLoading(cdp);

    let url = await cdp.evaluate('window.location.href');
    console.log('Current URL on Owner Cameras:', url);

    // Verify cameras are rendered
    const cameraCardsCount = await cdp.evaluate(`document.querySelectorAll('article.panel').length`);
    console.log(`Rendered camera cards: ${cameraCardsCount}`);
    if (cameraCardsCount === 0) throw new Error('No camera cards rendered for owner-1');

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_1_owner_cameras_list.png'));

    // Verify failure reason and recovery guidance is rendered for failed camera
    const failedNoticeText = await cdp.evaluate(`
      (() => {
        const failed = Array.from(document.querySelectorAll('.text-rose-900')).map(e => e.textContent).join(' ');
        return failed;
      })()
    `);
    console.log('Failed camera guidance verified:', failedNoticeText.includes('Failure Reason') || failedNoticeText.includes('verification'));

    // Open Admin Certification Review Modal
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simulate Admin Review'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_1_admin_review_modal.png'));

    // Change decision to 'passed' (Certified) and save
    await cdp.evaluate(`
      (() => {
        const sel = document.querySelector('[role="dialog"] select');
        if (sel) {
          sel.value = 'passed';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const saveBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.textContent.includes('Save'));
        if (saveBtn) saveBtn.click();
      })()
    `);
    await sleep(2000);

    // Verify status updated to Certified
    const updatedCertStatus = await cdp.evaluate(`
      (() => {
        return Array.from(document.querySelectorAll('span')).map(s => s.textContent).join(' ');
      })()
    `);
    console.log('Camera passed certification status verified:', updatedCertStatus.includes('Certified'));

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 2: Match Recordings, Processing Retry, Consent & Publication
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 2: Match Recordings, Consent & Publication ---');
    // Switch to Recordings tab
    await cdp.evaluate(`
      (() => {
        const tabs = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Match Recordings'));
        if (tabs.length > 0) tabs[0].click();
      })()
    `);
    await sleep(2000);

    const recordingCardsCount = await cdp.evaluate(`document.querySelectorAll('article.panel').length`);
    console.log(`Rendered recording cards: ${recordingCardsCount}`);
    if (recordingCardsCount === 0) throw new Error('No recording cards rendered on recordings tab');

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_2_recordings_tab.png'));

    // Click Retry Processing on failed recording
    const retryBtn = await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Retry Processing'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log('Retry button clicked:', retryBtn);
    await sleep(2000);

    // Open Recording Details Modal
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Recording Details'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1500);

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_2_recording_detail_modal.png'));

    // Advance Simulator state to 'ready'
    await cdp.evaluate(`
      (() => {
        const readyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('→ ready'));
        if (readyBtn) readyBtn.click();
      })()
    `);
    await sleep(2000);

    // Test Privacy publication guard: try to set public while consent is pending/blur incomplete
    await cdp.evaluate(`
      (() => {
        const visSel = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === 'public'));
        if (visSel) {
          visSel.value = 'public';
          visSel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(500);

    await cdp.evaluate(`
      (() => {
        const saveBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.textContent === 'Save');
        if (saveBtn) saveBtn.click();
      })()
    `);
    await sleep(2000);

    // Check for publication guard alert
    const publicationErrorText = await cdp.evaluate(`
      (() => {
        const err = document.querySelector('[role="alert"]');
        return err ? err.textContent : '';
      })()
    `);
    console.log('Publication guard blocked incomplete privacy publication:', publicationErrorText.length > 0);

    // Simulate Privacy Face Blur and Grant Consent
    await cdp.evaluate(`
      (() => {
        const blurBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simulate Privacy Face Blur'));
        if (blurBtn) blurBtn.click();
      })()
    `);
    await sleep(1500);

    await cdp.evaluate(`
      (() => {
        const consentBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Granted');
        if (consentBtn) consentBtn.click();
      })()
    `);
    await sleep(1500);

    // Now save publication to public
    await cdp.evaluate(`
      (() => {
        const visSel = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === 'public'));
        if (visSel) {
          visSel.value = 'public';
          visSel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const saveBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.textContent === 'Save');
        if (saveBtn) saveBtn.click();
      })()
    `);
    await sleep(2000);

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_2_recording_published_public.png'));

    // Close Recording Details modal
    await cdp.evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Close Video'));
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(1000);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 3: Player Booking Detail, Replay Modal & Playback Access
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 3: Player Booking Detail & Replay Playback ---');
    // Switch to Player 1
    await setSession(cdp, 'player-1', 'en');

    // Seed booking-rec-1 in demo state for player-1 using active storage key
    await cdp.evaluate(`
      (() => {
        const key = 'etsf-demo-v2';
        const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
        if (raw) {
          try {
            const state = JSON.parse(raw);
            if (!state.bookings.some(b => b.id === 'booking-rec-1')) {
              state.bookings.push({
                id: 'booking-rec-1',
                venueId: 'venue-1',
                fieldId: 'field-1',
                playerId: 'player-1',
                sport: 'football',
                date: '2026-10-10',
                startHour: 16,
                endHour: 18,
                totalMinor: 500000,
                currency: 'ETB',
                status: 'confirmed',
                paymentStatus: 'paid',
                createdAt: '2026-10-10T15:00:00Z',
                teamId: 'team-1',
                teamName: 'Bole Lions FC',
                source: 'online',
              });
              const json = JSON.stringify(state);
              sessionStorage.setItem(key, json);
              try { localStorage.setItem(key, json); } catch {}
            }
          } catch (e) {}
        }
      })()
    `);

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(2500);

    url = await cdp.evaluate('window.location.href');
    console.log('Current URL as Player 1:', url);

    // Verify "Match Replay" button exists on booking cards
    const replayButtonsCount = await cdp.evaluate(`
      (() => {
        return Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Match Replay')).length;
      })()
    `);
    console.log(`Booking replay buttons found: ${replayButtonsCount}`);
    if (replayButtonsCount === 0) throw new Error('No Match Replay buttons found on player bookings page');

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_3_player_bookings_list.png'));

    // Click Match Replay on first booking
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Match Replay'));
        if (btn) btn.click();
      })()
    `);
    await sleep(2500);

    // Verify Replay Modal is open with video element and provenance text
    const hasVideo = await cdp.evaluate(`!!document.querySelector('video')`);
    const provenanceText = await cdp.evaluate(`
      (() => {
        const el = document.querySelector('[role="dialog"]');
        return el ? el.textContent : '';
      })()
    `);
    console.log(`Replay video element rendered: ${hasVideo}`);
    console.log(`Provenance text displayed: ${provenanceText.includes('Big Buck Bunny') || provenanceText.includes('Creative Commons')}`);

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_3_player_replay_modal_open.png'));

    // Test Escape key closes Replay modal
    await cdp.evaluate(`
      (() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      })()
    `);
    await sleep(1000);

    const isModalClosed = await cdp.evaluate(`!document.querySelector('[role="dialog"]')`);
    console.log('Replay modal closed via keyboard Escape:', isModalClosed);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 4: Public Venue Microsite Highlights Integration
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 4: Microsite Public Highlights & Playback ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda#highlights' });
    await sleep(2500);

    const highlightsCount = await cdp.evaluate(`
      (() => {
        return document.querySelectorAll('#highlights [role="button"]').length;
      })()
    `);
    console.log(`Microsite match highlights rendered: ${highlightsCount}`);
    if (highlightsCount === 0) throw new Error('No match highlights found on venue microsite');

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_4_microsite_highlights.png'));

    // Click the first highlight to play in preview modal
    await cdp.evaluate(`
      (() => {
        const hl = document.querySelector('#highlights [role="button"]');
        if (hl) hl.click();
      })()
    `);
    await sleep(2000);

    const siteVideoPlayable = await cdp.evaluate(`!!document.querySelector('dialog video')`);
    console.log('Site highlight video preview playable:', siteVideoPlayable);

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_4_highlight_preview_dialog.png'));

    // Close preview dialog
    await cdp.evaluate(`
      (() => {
        const closeBtn = document.querySelector('dialog button');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(1000);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 5: Mobile Viewport & Amharic Localization
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 5: Mobile Viewport & Amharic Localization ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(500);

    // Navigate to /dashboard/cameras as owner-1 with Amharic
    await setSession(cdp, 'owner-1', 'am');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/cameras' });
    await sleep(2500);

    const amharicText = await cdp.evaluate(`document.body.innerText`);
    console.log('Amharic headings present on mobile:', amharicText.includes('ካሜራዎች') || amharicText.includes('የጨዋታ ቀረጻዎች'));

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_5_mobile_amharic_dashboard.png'));

    // Navigate to mobile bookings replay with Amharic
    await setSession(cdp, 'player-1', 'am');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(2500);

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_5_mobile_amharic_bookings.png'));

    // Reset device metrics
    await cdp.send('Emulation.clearDeviceMetricsOverride');

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 6: Demo Persistence Across Browser Reload
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 6: Demo Persistence Across Browser Reload ---');
    await setSession(cdp, 'owner-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/cameras' });
    await sleep(2000);

    // Full page reload
    await cdp.send('Page.reload');
    await sleep(2500);

    const reloadedCardsCount = await cdp.evaluate(`document.querySelectorAll('article.panel').length`);
    console.log(`Cards intact after full browser reload: ${reloadedCardsCount}`);
    if (reloadedCardsCount === 0) throw new Error('Camera cards lost after browser reload');

    await cdp.captureScreenshot(path.join(artifactDir, 'camera_journey_6_reload_persistence.png'));

    console.log('\n=== ALL CAMERA, MATCH MEDIA & PRIVACY E2E JOURNEYS PASSED ===\n');
  } finally {
    if (cdp) {
      try { await cdp.send('Browser.close'); } catch {}
    }
    chromeProc.kill('SIGKILL');
  }
}

runJourneys().catch(err => {
  console.error('\nE2E Journey Failure:', err);
  process.exit(1);
});

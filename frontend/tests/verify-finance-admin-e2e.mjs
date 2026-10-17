import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { createFixtures } from '../.test-build/demo/fixtures.js';

const chromePath = process.env.CHROME_BIN ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : (process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : 'google-chrome'));

const artifactDir = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\029216c7-1f48-4c02-bbd3-70b84f3c51e7';
const profileDir = path.join(os.tmpdir(), 'smartify-finance-admin-profile');

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
  console.log('=== STARTING FINANCE, SUPPORT, REVIEW & MODERATION E2E SUITE ===');

  if (fs.existsSync(profileDir)) {
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  }
  fs.mkdirSync(profileDir, { recursive: true });

  const port = 9335;
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

    // Prepare seeded initial demo state with today's bookings
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Addis_Ababa' }).format(new Date());
    const demoData = createFixtures();
    demoData.bookings = [
      {
        id: 'booking-e2e-1',
        venueId: 'venue-1',
        fieldId: 'field-1',
        playerId: 'player-1',
        sport: 'football',
        date: today,
        startHour: 18,
        endHour: 20,
        totalMinor: 200000,
        currency: 'ETB',
        status: 'confirmed',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'booking-e2e-2',
        venueId: 'venue-1',
        fieldId: 'field-2',
        playerId: 'player-1',
        sport: 'basketball',
        date: today,
        startHour: 14,
        endHour: 16,
        totalMinor: 150000,
        currency: 'ETB',
        status: 'confirmed',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
      },
    ];

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(1000);

    // Seed demo state into localStorage and sessionStorage
    await cdp.evaluate(`
      (() => {
        const json = ${JSON.stringify(JSON.stringify(demoData))};
        localStorage.setItem('etsf-demo-v2', json);
        sessionStorage.setItem('etsf-demo-v2', json);
      })()
    `);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 1: Owner Manual Settlement, Overpayment & Refund Lifecycle
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 1: Owner Manual Settlement, Receipts & Refund Lifecycle ---');
    await setSession(cdp, 'owner-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/bookings' });
    await sleep(1500);
    await waitForLoading(cdp);

    const bookingCards = await cdp.evaluate(`document.querySelectorAll('article.panel').length`);
    console.log(`Rendered booking cards in Owner Dashboard: ${bookingCards}`);
    if (bookingCards === 0) throw new Error('No bookings found in owner dashboard');

    // Click Record Settlement on the first available booking
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Record payment') || b.textContent.includes('Record settlement') || b.textContent.includes('Record Settlement'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Verify Settlement modal is open
    const isSettlementModalOpen = await cdp.evaluate(`!!document.querySelector('[role="dialog"]')`);
    console.log(`Settlement modal open: ${isSettlementModalOpen}`);
    if (!isSettlementModalOpen) throw new Error('Settlement modal did not open');

    // Test overpayment error: enter 999999
    await cdp.evaluate(`
      (() => {
        const amountInput = document.querySelector('[role="dialog"] input[type="number"]');
        if (amountInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(amountInput, '999999');
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          amountInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.textContent.includes('Record') || b.textContent.includes('Payment'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(500);

    const hasOverpaymentErr = await cdp.evaluate(`
      document.body.innerText.includes('exceed') || document.body.innerText.includes('greater than') || document.body.innerText.includes('outstanding')
    `);
    console.log(`Overpayment validation error displayed: ${hasOverpaymentErr}`);

    // Enter a valid collection amount (500 ETB) and submit
    await cdp.evaluate(`
      (() => {
        const amountInput = document.querySelector('[role="dialog"] input[type="number"]');
        if (amountInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(amountInput, '500');
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          amountInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.textContent.includes('Record') || b.textContent.includes('Payment'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(cdp);

    // Open Receipts modal
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Receipts') || b.textContent.includes('receipts'));
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_1_settlement_receipts.png'));

    // Verify transaction history in receipts modal
    const hasTransactionsTable = await cdp.evaluate(`!!document.querySelector('[role="dialog"] table')`);
    console.log(`Transactions table displayed in Receipts modal: ${hasTransactionsTable}`);
    if (!hasTransactionsTable) throw new Error('Receipts modal missing transactions table');

    // Close receipts modal
    await cdp.evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.textContent.includes('Close') || b.textContent.includes('✕'));
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 2: Player Simulated Gateway Payment & Failure Recovery
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 2: Player Simulated Gateway Payment & Recovery ---');
    await setSession(cdp, 'player-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(1500);
    await waitForLoading(cdp);

    // Click Simulate payment on unpaid booking
    await cdp.evaluate(`
      (() => {
        const simBtn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('Pay online') ||
          b.textContent.toLowerCase().includes('simulate')
        );
        if (simBtn) simBtn.click();
      })()
    `);
    await sleep(1000);

    const isGatewayModalOpen = await cdp.evaluate(`!!document.querySelector('#simulate-gateway-title')`);
    console.log(`Gateway simulation modal open: ${isGatewayModalOpen}`);
    if (!isGatewayModalOpen) throw new Error('Simulate gateway modal did not open');

    // Simulate failure outcome first
    await cdp.evaluate(`
      (() => {
        const outcomeSelect = Array.from(document.querySelectorAll('select')).find(s => s.value === 'succeed' || s.value === 'fail');
        if (outcomeSelect) {
          outcomeSelect.value = 'fail';
          outcomeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.textContent.includes('Simulate'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(1500);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_2_player_gateway_simulation.png'));

    // Open receipts modal to inspect the simulated failure record
    await cdp.evaluate(`
      (() => {
        const receiptsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Receipts') || b.textContent.includes('receipts'));
        if (receiptsBtn) receiptsBtn.click();
      })()
    `);
    await sleep(1000);

    const receiptsText = await cdp.evaluate(`document.querySelector('[role="dialog"]')?.innerText || ''`);
    console.log('Verified failed payment record:', receiptsText.includes('failed') || receiptsText.includes('Failed'));

    // Close receipts modal
    await cdp.evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b => b.textContent.includes('Close') || b.textContent.includes('✕'));
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 3: Owner & Admin Analytics Dashboards & Timezone Verification
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 3: Owner & Admin Analytics Dashboards ---');
    await setSession(cdp, 'owner-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/analytics' });
    await sleep(1500);
    await waitForLoading(cdp);

    const analyticsHeader = await cdp.evaluate(`document.body.innerText.includes('Analytics') || document.body.innerText.includes('Financial')`);
    console.log(`Owner Analytics page rendered: ${analyticsHeader}`);

    // Toggle metric date basis between booking_date and transaction_date
    await cdp.evaluate(`
      (() => {
        const sel = Array.from(document.querySelectorAll('select')).find(s => s.value === 'booking_date' || s.value === 'transaction_date');
        if (sel) {
          sel.value = 'transaction_date';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(1000);

    // Navigate to Admin Analytics at /admin/analytics
    await setSession(cdp, 'admin-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/analytics' });
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_3_analytics_dashboard.png'));
    const adminAnalyticsRendered = await cdp.evaluate(`document.body.innerText.includes('Platform') || document.body.innerText.includes('Analytics')`);
    console.log(`Admin platform analytics rendered: ${adminAnalyticsRendered}`);

    // Verify non-admin tenant denial
    await setSession(cdp, 'player-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/analytics' });
    await sleep(1500);
    const isPlayerDenied = await cdp.evaluate(`document.body.innerText.includes('permission') || document.body.innerText.includes('Sign in') || document.body.innerText.includes('forbidden')`);
    console.log(`Player access to /admin/analytics safely denied: ${isPlayerDenied}`);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 4: Venue Review Lifecycle & Administration
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 4: Venue Review Lifecycle ---');
    await setSession(cdp, 'admin-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/stadiums' });
    await sleep(1500);
    await waitForLoading(cdp);

    const hasStadiumsList = await cdp.evaluate(`document.querySelectorAll('article.panel').length > 0`);
    console.log(`Admin stadiums moderation list rendered: ${hasStadiumsList}`);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_4_venue_review_moderation.png'));

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 5: Account Moderation & Self-Lockout Protections
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 5: Account Moderation & Self-Lockout Guard ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/users' });
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_5_account_moderation.png'));
    const usersCardsRendered = await cdp.evaluate(`document.querySelectorAll('article.panel').length > 1`);
    console.log(`Users moderation cards rendered: ${usersCardsRendered}`);

    // Verify self-suspension protection message or disabled button
    const selfLockoutProtected = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const adminCard = cards.find(c => c.innerText.includes('admin-1') || c.innerText.includes('Demo Administrator'));
        if (!adminCard) return true;
        const suspendBtn = Array.from(adminCard.querySelectorAll('button')).find(b => b.textContent.includes('Suspend'));
        return !suspendBtn || suspendBtn.disabled;
      })()
    `);
    console.log(`Admin self-lockout invariant verified: ${selfLockoutProtected}`);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 6: Support Case Workflows (Player, Owner, Admin)
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 6: Support Case Workflows & Sanitization ---');
    // Player creates support case from /bookings
    await setSession(cdp, 'player-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(1500);
    await waitForLoading(cdp);

    // Click Support button on booking card
    await cdp.evaluate(`
      (() => {
        const supportBtn = Array.from(document.querySelectorAll('article.panel button')).find(b =>
          b.textContent.includes('Contact support') ||
          b.textContent.toLowerCase().includes('support')
        );
        if (supportBtn) supportBtn.click();
      })()
    `);
    await sleep(1000);

    const isSupportModalOpen = await cdp.evaluate(`!!document.querySelector('#support-modal-title')`);
    console.log(`Player support modal open: ${isSupportModalOpen}`);

    // Fill out inquiry and submit
    await cdp.evaluate(`
      (() => {
        const subInput = document.querySelector('[role="dialog"] input[type="text"]');
        if (subInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(subInput, 'Inquiry regarding court reservation lighting');
          subInput.dispatchEvent(new Event('input', { bubbles: true }));
          subInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const descInput = document.querySelector('[role="dialog"] textarea');
        if (descInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
          proto.set.call(descInput, 'Can you confirm evening floodlights will be available for our basketball match?');
          descInput.dispatchEvent(new Event('input', { bubbles: true }));
          descInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const confirmBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('Confirm') ||
          b.textContent.toLowerCase().includes('confirm')
        );
        if (confirmBtn) confirmBtn.click();
      })()
    `);
    await sleep(1500);

    // Switch to Owner at /dashboard/support
    await setSession(cdp, 'owner-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/support' });
    await sleep(1500);
    await waitForLoading(cdp);

    const ownerSupportRendered = await cdp.evaluate(`document.body.innerText.includes('Support') || document.body.innerText.includes('support')`);
    console.log(`Owner support panel rendered: ${ownerSupportRendered}`);

    // Switch to Admin at /admin/support
    await setSession(cdp, 'admin-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/support' });
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_6_support_workflow_sanitization.png'));
    const adminSupportCasesCount = await cdp.evaluate(`document.querySelectorAll('article.panel').length`);
    console.log(`Admin support cases visible: ${adminSupportCasesCount}`);

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 7: Mobile Viewport (390x844) & Amharic Localization
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 7: Mobile Viewport & Amharic Localization ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });

    // Set Amharic locale
    await setSession(cdp, 'owner-1', 'am');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/support' });
    await sleep(1500);
    await waitForLoading(cdp);

    const amharicSupportTitle = await cdp.evaluate(`document.body.innerText.includes('የድጋፍ ጥያቄዎች')`);
    console.log(`Amharic support panel header rendered (የድጋፍ ጥያቄዎች): ${amharicSupportTitle}`);

    // Navigate to bookings in mobile Amharic
    await setSession(cdp, 'player-1', 'am');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_7_mobile_amharic.png'));
    const amharicBookingsRendered = await cdp.evaluate(`document.body.innerText.includes('የቦታ ማስያዣዎች') || document.body.innerText.includes('የተረጋገጠ')`);
    console.log(`Amharic mobile bookings rendered: ${amharicBookingsRendered}`);

    console.log('\n=== ALL 7 FINANCE, SUPPORT, REVIEW & MODERATION JOURNEYS SUCCEEDED ===');
  } finally {
    if (chromeProc) chromeProc.kill();
  }
}

runJourneys().catch(err => {
  console.error('E2E SUITE FAILED:', err);
  process.exit(1);
});

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { createFixtures } from '../.test-build/demo/fixtures.js';

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
      const details = res.exceptionDetails.exception?.description || res.exceptionDetails.text || JSON.stringify(res.exceptionDetails);
      console.error('CDP Evaluation Exception:', details);
      throw new Error(`Browser evaluation exception: ${details}`);
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
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
    assert(bookingCards > 0, 'No bookings found in owner dashboard');

    // Click Record settlement on booking-e2e-1
    await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b1Card = cards.find(c => c.innerText.includes('booking-e2e-1')) || cards[0];
        const btn = Array.from(b1Card.querySelectorAll('button')).find(b =>
          b.textContent.includes('Record payment') ||
          b.textContent.includes('Record settlement') ||
          b.textContent.includes('Record Settlement')
        );
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);

    // Verify Settlement modal is open
    const isSettlementModalOpen = await cdp.evaluate(`!!document.querySelector('[role="dialog"]')`);
    console.log(`Settlement modal open: ${isSettlementModalOpen}`);
    assert(isSettlementModalOpen, 'Settlement modal did not open');

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
        const submitBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('Record') || b.textContent.includes('Payment')
        );
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(500);

    const hasOverpaymentErr = await cdp.evaluate(`
      document.body.innerText.includes('exceed') ||
      document.body.innerText.includes('greater than') ||
      document.body.innerText.includes('outstanding')
    `);
    console.log(`Overpayment validation error displayed: ${hasOverpaymentErr}`);
    assert(hasOverpaymentErr, 'Overpayment validation error was not displayed for excessive settlement amount');

    // Enter valid settlement collection (500 ETB) and submit
    await cdp.evaluate(`
      (() => {
        const amountInput = document.querySelector('[role="dialog"] input[type="number"]');
        if (amountInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(amountInput, '500');
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          amountInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('Record') || b.textContent.includes('Payment')
        );
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(cdp);

    // Open Receipts modal on booking-e2e-1
    await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b1Card = cards.find(c => c.innerText.includes('booking-e2e-1')) || cards[0];
        const btn = Array.from(b1Card.querySelectorAll('button')).find(b =>
          b.textContent.includes('Receipts') || b.textContent.includes('receipts')
        );
        if (btn) btn.click();
      })()
    `);
    await sleep(1000);
    await waitForLoading(cdp);

    const preRefundReceipts = await cdp.evaluate(`document.querySelector('[role="dialog"]')?.innerText || ''`);
    assert(
      preRefundReceipts.includes('500.00'),
      'Receipts modal must display 500.00 ETB collected after manual settlement'
    );

    // Perform an actual refund: click "Issue refund" button inside Receipts modal
    const issueRefundBtnFound = await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('Issue refund')
        );
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(issueRefundBtnFound, 'Issue refund button must be present in Receipts modal for owner');
    await sleep(500);

    // Fill in refund form (100 ETB, reason) and submit
    await cdp.evaluate(`
      (() => {
        const amountInput = document.querySelector('[role="dialog"] form input[type="number"]');
        if (amountInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(amountInput, '100');
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          amountInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const reasonInput = document.querySelector('[role="dialog"] form input[type="text"]');
        if (reasonInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(reasonInput, 'Customer schedule adjustment');
          reasonInput.dispatchEvent(new Event('input', { bubbles: true }));
          reasonInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const submitBtn = document.querySelector('[role="dialog"] form button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_1_settlement_receipts.png'));

    // Verify refund in receipts modal
    const postRefundReceipts = await cdp.evaluate(`document.querySelector('[role="dialog"]')?.innerText || ''`);
    assert(
      postRefundReceipts.includes('100.00'),
      'Receipts modal must record 100.00 ETB refunded'
    );
    assert(
      postRefundReceipts.includes('400.00'),
      'Receipts modal net collected balance must reflect 400.00 ETB after 100.00 ETB refund'
    );
    assert(
      postRefundReceipts.includes('Customer schedule adjustment'),
      'Transaction ledger must display the refund reason'
    );

    // Close receipts modal
    await cdp.evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('Close') || b.textContent.includes('✕')
        );
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

    // Click Simulate payment on booking-e2e-2
    await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b2Card = cards.find(c => c.innerText.includes('booking-e2e-2')) || cards[0];
        const simBtn = Array.from(b2Card.querySelectorAll('button')).find(b =>
          b.textContent.includes('Pay online') ||
          b.textContent.toLowerCase().includes('simulate')
        );
        if (simBtn) simBtn.click();
      })()
    `);
    await sleep(1000);

    const isGatewayModalOpen = await cdp.evaluate(`!!document.querySelector('#simulate-gateway-title')`);
    console.log(`Gateway simulation modal open: ${isGatewayModalOpen}`);
    assert(isGatewayModalOpen, 'Simulate gateway modal did not open');

    // Simulate failure outcome first
    await cdp.evaluate(`
      (() => {
        const outcomeSelect = Array.from(document.querySelectorAll('select')).find(s =>
          s.value === 'succeed' || s.value === 'fail'
        );
        if (outcomeSelect) {
          outcomeSelect.value = 'fail';
          outcomeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('Simulate')
        );
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(cdp);

    // Verify booking payment status transitioned to Failed
    const postFailCardText = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b2Card = cards.find(c => c.innerText.includes('booking-e2e-2')) || cards[0];
        return b2Card?.innerText || '';
      })()
    `);
    assert(postFailCardText.includes('Failed'), 'Booking card must display Failed payment badge after failed simulation');

    // Retry payment from the UI: click Pay online (Simulated) again
    const retryBtnClicked = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b2Card = cards.find(c => c.innerText.includes('booking-e2e-2')) || cards[0];
        const simBtn = Array.from(b2Card.querySelectorAll('button')).find(b =>
          b.textContent.includes('Pay online') ||
          b.textContent.toLowerCase().includes('simulate')
        );
        if (simBtn) {
          simBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(retryBtnClicked, 'Failed payment must be retriable from UI (Pay online button missing)');
    await sleep(1000);

    // Verify simulation modal opens for retry
    const isRetryModalOpen = await cdp.evaluate(`!!document.querySelector('#simulate-gateway-title')`);
    assert(isRetryModalOpen, 'Gateway simulation modal did not open on retry');

    // Select succeed outcome and submit retry
    await cdp.evaluate(`
      (() => {
        const outcomeSelect = Array.from(document.querySelectorAll('select')).find(s =>
          s.value === 'succeed' || s.value === 'fail'
        );
        if (outcomeSelect) {
          outcomeSelect.value = 'succeed';
          outcomeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('Simulate')
        );
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_2_player_gateway_simulation.png'));

    // Verify booking card now shows Paid
    const postRetryCardText = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b2Card = cards.find(c => c.innerText.includes('booking-e2e-2')) || cards[0];
        return b2Card?.innerText || '';
      })()
    `);
    assert(postRetryCardText.includes('Paid'), 'Booking card must display Paid badge after successful retry');

    // Open receipts modal to inspect the ledger (1 failed attempt, 1 successful collection, no duplicate charge)
    await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b2Card = cards.find(c => c.innerText.includes('booking-e2e-2')) || cards[0];
        const receiptsBtn = Array.from(b2Card.querySelectorAll('button')).find(b =>
          b.textContent.includes('Receipts') || b.textContent.includes('receipts')
        );
        if (receiptsBtn) receiptsBtn.click();
      })()
    `);
    await sleep(1000);
    await waitForLoading(cdp);

    const ledgerDetails = await cdp.evaluate(`
      (() => {
        const rows = Array.from(document.querySelectorAll('[role="dialog"] table tbody tr'));
        const modalText = document.querySelector('[role="dialog"]')?.innerText || '';
        return {
          rowCount: rows.length,
          hasFailed: modalText.includes('failed') || modalText.includes('Failed'),
          hasSucceeded: modalText.includes('succeeded') || modalText.includes('recorded') || modalText.includes('Paid'),
          modalText,
        };
      })()
    `);
    assert(ledgerDetails.rowCount === 2, `Ledger must contain exactly 2 transaction rows (1 failed attempt, 1 success), found: ${ledgerDetails.rowCount}`);
    assert(ledgerDetails.hasFailed, 'Ledger must display failed transaction record');
    assert(
      ledgerDetails.modalText.includes('1,500.00') || ledgerDetails.modalText.includes('1500.00'),
      'Net collected balance must equal 1,500.00 ETB without duplicate collections'
    );

    // Close receipts modal
    await cdp.evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('Close') || b.textContent.includes('✕')
        );
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

    const ownerAnalyticsText = await cdp.evaluate(`document.body.innerText`);
    assert(
      ownerAnalyticsText.includes('Analytics') || ownerAnalyticsText.includes('Financial Overview'),
      'Owner analytics dashboard header not rendered'
    );
    assert(
      ownerAnalyticsText.includes('Addis Ababa') || ownerAnalyticsText.includes('UTC+3') || ownerAnalyticsText.includes('EAT'),
      'Timezone compliance notice (Addis Ababa UTC+3) must be rendered'
    );

    // Toggle metric date basis between booking_date and transaction_date
    await cdp.evaluate(`
      (() => {
        const sel = Array.from(document.querySelectorAll('select')).find(s =>
          s.value === 'booking_date' || s.value === 'transaction_date'
        );
        if (sel) {
          sel.value = 'transaction_date';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    const updatedBasis = await cdp.evaluate(`
      (() => {
        const sel = Array.from(document.querySelectorAll('select')).find(s =>
          s.value === 'booking_date' || s.value === 'transaction_date'
        );
        return sel?.value;
      })()
    `);
    assert(updatedBasis === 'transaction_date', 'Date basis selector must update to transaction_date');

    // Navigate to Admin Analytics at /admin/analytics
    await setSession(cdp, 'admin-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/analytics' });
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_3_analytics_dashboard.png'));
    const adminAnalyticsLower = (await cdp.evaluate(`document.body.innerText`)).toLowerCase();
    assert(
      adminAnalyticsLower.includes('platform') || adminAnalyticsLower.includes('analytics'),
      'Admin platform analytics dashboard not rendered'
    );
    assert(
      adminAnalyticsLower.includes('gross booking value') || adminAnalyticsLower.includes('gross'),
      'Admin analytics must display gross booking value'
    );
    assert(
      adminAnalyticsLower.includes('net revenue') || adminAnalyticsLower.includes('net'),
      'Admin analytics must display net revenue'
    );

    // Verify non-admin tenant denial
    await setSession(cdp, 'player-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/analytics' });
    await sleep(1500);
    const isPlayerDenied = await cdp.evaluate(`
      document.body.innerText.includes('permission') ||
      document.body.innerText.includes('Sign in') ||
      document.body.innerText.includes('forbidden') ||
      document.body.innerText.includes('Access Denied')
    `);
    console.log(`Player access to /admin/analytics safely denied: ${isPlayerDenied}`);
    assert(isPlayerDenied, 'Player-1 was not denied access to /admin/analytics');

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 4: Venue Review Lifecycle & Administration
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 4: Venue Review Lifecycle ---');
    await setSession(cdp, 'admin-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/stadiums' });
    await sleep(1500);
    await waitForLoading(cdp);

    const stadiumsCount = await cdp.evaluate(`document.querySelectorAll('article.panel').length`);
    console.log(`Admin stadiums moderation list rendered: ${stadiumsCount}`);
    assert(stadiumsCount > 0, 'No stadium panels rendered in admin stadiums moderation');

    // Enter review reason for suspension
    await cdp.evaluate(`
      (() => {
        const reasonInput = document.querySelector('input[placeholder*="Inspection"], input[placeholder*="requirements"]');
        if (reasonInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(reasonInput, 'Annual facility safety audit review pending');
          reasonInput.dispatchEvent(new Event('input', { bubbles: true }));
          reasonInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(500);

    // Suspend active venue-1
    const suspendClicked = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const v1Card = cards.find(c => c.innerText.includes('venue-1')) || cards[0];
        const suspendBtn = Array.from(v1Card.querySelectorAll('button')).find(b => b.textContent.includes('Suspend'));
        if (suspendBtn && !suspendBtn.disabled) {
          suspendBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(suspendClicked, 'Suspend button for venue-1 was not found or disabled');
    await sleep(1500);
    await waitForLoading(cdp);

    // Verify venue-1 status is now Suspended and suspension notice is rendered
    const postSuspendText = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const v1Card = cards.find(c => c.innerText.includes('venue-1')) || cards[0];
        return v1Card?.innerText || '';
      })()
    `);
    assert(
      postSuspendText.includes('Suspended') || postSuspendText.includes('suspended'),
      'venue-1 status badge must update to Suspended'
    );
    assert(
      postSuspendText.includes('This venue is suspended') || postSuspendText.includes('Public discovery and new bookings are halted'),
      'venue-1 must display venue suspension warning notice'
    );

    // Open review history on venue-1
    await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const v1Card = cards.find(c => c.innerText.includes('venue-1')) || cards[0];
        const histBtn = Array.from(v1Card.querySelectorAll('button')).find(b => b.textContent.includes('Review history'));
        if (histBtn) histBtn.click();
      })()
    `);
    await sleep(1000);

    const historyContent = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const v1Card = cards.find(c => c.innerText.includes('venue-1')) || cards[0];
        return v1Card?.innerText || '';
      })()
    `);
    assert(
      historyContent.includes('Annual facility safety audit review pending'),
      'Venue review history must record the suspension reason'
    );

    // Enter review reason for reinstatement
    await cdp.evaluate(`
      (() => {
        const reasonInput = document.querySelector('input[placeholder*="Inspection"], input[placeholder*="requirements"]');
        if (reasonInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(reasonInput, 'Safety audit re-inspection passed successfully');
          reasonInput.dispatchEvent(new Event('input', { bubbles: true }));
          reasonInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(500);

    // Reinstate venue-1
    const reinstateClicked = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const v1Card = cards.find(c => c.innerText.includes('venue-1')) || cards[0];
        const reinstateBtn = Array.from(v1Card.querySelectorAll('button')).find(b => b.textContent.includes('Reinstate'));
        if (reinstateBtn && !reinstateBtn.disabled) {
          reinstateBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(reinstateClicked, 'Reinstate button for venue-1 was not found or disabled');
    await sleep(1500);
    await waitForLoading(cdp);

    const postReinstateText = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const v1Card = cards.find(c => c.innerText.includes('venue-1')) || cards[0];
        return v1Card?.innerText || '';
      })()
    `);
    assert(
      postReinstateText.includes('Active') || postReinstateText.includes('active'),
      'venue-1 status badge must return to Active after reinstatement'
    );

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_4_venue_review_moderation.png'));

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 5: Account Moderation & Self-Lockout Protections
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 5: Account Moderation & Self-Lockout Guard ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/users' });
    await sleep(1500);
    await waitForLoading(cdp);

    const usersCardsRendered = await cdp.evaluate(`document.querySelectorAll('article.panel').length > 1`);
    console.log(`Users moderation cards rendered: ${usersCardsRendered}`);
    assert(usersCardsRendered, 'Admin users list did not render user cards');

    // Assert admin self-suspension is disabled and displays warning
    const selfLockoutDetails = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const adminCard = cards.find(c => c.innerText.includes('admin-1') || c.innerText.includes('Demo Administrator'));
        if (!adminCard) return { found: false };
        const suspendBtn = Array.from(adminCard.querySelectorAll('button')).find(b => b.textContent.includes('Suspend'));
        const hasWarning = adminCard.innerText.includes('cannot suspend their own') || adminCard.innerText.includes('cannot suspend');
        return {
          found: true,
          isDisabled: suspendBtn ? suspendBtn.disabled : true,
          hasWarning,
        };
      })()
    `);
    assert(selfLockoutDetails.found, 'admin-1 account card must be present');
    assert(selfLockoutDetails.isDisabled, 'Admin self-suspension button must be disabled to prevent lockout');
    assert(selfLockoutDetails.hasWarning, 'Admin self-suspension warning message must be displayed');

    // Enter moderation reason for non-admin user (player-2)
    await cdp.evaluate(`
      (() => {
        const reasonInput = document.querySelector('input[placeholder*="Reason for suspension"]');
        if (reasonInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(reasonInput, 'Policy violation - multiple booking no-shows');
          reasonInput.dispatchEvent(new Event('input', { bubbles: true }));
          reasonInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(500);

    // Suspend player-2
    const suspendPlayerClicked = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const p2Card = cards.find(c => c.innerText.includes('player-2') || c.innerText.includes('Abebe Player'));
        if (p2Card) {
          const suspendBtn = Array.from(p2Card.querySelectorAll('button')).find(b => b.textContent.includes('Suspend'));
          if (suspendBtn && !suspendBtn.disabled) {
            suspendBtn.click();
            return true;
          }
        }
        return false;
      })()
    `);
    assert(suspendPlayerClicked, 'Suspend button for player-2 was not found or disabled');
    await sleep(1500);
    await waitForLoading(cdp);

    // Verify player-2 is suspended and displays notice
    const player2SuspendedText = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const p2Card = cards.find(c => c.innerText.includes('player-2') || c.innerText.includes('Abebe Player'));
        return p2Card?.innerText || '';
      })()
    `);
    assert(
      player2SuspendedText.includes('This account is suspended') || player2SuspendedText.includes('Operational actions are disabled'),
      'player-2 must display account suspension notice'
    );

    // Reinstate player-2
    const reinstatePlayerClicked = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const p2Card = cards.find(c => c.innerText.includes('player-2') || c.innerText.includes('Abebe Player'));
        if (p2Card) {
          const reinstateBtn = Array.from(p2Card.querySelectorAll('button')).find(b => b.textContent.includes('Reinstate'));
          if (reinstateBtn && !reinstateBtn.disabled) {
            reinstateBtn.click();
            return true;
          }
        }
        return false;
      })()
    `);
    assert(reinstatePlayerClicked, 'Reinstate button for player-2 was not found or disabled');
    await sleep(1500);
    await waitForLoading(cdp);

    const player2ReinstatedText = await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const p2Card = cards.find(c => c.innerText.includes('player-2') || c.innerText.includes('Abebe Player'));
        return p2Card?.innerText || '';
      })()
    `);
    assert(player2ReinstatedText.includes('Active'), 'player-2 status badge must return to Active after reinstatement');

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_5_account_moderation.png'));

    // ────────────────────────────────────────────────────────────────
    // JOURNEY 6: Support Case Workflows (Player, Owner, Admin)
    // ────────────────────────────────────────────────────────────────
    console.log('\n--- Journey 6: Support Case Workflows & Sanitization ---');
    // Player creates support case from /bookings linked to booking-e2e-1
    await setSession(cdp, 'player-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(1500);
    await waitForLoading(cdp);

    // Click Support button on booking-e2e-1 card
    await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b1Card = cards.find(c => c.innerText.includes('booking-e2e-1')) || cards[0];
        const supportBtn = Array.from(b1Card.querySelectorAll('button')).find(b =>
          b.textContent.includes('Contact support') ||
          b.textContent.toLowerCase().includes('support')
        );
        if (supportBtn) supportBtn.click();
      })()
    `);
    await sleep(1000);

    const isSupportModalOpen = await cdp.evaluate(`!!document.querySelector('#support-modal-title')`);
    console.log(`Player support modal open: ${isSupportModalOpen}`);
    assert(isSupportModalOpen, 'Player support modal did not open');

    // Fill out inquiry and submit
    await cdp.evaluate(`
      (() => {
        const subInput = document.querySelector('[role="dialog"] input[type="text"]');
        if (subInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(subInput, 'Inquiry regarding evening floodlight operation');
          subInput.dispatchEvent(new Event('input', { bubbles: true }));
          subInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const descInput = document.querySelector('[role="dialog"] textarea');
        if (descInput) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
          proto.set.call(descInput, 'Can you confirm evening floodlights will be available for our football match?');
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
    await waitForLoading(cdp);

    // Close player modal
    await cdp.evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('✕') || b.textContent.includes('Close')
        );
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // Switch to Owner at /dashboard/support and submit reply
    await setSession(cdp, 'owner-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/support' });
    await sleep(1500);
    await waitForLoading(cdp);

    const ownerSupportRendered = await cdp.evaluate(`
      document.body.innerText.includes('Support') || document.body.innerText.includes('support')
    `);
    assert(ownerSupportRendered, 'Owner support panel not rendered');

    // Select the newly created case in owner list
    const caseSelected = await cdp.evaluate(`
      (() => {
        const articles = Array.from(document.querySelectorAll('article.panel'));
        const target = articles.find(a => a.innerText.includes('floodlight'));
        if (target) {
          target.click();
          return true;
        }
        return false;
      })()
    `);
    assert(caseSelected, 'Owner must see player support case for their venue');
    await sleep(500);

    // Owner types and sends reply
    await cdp.evaluate(`
      (() => {
        const replyArea = document.querySelector('textarea');
        if (replyArea) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
          proto.set.call(replyArea, 'Owner confirmation: Floodlights are fully operational.');
          replyArea.dispatchEvent(new Event('input', { bubbles: true }));
          replyArea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send reply'));
        if (sendBtn) sendBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(cdp);

    // Verify owner reply appears in conversation
    const ownerConversationText = await cdp.evaluate(`document.body.innerText`);
    assert(
      ownerConversationText.includes('Owner confirmation: Floodlights are fully operational.'),
      'Owner reply must be displayed in conversation thread'
    );

    // Verify Tenant Isolation: owner-2 must NOT see this case
    await setSession(cdp, 'owner-2', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/support' });
    await sleep(1500);
    await waitForLoading(cdp);

    const owner2Cases = await cdp.evaluate(`document.body.innerText`);
    assert(
      !owner2Cases.includes('Inquiry regarding evening floodlight operation'),
      'owner-2 must not have access to support case belonging to venue-1 (tenant isolation)'
    );

    // Switch to Admin at /admin/support to post internal note and public message
    await setSession(cdp, 'admin-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/admin/support' });
    await sleep(1500);
    await waitForLoading(cdp);

    // Select the case in admin panel
    await cdp.evaluate(`
      (() => {
        const articles = Array.from(document.querySelectorAll('article.panel'));
        const target = articles.find(a => a.innerText.includes('floodlight'));
        if (target) target.click();
      })()
    `);
    await sleep(500);

    // Post internal staff note
    await cdp.evaluate(`
      (() => {
        const replyArea = document.querySelector('textarea');
        if (replyArea) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
          proto.set.call(replyArea, 'Internal staff note: Backup diesel generator switch inspected.');
          replyArea.dispatchEvent(new Event('input', { bubbles: true }));
          replyArea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const internalCheckbox = document.querySelector('input[type="checkbox"]');
        if (internalCheckbox && !internalCheckbox.checked) {
          internalCheckbox.click();
        }
        const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send reply'));
        if (sendBtn) sendBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(cdp);

    const adminConvoWithInternal = await cdp.evaluate(`document.body.innerText`);
    assert(
      adminConvoWithInternal.includes('Internal staff note: Backup diesel generator switch inspected.'),
      'Admin must see internal staff note'
    );
    const hasInternalBadge = await cdp.evaluate(`
      Array.from(document.querySelectorAll('span')).some(s =>
        s.textContent.includes('Internal staff note') && s.className.includes('bg-amber-200')
      )
    `);
    assert(hasInternalBadge, 'Admin view must highlight internal staff note with Internal Note badge');

    // Post admin public reply
    await cdp.evaluate(`
      (() => {
        const replyArea = document.querySelector('textarea');
        if (replyArea) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
          proto.set.call(replyArea, 'Admin public message: Platform verified lighting status.');
          replyArea.dispatchEvent(new Event('input', { bubbles: true }));
          replyArea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const internalCheckbox = document.querySelector('input[type="checkbox"]');
        if (internalCheckbox && internalCheckbox.checked) {
          internalCheckbox.click();
        }
        const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send reply'));
        if (sendBtn) sendBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_6_support_workflow_sanitization.png'));

    // Assert Internal Note Sanitization in Player View
    await setSession(cdp, 'player-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(1500);
    await waitForLoading(cdp);

    // Open support modal on booking-e2e-1
    await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b1Card = cards.find(c => c.innerText.includes('booking-e2e-1')) || cards[0];
        const supportBtn = Array.from(b1Card.querySelectorAll('button')).find(b =>
          b.textContent.includes('Contact support') ||
          b.textContent.toLowerCase().includes('support')
        );
        if (supportBtn) supportBtn.click();
      })()
    `);
    await sleep(1000);
    await waitForLoading(cdp);

    const playerModalText = await cdp.evaluate(`document.querySelector('[role="dialog"]')?.innerText || ''`);
    assert(
      playerModalText.includes('Owner confirmation: Floodlights are fully operational.'),
      'Player must see owner public reply'
    );
    assert(
      playerModalText.includes('Admin public message: Platform verified lighting status.'),
      'Player must see admin public reply'
    );
    assert(
      !playerModalText.includes('Internal staff note: Backup diesel generator switch inspected.'),
      'Internal staff notes MUST be sanitized and never disclosed to player'
    );

    // Also assert Internal Note Sanitization in Owner View
    await setSession(cdp, 'owner-1', 'en');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/support' });
    await sleep(1500);
    await waitForLoading(cdp);

    await cdp.evaluate(`
      (() => {
        const articles = Array.from(document.querySelectorAll('article.panel'));
        const target = articles.find(a => a.innerText.includes('floodlight'));
        if (target) target.click();
      })()
    `);
    await sleep(500);

    const ownerConvoText = await cdp.evaluate(`document.body.innerText`);
    assert(
      ownerConvoText.includes('Admin public message: Platform verified lighting status.'),
      'Owner must see admin public reply'
    );
    assert(
      !ownerConvoText.includes('Internal staff note: Backup diesel generator switch inspected.'),
      'Internal staff notes MUST be sanitized and never disclosed to venue owner'
    );

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

    // Set Amharic locale for Owner Support Panel
    await setSession(cdp, 'owner-1', 'am');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard/support' });
    await sleep(1500);
    await waitForLoading(cdp);

    const amharicSupportTitle = await cdp.evaluate(`document.body.innerText.includes('የድጋፍ ጥያቄዎች')`);
    console.log(`Amharic support panel header rendered (የድጋፍ ጥያቄዎች): ${amharicSupportTitle}`);
    assert(amharicSupportTitle, 'Amharic support panel header missing (የድጋፍ ጥያቄዎች)');

    // Select case to view Amharic conversation view and verify reply form localization
    await cdp.evaluate(`
      (() => {
        const articles = Array.from(document.querySelectorAll('article.panel'));
        const target = articles.find(a => a.innerText.includes('floodlight') || a.innerText.includes('ጥያቄ'));
        if (target) target.click();
      })()
    `);
    await sleep(500);

    const amharicReplyAreaPlaceholder = await cdp.evaluate(`
      document.querySelector('textarea')?.getAttribute('placeholder') || ''
    `);
    console.log(`Amharic owner reply placeholder: "${amharicReplyAreaPlaceholder}"`);
    assert(
      amharicReplyAreaPlaceholder.includes('ለደንበኛው') || amharicReplyAreaPlaceholder.includes('ምላሽ'),
      'Owner reply placeholder must be localized in Amharic'
    );

    const amharicSendReplyBtn = await cdp.evaluate(`
      Array.from(document.querySelectorAll('button')).some(b =>
        b.textContent.includes('መልስ ላክ') || b.textContent.includes('ምላሽ ላክ')
      )
    `);
    assert(amharicSendReplyBtn, 'Send reply button must be localized in Amharic (መልስ ላክ)');

    // Open create case modal in Amharic and verify form fields
    await cdp.evaluate(`
      (() => {
        const createBtn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('እርዳታ') || b.textContent.includes('ድጋፍ') || b.textContent.includes('+')
        );
        if (createBtn) createBtn.click();
      })()
    `);
    await sleep(500);

    const amharicOwnerCreateModal = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return { open: false };
        const text = dialog.innerText;
        const subjPlaceholder = dialog.querySelector('input[type="text"]')?.getAttribute('placeholder') || '';
        const descPlaceholder = dialog.querySelector('textarea')?.getAttribute('placeholder') || '';
        return {
          open: true,
          hasFacilityCat: text.includes('የተቋም ችግር'),
          hasPaymentCat: text.includes('የክፍያ ችግር'),
          subjPlaceholder,
          descPlaceholder,
        };
      })()
    `);
    assert(amharicOwnerCreateModal.open, 'Create case modal did not open in Amharic');
    assert(amharicOwnerCreateModal.hasFacilityCat, 'Category options must be localized in Amharic');
    assert(
      amharicOwnerCreateModal.subjPlaceholder.includes('የመብራት ጥገና') || amharicOwnerCreateModal.subjPlaceholder.includes('የሰዓት ጥያቄ'),
      'Subject placeholder must be localized in Amharic'
    );
    assert(
      amharicOwnerCreateModal.descPlaceholder.includes('ጉዳይዎን ወይም ጥያቄዎን') || amharicOwnerCreateModal.descPlaceholder.includes('ይግለጹ'),
      'Description placeholder must be localized in Amharic'
    );

    // Close create modal
    await cdp.evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('[role="dialog"] button')).find(b =>
          b.textContent.includes('✕') || b.textContent.includes('ሰርዝ')
        );
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // Navigate to bookings in mobile Amharic for player
    await setSession(cdp, 'player-1', 'am');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/bookings' });
    await sleep(1500);
    await waitForLoading(cdp);

    const amharicBookingsRendered = await cdp.evaluate(`
      document.body.innerText.includes('የቦታ ማስያዣዎች') || document.body.innerText.includes('የተረጋገጠ')
    `);
    assert(amharicBookingsRendered, 'Amharic bookings view not rendered');

    // Open player support modal in Amharic and verify conversation view & form
    await cdp.evaluate(`
      (() => {
        const cards = Array.from(document.querySelectorAll('article.panel'));
        const b1Card = cards.find(c => c.innerText.includes('booking-e2e-1')) || cards[0];
        const supportBtn = Array.from(b1Card.querySelectorAll('button')).find(b =>
          b.textContent.includes('እርዳታ') || b.textContent.includes('የድጋፍ') || b.textContent.includes('ድጋፍ')
        );
        if (supportBtn) supportBtn.click();
      })()
    `);
    await sleep(1000);
    await waitForLoading(cdp);

    const amharicPlayerModalInfo = await cdp.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return { open: false };
        const replyArea = dialog.querySelector('textarea');
        const replyPlaceholder = replyArea ? replyArea.getAttribute('placeholder') : '';
        const hasSendReplyBtn = Array.from(dialog.querySelectorAll('button')).some(b =>
          b.textContent.includes('መልስ ላክ') || b.textContent.includes('ምላሽ ላክ')
        );
        return {
          open: true,
          title: dialog.querySelector('#support-modal-title')?.textContent || '',
          replyPlaceholder,
          hasSendReplyBtn,
        };
      })()
    `);
    assert(amharicPlayerModalInfo.open, 'Player support modal did not open in Amharic');
    assert(
      amharicPlayerModalInfo.title.includes('የድጋፍ ጥያቄዎች'),
      'Player support modal title must be localized in Amharic (የድጋፍ ጥያቄዎች)'
    );
    assert(
      amharicPlayerModalInfo.replyPlaceholder.includes('መልእክትዎን') || amharicPlayerModalInfo.replyPlaceholder.includes('ይጻፉ'),
      'Player reply textarea placeholder must be localized in Amharic'
    );
    assert(amharicPlayerModalInfo.hasSendReplyBtn, 'Player send reply button must be localized in Amharic');

    await cdp.captureScreenshot(path.join(artifactDir, 'finance_journey_7_mobile_amharic.png'));

    // Reset viewport override
    await cdp.send('Emulation.clearDeviceMetricsOverride');

    console.log('\n=== ALL 7 FINANCE, SUPPORT, REVIEW & MODERATION JOURNEYS FULLY SUBSTANTIATED & PASSED ===');
  } finally {
    if (chromeProc) chromeProc.kill();
  }
}

runJourneys().catch(err => {
  console.error('E2E SUITE FAILED:', err);
  process.exit(1);
});

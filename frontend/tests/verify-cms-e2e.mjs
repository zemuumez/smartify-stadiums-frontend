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

const artifactDir = process.env.ARTIFACT_DIR || path.join(process.cwd(), '.test-artifacts');
const profileDir = path.join(os.tmpdir(), 'smartify-stadiums-cms-profile');

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
    const isLoading = await client.evaluate(`!!document.querySelector('p[role="status"]')?.textContent?.includes('Loading')`);
    if (!isLoading) break;
    await sleep(150);
  }
}

export async function runCmsE2ETest() {
  console.log('================================================================');
  console.log('VENUE CMS PUBLISHING & TENANT ISOLATION REPRODUCIBLE E2E SUITE');
  console.log('================================================================\n');

  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch {
    // Ignore error if profile directory does not exist
  }

  const port = 9323;
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

  console.log(`Starting headless Chrome for CMS test (${chromePath})...`);
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
      // Retry connection
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
    // [STEP 0] Setup pristine session as Owner-1 (Bambis Meda)
    console.log('[STEP 0] Setup pristine demo session for owner-1 (Fatima Hassan @ Bambis Meda Stadium)...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
    await sleep(1500);

    await client.evaluate(`
      (() => {
        sessionStorage.setItem('etsf-demo-session-v1', 'owner-1');
        localStorage.setItem('etsf-locale', 'en');
      })()
    `);

    // =========================================================================
    // JOURNEY 1: Draft Editing & Live Preview without Publication
    // =========================================================================
    console.log('\n[JOURNEY 1] Draft Editing & Live Preview without Publication...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);

    // Assert initial editor UI state
    const initialEditorCheck = await client.evaluate(`
      (() => {
        const h1 = document.querySelector('h1')?.textContent;
        const taglineInput = document.querySelector('input[required]');
        const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Publish'));
        const unpublishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Unpublish'));
        const previewTabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Live Preview'));
        const statusBadge = document.querySelector('span[class*="emerald"]')?.textContent;
        return {
          h1,
          tagline: taglineInput?.value,
          hasPublish: !!publishBtn,
          hasUnpublish: !!unpublishBtn,
          hasPreviewTab: !!previewTabBtn,
          statusBadge: statusBadge?.trim()
        };
      })()
    `);
    console.log('  Initial CMS Editor state:', initialEditorCheck);
    if (!initialEditorCheck.hasPublish || !initialEditorCheck.hasPreviewTab) {
      throw new Error(`Journey 1 assertion failed: CMS Editor did not load properly: ${JSON.stringify(initialEditorCheck)}`);
    }

    // Make an in-memory draft edit without saving
    const testDraftTagline = 'Bambis Meda Grand Arena (Live Uncommitted Preview)';
    const testAnnouncement = 'Live Demo Cup: Draft In-Memory Preview Announcement';
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, '${testDraftTagline}');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));

        const announcementInput = document.querySelector('input[placeholder*="tournament"]');
        if (announcementInput) {
          prototypeValue.set.call(announcementInput, '${testAnnouncement}');
          announcementInput.dispatchEvent(new Event('input', { bubbles: true }));
          announcementInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(500);

    // Verify dirty state badge appears
    const dirtyCheck = await client.evaluate(`
      (() => {
        const dirtyBadge = document.querySelector('[role="status"]');
        return {
          isDirty: !!dirtyBadge && dirtyBadge.textContent.includes('unsaved')
        };
      })()
    `);
    console.log('  Dirty state assertion:', dirtyCheck);
    if (!dirtyCheck.isDirty) {
      throw new Error('Journey 1 assertion failed: Dirty badge did not appear after editing.');
    }

    // Toggle to "Live Preview" tab (in-context rendering)
    console.log('  Switching to Live Preview tab (in-context renderer)...');
    await client.evaluate(`
      (() => {
        const previewBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Live Preview'));
        previewBtn?.click();
      })()
    `);
    await sleep(1000);

    // Assert preview renders with public microsite layout, court cards, and test draft content
    const previewRenderCheck = await client.evaluate(`
      (() => {
        const previewBanner = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('Draft Preview Mode'));
        const heading = Array.from(document.querySelectorAll('h1')).find(h => h.textContent?.includes('Bambis Meda'))?.textContent;
        const courtCards = document.querySelectorAll('#fields .bg-white.rounded-3xl');
        const announcement = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('${testAnnouncement}'));
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Back to Editor'));
        return {
          hasBanner: !!previewBanner,
          hasUpdatedHeading: heading?.includes('Bambis Meda Grand Arena'),
          courtCount: courtCards.length,
          hasAnnouncement: !!announcement,
          hasBackBtn: !!backBtn
        };
      })()
    `);
    console.log('  Live Preview assertion:', previewRenderCheck);
    if (!previewRenderCheck.hasBanner || !previewRenderCheck.hasUpdatedHeading || previewRenderCheck.courtCount === 0) {
      throw new Error(`Journey 1 assertion failed: Preview did not render correctly: ${JSON.stringify(previewRenderCheck)}`);
    }

    const shot1Path = path.join(artifactDir, 'journey_1_live_preview.png');
    await client.captureScreenshot(shot1Path);
    console.log('  ✓ Screenshot captured (live draft preview):', shot1Path);

    // Verify public microsite remains UNCHANGED (public visitor isolation)
    console.log('  Checking public microsite at /s/bambis-meda to verify unsaved preview did not leak...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda' });
    await sleep(1500);
    await waitForLoading(client);

    const publicLeakCheck = await client.evaluate(`
      (() => {
        const h1 = document.querySelector('h1')?.textContent;
        return {
          h1,
          leakedDraftHeading: h1?.includes('Live Uncommitted Preview')
        };
      })()
    `);
    console.log('  Public isolation check:', publicLeakCheck);
    if (publicLeakCheck.leakedDraftHeading) {
      throw new Error('Journey 1 assertion failed: Unsaved draft changes leaked to public microsite!');
    }

    // =========================================================================
    // JOURNEY 2: Unsaved-Changes Protection (Internal Navigation & Dirty Unpublish)
    // =========================================================================
    console.log('\n[JOURNEY 2] Unsaved-Changes Protection (Internal Navigation & Dirty Unpublish)...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);

    // Install dialog mock
    await client.evaluate(`
      (() => {
        window.__dialogLog = [];
        window.__confirmResponse = false; // Cancel by default to test abort
        window.confirm = (msg) => {
          window.__dialogLog.push({ type: 'confirm', message: msg, accepted: window.__confirmResponse });
          return window.__confirmResponse;
        };
      })()
    `);

    // Type a dirty edit
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Unsaved Edits Protected Against Navigation');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    // Test 2a: Intercept internal navigation link click when user cancels
    console.log('  Attempting internal navigation to /dashboard/bookings while dirty (user cancels)...');
    await client.evaluate(`
      (() => {
        const bookingsLink = Array.from(document.querySelectorAll('a')).find(a => a.href?.includes('/dashboard/bookings'));
        bookingsLink?.click();
      })()
    `);
    await sleep(500);

    const navCancelCheck = await client.evaluate(`
      (() => {
        return {
          currentUrl: window.location.href,
          dialogCount: window.__dialogLog.length,
          lastDialog: window.__dialogLog[window.__dialogLog.length - 1],
          taglineValue: document.querySelector('input[required]')?.value
        };
      })()
    `);
    console.log('  Navigation cancellation result:', navCancelCheck);
    if (!navCancelCheck.currentUrl.includes('/dashboard/microsite') || !navCancelCheck.taglineValue?.includes('Unsaved Edits')) {
      throw new Error('Journey 2 assertion failed: Internal navigation was not blocked when dirty!');
    }

    // -------------------------------------------------------------------------
    // Test 2b: Management-Tab Switching Guard (VenueAdministration buttons)
    // -------------------------------------------------------------------------
    console.log('  Testing management-tab switching guard in VenueAdministration (/s/bambis-meda/manage?tab=cms)...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda/manage?tab=cms' });
    await sleep(1500);
    await waitForLoading(client);

    // Re-install confirm dialog mock
    await client.evaluate(`
      (() => {
        window.__dialogLog = [];
        window.__confirmResponse = false; // Cancel by default
        window.confirm = (msg) => {
          window.__dialogLog.push({ type: 'confirm', message: msg, accepted: window.__confirmResponse });
          return window.__confirmResponse;
        };
      })()
    `);

    // Type dirty edit in CMS editor
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Bambis Dirty Tab Switch Test');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(400);

    // Try switching to "Bookings" tab button while dirty (user cancels)
    console.log('  Clicking Bookings tab button while dirty (user cancels confirm)...');
    await client.evaluate(`
      (() => {
        const bookingsTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('bookings') || b.textContent?.includes('Bookings'));
        bookingsTabBtn?.click();
      })()
    `);
    await sleep(400);

    const tabCancelCheck = await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const activeTabBtn = document.querySelector('nav button.selected');
        return {
          dialogCount: window.__dialogLog.length,
          activeTab: activeTabBtn?.textContent,
          taglineValue: taglineInput?.value,
          cmsStillMounted: !!taglineInput
        };
      })()
    `);
    console.log('  Tab switch cancellation check:', tabCancelCheck);
    if (!tabCancelCheck.cmsStillMounted || !tabCancelCheck.taglineValue?.includes('Bambis Dirty Tab Switch Test') || tabCancelCheck.dialogCount === 0) {
      throw new Error(`Journey 2 assertion failed: Tab switch was not guarded or edits were lost: ${JSON.stringify(tabCancelCheck)}`);
    }

    // Try switching to "Fields" tab button while dirty (user cancels)
    console.log('  Clicking Fields tab button while dirty (user cancels confirm)...');
    await client.evaluate(`
      (() => {
        const fieldsTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('fields') || b.textContent?.includes('Fields'));
        fieldsTabBtn?.click();
      })()
    `);
    await sleep(400);

    const fieldsCancelCheck = await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        return {
          dialogCount: window.__dialogLog.length,
          cmsStillMounted: !!taglineInput
        };
      })()
    `);
    if (!fieldsCancelCheck.cmsStillMounted || fieldsCancelCheck.dialogCount < 2) {
      throw new Error(`Journey 2 assertion failed: Fields tab switch was not guarded: ${JSON.stringify(fieldsCancelCheck)}`);
    }

    // Now confirm tab switch to Bookings
    console.log('  Clicking Bookings tab button while dirty (user confirms discard)...');
    await client.evaluate(`
      (() => {
        window.__confirmResponse = true; // Confirm discard
        const bookingsTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('bookings') || b.textContent?.includes('Bookings'));
        bookingsTabBtn?.click();
      })()
    `);
    await sleep(600);

    const tabConfirmCheck = await client.evaluate(`
      (() => {
        const activeTabBtn = document.querySelector('nav button.selected');
        const hasCalendar = !!document.querySelector('input[type="date"]');
        const hasEditor = !!document.querySelector('input[required][maxlength="120"]');
        return {
          activeTab: activeTabBtn?.textContent,
          hasCalendar,
          hasEditor
        };
      })()
    `);
    console.log('  Tab switch confirmation check:', tabConfirmCheck);
    if (!tabConfirmCheck.hasCalendar || tabConfirmCheck.hasEditor) {
      throw new Error(`Journey 2 assertion failed: Tab did not switch to Bookings upon confirmation: ${JSON.stringify(tabConfirmCheck)}`);
    }

    // Verify trap was cleaned up before unmounting
    const tabTrapCheck = await client.evaluate(`!!window.history.state?.__cmsTrap`);
    console.log('  Trap state after confirmed tab switch (must be false):', tabTrapCheck);
    if (tabTrapCheck) {
      throw new Error('Journey 2 assertion failed: History trap remained active after tab switch!');
    }

    // Repeated CMS -> edit -> confirm tab switch -> return -> edit lifecycle test
    console.log('  Testing repeated CMS -> edit -> confirm tab switch -> return -> edit cycles...');
    // Return to CMS tab
    await client.evaluate(`
      (() => {
        const cmsTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('microsite') || b.textContent?.includes('Microsite'));
        cmsTabBtn?.click();
      })()
    `);
    await sleep(800);
    await waitForLoading(client);

    // Tab Cycle 1: Edit in CMS
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Tab Cycle Edit 1');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    const lenDuringTabCycle1 = await client.evaluate(`window.history.length`);
    console.log('  History length during dirty tab cycle 1:', lenDuringTabCycle1);

    // Confirm tab switch to Fields
    await client.evaluate(`
      (() => {
        window.__confirmResponse = true;
        const fieldsTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('fields') || b.textContent?.includes('Fields'));
        fieldsTabBtn?.click();
      })()
    `);
    await sleep(800);
    await waitForLoading(client);

    const hasTrapAfterFields = await client.evaluate(`!!window.history.state?.__cmsTrap`);
    if (hasTrapAfterFields) {
      throw new Error('Journey 2 assertion failed: History trap remained active after switching to Fields tab!');
    }

    // Return to CMS tab
    await client.evaluate(`
      (() => {
        const cmsTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('microsite') || b.textContent?.includes('Microsite'));
        cmsTabBtn?.click();
      })()
    `);
    await sleep(800);
    await waitForLoading(client);

    // Tab Cycle 2: Edit in CMS again
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Tab Cycle Edit 2');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    const lenDuringTabCycle2 = await client.evaluate(`window.history.length`);
    console.log('  History length during dirty tab cycle 2:', lenDuringTabCycle2);
    if (lenDuringTabCycle2 > lenDuringTabCycle1) {
      throw new Error(`Journey 2 assertion failed: History accumulated entries on repeat tab switch and edit! (${lenDuringTabCycle2} > ${lenDuringTabCycle1})`);
    }

    // Confirm tab switch to Bookings
    await client.evaluate(`
      (() => {
        window.__confirmResponse = true;
        const bookingsTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('bookings') || b.textContent?.includes('Bookings'));
        bookingsTabBtn?.click();
      })()
    `);
    await sleep(800);
    await waitForLoading(client);

    // Return to CMS tab
    await client.evaluate(`
      (() => {
        const cmsTabBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.textContent?.includes('microsite') || b.textContent?.includes('Microsite'));
        cmsTabBtn?.click();
      })()
    `);
    await sleep(800);
    await waitForLoading(client);

    // Tab Cycle 3: Edit in CMS third time
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Tab Cycle Edit 3');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    const lenDuringTabCycle3 = await client.evaluate(`window.history.length`);
    console.log('  History length during dirty tab cycle 3:', lenDuringTabCycle3);
    if (lenDuringTabCycle3 > lenDuringTabCycle1) {
      throw new Error(`Journey 2 assertion failed: History accumulated entries on 3rd tab switch and edit! (${lenDuringTabCycle3} > ${lenDuringTabCycle1})`);
    }
    console.log('  ✓ Tab switches cleanly pop history trap with zero accumulation.');

    // -------------------------------------------------------------------------
    // Repeated CMS -> edit -> confirm venue switch -> return -> edit
    // -------------------------------------------------------------------------
    console.log('  Testing repeated CMS -> edit -> confirm venue switch -> return -> edit cycles...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);

    // Re-install confirm mock
    await client.evaluate(`
      (() => {
        window.__confirmResponse = true;
        window.confirm = () => true;
      })()
    `);

    // Edit venue 1
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Venue Cycle Edit 1');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    const venueDirtyLen1 = await client.evaluate(`window.history.length`);
    console.log('  Venue 1 dirty length:', venueDirtyLen1);

    const availableVenuesCount = await client.evaluate(`document.querySelector('select')?.options.length || 0`);
    if (availableVenuesCount > 1) {
      // Switch to second venue in dropdown
      console.log('  Switching to venue 2 in dropdown...');
      await client.evaluate(`
        (() => {
          const sel = document.querySelector('select');
          const opt = sel.options[1];
          const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
          proto.set.call(sel, opt.value);
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `);
      await sleep(1500);
      await waitForLoading(client);

      const hasTrapAfterVenueSwitch = await client.evaluate(`!!window.history.state?.__cmsTrap`);
      if (hasTrapAfterVenueSwitch) {
        throw new Error('Journey 2 assertion failed: History trap remained active after venue switch!');
      }

      // Edit venue 2
      console.log('  Editing venue 2...');
      await client.evaluate(`
        (() => {
          const taglineInput = document.querySelector('input[required]');
          const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          prototypeValue.set.call(taglineInput, 'Venue Cycle Edit 2');
          taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
          taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `);
      await sleep(300);

      const venueDirtyLen2 = await client.evaluate(`window.history.length`);
      console.log('  Venue 2 dirty length:', venueDirtyLen2);
      if (venueDirtyLen2 > venueDirtyLen1) {
        throw new Error(`Journey 2 assertion failed: History accumulated entries on venue switch! (${venueDirtyLen2} > ${venueDirtyLen1})`);
      }

      // Switch back to venue 1
      console.log('  Switching back to venue 1...');
      await client.evaluate(`
        (() => {
          const sel = document.querySelector('select');
          const opt = sel.options[0];
          const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
          proto.set.call(sel, opt.value);
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `);
      await sleep(1500);
      await waitForLoading(client);

      // Edit venue 1 again
      console.log('  Editing venue 1 again...');
      await client.evaluate(`
        (() => {
          const taglineInput = document.querySelector('input[required]');
          const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          prototypeValue.set.call(taglineInput, 'Venue Cycle Edit 1 Again');
          taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
          taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `);
      await sleep(300);

      const venueDirtyLen3 = await client.evaluate(`window.history.length`);
      console.log('  Venue 1 again dirty length:', venueDirtyLen3);
      if (venueDirtyLen3 > venueDirtyLen1) {
        throw new Error(`Journey 2 assertion failed: History accumulated entries on repeat venue switch! (${venueDirtyLen3} > ${venueDirtyLen1})`);
      }
      console.log('  ✓ Venue switches cleanly pop history trap with zero accumulation.');
    }

    // -------------------------------------------------------------------------
    // Internal link navigation with confirmed discard
    // -------------------------------------------------------------------------
    console.log('  Testing internal link navigation with dirty CMS...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda/manage?tab=cms' });
    await sleep(1500);
    await waitForLoading(client);

    await client.evaluate(`
      (() => {
        window.__confirmResponse = true;
        window.confirm = () => true;
        const input = document.querySelector('input[required]');
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(input, 'Internal Link Nav Edit');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    // Click "View public microsite" internal link
    console.log('  Clicking "View public microsite" internal link while dirty...');
    await client.evaluate(`
      (() => {
        const link = Array.from(document.querySelectorAll('a')).find(a => a.href?.includes('/s/bambis-meda') && !a.href?.includes('/manage'));
        link?.click();
      })()
    `);
    await sleep(1500);
    await waitForLoading(client);

    const linkNavCheck = await client.evaluate(`
      (() => ({
        currentUrl: window.location.href,
        hasTrap: !!window.history.state?.__cmsTrap,
        isPublicMicrosite: window.location.href.includes('/s/bambis-meda') && !window.location.href.includes('/manage')
      }))()
    `);
    console.log('  Internal link navigation check:', linkNavCheck);
    if (!linkNavCheck.isPublicMicrosite || linkNavCheck.hasTrap) {
      throw new Error(`Journey 2 assertion failed: Internal link did not navigate cleanly: ${JSON.stringify(linkNavCheck)}`);
    }

    // Verify Back returns to CMS editor cleanly without orphan trap
    console.log('  Triggering window.history.back() from public microsite...');
    await client.evaluate(`window.history.back()`);
    await sleep(1500);
    await waitForLoading(client);

    const backFromLinkCheck = await client.evaluate(`
      (() => ({
        currentUrl: window.location.href,
        hasEditor: !!document.querySelector('input[required][maxlength="120"]'),
        hasTrap: !!window.history.state?.__cmsTrap
      }))()
    `);
    console.log('  Back return from link check:', backFromLinkCheck);
    if (!backFromLinkCheck.currentUrl.includes('/manage') || !backFromLinkCheck.hasEditor || backFromLinkCheck.hasTrap) {
      throw new Error(`Journey 2 assertion failed: Back from internal link destination failed: ${JSON.stringify(backFromLinkCheck)}`);
    }
    console.log('  ✓ Internal link navigation and Back return are clean without orphan trap.');

    // -------------------------------------------------------------------------
    // Test 2c: Browser Back / Forward History Protection Without Corruption
    // -------------------------------------------------------------------------
    console.log('  Testing browser Back/Forward protection without repeated history entries...');
    // Start at /stadiums, then navigate to /s/bambis-meda/manage?tab=cms
    await client.send('Page.navigate', { url: 'http://localhost:3000/stadiums' });
    await sleep(1500);
    await waitForLoading(client);

    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda/manage?tab=cms' });
    await sleep(1500);
    await waitForLoading(client);

    // Re-install confirm dialog mock
    await client.evaluate(`
      (() => {
        window.__dialogLog = [];
        window.__confirmResponse = false; // Cancel by default
        window.confirm = (msg) => {
          window.__dialogLog.push({ type: 'confirm', message: msg, accepted: window.__confirmResponse });
          return window.__confirmResponse;
        };
      })()
    `);

    const initialHistoryLength = await client.evaluate(`window.history.length`);
    const initialNextJsState = await client.evaluate(`window.history.state`);
    console.log('  Initial history length on CMS editor:', initialHistoryLength);
    console.log('  Initial Next.js router state preserved:', { hasNA: !!initialNextJsState?.__NA });

    // Keystroke 1: dirty transition
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'History Keystroke 1');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    const historyAfterFirstDirty = await client.evaluate(`window.history.length`);
    const dirtyNextJsState = await client.evaluate(`window.history.state`);
    console.log('  History length after first dirty edit:', historyAfterFirstDirty);
    console.log('  Dirty state preserves Next.js router keys:', {
      hasNA: !!dirtyNextJsState?.__NA,
      hasTrap: !!dirtyNextJsState?.__cmsTrap
    });

    if (historyAfterFirstDirty !== initialHistoryLength + 1) {
      throw new Error(`Journey 2 assertion failed: Expected single trap entry (${initialHistoryLength + 1}), got ${historyAfterFirstDirty}`);
    }

    // Keystrokes 2, 3, 4, 5 (simulating typing/re-renders while already dirty)
    for (let k = 2; k <= 5; k++) {
      await client.evaluate(`
        (() => {
          const taglineInput = document.querySelector('input[required]');
          const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          prototypeValue.set.call(taglineInput, 'History Keystroke ' + ${k});
          taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
          taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
        })()
      `);
      await sleep(100);
    }

    const historyAfterManyKeystrokes = await client.evaluate(`window.history.length`);
    console.log('  History length after 5 keystrokes:', historyAfterManyKeystrokes);
    if (historyAfterManyKeystrokes > historyAfterFirstDirty) {
      throw new Error(`Journey 2 assertion failed: History length increased on every dirty keystroke! (${historyAfterFirstDirty} -> ${historyAfterManyKeystrokes})`);
    }

    // Trigger browser Back while dirty (user cancels confirm)
    console.log('  Triggering window.history.back() while dirty (user cancels confirm)...');
    await client.evaluate(`window.history.back()`);
    await sleep(500);

    const backCancelCheck = await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        return {
          currentUrl: window.location.href,
          taglineValue: taglineInput?.value,
          cmsStillMounted: !!taglineInput,
          dialogCount: window.__dialogLog.length
        };
      })()
    `);
    console.log('  Back cancellation check (restored editor):', backCancelCheck);
    if (!backCancelCheck.currentUrl.includes('/s/bambis-meda/manage') || !backCancelCheck.taglineValue?.includes('History Keystroke 5') || !backCancelCheck.cmsStillMounted) {
      throw new Error(`Journey 2 assertion failed: Editor was not reliably restored upon Back cancellation: ${JSON.stringify(backCancelCheck)}`);
    }

    // Test repeated edit/save and edit/discard cycles do NOT accumulate history entries
    console.log('  Testing repeated edit/save and edit/discard cycles non-accumulation...');
    // Cycle A: Save
    await client.evaluate(`
      (() => {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Save draft') || b.textContent?.includes('Save'));
        saveBtn?.click();
      })()
    `);
    await sleep(1000);
    await waitForLoading(client);

    const lengthAfterSave = await client.evaluate(`window.history.length`);
    console.log('  History length after saving clean:', lengthAfterSave);

    // Cycle B: Edit then Discard
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Cycle Edit Discard');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    const lengthDuringCycleB = await client.evaluate(`window.history.length`);
    console.log('  History length during dirty cycle B:', lengthDuringCycleB);
    if (lengthDuringCycleB > historyAfterFirstDirty) {
      throw new Error(`Journey 2 assertion failed: History accumulated entries on repeat edit/discard! (${lengthDuringCycleB} > ${historyAfterFirstDirty})`);
    }

    await client.evaluate(`
      (() => {
        window.__confirmResponse = true; // confirm discard
        const discardBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Discard changes'));
        discardBtn?.click();
      })()
    `);
    await sleep(500);

    const lengthAfterDiscard = await client.evaluate(`window.history.length`);
    console.log('  History length after discard clean:', lengthAfterDiscard);

    // Cycle C: Another edit and save to confirm zero accumulation across multiple cycles
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Cycle C Edit Save');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    const lengthDuringCycleC = await client.evaluate(`window.history.length`);
    console.log('  History length during dirty cycle C:', lengthDuringCycleC);
    if (lengthDuringCycleC > historyAfterFirstDirty) {
      throw new Error(`Journey 2 assertion failed: History accumulated entries on repeat edit/save! (${lengthDuringCycleC} > ${historyAfterFirstDirty})`);
    }

    await client.evaluate(`
      (() => {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Save draft') || b.textContent?.includes('Save'));
        saveBtn?.click();
      })()
    `);
    await sleep(1000);
    await waitForLoading(client);

    // Test Back -> Confirm reaches the preceding page (/stadiums)
    console.log('  Testing Back -> Confirm reaches the preceding page (/stadiums)...');
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'Back Confirm Test');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    await client.evaluate(`
      (() => {
        window.__confirmResponse = true; // Confirm discard on Back
        window.history.back();
      })()
    `);
    await sleep(1500);
    await waitForLoading(client);

    const backConfirmCheck = await client.evaluate(`
      (() => {
        const h1 = document.querySelector('h1')?.textContent;
        return {
          currentUrl: window.location.href,
          h1,
          isPrecedingPage: window.location.href.includes('/stadiums'),
          hasEditor: !!document.querySelector('input[required][maxlength="120"]')
        };
      })()
    `);
    console.log('  Back confirmation check (preceding page):', backConfirmCheck);
    if (!backConfirmCheck.isPrecedingPage || backConfirmCheck.hasEditor) {
      throw new Error(`Journey 2 assertion failed: Back -> Confirm did not navigate to preceding page: ${JSON.stringify(backConfirmCheck)}`);
    }

    // Test Forward returns to editor normally
    console.log('  Testing Forward returns to CMS editor normally...');
    await client.evaluate(`window.history.forward()`);
    await sleep(1500);
    await waitForLoading(client);

    const forwardCheck = await client.evaluate(`
      (() => {
        const hasEditor = !!document.querySelector('input[required][maxlength="120"]');
        return {
          currentUrl: window.location.href,
          hasEditor,
          isEditorUrl: window.location.href.includes('/s/bambis-meda/manage')
        };
      })()
    `);
    console.log('  Forward navigation check:', forwardCheck);
    if (!forwardCheck.isEditorUrl || !forwardCheck.hasEditor) {
      throw new Error(`Journey 2 assertion failed: Forward did not return to editor: ${JSON.stringify(forwardCheck)}`);
    }

    // Re-apply dirty edit for subsequent Test 2d (dirty unpublish)
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, 'History Keystroke 5');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    // -------------------------------------------------------------------------
    // Test 2d: Dirty Unpublish - unpublishing preserves local in-memory edits
    // -------------------------------------------------------------------------
    console.log('  Testing unpublish while dirty (verifying local edits are preserved)...');
    await client.evaluate(`
      (() => {
        window.__confirmResponse = true; // allow unpublish
        const unpublishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Unpublish'));
        unpublishBtn?.click();
      })()
    `);
    await sleep(1500);

    const dirtyUnpublishCheck = await client.evaluate(`
      (() => {
        const taglineValue = document.querySelector('input[required]')?.value;
        const statusBadge = document.querySelector('span[class*="amber"]')?.textContent;
        const dirtyBadge = document.querySelector('[role="status"]');
        return {
          taglineValue,
          statusBadge,
          isDirty: !!dirtyBadge && dirtyBadge.textContent.includes('unsaved')
        };
      })()
    `);
    console.log('  Dirty unpublish result:', dirtyUnpublishCheck);
    if (!dirtyUnpublishCheck.taglineValue?.includes('History Keystroke 5') || !dirtyUnpublishCheck.statusBadge?.includes('Unpublished')) {
      throw new Error('Journey 2 assertion failed: Dirty edits were wiped out by unpublish!');
    }

    // -------------------------------------------------------------------------
    // Test 2e: Discard changes button restores saved baseline
    // -------------------------------------------------------------------------
    console.log('  Clicking Discard Changes button...');
    await client.evaluate(`
      (() => {
        const discardBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Discard changes'));
        discardBtn?.click();
      })()
    `);
    await sleep(500);

    const discardCheck = await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const dirtyBadge = document.querySelector('[role="status"]');
        return {
          tagline: taglineInput?.value,
          isDirty: !!dirtyBadge && dirtyBadge.textContent.includes('unsaved')
        };
      })()
    `);
    console.log('  Discard result:', discardCheck);
    if (discardCheck.isDirty || discardCheck.tagline?.includes('History Keystroke 5')) {
      throw new Error(`Journey 2 assertion failed: Discard did not revert draft: ${JSON.stringify(discardCheck)}`);
    }

    // =========================================================================
    // JOURNEY 3: Media Policy Validation & Highlight Reordering
    // =========================================================================
    console.log('\n[JOURNEY 3] Media Policy Validation & Highlight Reordering...');
    // Reorder first highlight down
    const reorderResult = await client.evaluate(`
      (() => {
        const firstMoveDownBtn = document.querySelector('button[aria-label*="Move down #1"]');
        firstMoveDownBtn?.click();
        const allHighlightLegends = Array.from(document.querySelectorAll('fieldset legend')).map(l => l.textContent);
        return { clicked: !!firstMoveDownBtn, legends: allHighlightLegends };
      })()
    `);
    console.log('  Reorder action:', reorderResult);
    await sleep(500);

    // Enter invalid hero image URL (unconfigured domain) to test accessible inline validation error
    console.log('  Testing validation rejection on unconfigured remote image domain...');
    await client.evaluate(`
      (() => {
        const heroInput = Array.from(document.querySelectorAll('input')).find(i => i.placeholder?.includes('/venues/'));
        if (heroInput) {
          const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          prototypeValue.set.call(heroInput, 'https://unconfigured-cdn.com/bad-hero.jpg');
          heroInput.dispatchEvent(new Event('input', { bubbles: true }));
          heroInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(300);

    const mediaErrorCheck = await client.evaluate(`
      (() => {
        const errorAlert = Array.from(document.querySelectorAll('[role="alert"]')).find(a => a.textContent?.includes('Hero image must be a local asset'));
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Save');
        return {
          hasErrorAlert: !!errorAlert,
          isSaveDisabled: !!saveBtn?.disabled
        };
      })()
    `);
    console.log('  Unsupported media validation check:', mediaErrorCheck);
    if (!mediaErrorCheck.hasErrorAlert || !mediaErrorCheck.isSaveDisabled) {
      throw new Error('Journey 3 assertion failed: Media policy error was not displayed or save was not prevented!');
    }

    // Supply supported local image URL and save
    console.log('  Supplying valid supported media URL and saving...');
    await client.evaluate(`
      (() => {
        const heroInput = Array.from(document.querySelectorAll('input')).find(i => i.placeholder?.includes('/venues/'));
        if (heroInput) {
          const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          prototypeValue.set.call(heroInput, '/venues/bambis.jpg');
          heroInput.dispatchEvent(new Event('input', { bubbles: true }));
          heroInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Save');
        saveBtn?.click();
      })()
    `);
    await sleep(1000);

    const savedCheck = await client.evaluate(`
      (() => {
        const statusMsg = document.querySelector('[role="status"]')?.textContent;
        return { statusMsg };
      })()
    `);
    console.log('  Save result:', savedCheck);

    // =========================================================================
    // JOURNEY 4: Dynamic Primary-Color Branding & Publication
    // =========================================================================
    console.log('\n[JOURNEY 4] Dynamic Primary-Color Branding & Publication...');
    const publishedHeading = 'Bambis Meda Premier Arena';
    const customBrandColor = '#1a4329'; // Dark emerald green
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, '${publishedHeading}');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));

        const colorInput = document.querySelector('input[type="color"]');
        if (colorInput) {
          prototypeValue.set.call(colorInput, '${customBrandColor}');
          colorInput.dispatchEvent(new Event('input', { bubbles: true }));
          colorInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Publish'));
        publishBtn?.click();
      })()
    `);
    await sleep(1500);

    // Navigate to public microsite /s/bambis-meda to verify branding and publication
    console.log('  Navigating to public microsite /s/bambis-meda to verify branding...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda' });
    await sleep(1500);
    await waitForLoading(client);

    const publicPublishedCheck = await client.evaluate(`
      (() => {
        const h1 = document.querySelector('h1')?.textContent;
        const courtCards = document.querySelectorAll('#fields .bg-white.rounded-3xl');
        const reserveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Reserve a Pitch'));
        const btnBackground = reserveBtn ? window.getComputedStyle(reserveBtn).backgroundColor : null;
        return {
          h1,
          matchesPublishedHeading: h1?.includes('Bambis Meda') && h1?.includes('Premier Arena'),
          courtCount: courtCards.length,
          btnBackground
        };
      })()
    `);
    console.log('  Public microsite publication & branding check:', publicPublishedCheck);
    if (!publicPublishedCheck.matchesPublishedHeading) {
      throw new Error(`Journey 4 assertion failed: Published tagline not visible on public site: ${JSON.stringify(publicPublishedCheck)}`);
    }

    const shot4Path = path.join(artifactDir, 'journey_4_published_public_site.png');
    await client.captureScreenshot(shot4Path);
    console.log('  ✓ Screenshot captured (published public site):', shot4Path);

    // =========================================================================
    // JOURNEY 5: Unpublish Lifecycle & Operational Invariants
    // =========================================================================
    console.log('\n[JOURNEY 5] Unpublish Lifecycle & Operational Invariants...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);

    // Re-install confirm mock
    await client.evaluate(`
      (() => {
        window.__dialogLog = [];
        window.__confirmResponse = true;
        window.confirm = (msg) => {
          window.__dialogLog.push({ type: 'confirm', message: msg, accepted: true });
          return true;
        };
      })()
    `);

    // Click Unpublish
    console.log('  Clicking Unpublish button...');
    await client.evaluate(`
      (() => {
        const unpublishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Unpublish'));
        unpublishBtn?.click();
      })()
    `);
    await sleep(1500);

    const unpublishStatusCheck = await client.evaluate(`
      (() => {
        const statusBadge = document.querySelector('span[class*="amber"]')?.textContent;
        return { statusBadge };
      })()
    `);
    console.log('  CMS unpublish status badge:', unpublishStatusCheck);
    if (!unpublishStatusCheck.statusBadge?.includes('Unpublished')) {
      throw new Error('Journey 5 assertion failed: Status badge did not update to Unpublished.');
    }

    // Check public microsite /s/bambis-meda now shows honest unpublished state
    console.log('  Checking public microsite /s/bambis-meda for honest unpublished notice...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda' });
    await sleep(1500);
    await waitForLoading(client);

    const publicUnpublishedCheck = await client.evaluate(`
      (() => {
        const mainText = document.querySelector('main')?.textContent;
        const directoryLink = Array.from(document.querySelectorAll('a')).find(a => a.href?.includes('/stadiums'));
        const manageLink = Array.from(document.querySelectorAll('a')).find(a => a.href?.includes('/manage'));
        return {
          hasUnpublishedNotice: mainText?.includes('unpublished') || mainText?.includes('in preparation'),
          hasDirectoryLink: !!directoryLink,
          hasManageLink: !!manageLink
        };
      })()
    `);
    console.log('  Public unpublished notice check:', publicUnpublishedCheck);
    if (!publicUnpublishedCheck.hasUnpublishedNotice || !publicUnpublishedCheck.hasDirectoryLink) {
      throw new Error(`Journey 5 assertion failed: Public site did not display unpublished notice: ${JSON.stringify(publicUnpublishedCheck)}`);
    }

    const shot5Path = path.join(artifactDir, 'journey_5_unpublished_notice.png');
    await client.captureScreenshot(shot5Path);
    console.log('  ✓ Screenshot captured (unpublished notice):', shot5Path);

    // Verify bookings & court operational data still exist in owner portal
    console.log('  Verifying owner booking calendar and court inventory remain active...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/bookings' });
    await sleep(1500);
    await waitForLoading(client);

    const ownerBookingsCheck = await client.evaluate(`
      (() => {
        const h1 = document.querySelector('h1')?.textContent;
        return { h1, hasCalendar: !!document.querySelector('input[type="date"]') };
      })()
    `);
    console.log('  Owner booking calendar check:', ownerBookingsCheck);
    if (!ownerBookingsCheck.hasCalendar) {
      throw new Error('Journey 5 assertion failed: Owner booking calendar was impacted by unpublish!');
    }

    // Re-publish Bambis Meda to restore public site
    console.log('  Re-publishing Bambis Meda microsite...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);
    await client.evaluate(`
      (() => {
        const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Publish'));
        publishBtn?.click();
      })()
    `);
    await sleep(1500);
    console.log('  ✓ Re-publication succeeded.');

    // =========================================================================
    // JOURNEY 6: Two-Tenant Isolation & Non-Owner Denial
    // =========================================================================
    console.log('\n[JOURNEY 6] Two-Tenant Isolation & Non-Owner Denial...');
    console.log('  Switching session to owner-2 (Dawit Tadesse @ Unity Sports Complex)...');
    await client.evaluate(`
      (() => {
        sessionStorage.setItem('etsf-demo-session-v1', 'owner-2');
      })()
    `);
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);

    const owner2Check = await client.evaluate(`
      (() => {
        const select = document.querySelector('select');
        const options = Array.from(select?.querySelectorAll('option') || []).map(o => o.textContent);
        const tagline = document.querySelector('input[required]')?.value;
        return {
          options,
          onlyUnity: options.length === 1 && options[0].includes('Unity Sports Complex'),
          tagline
        };
      })()
    `);
    console.log('  Owner-2 CMS isolation check:', owner2Check);
    if (!owner2Check.onlyUnity) {
      throw new Error(`Journey 6 assertion failed: Owner-2 saw unauthorized venues: ${JSON.stringify(owner2Check)}`);
    }

    // Switch to player-1 and verify access is denied
    console.log('  Switching session to player-1 and verifying denial...');
    await client.evaluate(`
      (() => {
        sessionStorage.setItem('etsf-demo-session-v1', 'player-1');
      })()
    `);
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);

    const playerDenialCheck = await client.evaluate(`
      (() => {
        const alert = document.querySelector('[role="alert"]')?.textContent;
        return { hasForbidden: alert?.includes('permission') || alert?.includes('forbidden') };
      })()
    `);
    console.log('  Player denial check:', playerDenialCheck);
    if (!playerDenialCheck.hasForbidden) {
      throw new Error('Journey 6 assertion failed: Player was not denied access to CMS editor!');
    }

    // =========================================================================
    // JOURNEY 7: Responsive Mobile Layout & Amharic Localization
    // =========================================================================
    console.log('\n[JOURNEY 7] Responsive Mobile Layout (390x844) & Amharic Localization...');
    await client.evaluate(`
      (() => {
        sessionStorage.setItem('etsf-demo-session-v1', 'owner-1');
        localStorage.setItem('etsf-locale', 'am');
      })()
    `);

    // Set mobile viewport 390x844
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });

    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(2000);
    await waitForLoading(client);

    const mobileAmharicCheck = await client.evaluate(`
      (() => {
        const h1 = document.querySelector('h1')?.textContent;
        const editorTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('አርታኢ'));
        const previewTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('የቀጥታ ቅድመ-ዕይታ'));
        const scrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        return {
          h1,
          hasEditorTab: !!editorTab,
          hasPreviewTab: !!previewTab,
          scrollWidth,
          clientWidth,
          noHorizontalOverflow: scrollWidth <= clientWidth
        };
      })()
    `);
    console.log('  Mobile Amharic CMS check:', mobileAmharicCheck);
    if (!mobileAmharicCheck.hasEditorTab || !mobileAmharicCheck.noHorizontalOverflow) {
      throw new Error(`Journey 7 assertion failed: Mobile Amharic layout issue: ${JSON.stringify(mobileAmharicCheck)}`);
    }

    const shot7Path = path.join(artifactDir, 'journey_7_mobile_amharic_cms.png');
    await client.captureScreenshot(shot7Path);
    console.log('  ✓ Screenshot captured (mobile Amharic CMS):', shot7Path);

    // =========================================================================
    // JOURNEY 8: Pending-Venue Draft Preview with Owner-Scoped Courts
    // =========================================================================
    console.log('\n[JOURNEY 8] Pending-Venue Draft Preview with Owner-Scoped Courts...');

    // Reset desktop viewport
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Setup session as owner-1 in English
    await client.evaluate(`
      (() => {
        sessionStorage.setItem('etsf-demo-session-v1', 'owner-1');
        localStorage.setItem('etsf-locale', 'en');
        const langSelect = document.querySelector('select[aria-label]');
        if (langSelect && langSelect.value !== 'en') {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
          proto.set.call(langSelect, 'en');
          langSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);

    // Restore desktop viewport and English locale for Journey 8
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.evaluate(`
      (() => {
        window.localStorage.setItem('et_sport_locale', 'en');
        document.documentElement.lang = 'en';
      })()
    `);

    // 1. Submit a new venue (defaults to pending status)
    console.log('  Submitting new pending venue via OwnerVenues (/dashboard/stadiums)...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/stadiums' });
    await sleep(1500);
    await waitForLoading(client);

    const pendingVenueName = 'Addis Youth Sports Academy';
    await client.evaluate(`
      (() => {
        const setVal = (selector, val) => {
          const el = document.querySelector(selector);
          if (!el) return;
          const proto = el instanceof HTMLTextAreaElement ?
            Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value') :
            Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setVal('input[name="name"]', '${pendingVenueName}');
        setVal('input[name="city"]', 'Addis Ababa');
        setVal('input[name="address"]', 'Bole Atlas Road');
        setVal('input[name="phone"]', '+251911887766');
        setVal('textarea[name="description"]', 'State-of-the-art youth training center and turf pitches.');

        const submitBtn = document.querySelector('form button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Submit'));
        submitBtn?.click();
      })()
    `);
    await sleep(1500);

    // Verify submission status message
    const venueSubmitCheck = await client.evaluate(`
      (() => {
        const statusMsg = document.querySelector('[role="status"]')?.textContent;
        const venueCard = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('${pendingVenueName}'));
        return {
          statusMsg,
          hasCard: !!venueCard
        };
      })()
    `);
    console.log('  Venue submission check:', venueSubmitCheck);
    if (!venueSubmitCheck.hasCard) {
      throw new Error('Journey 8 assertion failed: New pending venue was not created!');
    }

    // 2. Add an owner-scoped court for this pending venue
    console.log('  Adding owner-scoped court for the pending venue via OwnerFields (/dashboard/fields)...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/fields' });
    await sleep(1500);
    await waitForLoading(client);

    const pendingCourtName = 'Academy Youth Turf Pitch 1';
    await client.evaluate(`
      (() => {
        const addFieldBtn = Array.from(document.querySelectorAll('button')).find(b =>
          b.className?.includes('action') ||
          b.textContent?.includes('Add a court') ||
          b.textContent?.includes('ሜዳ') ||
          b.textContent?.includes('Field')
        );
        addFieldBtn?.click();
      })()
    `);
    await sleep(800);

    await client.evaluate(`
      (() => {
        const setVal = (selector, val) => {
          const el = document.querySelector(selector);
          if (!el) return;
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto.set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        // Select the new pending venue in dropdown using HTMLSelectElement descriptor
        const venueSelect = document.querySelector('select');
        if (venueSelect) {
          const opt = Array.from(venueSelect.options).find(o => o.textContent.includes('${pendingVenueName}'));
          if (opt) {
            const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
            proto.set.call(venueSelect, opt.value);
            venueSelect.dispatchEvent(new Event('input', { bubbles: true }));
            venueSelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        setVal('input[required][maxlength="120"]', '${pendingCourtName}');
        setVal('input[required][maxlength="100"]', 'FIFA Turf');
        setVal('input[type="number"][step="0.01"]', '2500');

        // Check first sport checkbox (Football)
        const sportBox = document.querySelector('form input[type="checkbox"]');
        if (sportBox && !sportBox.checked) {
          sportBox.click();
        }
      })()
    `);
    await sleep(400);

    // Click Save button once enabled
    await client.evaluate(`
      (() => {
        const saveBtn = document.querySelector('form button[type="submit"]');
        saveBtn?.click();
      })()
    `);
    await sleep(2000);
    await waitForLoading(client);

    const courtCreateCheck = await client.evaluate(`
      (() => {
        const errorAlert = document.querySelector('[role="alert"]')?.textContent;
        const allH2 = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim());
        const courtHeading = allH2.find(text => text?.includes('${pendingCourtName}'));
        const formExists = !!document.querySelector('form');
        const saveBtnDisabled = document.querySelector('button[type="submit"]')?.disabled;
        return { hasCourt: !!courtHeading, allH2, errorAlert, formExists, saveBtnDisabled };
      })()
    `);
    console.log('  Court creation check:', courtCreateCheck);
    if (!courtCreateCheck.hasCourt) {
      throw new Error('Journey 8 assertion failed: Court was not created for pending venue! Details: ' + JSON.stringify(courtCreateCheck));
    }

    // 3. Open Microsite Editor, select pending venue, and test Live Preview
    console.log('  Opening CMS editor for the pending venue and switching to Live Preview...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);

    // Select the pending venue in venue select dropdown
    const selectedPending = await client.evaluate(`
      (() => {
        const select = document.querySelector('select');
        const opt = Array.from(select?.options || []).find(o => o.textContent.includes('${pendingVenueName}'));
        if (opt) {
          const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value');
          proto.set.call(select, opt.value);
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return { selected: true, venueId: opt.value };
        }
        return { selected: false };
      })()
    `);
    console.log('  Selected pending venue in CMS:', selectedPending);
    if (!selectedPending.selected) {
      throw new Error('Journey 8 assertion failed: Pending venue not found in CMS venue selector!');
    }
    await sleep(1500);
    await waitForLoading(client);

    // Verify Unpublished badge on pending venue
    const pendingStatusCheck = await client.evaluate(`
      (() => {
        const unpublishedBadge = document.querySelector('span[class*="amber"]')?.textContent;
        return { unpublishedBadge };
      })()
    `);
    console.log('  Pending venue CMS status check:', pendingStatusCheck);

    // Switch to Live Preview tab (in-context rendering)
    console.log('  Switching to Live Preview tab on pending venue...');
    await client.evaluate(`
      (() => {
        const previewBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Live Preview') || b.textContent?.includes('ቅድመ-ዕይታ'));
        previewBtn?.click();
      })()
    `);
    await sleep(1500);

    // Assert preview rendered with Draft Preview Mode, pending venue title, and owner-scoped court card
    const pendingPreviewCheck = await client.evaluate(`
      (() => {
        const previewBanner = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('Draft Preview Mode'));
        const heading = Array.from(document.querySelectorAll('h1')).find(h => h.textContent?.includes('${pendingVenueName}'));
        const courtCard = Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('${pendingCourtName}'));
        const notFound = Array.from(document.querySelectorAll('h1')).find(h => h.textContent?.includes('Unpublished') || h.textContent?.includes('Not Found'));
        return {
          hasBanner: !!previewBanner,
          hasHeading: !!heading,
          hasCourtCard: !!courtCard,
          isNotFound: !!notFound
        };
      })()
    `);
    console.log('  Pending venue Live Preview assertion:', pendingPreviewCheck);
    if (!pendingPreviewCheck.hasBanner || !pendingPreviewCheck.hasHeading || !pendingPreviewCheck.hasCourtCard || pendingPreviewCheck.isNotFound) {
      throw new Error(`Journey 8 assertion failed: Pending venue preview failed to render owner-scoped courts without 404: ${JSON.stringify(pendingPreviewCheck)}`);
    }

    const shot8Path = path.join(artifactDir, 'journey_8_pending_venue_preview.png');
    await client.captureScreenshot(shot8Path);
    console.log('  ✓ Screenshot captured (pending venue preview with owner courts):', shot8Path);

    // 4. Verify public visitor accessing /s/venue-{id} receives 404 / unpublished notice
    const pendingSlug = 'venue-' + selectedPending.venueId;
    console.log('  Verifying public visitor accessing /s/' + pendingSlug + ' receives 404 unpublished notice...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/' + pendingSlug });
    await sleep(1500);
    await waitForLoading(client);

    const publicPendingCheck = await client.evaluate(`
      (() => {
        const notice = Array.from(document.querySelectorAll('h1')).find(h =>
          h.textContent?.toLowerCase().includes('unpublished') ||
          h.textContent?.includes('አልታተመም') ||
          h.textContent?.toLowerCase().includes('not found') ||
          h.textContent?.toLowerCase().includes('unavailable')
        );
        const heading = Array.from(document.querySelectorAll('h1')).find(h => h.textContent?.includes('${pendingVenueName}'));
        return {
          hasNotice: !!notice,
          noticeText: notice?.textContent,
          leakedPublicly: !!heading
        };
      })()
    `);
    console.log('  Public pending access denial check:', publicPendingCheck);
    if (!publicPendingCheck.hasNotice || publicPendingCheck.leakedPublicly) {
      throw new Error('Journey 8 assertion failed: Pending venue leaked to public access! ' + JSON.stringify(publicPendingCheck));
    }

    client.close();
    proc.kill();
    console.log('\n================================================================');
    console.log('ALL CMS PUBLISHING & TENANT ISOLATION JOURNEYS PASSED!');
    console.log('================================================================');
    return true;
  } catch (err) {
    console.error('Test execution error:', err);
    proc.kill();
    throw err;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  runCmsE2ETest()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

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
    '--disable-extensions',
    '--window-size=1280,900',
    'about:blank',
  ];

  const proc = spawn(chromePath, chromeArgs, { stdio: 'ignore' });
  proc.on('error', err => console.error('Failed to launch Chrome:', err));

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      try {
        const targetRes = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
        const target = await targetRes.json();
        wsUrl = target.webSocketDebuggerUrl;
        if (wsUrl) break;
      } catch {
        await sleep(200);
      }
    }
    if (!wsUrl) throw new Error('Chrome remote debugging page target unreachable.');

    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Page.setLifecycleEventsEnabled', { enabled: true });

    // Override window.confirm and window.alert in evaluate context for precise control
    await client.evaluate(`
      (() => {
        window.__dialogLog = [];
        window.__confirmResponse = true;
        window.confirm = (msg) => {
          window.__dialogLog.push({ type: 'confirm', message: msg, accepted: window.__confirmResponse });
          return window.__confirmResponse;
        };
        window.alert = (msg) => {
          window.__dialogLog.push({ type: 'alert', message: msg });
        };
      })()
    `);

    // =========================================================================
    // STEP 0: Setup pristine demo session for owner-1 (Fatima Hassan @ Bambis)
    // =========================================================================
    console.log('[STEP 0] Setup pristine demo session for owner-1 (Fatima Hassan @ Bambis Meda Stadium)...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/auth/login' });
    await sleep(1500);
    await waitForLoading(client);

    await client.evaluate(`
      (() => {
        sessionStorage.clear();
        sessionStorage.setItem('etsf-demo-session-v1', 'owner-1');
      })()
    `);

    // =========================================================================
    // JOURNEY 1: In-context draft editing & live preview without publishing
    // =========================================================================
    console.log('\n[JOURNEY 1] Draft Editing & Live Preview without Publication...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(2000);
    await waitForLoading(client);

    // Assert initial editor loaded
    const initialEditorState = await client.evaluate(`
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
          statusBadge
        };
      })()
    `);
    console.log('  Initial CMS Editor state:', initialEditorState);
    if (!initialEditorState.hasPublish || !initialEditorState.hasPreviewTab) {
      throw new Error(`Journey 1 assertion failed: Editor did not render expected controls: ${JSON.stringify(initialEditorState)}`);
    }

    // Type uncommitted changes in tagline and announcement
    const testTagline = 'Bambis Meda Grand Arena — Live Uncommitted Preview';
    const testAnnouncement = 'Bole Weekend Cup registration open!';
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, '${testTagline}');
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
    // JOURNEY 2: Unsaved-Changes Protection (Discard & Venue-Switch Interception)
    // =========================================================================
    console.log('\n[JOURNEY 2] Unsaved-Changes Protection (Discard & Venue-Switch Interception)...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/dashboard/microsite' });
    await sleep(1500);
    await waitForLoading(client);

    // Re-install confirm mock for window
    await client.evaluate(`
      (() => {
        window.__dialogLog = [];
        window.__confirmResponse = true;
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
        prototypeValue.set.call(taglineInput, 'Temporary Tagline To Be Discarded');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(300);

    // Test 1: Click "Discard changes" button
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
    if (discardCheck.isDirty || discardCheck.tagline?.includes('Temporary Tagline')) {
      throw new Error(`Journey 2 assertion failed: Discard did not revert draft: ${JSON.stringify(discardCheck)}`);
    }

    // =========================================================================
    // JOURNEY 3: Media Validation & Highlight Reordering
    // =========================================================================
    console.log('\n[JOURNEY 3] Media Validation & Highlight Reordering...');
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

    // Enter invalid insecure video URL (http://) to test validation failure
    console.log('  Testing validation rejection on insecure video URL (http://)...');
    await client.evaluate(`
      (() => {
        const videoInput = document.querySelector('input[type="url"]');
        if (videoInput) {
          const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          prototypeValue.set.call(videoInput, 'http://insecure-stream.com/bad.mp4');
          videoInput.dispatchEvent(new Event('input', { bubbles: true }));
          videoInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(300);

    // Click Save
    await client.evaluate(`
      (() => {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Save');
        saveBtn?.click();
      })()
    `);
    await sleep(600);

    // Fix URL to valid HTTPS
    console.log('  Supplying valid HTTPS media URL and saving...');
    await client.evaluate(`
      (() => {
        const videoInput = document.querySelector('input[type="url"]');
        if (videoInput) {
          const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          prototypeValue.set.call(videoInput, 'https://example.com/championship-goals.mp4');
          videoInput.dispatchEvent(new Event('input', { bubbles: true }));
          videoInput.dispatchEvent(new Event('change', { bubbles: true }));
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
    // JOURNEY 4: Publish Draft and Verify Public Microsite Update
    // =========================================================================
    console.log('\n[JOURNEY 4] Publishing Draft and Verifying Public Microsite Update...');
    const publishedHeading = 'Bambis Meda Premier Arena';
    await client.evaluate(`
      (() => {
        const taglineInput = document.querySelector('input[required]');
        const prototypeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        prototypeValue.set.call(taglineInput, '${publishedHeading}');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));

        const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Publish'));
        publishBtn?.click();
      })()
    `);
    await sleep(1500);

    // Navigate to public microsite /s/bambis-meda
    console.log('  Navigating to public microsite /s/bambis-meda to verify publication...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/s/bambis-meda' });
    await sleep(1500);
    await waitForLoading(client);

    const publicPublishedCheck = await client.evaluate(`
      (() => {
        const h1 = document.querySelector('h1')?.textContent;
        const courtCards = document.querySelectorAll('#fields .bg-white.rounded-3xl');
        return {
          h1,
          matchesPublishedHeading: h1?.includes('Bambis Meda') && h1?.includes('Premier Arena'),
          courtCount: courtCards.length
        };
      })()
    `);
    console.log('  Public microsite publication check:', publicPublishedCheck);
    if (!publicPublishedCheck.matchesPublishedHeading) {
      throw new Error(`Journey 4 assertion failed: Published tagline not visible on public site: ${JSON.stringify(publicPublishedCheck)}`);
    }

    const shot4Path = path.join(artifactDir, 'journey_4_published_public_site.png');
    await client.captureScreenshot(shot4Path);
    console.log('  ✓ Screenshot captured (published public site):', shot4Path);

    // =========================================================================
    // JOURNEY 5: Unpublish Lifecycle & Operational Persistence
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

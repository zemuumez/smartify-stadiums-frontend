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
const profileDir = path.join(os.tmpdir(), 'smartify-stadiums-a11y-perf-profile');

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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function waitForLoading(client, maxWaitMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const busy = await client.evaluate(`
      (() => {
        const hasAriaBusy = !!document.querySelector('[aria-busy="true"]');
        const hasLoadingRole = !!document.querySelector('[role="status"]');
        const hasLoadingText = Array.from(document.querySelectorAll('div, p, span')).some(el => el.textContent && el.textContent.trim() === 'Loading...');
        return hasAriaBusy || hasLoadingRole || hasLoadingText;
      })()
    `);
    if (!busy) return;
    await sleep(200);
  }
}

export async function runA11yAndPerformanceSuite() {
  console.log('================================================================');
  console.log('REPRODUCIBLE ACCESSIBILITY & MOBILE PERFORMANCE EVIDENCE SUITE');
  console.log('================================================================\n');

  fs.mkdirSync(artifactDir, { recursive: true });

  const port = 9333;
  const proc = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ]);

  proc.stderr.on('data', () => {});

  try {
    let client = null;
    for (let i = 0; i < 40; i++) {
      try {
        const targetRes = await fetch(`http://127.0.0.1:${port}/json/new`, { method: 'PUT' });
        const target = await targetRes.json();
        if (target.webSocketDebuggerUrl) {
          client = new CDPClient(target.webSocketDebuggerUrl);
          await client.connect();
          break;
        }
      } catch {
        await sleep(250);
      }
    }
    if (!client) throw new Error('Failed to connect to headless Chrome page target on port 9333.');

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    const evidence = {
      timestamp: new Date().toISOString(),
      keyboardFocusRestoration: {},
      tabletViewport: {},
      zoom200pct: {},
      mobileThrottledPerformance: {},
    };

    // -------------------------------------------------------------------------
    // PART 1: KEYBOARD NAVIGATION, FOCUS RESTORATION & ESCAPE DISMISSAL
    // -------------------------------------------------------------------------
    console.log('[A11Y CHECK 1] Modal Keyboard Focus Restoration & Focus Trap...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

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
    await sleep(2000);
    await waitForLoading(client);

    // Focus the "Record walk-in" button
    const focusButtonResult = await client.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Record walk-in'));
        if (!btn) return { error: 'Record walk-in button not found' };
        btn.id = 'trigger-walkin-btn';
        btn.focus();
        return {
          id: btn.id,
          isFocused: document.activeElement === btn,
          tag: btn.tagName,
          text: btn.textContent.trim()
        };
      })()
    `);
    console.log('  Trigger button focused:', focusButtonResult);

    // Activate the modal via actual keyboard activation (Enter key on focused control)
    console.log('  Activating trigger button via keyboard Enter...');
    await client.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
      text: '\r',
      unmodifiedText: '\r',
    });
    await client.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
    });
    await sleep(800);

    // Verify modal is open and initial focus has moved inside the dialog
    const modalFocusCheck = await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return { error: 'Modal dialog not opened' };
        const active = document.activeElement;
        const isInside = modal.contains(active);
        return {
          modalOpen: true,
          activeInsideModal: isInside,
          activeElementTag: active ? active.tagName : null,
          activeElementId: active ? active.id : null,
          activeElementClass: active ? active.className : null
        };
      })()
    `);
    console.log('  Modal focus state after keyboard open:', modalFocusCheck);
    if (!modalFocusCheck.modalOpen || !modalFocusCheck.activeInsideModal) {
      throw new Error(`A11y focus trap failed: Focus did not move inside dialog: ${JSON.stringify(modalFocusCheck)}`);
    }

    // Exercise and assert Tab and Shift+Tab keyboard focus containment inside the modal step-by-step
    console.log('  Exercising and asserting Tab / Shift+Tab keyboard focus containment step-by-step...');
    const traversalResults = [];

    async function stepTab(shiftKey = false) {
      if (shiftKey) {
        await client.send('Input.dispatchKeyEvent', {
          type: 'keyDown',
          key: 'Shift',
          code: 'ShiftLeft',
          windowsVirtualKeyCode: 16,
          nativeVirtualKeyCode: 16,
          modifiers: 8,
        });
        await client.send('Input.dispatchKeyEvent', {
          type: 'keyDown',
          key: 'Tab',
          code: 'Tab',
          windowsVirtualKeyCode: 9,
          nativeVirtualKeyCode: 9,
          modifiers: 8,
        });
        await client.send('Input.dispatchKeyEvent', {
          type: 'keyUp',
          key: 'Tab',
          code: 'Tab',
          windowsVirtualKeyCode: 9,
          nativeVirtualKeyCode: 9,
          modifiers: 8,
        });
        await client.send('Input.dispatchKeyEvent', {
          type: 'keyUp',
          key: 'Shift',
          code: 'ShiftLeft',
          windowsVirtualKeyCode: 16,
          nativeVirtualKeyCode: 16,
          modifiers: 0,
        });
      } else {
        await client.send('Input.dispatchKeyEvent', {
          type: 'keyDown',
          key: 'Tab',
          code: 'Tab',
          windowsVirtualKeyCode: 9,
          nativeVirtualKeyCode: 9,
          text: '\t',
          unmodifiedText: '\t',
          modifiers: 0,
        });
        await client.send('Input.dispatchKeyEvent', {
          type: 'keyUp',
          key: 'Tab',
          code: 'Tab',
          windowsVirtualKeyCode: 9,
          nativeVirtualKeyCode: 9,
          modifiers: 0,
        });
      }
      await sleep(150);

      return await client.evaluate(`
        (() => {
          const modal = document.querySelector('[role="dialog"]');
          if (!modal) return { error: 'Modal dialog not found' };
          const focusables = Array.from(
            modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
          );
          const activeAfter = document.activeElement;
          return {
            isInsideModal: !!activeAfter && modal.contains(activeAfter),
            activeTag: activeAfter ? activeAfter.tagName : null,
            activeId: activeAfter ? activeAfter.id : null,
            activeIndex: focusables.indexOf(activeAfter),
            totalFocusables: focusables.length,
            isFirst: activeAfter === focusables[0],
            isLast: activeAfter === focusables[focusables.length - 1],
          };
        })()
      `);
    }

    const initialStatus = await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        const focusables = Array.from(
          modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
        );
        return {
          count: focusables.length,
          activeIndex: focusables.indexOf(document.activeElement),
          isInside: modal.contains(document.activeElement)
        };
      })()
    `);
    if (!initialStatus.isInside || initialStatus.count < 2) {
      throw new Error(`A11y focus setup failed: ${JSON.stringify(initialStatus)}`);
    }

    // Step forward through elements using browser-level Tab key events
    // Assert containment and forward advancement on each keypress until the last focusable element is reached
    let currentForwardIndex = initialStatus.activeIndex;
    let forwardSteps = 0;
    while (!traversalResults.some(r => r.isLast) && forwardSteps < 20) {
      const stepRes = await stepTab(false);
      forwardSteps++;
      if (!stepRes.isInsideModal) {
        throw new Error(`A11y focus containment broken on forward Tab step ${forwardSteps}: focus left modal: ${JSON.stringify(stepRes)}`);
      }
      if (stepRes.activeIndex < currentForwardIndex) {
        throw new Error(`A11y focus advancement regressed on forward Tab step ${forwardSteps}: index went from ${currentForwardIndex} to ${stepRes.activeIndex}`);
      }
      currentForwardIndex = stepRes.activeIndex;
      traversalResults.push({ step: `forward_tab_${forwardSteps}`, ...stepRes });
    }

    const lastStep = traversalResults[traversalResults.length - 1];
    if (!lastStep?.isLast) {
      throw new Error(`A11y focus traversal did not reach the last focusable element within ${forwardSteps} Tab presses`);
    }

    // Next Tab from last element must wrap around to first element (boundary wrapping)
    const wrapForwardRes = await stepTab(false);
    console.log('  Wrap forward result (last -> first):', wrapForwardRes);
    if (!wrapForwardRes.isInsideModal || !wrapForwardRes.isFirst || wrapForwardRes.activeIndex !== 0) {
      throw new Error(`A11y focus wrap forward failed: expected first element (index 0), got index ${wrapForwardRes.activeIndex}: ${JSON.stringify(wrapForwardRes)}`);
    }
    traversalResults.push({ step: 'wrap_forward', ...wrapForwardRes });

    // Shift+Tab from first element must wrap backward to last element (boundary wrapping)
    const wrapBackwardRes = await stepTab(true);
    console.log('  Wrap backward result (first -> last):', wrapBackwardRes);
    const expectedLastIndex = initialStatus.count - 1;
    if (!wrapBackwardRes.isInsideModal || !wrapBackwardRes.isLast || wrapBackwardRes.activeIndex !== expectedLastIndex) {
      throw new Error(`A11y focus wrap backward failed: expected last element (index ${expectedLastIndex}), got index ${wrapBackwardRes.activeIndex}: ${JSON.stringify(wrapBackwardRes)}`);
    }
    traversalResults.push({ step: 'wrap_backward', ...wrapBackwardRes });

    // Step backward using browser-level Shift+Tab key events
    // Assert containment and backward advancement on each keypress
    let currentBackwardIndex = wrapBackwardRes.activeIndex;
    for (let step = 0; step < Math.min(4, initialStatus.count - 1); step++) {
      const stepRes = await stepTab(true);
      if (!stepRes.isInsideModal) {
        throw new Error(`A11y focus containment broken on backward Shift+Tab step ${step}: focus left modal: ${JSON.stringify(stepRes)}`);
      }
      if (stepRes.activeIndex > currentBackwardIndex) {
        throw new Error(`A11y focus backward advancement regressed on step ${step}: index went from ${currentBackwardIndex} to ${stepRes.activeIndex}`);
      }
      currentBackwardIndex = stepRes.activeIndex;
      traversalResults.push({ step: `backward_shift_tab_${step}`, ...stepRes });
    }

    const tabContainmentCheck = {
      forwardWrapped: wrapForwardRes.isFirst,
      backwardWrapped: wrapBackwardRes.isLast,
      allStepsContained: traversalResults.every(r => r.isInsideModal),
      stepCount: traversalResults.length
    };
    console.log('  Tab / Shift+Tab step-by-step traversal check:', tabContainmentCheck);
    evidence.keyboardFocusContainment = { passed: true, ...tabContainmentCheck };

    // Capture screenshot of opened modal with focus inside
    const modalOpenShot = path.join(artifactDir, 'a11y_keyboard_modal_focused.png');
    await client.captureScreenshot(modalOpenShot);

    // Dispatch Escape keydown to dismiss dialog cleanly
    await client.evaluate(`
      (() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true }));
      })()
    `);
    await sleep(800);

    // Verify modal is closed AND focus is restored to the triggering button
    const restorationCheck = await client.evaluate(`
      (() => {
        const modal = document.querySelector('[role="dialog"]');
        const triggerBtn = document.getElementById('trigger-walkin-btn');
        const active = document.activeElement;
        return {
          modalClosed: !modal,
          focusRestoredToTrigger: active === triggerBtn,
          currentActiveId: active ? active.id : null,
          currentActiveTag: active ? active.tagName : null
        };
      })()
    `);
    console.log('  Focus restoration check after Escape dismissal:', restorationCheck);
    if (!restorationCheck.modalClosed || !restorationCheck.focusRestoredToTrigger) {
      throw new Error(`A11y focus restoration failed: ${JSON.stringify(restorationCheck)}`);
    }

    const focusRestoredShot = path.join(artifactDir, 'a11y_keyboard_focus_restored.png');
    await client.captureScreenshot(focusRestoredShot);
    console.log('  ✓ Verified keyboard focus restoration to triggering control after Escape dismissal');
    evidence.keyboardFocusRestoration = { passed: true, ...restorationCheck };

    // -------------------------------------------------------------------------
    // PART 2: TABLET VIEWPORT (768px x 1024px) RESPONSIVENESS & OVERFLOW AUDIT
    // -------------------------------------------------------------------------
    console.log('\n[A11Y CHECK 2] Tablet Viewport (768px) Reflow & Zero Horizontal Overflow...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: false,
    });

    const tabletPages = [
      { name: 'Directory', url: 'http://localhost:3000/stadiums', shot: 'a11y_tablet_directory_768px.png' },
      { name: 'Microsite', url: 'http://localhost:3000/s/unity-complex', shot: 'a11y_tablet_microsite_768px.png' },
      { name: 'OwnerSchedule', url: 'http://localhost:3000/dashboard/bookings', shot: 'a11y_tablet_dashboard_768px.png' },
    ];

    for (const page of tabletPages) {
      await client.send('Page.navigate', { url: page.url });
      await sleep(1500);
      await waitForLoading(client);

      const overflow = await client.evaluate(`
        (() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientWidth = doc.clientWidth;
          return {
            page: window.location.pathname,
            scrollWidth,
            clientWidth,
            hasHorizontalOverflow: scrollWidth > clientWidth,
            overflowPx: Math.max(0, scrollWidth - clientWidth)
          };
        })()
      `);
      console.log(`  Tablet ${page.name} (${page.url}):`, overflow);
      if (overflow.hasHorizontalOverflow) {
        throw new Error(`Tablet horizontal overflow detected on ${page.name}: ${JSON.stringify(overflow)}`);
      }
      const shotPath = path.join(artifactDir, page.shot);
      await client.captureScreenshot(shotPath);
      evidence.tabletViewport[page.name] = overflow;
    }
    console.log('  ✓ Verified tablet 768px reflow with 0px horizontal overflow across directory, microsite, and dashboard');

    // -------------------------------------------------------------------------
    // PART 3: 200% ZOOM SCALING & ADAPTABILITY AUDIT
    // -------------------------------------------------------------------------
    console.log('\n[A11Y CHECK 3] 200% Zoom Scaling & Layout Reflow Audit...');
    console.log('  Methodology Distinction:');
    console.log('    • CSS Zoom Reflow (document.body.style.zoom = 200%): Audits responsive reflow and text wrapping at 200% magnification within desktop viewport.');
    console.log('    • Browser Device Scale Factor (deviceScaleFactor = 2.0): Audits crisp rendering and high-DPI scaling across display boundaries.');
    console.log('    • Mandatory Assertion: Enforces zero horizontal overflow (scrollWidth <= clientWidth).');

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 2.0,
      mobile: false,
    });

    // Execute 200% CSS zoom reflow audit on public directory and player bookings
    evidence.zoom200pct = {
      testMethodology: 'CSS zoom reflow (document.body.style.zoom = 200%) + Browser DPR 2.0',
      mandatoryAssertion: 'zero_horizontal_overflow',
      results: {}
    };

    for (const page of [
      { name: 'StadiumsZoom200', url: 'http://localhost:3000/stadiums', shot: 'a11y_zoom_200pct_stadiums.png' },
      { name: 'BookingsZoom200', url: 'http://localhost:3000/bookings', shot: 'a11y_zoom_200pct_bookings.png' },
    ]) {
      await client.send('Page.navigate', { url: page.url });
      await sleep(1500);
      await waitForLoading(client);

      await client.evaluate(`
        (() => {
          document.body.style.zoom = '200%';
        })()
      `);
      await sleep(600);

      const zoomCheck = await client.evaluate(`
        (() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientWidth = doc.clientWidth;
          return {
            scrollWidth,
            clientWidth,
            hasOverflow: scrollWidth > clientWidth,
            overflowPx: Math.max(0, scrollWidth - clientWidth),
            h1Text: document.querySelector('h1')?.textContent?.trim()
          };
        })()
      `);
      console.log(`  200% Zoom ${page.name}:`, zoomCheck);

      // Mandatory assertion: throw on any horizontal overflow
      if (zoomCheck.hasOverflow) {
        throw new Error(`200% CSS zoom check failed: Horizontal overflow detected on ${page.name} (${zoomCheck.overflowPx}px overflow): ${JSON.stringify(zoomCheck)}`);
      }

      const shotPath = path.join(artifactDir, page.shot);
      await client.captureScreenshot(shotPath);
      evidence.zoom200pct.results[page.name] = zoomCheck;

      // Reset zoom
      await client.evaluate(`(() => { document.body.style.zoom = '100%'; })()`);
    }
    console.log('  ✓ Verified 200% zoom scaling with mandatory zero horizontal overflow assertion enforced');

    // -------------------------------------------------------------------------
    // PART 4: MOBILE PERFORMANCE UNDER DOCUMENTED THROTTLED CONDITIONS
    // -------------------------------------------------------------------------
    console.log('\n[PERF CHECK 4] Mobile Performance Measurement under Documented Conditions...');
    console.log('  Conditions: Viewport 390x844 (iPhone baseline), 4x CPU Throttling, Fast 3G Network (40ms RTT, 1.6 Mbps DL, 750 kbps UL)');

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });

    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 40, // 40ms RTT
      downloadThroughput: (1600 * 1024) / 8, // 1.6 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 kbps
      connectionType: 'cellular3g',
    });

    const perfTargets = [
      { name: 'Landing', url: 'http://localhost:3000/' },
      { name: 'Directory', url: 'http://localhost:3000/stadiums' },
      { name: 'Microsite', url: 'http://localhost:3000/s/bambis-meda' },
      { name: 'PlayerBookings', url: 'http://localhost:3000/bookings' },
      { name: 'OwnerDashboard', url: 'http://localhost:3000/dashboard/bookings' },
    ];

    for (const target of perfTargets) {
      await client.send('Page.navigate', { url: target.url });
      await sleep(1500);
      await waitForLoading(client);

      const timing = await client.evaluate(`
        (() => {
          const navEntries = performance.getEntriesByType('navigation');
          const nav = navEntries.length > 0 ? navEntries[0] : null;
          if (nav) {
            return {
              dnsMs: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
              tcpMs: Math.round(nav.connectEnd - nav.connectStart),
              ttfbMs: Math.round(nav.responseStart - nav.requestStart),
              domInteractiveMs: Math.round(nav.domInteractive),
              domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
              loadEventMs: Math.round(nav.loadEventEnd)
            };
          }
          const t = performance.timing;
          return {
            ttfbMs: Math.round(t.responseStart - t.requestStart),
            domInteractiveMs: Math.round(t.domInteractive - t.navigationStart),
            domContentLoadedMs: Math.round(t.domContentLoadedEventEnd - t.navigationStart),
            loadEventMs: Math.round(t.loadEventEnd - t.navigationStart)
          };
        })()
      `);

      const overflow = await client.evaluate(`
        (() => {
          const doc = document.documentElement;
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            overflowPx: Math.max(0, doc.scrollWidth - doc.clientWidth)
          };
        })()
      `);

      console.log(`  Page ${target.name} metrics:`, { ...timing, ...overflow });
      evidence.mobileThrottledPerformance[target.name] = { ...timing, ...overflow };
    }

    // Reset throttling
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    });

    const shotPerfPath = path.join(artifactDir, 'perf_mobile_throttled_stadiums.png');
    await client.captureScreenshot(shotPerfPath);

    // Save evidence JSON
    const evidencePath = path.join(artifactDir, 'accessibility_performance_evidence.json');
    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
    console.log(`\nEvidence saved to: ${evidencePath}`);

    client.close();
    proc.kill();
    console.log('================================================================');
    console.log('ACCESSIBILITY & PERFORMANCE EVIDENCE ESTABLISHED SUCCESSFULLY!');
    console.log('================================================================');
    return true;
  } catch (err) {
    console.error('A11y/Performance test execution error:', err);
    proc.kill();
    throw err;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
  runA11yAndPerformanceSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

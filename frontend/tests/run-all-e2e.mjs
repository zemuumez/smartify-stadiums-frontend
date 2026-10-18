import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const artifactDir = process.env.ARTIFACT_DIR || path.join(process.cwd(), '.test-artifacts');
fs.mkdirSync(artifactDir, { recursive: true });

async function checkServerHealthy(url = 'http://localhost:3000') {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url = 'http://localhost:3000', timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkServerHealthy(url)) return true;
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

const testSuites = [
  { name: 'Booking Journeys (J0-J8)', script: 'tests/verify-journeys-e2e.mjs' },
  { name: 'Microsite CMS & Dynamic Theming (J1-J8)', script: 'tests/verify-cms-e2e.mjs' },
  { name: 'Community Teams & Event Registrations (J1-J4)', script: 'tests/verify-teams-events-e2e.mjs' },
  { name: 'Camera Lifecycle & Match Media (J1-J6)', script: 'tests/verify-camera-media-e2e.mjs' },
  { name: 'Finance Ledger & Platform Admin (J1-J7)', script: 'tests/verify-finance-admin-e2e.mjs' },
  { name: 'Accessibility & Mobile Performance Evidence', script: 'tests/verify-a11y-performance.mjs' },
];

async function main() {
  console.log('================================================================');
  console.log('SMART FIELDS CONTINUOUS INTEGRATION: END-TO-END BROWSER RUNNER');
  console.log('================================================================\n');

  let serverProc = null;
  const isAlreadyRunning = await checkServerHealthy();

  if (isAlreadyRunning) {
    console.log('✓ Found active Next.js application server running on http://localhost:3000');
  } else {
    console.log('Starting Next.js server on port 3000...');
    serverProc = spawn('npm', ['run', 'start'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: '3000',
        NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE || 'demo',
        NEXT_PUBLIC_APP_ENV: 'test',
      },
    });

    const isReady = await waitForServer('http://localhost:3000', 60000);
    if (!isReady) {
      if (serverProc) serverProc.kill();
      console.error('Fatal: Timed out waiting for Next.js server on http://localhost:3000');
      process.exit(1);
    }
    console.log('✓ Next.js server started successfully on http://localhost:3000\n');
  }

  const results = [];
  let allPassed = true;

  try {
    for (const suite of testSuites) {
      console.log(`\n----------------------------------------------------------------`);
      console.log(`RUNNING SUITE: ${suite.name} (${suite.script})`);
      console.log(`----------------------------------------------------------------`);

      const suiteStart = Date.now();
      const exitCode = await new Promise((resolve) => {
        const proc = spawn('node', [suite.script], {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
            ARTIFACT_DIR: artifactDir,
            NEXT_PUBLIC_DATA_MODE: process.env.NEXT_PUBLIC_DATA_MODE || 'demo',
          },
        });
        proc.on('close', code => resolve(code ?? 1));
      });

      const durationMs = Date.now() - suiteStart;
      const passed = exitCode === 0;
      results.push({ name: suite.name, script: suite.script, passed, durationMs });

      if (!passed) {
        console.error(`✗ FAILED: ${suite.name} exited with code ${exitCode}`);
        allPassed = false;
        break;
      } else {
        console.log(`✓ PASSED: ${suite.name} (${(durationMs / 1000).toFixed(1)}s)`);
      }
    }
  } finally {
    if (serverProc) {
      console.log('\nStopping spawned background Next.js server process...');
      serverProc.kill();
    }
  }

  console.log('\n================================================================');
  console.log('BROWSER TEST EXECUTION SUMMARY');
  console.log('================================================================');
  for (const r of results) {
    console.log(`  ${r.passed ? '✓ PASS' : '✗ FAIL'} [${(r.durationMs / 1000).toFixed(1)}s] ${r.name}`);
  }
  console.log(`Artifacts preserved in: ${artifactDir}`);
  console.log('================================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal CI runner error:', err);
  process.exit(1);
});

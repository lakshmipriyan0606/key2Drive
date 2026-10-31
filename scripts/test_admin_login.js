const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error('[BROWSER PAGE ERROR]:', err.message);
    pageErrors.push(err.message);
  });

  console.log('Navigating to http://localhost:3000/admin/login...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });

  console.log('Filling login credentials...');
  await page.fill('input[type="email"]', 'admin@key2drive.com');
  await page.fill('input[type="password"]', 'Key2DriveAdmin2026!');

  console.log('Clicking submit...');
  await Promise.all([
    page.waitForURL('**/admin', { timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);

  console.log('Waiting for network idle on /admin...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const title = await page.title();
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  console.log('Page Title:', title);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const hasAppError = bodyText.includes('Application error: a client-side exception has occurred');
  console.log('Has Application Error?', hasAppError);

  const artifactPath = 'C:/Users/LAKSHMI/.gemini/antigravity/brain/13ebf5af-fcdb-4582-b81c-39ed02b18bfd/admin_dashboard_rendered.png';
  await page.screenshot({ path: artifactPath, fullPage: true });
  console.log('Screenshot saved to:', artifactPath);

  await browser.close();

  if (hasAppError || pageErrors.length > 0) {
    console.error('FAILED! Application error or page errors detected.');
    process.exit(1);
  } else {
    console.log('SUCCESS! Admin rendered without application error.');
  }
}

main().catch((err) => {
  console.error('Script failure:', err);
  process.exit(1);
});


const { chromium } = require('playwright');

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

  console.log('1. Navigating to http://localhost:3000/admin/login...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });

  console.log('2. Filling credentials and signing in...');
  await page.fill('input[type="email"]', 'admin@key2drive.com');
  await page.fill('input[type="password"]', 'Key2DriveAdmin2026!');

  await Promise.all([
    page.waitForURL('**/admin', { timeout: 10000 }),
    page.click('button[type="submit"]'),
  ]);

  await page.waitForLoadState('networkidle');
  console.log('3. Navigated to /admin successfully.');

  console.log('4. Navigating to http://localhost:3000/admin/pricing...');
  await page.goto('http://localhost:3000/admin/pricing', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const pricingTitle = await page.title();
  const pricingUrl = page.url();
  console.log('Current URL:', pricingUrl);
  console.log('Page Title:', pricingTitle);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const hasAppError = bodyText.includes('Application error: a client-side exception has occurred');
  console.log('Has Application Error?', hasAppError);

  const screenshotPath = 'C:/Users/LAKSHMI/.gemini/antigravity/brain/13ebf5af-fcdb-4582-b81c-39ed02b18bfd/admin_pricing_rendered.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();

  if (hasAppError || pageErrors.length > 0) {
    console.error('FAILED! Errors detected on /admin/pricing:', pageErrors);
    process.exit(1);
  } else {
    console.log('SUCCESS! /admin/pricing rendered without any application error or unhandled exceptions.');
  }
}

main().catch((err) => {
  console.error('Script failure:', err);
  process.exit(1);
});

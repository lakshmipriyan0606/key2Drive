const { chromium } = require('playwright');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Take screenshot of the Hero section
  const heroCard = page.locator('video').locator('xpath=ancestor::div[contains(@class, "rounded-3xl")][1]');
  if (await heroCard.isVisible()) {
    await heroCard.screenshot({ path: 'e:/project/actingDriver/hero_video_heroclip.png' });
    console.log('Captured hero_video_heroclip.png');
  }

  // Also full hero viewport
  await page.screenshot({ path: 'e:/project/actingDriver/hero_full_viewport.png' });
  console.log('Captured hero_full_viewport.png');

  await browser.close();
  console.log('Capture complete!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});


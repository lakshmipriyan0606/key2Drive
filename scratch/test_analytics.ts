import { ensureAnalyticsTables, recordVisitorEvent, getAnalyticsStats } from '../src/lib/analytics/db';

async function testAnalytics() {
  console.log('Testing analytics database initialization...');
  await ensureAnalyticsTables();
  console.log('Tables initialized successfully.');

  console.log('Recording a test visitor event...');
  await recordVisitorEvent({
    visitorId: 'vis_test_user_1',
    sessionId: 'ses_test_1',
    eventType: 'pageview',
    page: '/',
    device: 'Mobile',
    browser: 'Chrome',
    os: 'Android',
    ip: '127.0.0.1',
    referrer: 'Direct',
  });

  await recordVisitorEvent({
    visitorId: 'vis_test_user_1',
    sessionId: 'ses_test_1',
    eventType: 'click_whatsapp',
    page: '/',
    label: 'Floating WhatsApp Bar',
    device: 'Mobile',
    browser: 'Chrome',
    os: 'Android',
    ip: '127.0.0.1',
    referrer: 'Direct',
  });

  const stats = await getAnalyticsStats();
  console.log('Current Analytics Stats:', JSON.stringify(stats, null, 2));
}

testAnalytics().catch(console.error);


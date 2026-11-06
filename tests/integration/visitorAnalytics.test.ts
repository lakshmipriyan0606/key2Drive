import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST as trackPOST } from '@/app/api/analytics/track/route';
import { GET as analyticsGET } from '@/app/api/admin/analytics/route';
import { ensureAnalyticsTables } from '@/lib/analytics/db';
import { signAdminToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import prisma from '@/lib/db';

describe('Visitor Telemetry & Live Analytics Integration Suite', () => {
  const testVisitorId = `vis_test_suite_${Date.now()}`;
  let adminCookie: string;

  beforeAll(async () => {
    await ensureAnalyticsTables();
    const token = signAdminToken({
      uid: 'admin-test-id',
      em: 'admin@key2drive.com',
      nm: 'Admin',
      rl: 'ADMIN',
      exp: Date.now() + 3600000,
    });
    adminCookie = `${SESSION_COOKIE_NAME}=${token}`;
  });

  afterAll(async () => {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM analytics_events WHERE visitor_id LIKE '%test_suite%'`);
      await prisma.$executeRawUnsafe(`DELETE FROM analytics_visitors WHERE visitor_id LIKE '%test_suite%'`);
    } catch {
      // Cleanup
    }
  });

  it('POST /api/analytics/track logs pageviews without error', async () => {
    const req = new Request('http://localhost:3000/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      body: JSON.stringify({
        visitorId: testVisitorId,
        sessionId: 'ses_test_1',
        eventType: 'pageview',
        page: '/services',
        device: 'Mobile',
        browser: 'Safari',
        os: 'iOS',
      }),
    });

    const res = await trackPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('POST /api/analytics/track logs action clicks (WhatsApp & Calls)', async () => {
    const req = new Request('http://localhost:3000/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: testVisitorId,
        sessionId: 'ses_test_1',
        eventType: 'click_whatsapp',
        page: '/services',
        label: 'Floating WhatsApp Pill',
        device: 'Mobile',
        browser: 'Safari',
      }),
    });

    const res = await trackPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('GET /api/admin/analytics rejects unauthorized requests with HTTP 401', async () => {
    const req = new Request('http://localhost:3000/api/admin/analytics', {
      method: 'GET',
    });

    const res = await analyticsGET(req);
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/analytics returns live stats and event stream for authenticated admin', async () => {
    const req = new Request('http://localhost:3000/api/admin/analytics', {
      method: 'GET',
      headers: {
        Cookie: adminCookie,
      },
    });

    const res = await analyticsGET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.stats).toBeDefined();
    expect(typeof json.stats.liveVisitors).toBe('number');
    expect(typeof json.stats.uniqueVisitorsToday).toBe('number');
    expect(Array.isArray(json.stats.recentEvents)).toBe(true);
    expect(json.stats.actionBreakdown).toBeDefined();
    expect(Array.isArray(json.stats.uniqueClients)).toBe(true);
    expect(Array.isArray(json.stats.dayWiseSummaries)).toBe(true);

    const client = json.stats.uniqueClients.find((c: any) => c.visitorId === testVisitorId);
    if (client) {
      expect(client.dealStatus).toBe('WHATSAPP_LEAD');
      expect(client.intent).toBe('HIGH');
      expect(client.actionsCount).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(client.pageWiseList)).toBe(true);
      expect(Array.isArray(client.dayVisits)).toBe(true);
      expect(typeof client.durationFormatted).toBe('string');
    }
  });

  it('aggregates multi-day customer journeys without multiplying records', async () => {
    const multiDayVisitorId = `vis_test_suite_multiday_${Date.now()}`;
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const today = new Date().toISOString();

    // Insert yesterday event
    await prisma.$executeRawUnsafe(
      `INSERT INTO analytics_events (id, visitor_id, event_type, page, created_at) VALUES (?, ?, 'pageview', '/', ?)`,
      `evt_m1_${Date.now()}`,
      multiDayVisitorId,
      yesterday
    );

    // Insert today event with WhatsApp click
    await prisma.$executeRawUnsafe(
      `INSERT INTO analytics_events (id, visitor_id, event_type, page, label, created_at) VALUES (?, ?, 'click_whatsapp', '/services', 'WhatsApp Click', ?)`,
      `evt_m2_${Date.now()}`,
      multiDayVisitorId,
      today
    );

    const req = new Request('http://localhost:3000/api/admin/analytics', {
      method: 'GET',
      headers: { Cookie: adminCookie },
    });

    const res = await analyticsGET(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    const client = json.stats.uniqueClients.find((c: any) => c.visitorId === multiDayVisitorId);
    expect(client).toBeDefined();
    expect(client.isMultiDay).toBe(true);
    expect(client.totalDaysVisited).toBe(2);
    expect(client.dayVisits.length).toBe(2);
    expect(client.dealStatus).toBe('WHATSAPP_LEAD');

    // Clean up
    await prisma.$executeRawUnsafe(`DELETE FROM analytics_events WHERE visitor_id = ?`, multiDayVisitorId);
    await prisma.$executeRawUnsafe(`DELETE FROM analytics_visitors WHERE visitor_id = ?`, multiDayVisitorId);
  });
});

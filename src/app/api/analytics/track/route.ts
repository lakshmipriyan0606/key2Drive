import { NextResponse } from 'next/server';
import { recordVisitorEvent } from '@/lib/analytics/db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const headers = request.headers;

    const rawIp =
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      '127.0.0.1';

    // Privacy-preserving masked IP (e.g., 103.21.xx.xx)
    const ipParts = rawIp.split('.');
    const maskedIp =
      ipParts.length === 4
        ? `${ipParts[0]}.${ipParts[1]}.*.*`
        : rawIp.substring(0, 10);

    const userAgent = headers.get('user-agent') || '';

    // Simple heuristic fallback if client didn't supply device details
    let device = body.device;
    if (!device) {
      if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';
      else if (/mobile|android|iphone/i.test(userAgent)) device = 'Mobile';
      else device = 'Desktop';
    }

    let browser = body.browser;
    if (!browser) {
      if (/edg/i.test(userAgent)) browser = 'Edge';
      else if (/chrome/i.test(userAgent)) browser = 'Chrome';
      else if (/safari/i.test(userAgent)) browser = 'Safari';
      else if (/firefox/i.test(userAgent)) browser = 'Firefox';
      else browser = 'Browser';
    }

    let os = body.os;
    if (!os) {
      if (/windows/i.test(userAgent)) os = 'Windows';
      else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
      else if (/android/i.test(userAgent)) os = 'Android';
      else if (/iphone|ipad|ios/i.test(userAgent)) os = 'iOS';
      else if (/linux/i.test(userAgent)) os = 'Linux';
      else os = 'Unknown';
    }

    const targetPage = body.page || '/';

    // Strictly ignore any admin portal routes from public visitor telemetry
    if (targetPage.startsWith('/admin')) {
      return NextResponse.json({ success: true, ignored: true }, { status: 200 });
    }

    const visitorId = body.visitorId || `vis_${Date.now().toString(36)}`;
    const eventType = body.eventType || 'pageview';

    await recordVisitorEvent({
      visitorId,
      sessionId: body.sessionId,
      eventType,
      page: targetPage,
      label: body.label,
      metadata: body.metadata,
      device,
      browser,
      os,
      ip: maskedIp,
      referrer: body.referrer || 'Direct',
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Analytics should never break client page navigation, return silent success
    return NextResponse.json({ success: false }, { status: 200 });
  }
}


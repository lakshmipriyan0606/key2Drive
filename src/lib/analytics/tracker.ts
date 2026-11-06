/**
 * Client-Side Visitor Tracking & Action SDK for Key2Drive
 */

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';

  const KEY = 'k2d_visitor_id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = `k2d_vis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `k2d_temp_${Math.random().toString(36).substring(2, 8)}`;
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const KEY = 'k2d_session_id';
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = `k2d_ses_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `k2d_temp_ses_${Math.random().toString(36).substring(2, 8)}`;
  }
}

export function getClientMetadata(): {
  device: string;
  browser: string;
  os: string;
  referrer: string;
} {
  if (typeof window === 'undefined') {
    return { device: 'Desktop', browser: 'Unknown', os: 'Unknown', referrer: 'Direct' };
  }

  const ua = navigator.userAgent;

  // Device Detection
  let device = 'Desktop';
  if (/iPad|tablet/i.test(ua)) {
    device = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    device = 'Mobile';
  }

  // Browser Detection
  let browser = 'Chrome';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  // OS Detection
  let os = 'Windows';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  const referrer = document.referrer ? new URL(document.referrer, window.location.href).hostname : 'Direct';

  return { device, browser, os, referrer };
}

/**
 * Sends a tracking event to the analytics engine via navigator.sendBeacon or fetch.
 */
export function trackAction(
  eventType: 'pageview' | 'heartbeat' | 'click_whatsapp' | 'click_call' | 'view_service' | 'submit_booking' | 'submit_enquiry' | string,
  label?: string,
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;
  // Strictly ignore all admin portal pages - only customer website events are tracked
  if (window.location.pathname.startsWith('/admin')) return;

  const visitorId = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  const meta = getClientMetadata();
  const page = window.location.pathname;

  const payload = JSON.stringify({
    visitorId,
    sessionId,
    eventType,
    page,
    label: label || null,
    metadata: metadata || null,
    device: meta.device,
    browser: meta.browser,
    os: meta.os,
    referrer: meta.referrer,
  });

  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon && eventType !== 'heartbeat') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
      return;
    }

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Analytics failures are non-blocking
    });
  } catch {
    // Silent catch
  }
}


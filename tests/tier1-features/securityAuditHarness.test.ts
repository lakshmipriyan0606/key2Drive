import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/lib/rateLimit';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Phase 1 & 8: Security Audit & Hardening Harness', () => {
  it('enforces in-memory sliding window rate limiting and triggers HTTP 429 when threshold exceeded', () => {
    const testKey = `test-ip-${Date.now()}`;
    const limit = 3;
    const windowSecs = 10;

    // Requests 1, 2, 3 allowed
    expect(checkRateLimit(testKey, limit, windowSecs).allowed).toBe(true);
    expect(checkRateLimit(testKey, limit, windowSecs).allowed).toBe(true);
    expect(checkRateLimit(testKey, limit, windowSecs).allowed).toBe(true);

    // Request 4 blocked
    const blockedResult = checkRateLimit(testKey, limit, windowSecs);
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.remaining).toBe(0);
    expect(blockedResult.resetSeconds).toBeGreaterThan(0);
  });

  it('rejects unauthenticated API requests to /api/admin/metrics via middleware with HTTP 401', () => {
    const req = new NextRequest('http://localhost:3000/api/admin/metrics', {
      method: 'GET',
    });

    const res = middleware(req);
    expect(res.status).toBe(401);
  });

  it('redirects unauthenticated browser requests to /admin to /admin/login via middleware', () => {
    const req = new NextRequest('http://localhost:3000/admin/bookings', {
      method: 'GET',
    });

    const res = middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/admin/login');
  });

  it('attaches critical security headers (X-Frame-Options, X-Content-Type-Options, Permissions-Policy)', () => {
    const req = new NextRequest('http://localhost:3000/', {
      method: 'GET',
    });

    const res = middleware(req);
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('Permissions-Policy')).toBeDefined();
  });
});


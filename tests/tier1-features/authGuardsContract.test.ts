import { describe, it, expect } from 'vitest';
import {
  AdminLoginSchema,
  AdminSessionManager,
  ADMIN_COOKIE_NAME,
} from '@/../tests/contracts/authContract';

describe('Tier 1: Feature 19 - Admin Authentication & Guard Contract', () => {
  it('validates compliant admin login credentials', () => {
    const valid = {
      email: 'admin@key2drive.com',
      password: 'AdminPassword2026!',
    };
    const result = AdminLoginSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('admin@key2drive.com');
    }
  });

  it('rejects passwords shorter than 8 characters and invalid emails', () => {
    // Too short password
    const shortPass = AdminLoginSchema.safeParse({
      email: 'admin@key2drive.com',
      password: 'short',
    });
    expect(shortPass.success).toBe(false);

    // Invalid email
    const badEmail = AdminLoginSchema.safeParse({
      email: 'not-an-email',
      password: 'ValidPassword123!',
    });
    expect(badEmail.success).toBe(false);
  });

  it('verifies canonical admin session cookie name', () => {
    expect(ADMIN_COOKIE_NAME).toBe('key2drive_admin_session');
  });

  it('creates active admin session with future expiration timestamp', () => {
    const manager = new AdminSessionManager();
    const session = manager.createSession('usr_admin_1', 'ADMIN', 3600000);

    expect(session.token).toMatch(/^k2d_sess_/);
    expect(session.userId).toBe('usr_admin_1');
    expect(session.role).toBe('ADMIN');
    expect(session.expiresAt).toBeGreaterThan(Date.now());
  });

  it('verifies valid session token successfully', () => {
    const manager = new AdminSessionManager();
    const session = manager.createSession('usr_admin_2', 'ADMIN');

    const verification = manager.verifySession(session.token);
    expect(verification.valid).toBe(true);
    expect(verification.session?.userId).toBe('usr_admin_2');
  });

  it('rejects missing or unknown session tokens', () => {
    const manager = new AdminSessionManager();

    const missingRes = manager.verifySession(undefined);
    expect(missingRes.valid).toBe(false);
    expect(missingRes.reason).toContain('Missing');

    const unknownRes = manager.verifySession('k2d_sess_non_existent');
    expect(unknownRes.valid).toBe(false);
    expect(unknownRes.reason).toContain('Invalid');
  });

  it('rejects expired session tokens and purges them from memory', () => {
    const manager = new AdminSessionManager();
    // Create session that expired 10 seconds ago
    const expiredSession = manager.createSession('usr_admin_3', 'STAFF', -10000);

    const check = manager.verifySession(expiredSession.token);
    expect(check.valid).toBe(false);
    expect(check.reason).toContain('expired');
  });

  it('invalidates session token on explicit admin logout', () => {
    const manager = new AdminSessionManager();
    const session = manager.createSession('usr_admin_4', 'ADMIN');

    // Confirm valid first
    expect(manager.verifySession(session.token).valid).toBe(true);

    // Logout / invalidate
    const removed = manager.invalidateSession(session.token);
    expect(removed).toBe(true);

    // Subsequent check fails
    expect(manager.verifySession(session.token).valid).toBe(false);
  });

  it('GET /api/admin/auth/me returns 200 with authenticated=false when unauthenticated to avoid console network errors', async () => {
    const { GET } = await import('@/app/api/admin/auth/me/route');
    const { NextRequest } = await import('next/server');
    const req = new NextRequest('http://localhost:3000/api/admin/auth/me');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.authenticated).toBe(false);
    expect(data.user).toBeNull();
  });
});

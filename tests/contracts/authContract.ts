import { z } from 'zod';

export const AdminLoginSchema = z.object({
  email: z
    .string({ required_error: 'Admin email is required' })
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters'),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export type UserRole = 'ADMIN' | 'STAFF';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface AdminSession {
  token: string;
  userId: string;
  role: UserRole;
  expiresAt: number; // Unix timestamp in ms
}

export const ADMIN_COOKIE_NAME = 'key2drive_admin_session';

/**
 * In-memory session manager for admin authentication verification
 */
export class AdminSessionManager {
  private sessions = new Map<string, AdminSession>();

  public createSession(userId: string, role: UserRole, ttlMs: number = 86400000): AdminSession {
    const token = `k2d_sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const session: AdminSession = {
      token,
      userId,
      role,
      expiresAt: Date.now() + ttlMs,
    };
    this.sessions.set(token, session);
    return session;
  }

  public verifySession(token: string | undefined): { valid: boolean; session?: AdminSession; reason?: string } {
    if (!token) {
      return { valid: false, reason: 'Missing session token' };
    }
    const session = this.sessions.get(token);
    if (!session) {
      return { valid: false, reason: 'Invalid or unknown session token' };
    }
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(token);
      return { valid: false, reason: 'Session token has expired' };
    }
    return { valid: true, session };
  }

  public invalidateSession(token: string): boolean {
    return this.sessions.delete(token);
  }
}

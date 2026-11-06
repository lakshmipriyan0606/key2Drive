import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { AdminLoginSchema } from '@/lib/validations/auth';
import { verifyPassword, createAdminSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 0. Rate limiting check (10 attempts per 15 minutes per IP)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`login:${clientIp}`, 10, 900);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.resetSeconds.toString(),
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const json = await request.json();
    const validated = AdminLoginSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Administrator privileges required.' },
        { status: 403 }
      );
    }

    // Creates serverless-proof signed session and sets cookie
    const session = await createAdminSession(user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Admin authentication successful.',
      },
      { status: 200 }
    );

    // Explicitly attach cookies to the outgoing response object
    response.cookies.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });

    response.cookies.set('key2drive_admin_session', session.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}

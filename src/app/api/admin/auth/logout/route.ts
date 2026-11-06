import { NextResponse } from 'next/server';
import { destroyAdminSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    await destroyAdminSession();
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json(
      { success: true, message: 'Admin logged out successfully.' },
      { status: 200 }
    );
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    response.cookies.set('key2drive_admin_session', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process logout.' },
      { status: 500 }
    );
  }
}

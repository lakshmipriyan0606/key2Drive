import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionContext = await getAdminSession();

    if (!sessionContext) {
      const response = NextResponse.json(
        {
          success: true,
          authenticated: false,
          user: null,
          message: 'No active admin session found.',
        },
        { status: 200 }
      );
      response.cookies.delete('k2d_session');
      response.cookies.delete('key2drive_admin_session');
      return response;
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: sessionContext.user,
        expiresAt: sessionContext.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error verifying session.' },
      { status: 500 }
    );
  }
}

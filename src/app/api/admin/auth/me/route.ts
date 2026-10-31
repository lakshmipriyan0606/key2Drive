import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const sessionContext = await getAdminSession();

    if (!sessionContext) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Active session not found.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
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

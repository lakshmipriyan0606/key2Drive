import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getAnalyticsStats } from '@/lib/analytics/db';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getAnalyticsStats();

    return NextResponse.json(
      {
        success: true,
        stats,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics metrics.' },
      { status: 500 }
    );
  }
}


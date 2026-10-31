import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth';

export async function POST() {
  try {
    await destroyAdminSession();
    return NextResponse.json(
      { success: true, message: 'Admin logged out successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process logout.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking identifier is required.' },
        { status: 400 }
      );
    }

    const trimmed = id.trim();

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { reference: trimmed.toUpperCase() },
        ],
      },
      include: {
        service: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin booking details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving booking details.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const tariffs = await prisma.tariff.findMany({
      include: {
        service: {
          select: {
            id: true,
            slug: true,
            title: true,
            priceUnit: true,
          },
        },
      },
      orderBy: [
        { service: { sortOrder: 'asc' } },
        { baseRate: 'asc' },
      ],
    });

    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(
      {
        success: true,
        count: tariffs.length,
        tariffs,
        services,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin tariffs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving tariffs.' },
      { status: 500 }
    );
  }
}

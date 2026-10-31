import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      include: {
        tariffs: {
          orderBy: { baseRate: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

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

    return NextResponse.json(
      {
        success: true,
        count: services.length,
        services,
        tariffs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin pricing:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving pricing data.' },
      { status: 500 }
    );
  }
}

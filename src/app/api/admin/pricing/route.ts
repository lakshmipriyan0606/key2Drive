import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { SEED_SERVICES, SEED_TARIFFS } from '@/lib/data/seedData';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let services: any[] = [];
    let tariffs: any[] = [];

    try {
      services = await prisma.service.findMany({
        include: {
          tariffs: {
            orderBy: { baseRate: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      tariffs = await prisma.tariff.findMany({
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
    } catch (dbError) {
      console.warn('Prisma query in /api/admin/pricing failed, falling back to seed:', dbError);
    }

    if (!services || services.length === 0) {
      services = SEED_SERVICES;
    }
    if (!tariffs || tariffs.length === 0) {
      tariffs = SEED_TARIFFS;
    }

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
      {
        success: true,
        count: SEED_SERVICES.length,
        services: SEED_SERVICES,
        tariffs: SEED_TARIFFS,
      },
      { status: 200 }
    );
  }
}

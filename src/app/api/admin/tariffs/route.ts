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

    let tariffs: any[] = [];
    let services: any[] = [];

    try {
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

      services = await prisma.service.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    } catch (dbError) {
      console.warn('Prisma query in /api/admin/tariffs failed, falling back to seed:', dbError);
    }

    if (!tariffs || tariffs.length === 0) {
      tariffs = SEED_TARIFFS;
    }
    if (!services || services.length === 0) {
      services = SEED_SERVICES;
    }

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
      {
        success: true,
        count: SEED_TARIFFS.length,
        tariffs: SEED_TARIFFS,
        services: SEED_SERVICES,
      },
      { status: 200 }
    );
  }
}

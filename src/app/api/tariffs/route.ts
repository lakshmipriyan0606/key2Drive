import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SEED_TARIFFS } from '@/lib/data/seedData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceSlug = searchParams.get('service');

    let tariffs: any[] = [];
    try {
      tariffs = await prisma.tariff.findMany({
        where: serviceSlug
          ? { service: { slug: serviceSlug, isActive: true } }
          : { service: { isActive: true } },
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
      console.warn('Prisma query in /api/tariffs failed, using fallback seed tariffs:', dbError);
    }

    if (!tariffs || tariffs.length === 0) {
      tariffs = serviceSlug
        ? SEED_TARIFFS.filter((t) => t.service?.slug === serviceSlug)
        : SEED_TARIFFS;
    }

    return NextResponse.json(
      {
        success: true,
        count: tariffs.length,
        tariffs,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching public tariffs:', error);
    return NextResponse.json(
      {
        success: true,
        count: SEED_TARIFFS.length,
        tariffs: SEED_TARIFFS,
        fallback: true,
      },
      { status: 200 }
    );
  }
}

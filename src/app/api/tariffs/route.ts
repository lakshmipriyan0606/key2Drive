import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceSlug = searchParams.get('service');

    const tariffs = await prisma.tariff.findMany({
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
      { success: false, error: 'Failed to retrieve tariffs.' },
      { status: 500 }
    );
  }
}

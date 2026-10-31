import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const services = await prisma.service.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        tariffs: {
          orderBy: { baseRate: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Parse features if stored as JSON string
    const formattedServices = services.map((service) => {
      let parsedFeatures: string[] = [];
      try {
        if (service.features) {
          parsedFeatures = JSON.parse(service.features);
        }
      } catch {
        parsedFeatures = service.features
          ? service.features.split('\n').filter((f) => f.trim().length > 0)
          : [];
      }
      return {
        ...service,
        featuresList: parsedFeatures,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: formattedServices.length,
        services: formattedServices,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chauffeur services.' },
      { status: 500 }
    );
  }
}

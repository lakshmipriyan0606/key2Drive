import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SEED_SERVICES } from '@/lib/data/seedData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let services: any[] = [];
    try {
      services = await prisma.service.findMany({
        where: includeInactive ? undefined : { isActive: true },
        include: {
          tariffs: {
            orderBy: { baseRate: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (dbError) {
      console.warn('Prisma query in /api/services failed, using fallback seed services:', dbError);
    }

    if (!services || services.length === 0) {
      services = includeInactive ? SEED_SERVICES : SEED_SERVICES.filter((s) => s.isActive);
    }

    // Parse features if stored as JSON string
    const formattedServices = services.map((service) => {
      let parsedFeatures: string[] = [];
      try {
        if (service.features) {
          parsedFeatures = JSON.parse(service.features);
        }
      } catch {
        parsedFeatures = service.features
          ? service.features.split('\n').filter((f: string) => f.trim().length > 0)
          : [];
      }
      return {
        ...service,
        featuresList:
          Array.isArray(service.featuresList) && service.featuresList.length > 0
            ? service.featuresList
            : parsedFeatures,
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
    console.error('Error in /api/services:', error);
    // Never return a 500 when static seed fallback is available
    return NextResponse.json(
      {
        success: true,
        count: SEED_SERVICES.length,
        services: SEED_SERVICES,
        fallback: true,
      },
      { status: 200 }
    );
  }
}

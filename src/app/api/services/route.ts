import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SEED_SERVICES } from '@/lib/data/seedData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SERVICE_IMAGES: Record<string, string> = {
  'hourly-driver': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop',
  'full-day-driver': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
  'airport-transfer': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800&auto=format&fit=crop',
  'outstation-driver': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
  'corporate-services': 'https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop',
  'personal-chauffeur': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop',
};
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop';

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

    // Parse features and custom images
    const formattedServices = services.map((service) => {
      let parsedFeatures: string[] = [];
      let customImage: string | undefined = undefined;

      try {
        if (service.features) {
          const parsed = JSON.parse(service.features);
          if (Array.isArray(parsed)) {
            parsedFeatures = parsed;
          } else if (parsed && typeof parsed === 'object') {
            parsedFeatures = Array.isArray(parsed.bullets) ? parsed.bullets : [];
            customImage = typeof parsed.image === 'string' && parsed.image.trim() ? parsed.image : undefined;
          }
        }
      } catch {
        parsedFeatures = service.features
          ? service.features.split('\n').filter((f: string) => f.trim().length > 0)
          : [];
      }

      const defaultImage = SERVICE_IMAGES[service.slug] || DEFAULT_IMAGE;
      const finalImage = customImage || (service as any).imageUrl || (service as any).image || defaultImage;

      return {
        ...service,
        image: finalImage,
        imageUrl: finalImage,
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
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
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

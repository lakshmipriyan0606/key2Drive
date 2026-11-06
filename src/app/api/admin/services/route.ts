import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { ServiceCreateSchema } from '@/lib/validations/tariff';
import { SEED_SERVICES } from '@/lib/data/seedData';
import {
  SERVICE_IMAGES,
  DEFAULT_IMAGE,
  slugify,
  parseFeaturesAndImage,
  stringifyFeaturesAndImage,
} from '@/lib/services';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let services: any[] = [];
    try {
      services = await prisma.service.findMany({
        include: {
          tariffs: {
            select: { id: true, title: true, baseRate: true, vehicleCategory: true },
          },
          _count: {
            select: { bookings: true, tariffs: true },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });
    } catch (dbError) {
      console.warn('Prisma query in /api/admin/services failed, using fallback:', dbError);
    }

    if (!services || services.length === 0) {
      services = SEED_SERVICES.map((s) => ({
        ...s,
        tariffs: [],
        _count: { bookings: 0, tariffs: 0 },
      }));
    }

    // Parse features & images
    const formatted = services.map((service) => {
      const { featuresList, image: customImage } = parseFeaturesAndImage(service.features);
      const defaultImage = SERVICE_IMAGES[service.slug] || DEFAULT_IMAGE;
      const finalImage = customImage || (service as any).imageUrl || (service as any).image || defaultImage;

      return {
        ...service,
        image: finalImage,
        imageUrl: finalImage,
        featuresList,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: formatted.length,
        services: formatted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin services:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching services.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const validated = ServiceCreateSchema.parse(json);

    // Generate slug if omitted or empty
    let slug = validated.slug ? slugify(validated.slug) : slugify(validated.title);
    if (!slug) {
      slug = `service-${Date.now().toString(36)}`;
    }

    // Ensure unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      try {
        const existing = await prisma.service.findUnique({ where: { slug: uniqueSlug } });
        if (!existing) break;
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      } catch {
        break;
      }
    }

    const image = validated.image || validated.imageUrl || undefined;
    const featuresString = stringifyFeaturesAndImage(validated.features, image);

    const newService = await prisma.service.create({
      data: {
        title: validated.title,
        slug: uniqueSlug,
        tagline: validated.tagline,
        description: validated.description,
        features: featuresString,
        basePrice: validated.basePrice,
        priceUnit: validated.priceUnit,
        isActive: validated.isActive,
        sortOrder: validated.sortOrder,
      },
    });

    const { featuresList, image: savedImage } = parseFeaturesAndImage(newService.features);
    const defaultImage = SERVICE_IMAGES[newService.slug] || DEFAULT_IMAGE;
    const finalImage = savedImage || defaultImage;

    try {
      revalidatePath('/');
      revalidatePath('/services');
      revalidatePath('/api/services');
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        success: true,
        service: {
          ...newService,
          image: finalImage,
          imageUrl: finalImage,
          featuresList,
        },
        message: `Service '${newService.title}' created successfully.`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error creating service.' },
      { status: 500 }
    );
  }
}

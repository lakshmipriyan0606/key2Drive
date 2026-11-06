import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { ServiceUpdateSchema } from '@/lib/validations/tariff';
import {
  SERVICE_IMAGES,
  DEFAULT_IMAGE,
  parseFeaturesAndImage,
  stringifyFeaturesAndImage,
} from '@/lib/services';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const service = await prisma.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        tariffs: true,
        _count: { select: { bookings: true } },
      },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: `Service with ID or slug '${id}' not found.` },
        { status: 404 }
      );
    }

    const { featuresList, image: customImage } = parseFeaturesAndImage(service.features);
    const defaultImage = SERVICE_IMAGES[service.slug] || DEFAULT_IMAGE;
    const finalImage = customImage || (service as any).imageUrl || (service as any).image || defaultImage;

    return NextResponse.json(
      {
        success: true,
        service: {
          ...service,
          image: finalImage,
          imageUrl: finalImage,
          featuresList,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching service.' },
      { status: 500 }
    );
  }
}

async function handleUpdate(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const json = await request.json();
    const validated = ServiceUpdateSchema.parse(json);

    const existing = await prisma.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Service with ID or slug '${id}' not found.` },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (validated.slug && validated.slug !== existing.slug) {
      const conflict = await prisma.service.findUnique({
        where: { slug: validated.slug },
      });
      if (conflict && conflict.id !== existing.id) {
        return NextResponse.json(
          { success: false, error: `Slug '${validated.slug}' is already taken by another service.` },
          { status: 400 }
        );
      }
    }

    let newFeaturesString = undefined;
    if (
      validated.features !== undefined ||
      validated.image !== undefined ||
      validated.imageUrl !== undefined
    ) {
      const existingData = parseFeaturesAndImage(existing.features);
      const incomingFeatures = validated.features !== undefined ? validated.features : existingData.featuresList;
      const incomingImage =
        validated.image !== undefined
          ? validated.image
          : validated.imageUrl !== undefined
          ? validated.imageUrl
          : existingData.image;

      newFeaturesString = stringifyFeaturesAndImage(incomingFeatures, incomingImage);
    }

    const updated = await prisma.service.update({
      where: { id: existing.id },
      data: {
        ...(validated.title !== undefined ? { title: validated.title } : {}),
        ...(validated.slug !== undefined ? { slug: validated.slug } : {}),
        ...(validated.tagline !== undefined ? { tagline: validated.tagline } : {}),
        ...(validated.description !== undefined ? { description: validated.description } : {}),
        ...(newFeaturesString !== undefined ? { features: newFeaturesString } : {}),
        ...(validated.basePrice !== undefined ? { basePrice: validated.basePrice } : {}),
        ...(validated.priceUnit !== undefined ? { priceUnit: validated.priceUnit } : {}),
        ...(validated.isActive !== undefined ? { isActive: validated.isActive } : {}),
        ...(validated.sortOrder !== undefined ? { sortOrder: validated.sortOrder } : {}),
      },
    });

    const { featuresList, image: customImage } = parseFeaturesAndImage(updated.features);
    const defaultImage = SERVICE_IMAGES[updated.slug] || DEFAULT_IMAGE;
    const finalImage = customImage || defaultImage;

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
          ...updated,
          image: finalImage,
          imageUrl: finalImage,
          featuresList,
        },
        message: `Service '${updated.title}' updated successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error updating service.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, props);
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, props);
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;

    const existing = await prisma.service.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: { select: { bookings: true, tariffs: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Service with ID or slug '${id}' not found.` },
        { status: 404 }
      );
    }

    // Check if bookings exist for this service
    if (existing._count.bookings > 0) {
      await prisma.service.update({
        where: { id: existing.id },
        data: { isActive: false },
      });

      return NextResponse.json(
        {
          success: true,
          deactivated: true,
          message: `Service '${existing.title}' has ${existing._count.bookings} existing booking(s). It has been deactivated and hidden from the website to preserve customer records.`,
        },
        { status: 200 }
      );
    }

    // Delete tariffs associated with this service if any
    await prisma.tariff.deleteMany({
      where: { serviceId: existing.id },
    }).catch(() => {});

    // Delete the service
    await prisma.service.delete({
      where: { id: existing.id },
    });

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
        deleted: true,
        message: `Service '${existing.title}' deleted successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error deleting service.' },
      { status: 500 }
    );
  }
}

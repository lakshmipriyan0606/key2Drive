import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { TariffUpdateSchema, ServiceUpdateSchema } from '@/lib/validations/tariff';

async function handleUpdate(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const json = await request.json();

    // 1. Check if ID corresponds to a Tariff
    const existingTariff = await prisma.tariff.findUnique({
      where: { id },
    });

    if (existingTariff) {
      const validated = TariffUpdateSchema.parse(json);
      const updatedTariff = await prisma.tariff.update({
        where: { id },
        data: {
          ...(validated.title ? { title: validated.title } : {}),
          ...(validated.vehicleCategory ? { vehicleCategory: validated.vehicleCategory } : {}),
          ...(validated.baseRate !== undefined ? { baseRate: validated.baseRate } : {}),
          ...(validated.includedHours !== undefined ? { includedHours: validated.includedHours } : {}),
          ...(validated.includedKm !== undefined ? { includedKm: validated.includedKm } : {}),
          ...(validated.extraHourRate !== undefined ? { extraHourRate: validated.extraHourRate } : {}),
          ...(validated.extraKmRate !== undefined ? { extraKmRate: validated.extraKmRate } : {}),
          ...(validated.nightChargeRate !== undefined ? { nightChargeRate: validated.nightChargeRate } : {}),
          ...(validated.waitingChargePerMin !== undefined ? { waitingChargePerMin: validated.waitingChargePerMin } : {}),
          ...(validated.cancellationPolicy !== undefined ? { cancellationPolicy: validated.cancellationPolicy } : {}),
          ...(validated.isUnconfirmed !== undefined ? { isUnconfirmed: validated.isUnconfirmed } : {}),
        },
      });

      return NextResponse.json(
        {
          success: true,
          type: 'tariff',
          data: updatedTariff,
          message: 'Tariff updated successfully.',
        },
        { status: 200 }
      );
    }

    // 2. Check if ID corresponds to a Service
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (existingService) {
      const validated = ServiceUpdateSchema.parse(json);
      const updatedService = await prisma.service.update({
        where: { id },
        data: {
          ...(validated.title ? { title: validated.title } : {}),
          ...(validated.tagline ? { tagline: validated.tagline } : {}),
          ...(validated.description ? { description: validated.description } : {}),
          ...(validated.features !== undefined ? { features: validated.features } : {}),
          ...(validated.basePrice !== undefined ? { basePrice: validated.basePrice } : {}),
          ...(validated.priceUnit ? { priceUnit: validated.priceUnit } : {}),
          ...(validated.isActive !== undefined ? { isActive: validated.isActive } : {}),
          ...(validated.sortOrder !== undefined ? { sortOrder: validated.sortOrder } : {}),
        },
      });

      return NextResponse.json(
        {
          success: true,
          type: 'service',
          data: updatedService,
          message: 'Service updated successfully.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: `No tariff or service found with ID '${id}'.` },
      { status: 404 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Error updating pricing item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error updating pricing item.' },
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

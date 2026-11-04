import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { BookingCreateSchema } from '@/lib/validations/booking';
import messagingService from '@/lib/integrations/messaging';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

/**
 * Generates reference formatted as K2D-YYYYMMDD-XXXX
 */
function generateBookingReference(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const dateSegment = `${year}${month}${day}`;

  // 4 safe alphanumeric uppercase characters (avoiding confusing chars)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `K2D-${dateSegment}-${rand}`;
}

export async function POST(request: Request) {
  try {
    // 0. Rate limiting (30 requests per minute per IP)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`booking:${clientIp}`, 30, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many booking requests. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.resetSeconds.toString(),
            'X-RateLimit-Limit': rateCheck.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const json = await request.json();
    const validated = BookingCreateSchema.parse(json);

    // 1. Idempotency Check: Prevent double-submission within 5 minutes
    if (validated.submissionHash) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existing = await prisma.booking.findFirst({
        where: {
          submissionHash: validated.submissionHash,
          createdAt: { gte: fiveMinutesAgo },
        },
        include: { service: true },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: true,
            isDuplicate: true,
            bookingReference: existing.reference,
            bookingId: existing.id,
            status: existing.status,
            estimatedFare: existing.estimatedAmount,
            message: 'Existing booking retrieved. Duplicate submission prevented.',
          },
          { status: 200 }
        );
      }
    }

    // 2. Validate Service exists
    const service = await prisma.service.findUnique({
      where: { id: validated.serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Selected driver service was not found.' },
        { status: 400 }
      );
    }

    // 3. Generate Unique Booking Reference with collision retry
    let reference = generateBookingReference();
    let collisionCheck = await prisma.booking.findUnique({ where: { reference } });
    let attempts = 0;
    while (collisionCheck && attempts < 5) {
      reference = generateBookingReference();
      collisionCheck = await prisma.booking.findUnique({ where: { reference } });
      attempts++;
    }

    // 4. Create Booking & Initial Lifecycle Status History in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          reference,
          status: 'REQUESTED',
          customerName: validated.customerName,
          customerPhone: validated.customerPhone,
          customerEmail: validated.customerEmail,
          serviceId: validated.serviceId,
          pickupAddress: validated.pickupAddress,
          dropAddress: validated.dropAddress ?? null,
          pickupDateTime: new Date(validated.pickupDateTime),
          duration: validated.duration ?? null,
          vehicleInfo: validated.vehicleInfo,
          specialInstructions: validated.specialInstructions ?? null,
          estimatedAmount: validated.estimatedAmount,
          submissionHash: validated.submissionHash,
        },
        include: { service: true },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: newBooking.id,
          fromStatus: null,
          toStatus: 'REQUESTED',
          changedBy: 'CUSTOMER',
          note: 'Initial booking request submitted online',
        },
      });

      return newBooking;
    });

    // 5. Trigger Mock Messaging Notification
    await messagingService.sendBookingConfirmation({
      reference: booking.reference,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      serviceTitle: booking.service.title,
      pickupAddress: booking.pickupAddress,
      pickupDateTime: booking.pickupDateTime,
      estimatedFare: booking.estimatedAmount,
    }).catch((err) => console.error('Notification dispatch warning:', err));

    const whatsappLink = messagingService.generateBookingWhatsAppLink(booking.reference);

    return NextResponse.json(
      {
        success: true,
        bookingReference: booking.reference,
        bookingId: booking.id,
        status: booking.status,
        estimatedFare: booking.estimatedAmount,
        whatsappLink,
        message: 'Booking request created successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing booking.' },
      { status: 500 }
    );
  }
}

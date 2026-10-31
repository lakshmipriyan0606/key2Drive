import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { BookingStatusUpdateSchema } from '@/lib/validations/booking';
import {
  isValidStatusTransition,
  ALLOWED_STATUS_TRANSITIONS,
  BookingStatus,
} from '@/lib/validations/status';
import messagingService from '@/lib/integrations/messaging';

export async function PATCH(
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
    const validated = BookingStatusUpdateSchema.parse(json);

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id },
          { reference: id.toUpperCase() },
        ],
      },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with identifier '${id}' not found.` },
        { status: 404 }
      );
    }

    const currentStatus = booking.status as BookingStatus;
    const nextStatus = validated.status as BookingStatus;

    // Reject no-op status transition
    if (currentStatus === nextStatus) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking is already in '${currentStatus}' status. No transition performed.`,
        },
        { status: 400 }
      );
    }

    // Validate state machine rules:
    // REQUESTED -> CONFIRMED | REJECTED | CANCELLED
    // CONFIRMED -> COMPLETED | CANCELLED
    if (!isValidStatusTransition(currentStatus, nextStatus)) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition from '${currentStatus}' to '${nextStatus}'.`,
          allowedTransitions: allowed,
        },
        { status: 422 }
      );
    }

    // Atomic update of status and audit trail record
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: nextStatus,
          ...(validated.finalAmount ? { finalAmount: validated.finalAmount } : {}),
        },
        include: {
          service: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: currentStatus,
          toStatus: nextStatus,
          changedBy: session.user.email,
          note: validated.note ?? `Status transitioned from ${currentStatus} to ${nextStatus}`,
        },
      });

      return updated;
    });

    // Send mock SMS notification for status change
    await messagingService.sendStatusUpdateNotification(
      updatedBooking.customerPhone,
      updatedBooking.customerName,
      updatedBooking.reference,
      nextStatus,
      validated.note ?? undefined
    ).catch((err) => console.error('Status notification warning:', err));

    return NextResponse.json(
      {
        success: true,
        booking: updatedBooking,
        message: `Booking status successfully changed to ${nextStatus}.`,
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
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error transitioning status.' },
      { status: 500 }
    );
  }
}

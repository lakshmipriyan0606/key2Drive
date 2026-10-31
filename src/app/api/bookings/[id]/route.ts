import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import messagingService from '@/lib/integrations/messaging';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking identifier is required.' },
        { status: 400 }
      );
    }

    const trimmed = id.trim();

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { reference: trimmed.toUpperCase() },
          { id: trimmed },
        ],
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            priceUnit: true,
          },
        },
        statusHistory: {
          select: {
            toStatus: true,
            note: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking '${id}' not found.` },
        { status: 404 }
      );
    }

    // Mask sensitive contact details for public lookup
    const maskedPhone = booking.customerPhone.replace(/(\d{2})\d+(\d{2})/, '$1******$2');
    const [user, domain] = booking.customerEmail.split('@');
    const maskedEmail = user ? `${user.charAt(0)}***@${domain}` : '***@***';

    const whatsappLink = messagingService.generateBookingWhatsAppLink(booking.reference);

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          reference: booking.reference,
          status: booking.status,
          customerName: booking.customerName,
          customerPhone: maskedPhone,
          customerEmail: maskedEmail,
          pickupAddress: booking.pickupAddress,
          dropAddress: booking.dropAddress,
          pickupDateTime: booking.pickupDateTime,
          duration: booking.duration,
          vehicleInfo: booking.vehicleInfo,
          estimatedAmount: booking.estimatedAmount,
          finalAmount: booking.finalAmount,
          service: booking.service,
          statusHistory: booking.statusHistory,
          createdAt: booking.createdAt,
          whatsappLink,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching booking by identifier:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving booking.' },
      { status: 500 }
    );
  }
}

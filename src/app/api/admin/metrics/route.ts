import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    const [
      totalBookings,
      requestedCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      rejectedCount,
      upcomingCount,
      revenueAggregate,
      totalEnquiries,
      pendingEnquiries,
      resolvedEnquiries,
      recentBookings,
      recentEnquiries,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'REQUESTED' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'REJECTED' } }),
      prisma.booking.count({
        where: {
          status: 'CONFIRMED',
          pickupDateTime: { gte: now },
        },
      }),
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: {
          finalAmount: true,
          estimatedAmount: true,
        },
      }),
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: 'PENDING' } }),
      prisma.enquiry.count({ where: { isResolved: true } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reference: true,
          customerName: true,
          customerPhone: true,
          status: true,
          estimatedAmount: true,
          pickupDateTime: true,
          createdAt: true,
          service: { select: { title: true } },
        },
      }),
      prisma.enquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          subject: true,
          status: true,
          isResolved: true,
          createdAt: true,
        },
      }),
    ]);

    const completedRevenue =
      revenueAggregate._sum.finalAmount ?? revenueAggregate._sum.estimatedAmount ?? 0;

    return NextResponse.json(
      {
        success: true,
        metrics: {
          // Flat attributes for page consumption
          totalBookings,
          requestedCount,
          confirmedCount,
          completedCount,
          cancelledCount,
          rejectedCount,
          upcomingCount,
          totalRevenue: completedRevenue,
          totalEnquiries,
          pendingEnquiries,
          resolvedEnquiries,
          recentBookings,
          recentEnquiries,

          // Nested attributes for contract compatibility
          bookings: {
            total: totalBookings,
            requested: requestedCount,
            confirmed: confirmedCount,
            completed: completedCount,
            cancelled: cancelledCount,
            rejected: rejectedCount,
            upcomingTrips: upcomingCount,
          },
          financials: {
            totalRevenue: completedRevenue,
            currency: 'INR',
          },
          enquiries: {
            total: totalEnquiries,
            pending: pendingEnquiries,
            resolved: resolvedEnquiries,
          },
          recentActivity: {
            bookings: recentBookings,
            enquiries: recentEnquiries,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error calculating dashboard metrics.' },
      { status: 500 }
    );
  }
}

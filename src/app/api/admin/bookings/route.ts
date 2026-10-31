import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { BookingQuerySchema } from '@/lib/validations/booking';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validated = BookingQuerySchema.parse(queryParams);

    const where: Prisma.BookingWhereInput = {};

    // Filter by status if not 'ALL'
    if (validated.status && validated.status !== 'ALL') {
      where.status = validated.status;
    }

    // Filter by service
    if (validated.serviceId) {
      where.serviceId = validated.serviceId;
    }

    // Search reference, customer name, phone, or email
    if (validated.search && validated.search.trim().length > 0) {
      const term = validated.search.trim();
      where.OR = [
        { reference: { contains: term } },
        { customerName: { contains: term } },
        { customerPhone: { contains: term } },
        { customerEmail: { contains: term } },
      ];
    }

    // Date range filter
    if (validated.startDate || validated.endDate) {
      where.pickupDateTime = {
        ...(validated.startDate ? { gte: new Date(validated.startDate) } : {}),
        ...(validated.endDate ? { lte: new Date(validated.endDate) } : {}),
      };
    }

    const skip = (validated.page - 1) * validated.limit;
    const take = validated.limit;

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { [validated.sortBy]: validated.sortOrder },
        include: {
          service: {
            select: { id: true, title: true, slug: true },
          },
          notes: {
            orderBy: { createdAt: 'desc' },
            include: {
              author: { select: { id: true, name: true, email: true } },
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        bookings,
        pagination: {
          total,
          page: validated.page,
          limit: validated.limit,
          totalPages: Math.ceil(total / validated.limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Error querying admin bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error querying bookings.' },
      { status: 500 }
    );
  }
}

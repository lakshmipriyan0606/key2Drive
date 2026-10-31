import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { EnquiryQuerySchema } from '@/lib/validations/enquiry';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validated = EnquiryQuerySchema.parse(queryParams);

    const where: Prisma.EnquiryWhereInput = {};

    if (validated.status && validated.status !== 'ALL') {
      where.status = validated.status;
    }

    if (validated.isResolved && validated.isResolved !== 'all') {
      where.isResolved = validated.isResolved === 'true';
    }

    if (validated.search && validated.search.trim().length > 0) {
      const term = validated.search.trim();
      where.OR = [
        { name: { contains: term } },
        { phone: { contains: term } },
        { email: { contains: term } },
        { subject: { contains: term } },
        { message: { contains: term } },
      ];
    }

    const skip = (validated.page - 1) * validated.limit;
    const take = validated.limit;

    const [total, enquiries] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({
        where,
        skip,
        take,
        orderBy: { [validated.sortBy]: validated.sortOrder },
        include: {
          notes: {
            orderBy: { createdAt: 'desc' },
            include: {
              author: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        enquiries,
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
    console.error('Error querying admin enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error querying enquiries.' },
      { status: 500 }
    );
  }
}

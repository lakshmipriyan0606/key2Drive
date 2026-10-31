import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

const AdminNoteSchema = z.object({
  content: z
    .string({ required_error: 'Note content is required' })
    .trim()
    .min(1, 'Note cannot be empty')
    .max(2000, 'Note cannot exceed 2000 characters'),
});

export async function POST(
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
    const validated = AdminNoteSchema.parse(json);

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id },
          { reference: id.toUpperCase() },
        ],
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with identifier '${id}' not found.` },
        { status: 404 }
      );
    }

    const note = await prisma.adminNote.create({
      data: {
        content: validated.content,
        authorId: session.user.id,
        bookingId: booking.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        note,
        message: 'Admin note attached successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error('Error attaching admin note:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error attaching note.' },
      { status: 500 }
    );
  }
}

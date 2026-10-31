import { NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { EnquiryUpdateSchema } from '@/lib/validations/enquiry';

const ExtendedEnquiryUpdateSchema = EnquiryUpdateSchema.extend({
  noteContent: z.string().trim().max(2000).optional(),
});

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
    const validated = ExtendedEnquiryUpdateSchema.parse(json);

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      return NextResponse.json(
        { success: false, error: `Enquiry with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    // Automatically synchronize status if isResolved is updated
    let nextStatus = validated.status ?? enquiry.status;
    if (validated.isResolved === true && !validated.status) {
      nextStatus = 'RESOLVED';
    } else if (validated.isResolved === false && enquiry.status === 'RESOLVED') {
      nextStatus = 'IN_REVIEW';
    }

    const updatedEnquiry = await prisma.$transaction(async (tx) => {
      // Optional note creation attached to enquiry
      if (validated.noteContent && validated.noteContent.trim().length > 0) {
        await tx.adminNote.create({
          data: {
            content: validated.noteContent.trim(),
            authorId: session.user.id,
            enquiryId: id,
          },
        });
      }

      return tx.enquiry.update({
        where: { id },
        data: {
          ...(validated.status !== undefined || validated.isResolved !== undefined ? { status: nextStatus } : {}),
          ...(validated.isResolved !== undefined ? { isResolved: validated.isResolved } : {}),
          ...(validated.internalNotes !== undefined ? { internalNotes: validated.internalNotes } : {}),
        },
        include: {
          notes: {
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { id: true, name: true, email: true } } },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        enquiry: updatedEnquiry,
        message: 'Enquiry updated successfully.',
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
    console.error('Error updating enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error updating enquiry.' },
      { status: 500 }
    );
  }
}

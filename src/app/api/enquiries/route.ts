import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { EnquiryCreateSchema } from '@/lib/validations/enquiry';
import messagingService from '@/lib/integrations/messaging';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 0. Rate limiting (15 enquiries per 10 minutes per IP)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`enquiry:${clientIp}`, 15, 600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many enquiry submissions. Please wait ${rateCheck.resetSeconds} seconds before trying again.`,
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
    const validated = EnquiryCreateSchema.parse(json);

    const enquiry = await prisma.enquiry.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
        status: 'PENDING',
        isResolved: false,
      },
    });

    // Send mock acknowledgment SMS
    await messagingService.sendEnquiryAcknowledgment(
      enquiry.phone,
      enquiry.name,
      enquiry.id
    ).catch((err) => console.error('Enquiry SMS acknowledgment warning:', err));

    const whatsappLink = messagingService.generateWhatsAppLink(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919600992709',
      `Hello Key2Drive Team, I submitted enquiry #${enquiry.id.slice(-6)} regarding: "${enquiry.subject}".`
    );

    return NextResponse.json(
      {
        success: true,
        enquiryId: enquiry.id,
        message: 'Your enquiry has been received. Our chauffeur team will reach out shortly.',
        whatsappLink,
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

    console.error('Error creating enquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error submitting enquiry.' },
      { status: 500 }
    );
  }
}

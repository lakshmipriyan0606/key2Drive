# Key2Drive Next.js 15 Server Route Handlers Specification

This document provides drop-in, production-ready route handler implementations for Key2Drive. All route handlers feature:
- Next.js 15 App Router compatibility (asynchronous `props.params` and `cookies()`)
- End-to-end Zod request validation
- Strict error boundaries with JSON error responses
- Database integration via `@/lib/db` singleton
- Session authentication verification via `@/lib/auth`
- Mock integration dispatches via `@/lib/integrations/messaging`

---

## 1. Public Routes

### 1.1 `GET /api/services`
**Target File**: `src/app/api/services/route.ts`

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const services = await prisma.service.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        tariffs: {
          orderBy: { baseRate: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Parse features if stored as JSON string
    const formattedServices = services.map((service) => {
      let parsedFeatures: string[] = [];
      try {
        if (service.features) {
          parsedFeatures = JSON.parse(service.features);
        }
      } catch {
        parsedFeatures = service.features
          ? service.features.split('\n').filter((f) => f.trim().length > 0)
          : [];
      }
      return {
        ...service,
        featuresList: parsedFeatures,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: formattedServices.length,
        services: formattedServices,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chauffeur services.' },
      { status: 500 }
    );
  }
}
```

---

### 1.2 `POST /api/bookings`
**Target File**: `src/app/api/bookings/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { BookingCreateSchema } from '@/lib/validations/booking';
import messagingService from '@/lib/integrations/messaging';

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
        { success: false, error: 'Selected chauffeur service was not found.' },
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
          fromStatus: 'NONE',
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
```

---

### 1.3 `GET /api/bookings/[reference]`
**Target File**: `src/app/api/bookings/[reference]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import messagingService from '@/lib/integrations/messaging';

export async function GET(
  request: Request,
  props: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await props.params;

    if (!reference || reference.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking reference is required.' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { reference: reference.trim().toUpperCase() },
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
        { success: false, error: `Booking reference '${reference}' not found.` },
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
    console.error('Error fetching booking by reference:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving booking.' },
      { status: 500 }
    );
  }
}
```

---

### 1.4 `POST /api/enquiries`
**Target File**: `src/app/api/enquiries/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { EnquiryCreateSchema } from '@/lib/validations/enquiry';
import messagingService from '@/lib/integrations/messaging';

export async function POST(request: Request) {
  try {
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
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210',
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
```

---

## 2. Admin Authentication Routes

### 2.1 `POST /api/admin/auth/login`
**Target File**: `src/app/api/admin/auth/login/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { AdminLoginSchema } from '@/lib/validations/auth';
import { verifyPassword, createAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validated = AdminLoginSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Administrator privileges required.' },
        { status: 403 }
      );
    }

    // Creates DB session and writes httpOnly cookie
    await createAdminSession(user.id);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Admin authentication successful.',
      },
      { status: 200 }
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

    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
```

---

### 2.2 `POST /api/admin/auth/logout`
**Target File**: `src/app/api/admin/auth/logout/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth';

export async function POST() {
  try {
    await destroyAdminSession();
    return NextResponse.json(
      { success: true, message: 'Admin logged out successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process logout.' },
      { status: 500 }
    );
  }
}
```

---

### 2.3 `GET /api/admin/auth/me`
**Target File**: `src/app/api/admin/auth/me/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const sessionContext = await getAdminSession();

    if (!sessionContext) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Active session not found.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: sessionContext.user,
        expiresAt: sessionContext.expiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error verifying session.' },
      { status: 500 }
    );
  }
}
```

---

## 3. Admin Operational Routes

### 3.1 `GET /api/admin/metrics`
**Target File**: `src/app/api/admin/metrics/route.ts`

```typescript
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
```

---

### 3.2 `GET /api/admin/bookings`
**Target File**: `src/app/api/admin/bookings/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { BookingQuerySchema } from '@/lib/validations/booking';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validated = BookingQuerySchema.parse(queryParams);

    const where: any = {};

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
            take: 3,
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
```

---

### 3.3 `PATCH /api/admin/bookings/[id]/status`
**Target File**: `src/app/api/admin/bookings/[id]/status/route.ts`

```typescript
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with ID '${id}' not found.` },
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
        where: { id },
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
          bookingId: id,
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
```

---

### 3.4 `POST /api/admin/bookings/[id]/notes`
**Target File**: `src/app/api/admin/bookings/[id]/notes/route.ts`

```typescript
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

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: `Booking with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    const note = await prisma.adminNote.create({
      data: {
        content: validated.content,
        authorId: session.user.id,
        bookingId: id,
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
```

---

### 3.5 `GET /api/admin/pricing`
**Target File**: `src/app/api/admin/pricing/route.ts`

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      include: {
        tariffs: {
          orderBy: { baseRate: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(
      {
        success: true,
        count: services.length,
        services,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin pricing:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error retrieving pricing data.' },
      { status: 500 }
    );
  }
}
```

---

### 3.6 `PUT /api/admin/pricing/[id]`
**Target File**: `src/app/api/admin/pricing/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { TariffUpdateSchema, ServiceUpdateSchema } from '@/lib/validations/tariff';

export async function PUT(
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
```

---

### 3.7 `GET /api/admin/enquiries`
**Target File**: `src/app/api/admin/enquiries/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { EnquiryQuerySchema } from '@/lib/validations/enquiry';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validated = EnquiryQuerySchema.parse(queryParams);

    const where: any = {};

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
```

---

### 3.8 `PATCH /api/admin/enquiries/[id]`
**Target File**: `src/app/api/admin/enquiries/[id]/route.ts`

```typescript
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
          ...(validated.status !== undefined ? { status: nextStatus } : {}),
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
```

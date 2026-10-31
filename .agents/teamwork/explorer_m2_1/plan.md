# Task Plan: Explorer M2-1 (Prisma Schema, SQLite Database & Migration Strategy)

**Agent**: Explorer M2-1 (`teamwork_explorer`)  
**Parent Orchestrator**: `23f99e34-2f7f-4f46-8d45-f706a088cfaf`  
**Working Directory**: `e:\project\actingDriver\.agents\teamwork\explorer_m2_1\`  
**Objective**:
1. Read `e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md` and `PROJECT.md § Interface Contracts`.
2. Inspect `prisma/schema.prisma` requirements:
   - Define SQLite datasource (`file:./dev.db`) and Prisma client generator.
   - Design 8 relational models:
     - `User`: id, email (unique), passwordHash, name, role (ADMIN/STAFF), createdAt, updatedAt, sessions, adminNotes.
     - `Session`: id, userId, token (unique), expiresAt, createdAt, user.
     - `Service`: id, slug (unique), title, tagline, description, features (JSON string / list), basePrice, priceUnit, isActive, sortOrder, createdAt, updatedAt, tariffs, bookings.
     - `Tariff`: id, serviceId, title, vehicleCategory, baseRate, extraHourRate, extraKmRate, nightChargeRate, waitingChargePerMin, isUnconfirmed, cancellationPolicy, createdAt, updatedAt, service.
     - `Booking`: id, reference (unique: K2D-YYYYMMDD-XXXX), status (REQUESTED, CONFIRMED, REJECTED, CANCELLED, COMPLETED), customerName, customerPhone, customerEmail, serviceId, pickupAddress, dropAddress, pickupDateTime, duration, vehicleInfo, specialInstructions, estimatedAmount, finalAmount, submissionHash (unique/indexed for idempotency), createdAt, updatedAt, service, statusHistory, notes.
     - `BookingStatusHistory`: id, bookingId, fromStatus, toStatus, changedBy, note, createdAt, booking.
     - `Enquiry`: id, name, phone, email, subject, message, status (PENDING, IN_REVIEW, RESOLVED), isResolved, internalNotes, createdAt, updatedAt, notes.
     - `AdminNote`: id, content, authorId, bookingId (optional), enquiryId (optional), createdAt, author, booking, enquiry.
3. Determine migration / schema synchronization commands (`npx prisma db push` or `npx prisma migrate dev`), database client singleton `@/lib/db.ts`, and connection pooling / file handling on Windows.
4. Deliver structured `handoff.md` with drop-in schema specification and exact verification commands.

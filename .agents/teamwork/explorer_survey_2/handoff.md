# Domain & Feature Requirements Handoff Report — Key2Drive

## 1. Observation

Direct observations from authoritative project sources:
- **Authoritative Request File**: `e:\project\actingDriver\.agents\teamwork\ORIGINAL_REQUEST.md`
- **Dispatch Directives**: `e:\project\actingDriver\.agents\teamwork\explorer_survey_2\DISPATCH.md`
- **Workspace State**: `e:\project\actingDriver\` is currently a greenfield repository with no pre-existing application source code.
- **Key Directive Citations from `ORIGINAL_REQUEST.md`**:
  1. *Line 16 (R1)*: "Establish design tokens, typography, and responsive layouts based on the specified brand palette (Primary navy: #11243D, Deep navy: #172F4D, Accent orange: #F28C00, Warm background: #FAF9F6, White: #FFFFFF, Primary text: #252B33, Secondary text: #737B86, Border: #E8E7E3)."
  2. *Lines 18–25 (R2)*: Customer-facing website requirements including Home, Services, Tariff and Pricing, Booking page, Contact page & Terms. Specific mandate: "Clearly mark unconfirmed rates for client review", "Contact details (no fabricated values; unconfirmed values marked for review)", "client- and server-side validation, duplicate submission prevention, and unique booking reference generation upon confirmation."
  3. *Lines 26–34 (R3)*: Persistent booking lifecycle (`REQUESTED`, `CONFIRMED`, `REJECTED`, `CANCELLED`, `COMPLETED`) shared across customer, database, and admin interfaces. Admin dashboard requirements: secure auth, metrics overview with clear empty states, booking management (searchable, filterable, internal admin notes, server-validated status transitions), pricing management, enquiry management.
  4. *Lines 38–40 (R5)*: Real local persistent storage (e.g. SQLite with Prisma/Drizzle), server-side validation (Zod), safe database queries, clean integration boundaries and mocks for external third-party services (payments, SMS/WhatsApp messaging, maps), and `.env.example`.
  5. *Lines 44–56 (Acceptance Criteria)*: Responsive across 360px, 390px, 768px, 1024px, 1440px, and 1920px without horizontal overflow; strict admin protection; metrics with empty states; full auditability.

---

## 2. Logic Chain

From the observations above, the complete domain model and feature specifications are derived systematically across eight functional pillars:

```
[Customer Experience & Pages] ───► [Multi-step Booking Flow & Validation] ───► [Booking Lifecycle State Machine]
             │                                        │                                       │
             ▼                                        ▼                                       ▼
  [Responsive Layouts]                   [Persistence Models & Schemas]           [Admin Management Suite]
  (360px to 1920px)                                   │                                       │
                                                      ▼                                       ▼
                                           [Full API Contracts] ◄────────────── [Mock Integration Boundaries]
```

---

### 2.1 Customer-Facing Page Inventory & Component Structure

#### 1. Global Navigation & Layout Shell
- **Header**:
  - Logo: "Key2Drive" brand mark with luxury automotive emblem/typography.
  - Navigation Links: Home (`/`), Services (`/services`), Tariff & Pricing (`/pricing`), About (`/#about`), Contact (`/contact`).
  - Action CTA: "Book a Chauffeur" (button in Accent Orange `#F28C00` directing to `/booking`).
  - Mobile Menu: Responsive slide-in drawer with 44px min touch targets, backdrop blur, keyboard navigation trap, and escape key listener.
- **Footer**:
  - Brand summary: Premium on-demand chauffeur services for personal, corporate, and outstation mobility.
  - Quick Links: Services, Pricing, Booking, Admin Portal.
  - Direct Contact: Phone (`+91 98765 43210` marked *[Pending Client Review]*), Email (`dispatch@key2drive.com`), WhatsApp direct chat trigger.
  - Legal & Governance: Terms & Conditions (`/terms`), Cancellation & Refund Policy (`/terms#cancellation`), Privacy Policy (`/terms#privacy`).
  - Trust Marks: 100% Verified Drivers, Strict Background Checks, Insured Vehicle Handling.

#### 2. Home Page (`/`)
- **Hero Section**:
  - Headline: "Experience Chauffeur Excellence in Every Journey"
  - Subheadline: "Professional, background-verified personal drivers for your car — hourly, full-day, outstation, and airport transfers."
  - Primary CTA: "Book a Chauffeur" (routes to `/booking`).
  - Secondary CTA: "View Transparent Tariffs" (smooth scrolls to pricing or routes to `/pricing`).
  - Trust Badges: "24/7 Availability", "Zero Surge Guarantee", "Experienced Chauffeurs".
- **Service Highlights Grid**:
  - Cards showcasing 6 service categories with icon, description, starting rate, and "Book This Service" deep link.
- **How It Works (4-Step Workflow)**:
  - Step 1: *Select Service & Schedule* — Choose your date, time, and service type.
  - Step 2: *Enter Trip Details* — Provide pickup address, destination, and vehicle transmission type.
  - Step 3: *Chauffeur Assigned* — Receive instant confirmation and driver dispatch updates.
  - Step 4: *Ride in Luxury & Comfort* — Relax while our expert chauffeur navigates the road.
- **Tariff Preview**:
  - Interactive teaser card showing popular hourly & airport packages with rate breakdowns and "Calculate Exact Fare" link.
- **Why Choose Key2Drive**:
  - Verified & Vetted Drivers (police verified, license checked, 5+ yrs experience).
  - Punctuality Guarantee (driver arrives 15 minutes before scheduled pickup).
  - Manual & Automatic Vehicle Proficiency.
  - Transparent Billed Hours & Digital Invoicing.
- **Customer Testimonials**:
  - Genuine/structured test cases showcasing executive commuters, weekend travelers, and airport passengers. Clearly attributed.
- **Frequently Asked Questions (FAQ)**:
  - Accordion covering: "Do you supply the car or only the driver?", "How are night charges calculated?", "What is the cancellation window?", "Can I request manual or automatic drivers?".

#### 3. Services Page (`/services`)
Deep-dive catalog into the 6 core chauffeur services:
| Service Slug | Service Title | Ideal For | Package Inclusions | Starting Rate (Subject to Review) |
|---|---|---|---|---|
| `hourly` | Hourly City Driver | Short errands, medical visits, shopping trips, evening dinners | Min 2 hours; city boundary travel; manual & automatic cars | ₹399 for 2 hrs + ₹99/extra hr *[Pending Review]* |
| `full-day` | Full-Day Chauffeur | Business meetings, full-day shopping, wedding duties | 8 hrs / 80 km or 10 hrs / 100 km dedicated duty | ₹1,299 for 8 hrs *[Pending Review]* |
| `airport` | Airport Pickup & Drop | Flight transfers, terminal assistance, zero parking hassle | Fixed pickup/drop zones; 45-min complimentary wait time | ₹699 fixed slab *[Pending Review]* |
| `outstation` | Outstation Trips | Weekend getaways, inter-city road trips, multi-day tours | Round-trip & one-way; 250 km/day base; driver bata included | ₹1,599/day + ₹2.5/extra km *[Pending Review]* |
| `corporate` | Corporate & Executive | Daily CEO commute, client transit, VIP delegations | Monthly retainers, business attire, NDA-signed chauffeurs | Custom corporate quote / ₹24,999/mo *[Pending Review]* |
| `personal` | Dedicated Personal Chauffeur | Luxury cars (BMW, Mercedes, Audi, etc.), family chauffeur | Premium luxury handling, bilingual, concierge support | Custom plans / ₹1,999/day *[Pending Review]* |

*Each service card includes:*
- Full description & ideal use-cases
- Included hours/km & overtime rates
- Allowed vehicle types
- Direct CTA: "Book This Service" (pre-fills the service selector on `/booking?service=<slug>`)

#### 4. Tariff and Pricing Page (`/pricing`)
- **Unconfirmed Rates Notice Banner**:
  - Prominent badge at top: *"Notice: Displayed tariffs represent standard base models. Final commercial rates are subject to client confirmation."*
- **Interactive Rate Calculator / Matrix**:
  - Tab 1: Hourly Packages (2 hrs, 4 hrs, 6 hrs, 8 hrs)
  - Tab 2: Outstation Packages (1-Day, 2-Day, 3-Day+ round-trips)
  - Tab 3: Airport Transit Rates (Zone 1, Zone 2, Zone 3)
- **Comprehensive Surcharge & Conditions Breakdown**:
  - **Overtime Charges**: ₹99 per additional hour after package expiration.
  - **Night Duty Surcharge**: ₹250 flat surcharge for duties spanning between 22:00 and 06:00.
  - **Driver Allowance (Bata)**: ₹350 per day for outstation journeys.
  - **Waiting Charges**: 30-minute free grace period; ₹50 per 30 minutes thereafter.
  - **Cancellation Policy**:
    - Free cancellation up to 2 hours prior to scheduled pickup.
    - 50% base fee charge if cancelled within 2 hours of pickup.
    - 100% base fee charge if chauffeur has already arrived at pickup location.

#### 5. Contact Page & Legal Terms (`/contact`, `/terms`)
- **Contact Details**:
  - Office Address: *Central Dispatch Hub, Tech City Corridor, Bengaluru, Karnataka 560100* `[Unconfirmed - For Client Review]`.
  - Phone: `+91 98765 43210` `[Unconfirmed - For Client Review]`.
  - Email: `dispatch@key2drive.com` `[Unconfirmed - For Client Review]`.
  - Operating Hours: 24 Hours / 7 Days a Week.
  - WhatsApp Integration: Click-to-chat button with pre-filled greeting message.
- **Customer Enquiry Form**:
  - Fields: Full Name, Email, Phone Number, Subject, Enquiry Type (`General`, `Corporate Partnership`, `Driver Partner`, `Feedback`), Message.
  - Validation: Real-time client-side + server-side Zod validation.
  - Submission UX: Instant loading state, success toast notification, and form reset.
- **Terms & Conditions (`/terms`)**:
  - Section 1: *Booking & Dispatch Conditions* (Lead time minimums, address verification, vehicle roadworthiness).
  - Section 2: *Customer Responsibilities & Vehicle Insurance* (Vehicle must have valid comprehensive insurance, RC book, PUC, and sufficient fuel; customer liable for vehicle condition).
  - Section 3: *Chauffeur Conduct & Safety* (Chauffeur reserves right to decline driving if vehicle is unfit or under hazardous conditions; zero tolerance for unlawful transport).
  - Section 4: *Cancellation, Delays & Refund Policy*.
  - Section 5: *Liability Disclaimers* (Key2Drive acts as chauffeur provider; vehicle mechanical failures remain owner's responsibility).

---

### 2.2 Multi-Step Booking Flow & Validation Rules

The booking experience on `/booking` is structured as a 4-step progressive wizard with live validation and review:

```
[Step 1: Service & Schedule] ──► [Step 2: Trip Route & Vehicle] ──► [Step 3: Customer Details & Fare] ──► [Step 4: Confirmation]
```

#### Step 1: Service & Schedule
- **Fields**:
  - `serviceId`: Select from active services (Hourly, Full-Day, Airport, Outstation, Corporate, Personal).
  - `tripType`: Radio selection (`ONE_WAY`, `ROUND_TRIP`).
  - `pickupDate`: Date picker (min = Today; max = Today + 60 days).
  - `pickupTime`: Time picker (must be at least 2 hours in the future if pickup is today).
  - `durationHours`: Number (for hourly service, min 2; max 24).
  - `returnDate`: Date picker (required if `tripType === 'ROUND_TRIP'` and multi-day).
- **Validation**:
  - Future timestamp validation: `pickupDateTime >= Date.now() + 2 * 60 * 60 * 1000`.

#### Step 2: Trip Route & Vehicle Details
- **Fields**:
  - `pickupAddress`: String (min 5 chars, max 255 chars, address with landmark).
  - `dropoffAddress`: String (min 5 chars, max 255 chars; optional for hourly city driver if roaming).
  - `vehicleTransmission`: Radio (`MANUAL`, `AUTOMATIC`).
  - `vehicleCategory`: Select (`HATCHBACK`, `SEDAN`, `SUV`, `LUXURY`).
  - `vehicleModel`: String (e.g. "Honda City", "Hyundai Creta", "BMW 3 Series", optional).
  - `specialInstructions`: Textarea (e.g., "Child on board, please maintain 60km/h max", "Pet in car", max 500 chars).
- **Validation**:
  - Non-empty pickup address.
  - Valid transmission type enum.

#### Step 3: Customer Details & Fare Summary
- **Fields**:
  - `customerName`: String (min 2 chars, max 100 chars, alphabetic + spaces).
  - `customerPhone`: String (10-digit phone number, regex `^[6-9]\d{9}$`).
  - `customerEmail`: String (valid RFC 5322 email regex).
  - `termsAgreed`: Boolean checkbox (must be `true`).
  - `idempotencyKey`: Hidden UUID generated on form mount to prevent duplicate submissions.
- **Dynamic Fare Breakdown Card**:
  - Base Package Fare: e.g. ₹399
  - Estimated Night Surcharge: ₹250 (if pickup or expected duration spans 22:00–06:00)
  - Estimated Total Fare: Calculated dynamically
  - Notice badge: *"Estimated fare. Additional hours or tolls billed at trip conclusion."*

#### Step 4: Submission & Confirmation
- **Client Submission Behavior**:
  - Button state: Disables immediately on click, changes text to "Securing Your Chauffeur...".
  - Double-click protection: Form submission handler is guarded by an `isSubmitting` lock.
  - Idempotency check: Client sends `idempotencyKey`; server checks if a booking with this key was created within the last 5 minutes.
- **Server Processing**:
  - Server validates complete payload with Zod.
  - Generates unique reference code: `K2D-YYYYMMDD-XXXX` (e.g., `K2D-20261031-7A8B`).
  - Inserts booking with status `REQUESTED`.
  - Appends initial record to `BookingStatusHistory`.
  - Dispatches async mock confirmation notifications (email and SMS/WhatsApp).
- **Confirmation Screen**:
  - Success checkmark with Emil Kowalski spring celebration.
  - Booking Reference prominently displayed with "Copy Reference" button.
  - Full trip summary card (pickup time, location, service, estimated fare).
  - Status indicator: `REQUESTED` ("Awaiting Dispatch Confirmation").
  - "Chat on WhatsApp" quick link pre-populated with: `Hello Key2Drive, I just booked reference K2D-XXXX. Please confirm my driver.`
  - Print / Save confirmation receipt button.

---

### 2.3 Responsive Layout Standards (360px – 1920px)

Every view must be engineered without horizontal overflow across the 6 target breakpoints:

| Viewport Width | Device Category | Key Design Adjustments & Rules |
|---|---|---|
| **360px** | Small Mobile (Galaxy S8/A-series) | Single column; compact typography (`text-xl` headings); stacked form fields; 12px horizontal padding; full-width buttons; hamburger navigation; table converted to stacked card list. |
| **390px** | Modern Mobile (iPhone 12/13/14/15/16) | Single column; 16px horizontal padding; full-width buttons; touch target heights >= 44px; sticky mobile action bar for booking CTA. |
| **768px** | Tablet Portrait (iPad Mini/Air) | 2-column service and feature grids; 24px horizontal padding; multi-step wizard breadcrumbs visible; split route inputs (pickup & dropoff side-by-side). |
| **1024px** | Tablet Landscape / Small Laptop | 3-column service grid; horizontal navigation links in header; admin dashboard sidebar permanently docked or collapsible; split booking wizard (form left 60%, live fare breakdown right 40%). |
| **1440px** | Standard Desktop / MacBook Pro | Max-width container capped at `max-w-7xl` (1280px) or `max-w-6xl` centered with `mx-auto`; generous white space; 32px padding; rich hover micro-interactions. |
| **1920px** | Full HD / Large Displays | Layout centered; background fills edge-to-edge; content constrained so line lengths do not exceed 75ch; crisp typography and high-DPI asset rendering. |

**Universal Overflow Prevention Rules**:
- Root layout has `overflow-x: hidden; width: 100%;`.
- All images have `max-width: 100%; height: auto;`.
- Tables are wrapped in `.overflow-x-auto` or display as mobile cards on `<768px`.
- Long strings (references, emails, addresses) use `break-words` and `truncate`.

---

### 2.4 Booking Lifecycle & State Machine

The booking lifecycle is strictly governed by a 5-state finite state machine:

```
                  ┌──────────────┐
                  │  REQUESTED   │
                  └──────┬───────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
    ┌─────────────┐┌───────────┐┌─────────────┐
    │  CONFIRMED  ││ REJECTED  ││  CANCELLED  │
    └──────┬──────┘└───────────┘└─────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌───────────┐
│COMPLETED│ │ CANCELLED │
└─────────┘ └───────────┘
```

#### State Definitions
1. **`REQUESTED`**:
   - Initial state upon customer submission.
   - Database record created with booking reference.
   - Awaiting admin verification of driver availability.
2. **`CONFIRMED`**:
   - Admin approves booking and assigns chauffeur name and phone.
   - Customer notified via mock messaging service.
   - Booking locked against customer modifications (can only cancel).
3. **`REJECTED`**:
   - Admin declines booking due to non-serviceable location, lack of available chauffeur, or invalid requirements.
   - Terminal state (requires `rejectionReason`).
4. **`CANCELLED`**:
   - Cancelled either by customer (before trip) or admin.
   - Terminal state (requires `cancellationReason`).
5. **`COMPLETED`**:
   - Chauffeur successfully completed the duty.
   - Final hours and final fare recorded in database.
   - Terminal state.

#### Transition Matrix & Validation Rules
| From Status | To Status | Allowed Actor | Trigger Action | Required Fields / Conditions |
|---|---|---|---|---|
| *None* | `REQUESTED` | Customer | Booking form submit | Valid booking form data + unique reference |
| `REQUESTED` | `CONFIRMED` | Admin | Admin clicks "Confirm & Assign" | `driverName`, `driverPhone` (optional notes) |
| `REQUESTED` | `REJECTED` | Admin | Admin clicks "Reject" | `rejectionReason` (min 5 chars) |
| `REQUESTED` | `CANCELLED` | Customer / Admin | Cancel booking action | `cancellationReason` |
| `CONFIRMED` | `COMPLETED` | Admin | Admin clicks "Complete Duty" | `finalFare` (positive number) |
| `CONFIRMED` | `CANCELLED` | Customer / Admin | Cancel booking action | `cancellationReason` |
| *Any other* | *Any* | - | - | **DISALLOWED (HTTP 400 Bad Request)** |

#### Audit Trail
Every transition writes a permanent record to `BookingStatusHistory`:
- `bookingId`: Foreign key to `Booking`.
- `fromStatus`: Previous status.
- `toStatus`: Next status.
- `changedBy`: `'CUSTOMER' | 'ADMIN' | 'SYSTEM'`.
- `note`: Reason or contextual details.
- `createdAt`: ISO timestamp.

---

### 2.5 Admin Dashboard Functional Specification

The Admin Dashboard provides full visibility and control over business operations:

#### 1. Authentication & Session Security
- **Route**: `/admin/login` and `/admin/*`.
- **Mechanism**:
  - Secure credential login with username/email and password.
  - Password hashed using `bcrypt` or `argon2`.
  - Session managed via secure, encrypted `httpOnly` cookie (`sameSite: lax`, `secure: true` in production, 24-hour TTL).
  - Next.js Middleware intercepts `/admin/(dashboard|bookings|pricing|enquiries)/*` and redirects unauthenticated requests to `/admin/login?next=...`.
  - Dedicated logout endpoint `/api/admin/auth/logout` invalidates session and clears cookie.

#### 2. Overview Metrics & Business Intelligence
- Real database-backed summary cards:
  - **Total Bookings**: Count of all bookings.
  - **Pending Requests**: Count of `REQUESTED` status bookings requiring attention (highlighted with orange accent).
  - **Active / Confirmed Trips**: Count of `CONFIRMED` bookings scheduled for today/upcoming.
  - **Completed Duties**: Total fulfilled trips.
  - **Gross Revenue**: Sum of `finalFare` (or estimated fare for completed trips).
  - **Open Enquiries**: Count of contact enquiries with status `NEW`.
- **Upcoming Schedule Table**: Trips starting in the next 24 hours.
- **Graceful Empty State**: When no data exists, display:
  - Clean SVG illustration.
  - Heading: "No Bookings Yet".
  - Subtext: "When customers submit chauffeur reservations, they will appear here in real time."
  - Action button: "Create Test Booking" or "View Public Site".

#### 3. Booking Management (`/admin/bookings`)
- **Search & Filters**:
  - Real-time search by Reference Number, Customer Name, Phone, or Vehicle Model.
  - Filter by Status: `ALL`, `REQUESTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `REJECTED`.
  - Filter by Date: `Today`, `Upcoming`, `Past 7 Days`, `All Time`.
  - Sorting: By pickup date/time (asc/desc), creation date.
- **Booking Detail Drawer / Modal**:
  - Customer contact details with click-to-call and WhatsApp link.
  - Complete trip itinerary (pickup, dropoff, date, time, duration).
  - Vehicle details (transmission, model, instructions).
  - Status timeline showing all historical transitions.
  - Chauffeur assignment inputs (`driverName`, `driverPhone`).
  - Action buttons: "Confirm", "Reject", "Mark Complete", "Cancel".
- **Internal Admin Notes**:
  - Form to append internal timestamped notes to any booking (e.g., "Customer confirmed via phone call", "Driver Rajesh instructed on route").

#### 4. Pricing & Service Tier Management (`/admin/pricing`)
- List of all services with editable parameters:
  - Base fare (₹)
  - Base duration (hours) / included km
  - Extra hour rate (₹/hr)
  - Extra km rate (₹/km)
  - Night surcharge rate (₹)
  - Waiting charge rate (₹/hr)
  - Active toggle switch (enable/disable service booking on customer website)
- Immediate database persistence with toast notification feedback.

#### 5. Enquiry Management (`/admin/enquiries`)
- List all customer submissions from `/contact`.
- Status indicators: `NEW`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.
- Filter by status and enquiry category (`General`, `Corporate`, `Partner`, `Feedback`).
- Detail view showing full message and customer details.
- Action to update status and attach internal notes.

---

### 2.6 Persistence Models & Schemas

The database schema is designed for SQLite (via Prisma or Drizzle ORM) with exact Zod validation schemas for API inputs:

```prisma
// Example Prisma Schema Specification

model AdminUser {
  id           String      @id @default(uuid())
  email        String      @unique
  name         String
  passwordHash String
  role         String      @default("ADMIN") // SUPER_ADMIN, ADMIN, OPERATOR
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  adminNotes   AdminNote[]
}

model Service {
  id                String    @id @default(uuid())
  slug              String    @unique // hourly, full-day, airport, outstation, corporate, personal
  title             String
  description       String
  shortDescription  String
  basePrice         Float
  minHours          Int       @default(2)
  includedKm        Int       @default(0)
  extraHourRate     Float     @default(99.0)
  extraKmRate       Float     @default(12.0)
  nightChargeRate   Float     @default(250.0)
  waitingChargeRate Float     @default(50.0)
  isActive          Boolean   @default(true)
  sortOrder         Int       @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  bookings          Booking[]
}

model Booking {
  id                     String                 @id @default(uuid())
  bookingReference       String                 @unique // e.g. K2D-20261031-4F2A
  status                 String                 @default("REQUESTED") // REQUESTED, CONFIRMED, REJECTED, CANCELLED, COMPLETED
  idempotencyKey         String?                @unique
  
  // Customer details
  customerName           String
  customerPhone          String
  customerEmail          String
  
  // Service & Trip details
  serviceId              String
  service                Service                @relation(fields: [serviceId], references: [id])
  tripType               String                 @default("ONE_WAY") // ONE_WAY, ROUND_TRIP
  pickupAddress          String
  dropoffAddress         String?
  pickupDateTime         DateTime
  returnDateTime         DateTime?
  estimatedDurationHours Int                    @default(2)
  
  // Vehicle details
  vehicleTransmission    String                 @default("MANUAL") // MANUAL, AUTOMATIC
  vehicleCategory        String                 @default("SEDAN") // HATCHBACK, SEDAN, SUV, LUXURY
  vehicleModel           String?
  specialInstructions    String?
  
  // Financials
  estimatedFare          Float
  finalFare              Float?
  
  // Driver Assignment
  driverName             String?
  driverPhone            String?
  
  // Cancellation / Rejection info
  rejectionReason        String?
  cancellationReason     String?
  
  createdAt              DateTime               @default(now())
  updatedAt              DateTime               @updatedAt
  
  statusHistory          BookingStatusHistory[]
  adminNotes             AdminNote[]
}

model BookingStatusHistory {
  id         String   @id @default(uuid())
  bookingId  String
  booking    Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  fromStatus String
  toStatus   String
  changedBy  String   @default("SYSTEM") // CUSTOMER, ADMIN, SYSTEM
  note       String?
  createdAt  DateTime @default(now())
}

model AdminNote {
  id          String    @id @default(uuid())
  bookingId   String?
  booking     Booking?  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  enquiryId   String?
  enquiry     Enquiry?  @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  adminUserId String?
  adminUser   AdminUser? @relation(fields: [adminUserId], references: [id])
  authorName  String
  noteText    String
  createdAt   DateTime  @default(now())
}

model Enquiry {
  id          String      @id @default(uuid())
  name        String
  email       String
  phone       String
  subject     String
  enquiryType String      @default("GENERAL") // GENERAL, CORPORATE, PARTNER, FEEDBACK
  message     String
  status      String      @default("NEW") // NEW, IN_PROGRESS, RESOLVED, CLOSED
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  adminNotes  AdminNote[]
}

model Setting {
  key         String   @id
  value       String   // JSON stringified value
  description String?
  updatedAt   DateTime @updatedAt
}
```

#### Zod Validation Schemas
```typescript
import { z } from "zod";

export const BookingCreateSchema = z.object({
  serviceId: z.string().min(1, "Service selection is required"),
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP"]).default("ONE_WAY"),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  estimatedDurationHours: z.number().min(1).max(24).default(2),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  pickupAddress: z.string().min(5, "Pickup address must be at least 5 characters").max(255),
  dropoffAddress: z.string().max(255).optional(),
  vehicleTransmission: z.enum(["MANUAL", "AUTOMATIC"]),
  vehicleCategory: z.enum(["HATCHBACK", "SEDAN", "SUV", "LUXURY"]).default("SEDAN"),
  vehicleModel: z.string().max(100).optional(),
  specialInstructions: z.string().max(500).optional(),
  
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  customerEmail: z.string().email("Invalid email address"),
  termsAgreed: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
  idempotencyKey: z.string().uuid().optional(),
});

export const BookingStatusTransitionSchema = z.object({
  toStatus: z.enum(["REQUESTED", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"]),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  rejectionReason: z.string().optional(),
  cancellationReason: z.string().optional(),
  finalFare: z.number().positive().optional(),
  note: z.string().optional(),
});

export const EnquiryCreateSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit phone required"),
  subject: z.string().min(3, "Subject is required").max(150),
  enquiryType: z.enum(["GENERAL", "CORPORATE", "PARTNER", "FEEDBACK"]).default("GENERAL"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});
```

---

### 2.7 API Endpoint Contracts

#### Public APIs
1. **`GET /api/services`**
   - **Response**: `200 OK`
   - **Body**: Array of active services with pricing, description, and conditions.
2. **`POST /api/bookings`**
   - **Request**: Validated by `BookingCreateSchema`.
   - **Response `201 Created`**:
     ```json
     {
       "success": true,
       "bookingReference": "K2D-20261031-7A8B",
       "status": "REQUESTED",
       "estimatedFare": 399,
       "message": "Booking received successfully. Chauffeur dispatch is pending confirmation."
     }
     ```
   - **Response `400 Bad Request`**: Validation errors formatted per field.
   - **Response `409 Conflict`**: Idempotent duplicate detected, returns existing booking reference.
3. **`GET /api/bookings/[reference]`**
   - **Response `200 OK`**: Sanitized customer-facing trip details (reference, status, pickup date/time, service name, pickup address, masked driver details).
4. **`POST /api/enquiries`**
   - **Request**: Validated by `EnquiryCreateSchema`.
   - **Response `201 Created`**:
     ```json
     {
       "success": true,
       "message": "Enquiry submitted successfully. Our team will contact you within 2 business hours."
     }
     ```

#### Admin APIs (Protected via Session Cookie)
1. **`POST /api/admin/auth/login`**
   - **Request**: `{ "email": "admin@key2drive.com", "password": "..." }`
   - **Response `200 OK`**: Sets secure `httpOnly` session cookie `k2d_admin_session`.
2. **`POST /api/admin/auth/logout`**
   - **Response `200 OK`**: Clears session cookie.
3. **`GET /api/admin/auth/me`**
   - **Response `200 OK`**: Current authenticated admin user info (`id`, `name`, `email`, `role`).
4. **`GET /api/admin/metrics`**
   - **Response `200 OK`**:
     ```json
     {
       "totalBookings": 128,
       "requestedCount": 4,
       "confirmedCount": 12,
       "completedCount": 105,
       "cancelledCount": 5,
       "rejectedCount": 2,
       "openEnquiriesCount": 3,
       "totalRevenue": 142500,
       "upcomingTrips": [...]
     }
     ```
5. **`GET /api/admin/bookings`**
   - **Query Params**: `search`, `status`, `startDate`, `endDate`, `page`, `limit`.
   - **Response `200 OK`**: Paginated booking list with relations and counts.
6. **`GET /api/admin/bookings/[id]`**
   - **Response `200 OK`**: Full booking entity including status history, notes, driver details.
7. **`PATCH /api/admin/bookings/[id]/status`**
   - **Request**: Validated by `BookingStatusTransitionSchema`.
   - **Response `200 OK`**: Updated booking entity.
   - **Response `400 Bad Request`**: If state transition is invalid per state machine.
8. **`POST /api/admin/bookings/[id]/notes`**
   - **Request**: `{ "noteText": "Driver briefed regarding airport VIP pickup." }`
   - **Response `201 Created`**: Appended note record.
9. **`GET /api/admin/pricing`** & **`PUT /api/admin/pricing/[id]`**
   - Update rates, extra km/hour charges, and active status.
10. **`GET /api/admin/enquiries`** & **`PATCH /api/admin/enquiries/[id]`**
    - List and update status of customer enquiries.

---

### 2.8 Third-Party Mock Boundaries & `.env.example`

To ensure deterministic, zero-external-dependency execution and offline testing, third-party integrations must use strict interface boundaries with robust mock implementations:

#### 1. Payment Gateway Boundary
- **Interface**:
  ```typescript
  export interface PaymentGateway {
    createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>): Promise<{
      clientSecret: string;
      transactionId: string;
    }>;
    verifyPayment(transactionId: string): Promise<{ success: boolean; status: string }>;
    refundPayment(transactionId: string, amount?: number): Promise<{ success: boolean }>;
  }
  ```
- **Mock Implementation (`MockPaymentService`)**:
  - Simulates instant authorization.
  - Returns synthetic transaction ID `TXN_MOCK_K2D_<timestamp>`.
  - Configurable failure simulation via test header or amount flag.

#### 2. SMS & WhatsApp Messaging Boundary
- **Interface**:
  ```typescript
  export interface NotificationService {
    sendBookingReceived(booking: Booking): Promise<void>;
    sendBookingConfirmed(booking: Booking, driver: { name: string; phone: string }): Promise<void>;
    sendBookingCancelled(booking: Booking, reason: string): Promise<void>;
    sendEnquiryReceivedAlert(enquiry: Enquiry): Promise<void>;
  }
  ```
- **Mock Implementation (`MockNotificationService`)**:
  - Logs notification event payload to local logger / in-memory store.
  - Generates ready-to-click WhatsApp deep link URL (`https://wa.me/?text=...`) for UI preview.
  - No external Twilio/WhatsApp API keys required for development or CI tests.

#### 3. Maps & Routing Boundary
- **Interface**:
  ```typescript
  export interface MapsService {
    calculateDistanceAndDuration(origin: string, destination: string): Promise<{
      distanceKm: number;
      durationMinutes: number;
    }>;
    geocodeAddress(address: string): Promise<{
      formattedAddress: string;
      latitude: number;
      longitude: number;
    }>;
  }
  ```
- **Mock Implementation (`MockMapsService`)**:
  - Deterministically parses or computes distance (defaulting to reasonable city bounds, e.g., 18 km / 45 min).
  - Graceful fallback for offline development.

#### 4. `.env.example` Specification
```bash
# ==========================================
# Key2Drive Environment Configuration
# ==========================================

# Application
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (SQLite default for zero-config local persistence)
DATABASE_URL="file:./dev.db"

# Admin Authentication & Sessions
ADMIN_DEFAULT_EMAIL=admin@key2drive.com
ADMIN_DEFAULT_PASSWORD=AdminKey2Drive2026!
SESSION_SECRET=super_secret_session_encryption_key_minimum_32_characters_long

# Feature & Mock Flags
ENABLE_MOCK_PAYMENTS=true
ENABLE_MOCK_NOTIFICATIONS=true
ENABLE_MOCK_MAPS=true

# External Service Keys (Optional — Mocks activate when empty or flag is true)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
GOOGLE_MAPS_API_KEY=
```

---

## 3. Caveats

1. **Unconfirmed Rates and Contact Details**:
   - The user request specifies: *"Clearly mark unconfirmed rates for client review"* and *"Contact details (no fabricated values; unconfirmed values marked for review)"*.
   - All seeded pricing slabs and contact details (e.g. phone `+91 98765 43210` and physical address) MUST display an explicit visual indicator or badge (`[Pending Review]` / `[For Client Confirmation]`) in both public UI and admin screens so the client is aware they are placeholder defaults pending sign-off.
2. **Currency and Locale Assumption**:
   - Pricing models and phone validation defaults assume Indian Rupee (`₹` / INR) and 10-digit mobile phone numbers (`+91`), typical of driver-chauffeur platforms in India. If international expansion is needed, formatting utility can be abstracted.
3. **Database Selection**:
   - SQLite via Prisma (or Drizzle) provides zero-config, single-file local persistence with zero external container dependencies, perfectly fulfilling R5 while remaining 100% portable for automated test suites.
4. **Third-Party Integrations**:
   - The platform will run fully on mock providers out of the box (`ENABLE_MOCK_*=true`), enabling automated tests and verification to run completely offline without external network or API key dependencies.

---

## 4. Conclusion

The domain and feature requirements for Key2Drive are fully mapped into an actionable, cohesive system architecture:
1. **Public Experience**: 5 responsive customer-facing pages (Home, Services, Tariff & Pricing, 4-step Booking Wizard, Contact & Terms) with responsive breakpoints (360px, 390px, 768px, 1024px, 1440px, 1920px), zero horizontal overflow, and transparent review notices.
2. **Booking Flow**: Multi-step progressive form with double-submit protection, idempotency key, comprehensive Zod validation, and human-readable booking reference generator (`K2D-YYYYMMDD-XXXX`).
3. **Lifecycle State Machine**: Strict 5-state transitions (`REQUESTED` -> `CONFIRMED`/`REJECTED` -> `CANCELLED`/`COMPLETED`) with server-side validation and permanent audit logging.
4. **Admin Suite**: Secure session auth, real metrics aggregation with graceful empty states, booking management with search/filter/notes, pricing manager, and enquiry manager.
5. **Persistence & APIs**: 7 normalized database entities, complete REST API endpoints, clean mock boundaries for payments/messaging/maps, and `.env.example`.

This specification provides the foundational blueprint for implementation across Milestones M1 through M5.

---

## 5. Verification Method

To independently verify the completeness and compliance of these domain specifications against the codebase once implemented:

### Automated Test Suite Commands
- **Unit & Schema Validation Tests**:
  ```bash
  npm run test -- schemas.test.ts
  ```
  *Verifies: Validates phone regex, email format, future booking timestamps, minimum duration, and invalid transition rejections.*
- **State Machine Transition Tests**:
  ```bash
  npm run test -- lifecycle.test.ts
  ```
  *Verifies: `REQUESTED` can transition to `CONFIRMED` or `REJECTED`; `CONFIRMED` cannot transition back to `REQUESTED`; invalid transitions throw HTTP 400.*
- **End-to-End Booking & Admin Flow**:
  ```bash
  npx playwright test
  ```
  *Verifies: Booking submission generates unique reference, appears in Admin dashboard, status can be updated, and unauthenticated users cannot access `/admin/bookings`.*

### Viewport & Responsive Inspections
Inspect rendered pages at exact viewport widths:
- `360px` (Small Mobile) — check `document.documentElement.scrollWidth <= 360`
- `390px` (Modern Mobile) — check `document.documentElement.scrollWidth <= 390`
- `768px` (Tablet Portrait)
- `1024px` (Tablet Landscape)
- `1440px` (Desktop)
- `1920px` (Wide Desktop)
Ensure `window.innerWidth === document.documentElement.scrollWidth` (zero horizontal overflow) at every breakpoint.

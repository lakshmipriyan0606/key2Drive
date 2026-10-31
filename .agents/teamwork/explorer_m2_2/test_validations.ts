import {
  BookingCreateSchema,
  BookingStatusTransitionSchema,
  isValidStatusTransition,
  getAllowedNextStatuses,
  EnquiryCreateSchema,
  TariffUpdateSchema,
  AdminLoginSchema,
  AdminNoteCreateSchema,
  sanitizeIndianPhone,
} from "./validations";

console.log("=== Running Key2Drive Validation Schema Tests ===");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

// 1. Phone sanitization & validation
console.log("\n[1] Testing Indian Phone Sanitizer & Schema:");
assert(sanitizeIndianPhone("+91 98765-43210") === "9876543210", "Strips +91, spaces and hyphens");
assert(sanitizeIndianPhone("09876543210") === "9876543210", "Strips leading 0");
assert(sanitizeIndianPhone("9876543210") === "9876543210", "Leaves clean 10-digit unchanged");

const phoneRes1 = EnquiryCreateSchema.safeParse({
  name: "Rajesh Kumar",
  phone: "+91 98765 43210",
  email: "rajesh@example.com",
  subject: "Airport Pickup Query",
  message: "I need an early morning pickup from Whitefield to KIA Airport.",
});
assert(phoneRes1.success, "Accepts formatted Indian mobile number and sanitizes it");
if (phoneRes1.success) {
  assert(phoneRes1.data.phone === "9876543210", "Sanitized phone is exactly 10 digits");
}

const phoneRes2 = EnquiryCreateSchema.safeParse({
  name: "Invalid User",
  phone: "1234567890", // Does not start with 6,7,8,9
  email: "invalid@example.com",
  subject: "Testing Invalid Phone",
  message: "This should fail because phone does not start with 6-9.",
});
assert(!phoneRes2.success, "Rejects mobile number not starting with 6, 7, 8, or 9");

// 2. Future pickup date & time validation
console.log("\n[2] Testing Future Pickup DateTime Validation:");
const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const validFutureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

const bookingPast = BookingCreateSchema.safeParse({
  customerName: "Aditi Rao",
  customerPhone: "9876543210",
  customerEmail: "aditi@example.com",
  serviceId: "srv-hourly-driver",
  pickupAddress: "100 Feet Rd, Indiranagar, Bangalore",
  pickupDateTime: pastDate,
  vehicleInfo: "Honda City (Manual)",
  estimatedAmount: 1596,
  submissionHash: "hash-aditi-20261031-01",
});
assert(!bookingPast.success, "Rejects past pickup date and time");

const bookingValid = BookingCreateSchema.safeParse({
  customerName: "Aditi Rao",
  customerPhone: "+91 98765 43210",
  customerEmail: "aditi@example.com",
  serviceId: "srv-hourly-driver",
  pickupAddress: "100 Feet Rd, Indiranagar, Bangalore",
  dropAddress: "MG Road, Bangalore",
  pickupDateTime: validFutureDate,
  duration: 4,
  vehicleInfo: {
    make: "Honda",
    model: "City",
    transmission: "MANUAL",
    category: "SEDAN",
  },
  specialInstructions: "Driver should arrive at back gate.",
  estimatedAmount: 1596,
  submissionHash: "hash-aditi-20261031-01",
});
assert(bookingValid.success, "Accepts valid future booking with object vehicleInfo and number duration");
if (bookingValid.success) {
  assert(bookingValid.data.customerPhone === "9876543210", "Phone sanitized on booking");
  assert(bookingValid.data.vehicleInfo === "Honda City (MANUAL, SEDAN)", "VehicleInfo transformed to string");
  assert(bookingValid.data.duration === "4 hours", "Duration transformed to human string");
}

// 3. Status Transition State Machine
console.log("\n[3] Testing Booking Lifecycle State Machine:");
assert(isValidStatusTransition("REQUESTED", "CONFIRMED"), "REQUESTED -> CONFIRMED is valid");
assert(isValidStatusTransition("REQUESTED", "REJECTED"), "REQUESTED -> REJECTED is valid");
assert(isValidStatusTransition("REQUESTED", "CANCELLED"), "REQUESTED -> CANCELLED is valid");
assert(!isValidStatusTransition("REQUESTED", "COMPLETED"), "REQUESTED -> COMPLETED is invalid (must be confirmed first)");
assert(isValidStatusTransition("CONFIRMED", "COMPLETED"), "CONFIRMED -> COMPLETED is valid");
assert(isValidStatusTransition("CONFIRMED", "CANCELLED"), "CONFIRMED -> CANCELLED is valid");
assert(!isValidStatusTransition("COMPLETED", "CONFIRMED"), "COMPLETED is terminal (no transitions allowed)");
assert(!isValidStatusTransition("CANCELLED", "REQUESTED"), "CANCELLED is terminal (no transitions allowed)");
assert(!isValidStatusTransition("REJECTED", "CONFIRMED"), "REJECTED is terminal (no transitions allowed)");

const transitionValid = BookingStatusTransitionSchema.safeParse({
  currentStatus: "REQUESTED",
  nextStatus: "CONFIRMED",
  note: "Driver assigned: Ramesh Kumar",
  changedBy: "admin@key2drive.com",
});
assert(transitionValid.success, "BookingStatusTransitionSchema allows REQUESTED -> CONFIRMED");

const transitionInvalid = BookingStatusTransitionSchema.safeParse({
  currentStatus: "REQUESTED",
  nextStatus: "COMPLETED",
  changedBy: "admin@key2drive.com",
});
assert(!transitionInvalid.success, "BookingStatusTransitionSchema rejects illegal transition REQUESTED -> COMPLETED");

const transitionSame = BookingStatusTransitionSchema.safeParse({
  currentStatus: "CONFIRMED",
  nextStatus: "CONFIRMED",
  changedBy: "admin@key2drive.com",
});
assert(!transitionSame.success, "BookingStatusTransitionSchema rejects no-op transition (CONFIRMED -> CONFIRMED)");

// 4. Tariff & Service Schemas
console.log("\n[4] Testing Tariff Validation Schemas:");
const tariffNeg = TariffUpdateSchema.safeParse({
  baseRate: -100,
});
assert(!tariffNeg.success, "Rejects negative base rate");

const tariffOk = TariffUpdateSchema.safeParse({
  baseRate: 499,
  extraHourRate: 120,
  isUnconfirmed: false,
});
assert(tariffOk.success, "Accepts valid tariff updates");

// 5. Auth Validation Schemas
console.log("\n[5] Testing Admin Login Validation:");
const loginBad = AdminLoginSchema.safeParse({
  email: "not-an-email",
  password: "123",
});
assert(!loginBad.success, "Rejects invalid email and short password");

const loginOk = AdminLoginSchema.safeParse({
  email: "  ADMIN@Key2Drive.COM  ",
  password: "Admin@Key2Drive2026!",
});
assert(loginOk.success, "Accepts valid admin credentials");
if (loginOk.success) {
  assert(loginOk.data.email === "admin@key2drive.com", "Trims and lowercases admin email");
}

// 6. Admin Note Validation
console.log("\n[6] Testing Admin Note Validation:");
const noteWithoutTarget = AdminNoteCreateSchema.safeParse({
  content: "Customer called regarding flight delay.",
});
assert(!noteWithoutTarget.success, "Rejects admin note with neither bookingId nor enquiryId");

const noteWithBooking = AdminNoteCreateSchema.safeParse({
  content: "Customer called regarding flight delay.",
  bookingId: "bk_12345",
});
assert(noteWithBooking.success, "Accepts admin note attached to bookingId");

console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) {
  process.exit(1);
}

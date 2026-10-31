import { describe, it, expect } from 'vitest';
import { BookingCreateSchema } from '@/../tests/contracts/bookingContract';
import { EnquiryCreateSchema } from '@/../tests/contracts/enquiryContract';

describe('Tier 2: Boundary - Injection and Adversarial Payloads', () => {
  const baseBooking = {
    customerName: 'Aditya Rao',
    customerPhone: '9876543210',
    customerEmail: 'aditya.rao@example.com',
    serviceId: 'srv_hourly',
    pickupAddress: 'Road No 10, Banjara Hills',
    pickupDateTime: new Date(Date.now() + 86400000).toISOString(),
    duration: 4,
    vehicleInfo: 'Mercedes-Benz E-Class',
  };

  it('safely encapsulates XSS script tags in text fields without crashing parser', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      '<svg/onload=alert(document.cookie)>',
      'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
    ];

    xssPayloads.forEach((payload) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        specialInstructions: payload,
      });

      // Zod parser accepts raw strings without blowing up or executing; server persistence escapes it
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.specialInstructions).toBe(payload);
      }
    });
  });

  it('safely encapsulates SQL injection strings in address and query fields', () => {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE \"Booking\"; --",
      "admin' --",
      "1' UNION SELECT username, password_hash FROM \"User\" --",
    ];

    sqlPayloads.forEach((sql) => {
      const res = BookingCreateSchema.safeParse({
        ...baseBooking,
        pickupAddress: `Tower B, ${sql}, High-tech City`,
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.pickupAddress).toContain(sql);
      }
    });
  });

  it('handles Unicode, emojis, and multi-byte characters in instructions and names', () => {
    const unicodeInput = {
      ...baseBooking,
      customerName: 'डॉक्टर आनंद कुमार',
      specialInstructions: '🚗 Chauffeur needed at Gate 3 🏢. Please call on arrival: 📞 धन्यवाद!',
    };

    const res = BookingCreateSchema.safeParse(unicodeInput);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.customerName).toBe('डॉक्टर आनंद कुमार');
      expect(res.data.specialInstructions).toContain('🚗');
    }
  });

  it('handles template injection payloads (${...}, {{...}}) cleanly in enquiries', () => {
    const templatePayload = '${7*7} {{config.items}} <%= system("ls") %>';
    const res = EnquiryCreateSchema.safeParse({
      name: 'Security Tester',
      phone: '9812345678',
      email: 'security.audit@example.com',
      subject: 'Template check ' + templatePayload,
      message: 'Testing server-side template handling: ' + templatePayload,
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.message).toContain('${7*7}');
    }
  });
});

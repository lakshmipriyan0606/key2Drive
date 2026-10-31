import { describe, it, expect } from 'vitest';
import {
  EnquiryCreateSchema,
  generateWhatsAppLink,
  EnquiryManager,
} from '@/../tests/contracts/enquiryContract';

describe('Tier 4: Workload Scenario - Customer Contact Enquiry to Resolution Flow', () => {
  it('executes full enquiry lifecycle from public web submission to WhatsApp link, triage notes, and resolution', () => {
    const manager = new EnquiryManager();

    // Step 1: Customer submits contact enquiry form on /contact
    const customerInput = {
      name: 'Sunita Krishnan',
      phone: '9848055667',
      email: 'sunita.krishnan@techcorp.in',
      subject: 'Corporate Fleet Driver Retainer Inquiry',
      message: 'Looking to hire 4 dedicated chauffeurs for our executive directors on annual retainer.',
    };

    const validation = EnquiryCreateSchema.safeParse(customerInput);
    expect(validation.success).toBe(true);

    const enquiryRecord = manager.createEnquiry(customerInput);
    expect(enquiryRecord.id).toBeDefined();
    expect(enquiryRecord.status).toBe('PENDING');
    expect(enquiryRecord.isResolved).toBe(false);

    // Step 2: Instant WhatsApp click-to-chat fallback link generated
    const waLink = generateWhatsAppLink(
      customerInput.phone,
      `Hello Sunita, we have received your inquiry #${enquiryRecord.id} regarding Corporate Fleet Driver Retainers.`
    );
    expect(waLink).toContain('https://wa.me/9848055667');
    expect(waLink).toContain(encodeURIComponent(enquiryRecord.id));

    // Step 3: Admin support lead inspects pending enquiries
    const retrieved = manager.getEnquiry(enquiryRecord.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.status).toBe('PENDING');

    // Step 4: Admin attaches triage note and sets status to IN_REVIEW
    const triageNote = manager.addNote(
      enquiryRecord.id,
      'support_lead@key2drive.com',
      'Assigned to Enterprise Accounts Manager. Scheduled discovery call for Monday 10:00 AM.'
    );
    expect(triageNote.id).toBeDefined();

    manager.updateStatus(enquiryRecord.id, 'IN_REVIEW');
    expect(retrieved?.status).toBe('IN_REVIEW');
    expect(retrieved?.isResolved).toBe(false);

    // Step 5: Enterprise manager negotiates contract and records outcome
    const contractNote = manager.addNote(
      enquiryRecord.id,
      'enterprise_mgr@key2drive.com',
      'Client agreed to 4 monthly retainers at ₹34,999/month per chauffeur. Contract signed.'
    );
    expect(contractNote.authorId).toBe('enterprise_mgr@key2drive.com');

    // Step 6: Enquiry marked as RESOLVED
    const finalRecord = manager.updateStatus(enquiryRecord.id, 'RESOLVED');
    expect(finalRecord.status).toBe('RESOLVED');
    expect(finalRecord.isResolved).toBe(true);

    // Step 7: Verify complete audit notes list
    expect(finalRecord.notes.length).toBe(2);
    expect(finalRecord.notes[0].content).toContain('Enterprise Accounts Manager');
    expect(finalRecord.notes[1].content).toContain('Contract signed');
  });
});

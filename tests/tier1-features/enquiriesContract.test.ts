import { describe, it, expect } from 'vitest';
import {
  EnquiryCreateSchema,
  generateWhatsAppLink,
  EnquiryManager,
} from '@/../tests/contracts/enquiryContract';

describe('Tier 1: Feature 16 & 24 - Contact Enquiry & Support Contract', () => {
  const sampleEnquiry = {
    name: 'Vikram Mehta',
    phone: '9123456789',
    email: 'vikram.mehta@example.com',
    subject: 'Corporate chauffeur fleet inquiry',
    message: 'We are seeking 3 full-time drivers for our executive leadership team starting next month.',
  };

  it('validates a complete, compliant customer enquiry successfully', () => {
    const result = EnquiryCreateSchema.safeParse(sampleEnquiry);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Vikram Mehta');
      expect(result.data.subject).toContain('Corporate');
    }
  });

  it('rejects short messages (<10 characters) and invalid phone numbers', () => {
    // Too short message
    const shortMsgResult = EnquiryCreateSchema.safeParse({
      ...sampleEnquiry,
      message: 'Too short',
    });
    expect(shortMsgResult.success).toBe(false);

    // Bad phone
    const badPhoneResult = EnquiryCreateSchema.safeParse({
      ...sampleEnquiry,
      phone: '12345',
    });
    expect(badPhoneResult.success).toBe(false);
  });

  it('generates an accessible, compliant WhatsApp click-to-chat URL', () => {
    const url = generateWhatsAppLink('9123456789', 'Need assistance with airport booking');
    expect(url).toContain('https://wa.me/9123456789');
    expect(url).toContain('text=Need%20assistance%20with%20airport%20booking');
  });

  it('EnquiryManager creates enquiry with PENDING status and isResolved false', () => {
    const manager = new EnquiryManager();
    const record = manager.createEnquiry(sampleEnquiry);

    expect(record.id).toMatch(/^enq_/);
    expect(record.status).toBe('PENDING');
    expect(record.isResolved).toBe(false);
    expect(record.notes).toHaveLength(0);
  });

  it('attaches internal admin triage notes to an active enquiry', () => {
    const manager = new EnquiryManager();
    const record = manager.createEnquiry(sampleEnquiry);

    const note = manager.addNote(
      record.id,
      'admin@key2drive.com',
      'Assigned to corporate sales lead. Client called back at 11:30 AM.'
    );

    expect(note.id).toMatch(/^note_/);
    expect(note.authorId).toBe('admin@key2drive.com');
    expect(record.notes).toHaveLength(1);
    expect(record.notes[0].content).toContain('corporate sales lead');
  });

  it('transitions enquiry status to RESOLVED and synchronizes isResolved flag', () => {
    const manager = new EnquiryManager();
    const record = manager.createEnquiry(sampleEnquiry);

    // Transition to IN_REVIEW
    manager.updateStatus(record.id, 'IN_REVIEW');
    expect(record.status).toBe('IN_REVIEW');
    expect(record.isResolved).toBe(false);

    // Transition to RESOLVED
    manager.updateStatus(record.id, 'RESOLVED');
    expect(record.status).toBe('RESOLVED');
    expect(record.isResolved).toBe(true);
  });
});

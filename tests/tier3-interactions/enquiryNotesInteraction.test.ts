import { describe, it, expect, beforeEach } from 'vitest';
import { EnquiryManager } from '@/../tests/contracts/enquiryContract';

describe('Tier 3: Interaction - Enquiry Status Updates with Internal Notes', () => {
  let manager: EnquiryManager;

  beforeEach(() => {
    manager = new EnquiryManager();
  });

  const sampleEnquiryInput = {
    name: 'Sanjay Dutt',
    phone: '9845012345',
    email: 'sanjay.dutt@example.com',
    subject: 'Monthly chauffeur retainer tariff confirmation',
    message: 'Could you please confirm the exact hourly overtime rates for personal chauffeur monthly contract?',
  };

  it('manages full support triage interaction from initial enquiry to resolution with multiple admin notes', () => {
    // 1. Customer submits enquiry
    const enquiry = manager.createEnquiry(sampleEnquiryInput);
    expect(enquiry.status).toBe('PENDING');
    expect(enquiry.isResolved).toBe(false);
    expect(enquiry.notes).toHaveLength(0);

    // 2. Dispatch agent opens ticket and adds triage note
    const note1 = manager.addNote(
      enquiry.id,
      'triage_agent_1@key2drive.com',
      'Client contacted regarding monthly retainer rates. Checking with operations lead.'
    );
    expect(note1.authorId).toBe('triage_agent_1@key2drive.com');
    expect(enquiry.notes).toHaveLength(1);

    // 3. Status updated to IN_REVIEW
    manager.updateStatus(enquiry.id, 'IN_REVIEW');
    expect(enquiry.status).toBe('IN_REVIEW');
    expect(enquiry.isResolved).toBe(false);

    // 4. Senior operations manager provides quote and calls customer
    const note2 = manager.addNote(
      enquiry.id,
      'ops_manager@key2drive.com',
      'Spoke with Sanjay. Confirmed ₹100/hr overtime rate after 8 daily hours. Customer satisfied and sent contract draft.'
    );
    expect(note2.authorId).toBe('ops_manager@key2drive.com');
    expect(enquiry.notes).toHaveLength(2);

    // 5. Ticket marked as RESOLVED
    const resolvedEnquiry = manager.updateStatus(enquiry.id, 'RESOLVED');
    expect(resolvedEnquiry.status).toBe('RESOLVED');
    expect(resolvedEnquiry.isResolved).toBe(true);

    // Verify chronological order and note fidelity
    expect(resolvedEnquiry.notes[0].authorId).toContain('triage_agent_1');
    expect(resolvedEnquiry.notes[1].content).toContain('Spoke with Sanjay');
  });

  it('throws an error when attempting to add note or update non-existent enquiry', () => {
    expect(() => manager.addNote('enq_non_existent', 'admin@key2drive.com', 'test note')).toThrow(
      /not found/
    );
    expect(() => manager.updateStatus('enq_non_existent', 'RESOLVED')).toThrow(/not found/);
  });
});

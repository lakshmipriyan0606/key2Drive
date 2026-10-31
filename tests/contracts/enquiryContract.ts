import { z } from 'zod';
import { PHONE_REGEX } from './bookingContract';

export const EnquiryCreateSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(PHONE_REGEX, 'Please enter a valid 10-digit mobile number'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject cannot exceed 150 characters'),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

export type EnquiryCreateInput = z.infer<typeof EnquiryCreateSchema>;

export type EnquiryStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED';

export interface AdminNote {
  id: string;
  content: string;
  authorId: string;
  enquiryId?: string;
  bookingId?: string;
  createdAt: string;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  isResolved: boolean;
  notes: AdminNote[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate official WhatsApp contact URL with pre-filled message
 */
export function generateWhatsAppLink(phoneNumber: string, prefillMessage: string = 'Hello Key2Drive Chauffeur Services'): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(prefillMessage)}`;
}

/**
 * Enquiry Manager tracking status transitions and internal notes
 */
export class EnquiryManager {
  private enquiries = new Map<string, EnquiryRecord>();

  public createEnquiry(input: EnquiryCreateInput): EnquiryRecord {
    const validated = EnquiryCreateSchema.parse(input);
    const id = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const record: EnquiryRecord = {
      id,
      ...validated,
      status: 'PENDING',
      isResolved: false,
      notes: [],
      createdAt: now,
      updatedAt: now,
    };
    this.enquiries.set(id, record);
    return record;
  }

  public getEnquiry(id: string): EnquiryRecord | undefined {
    return this.enquiries.get(id);
  }

  public addNote(enquiryId: string, authorId: string, content: string): AdminNote {
    const enquiry = this.enquiries.get(enquiryId);
    if (!enquiry) {
      throw new Error(`Enquiry ${enquiryId} not found`);
    }
    const note: AdminNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      content,
      authorId,
      enquiryId,
      createdAt: new Date().toISOString(),
    };
    enquiry.notes.push(note);
    enquiry.updatedAt = new Date().toISOString();
    return note;
  }

  public updateStatus(enquiryId: string, status: EnquiryStatus): EnquiryRecord {
    const enquiry = this.enquiries.get(enquiryId);
    if (!enquiry) {
      throw new Error(`Enquiry ${enquiryId} not found`);
    }
    enquiry.status = status;
    enquiry.isResolved = status === 'RESOLVED';
    enquiry.updatedAt = new Date().toISOString();
    return enquiry;
  }
}

/**
 * Key2Drive Mock Messaging Service
 * Target path: src/lib/integrations/messaging.ts
 *
 * Provides deterministic WhatsApp deep-link generation and simulated
 * SMS notification logging for booking confirmations and lifecycle transitions.
 */

export interface MessagingLogEntry {
  id: string;
  channel: 'SMS' | 'WHATSAPP';
  recipient: string;
  message: string;
  bookingReference?: string;
  type: 'CONFIRMATION' | 'STATUS_UPDATE' | 'ENQUIRY_ACKNOWLEDGMENT' | 'ADMIN_ALERT';
  status: 'SENT' | 'SIMULATED';
  timestamp: string; // ISO 8601
}

export interface MessagingResult {
  success: boolean;
  messageId: string;
  channel: 'SMS' | 'WHATSAPP';
  recipient: string;
  status: 'SENT';
  timestamp: string;
}

export interface BookingNotificationPayload {
  reference: string;
  customerName: string;
  customerPhone: string;
  serviceTitle: string;
  pickupAddress: string;
  pickupDateTime: string | Date;
  estimatedFare: number;
}

export interface MessagingService {
  generateWhatsAppLink(phone: string, text?: string): string;
  generateBookingWhatsAppLink(reference: string, customMessage?: string): string;
  sendBookingConfirmation(payload: BookingNotificationPayload): Promise<MessagingResult>;
  sendStatusUpdateNotification(
    customerPhone: string,
    customerName: string,
    reference: string,
    newStatus: string,
    note?: string
  ): Promise<MessagingResult>;
  sendEnquiryAcknowledgment(
    customerPhone: string,
    customerName: string,
    enquiryId: string
  ): Promise<MessagingResult>;
  getLogs(): MessagingLogEntry[];
  clearLogs(): void;
}

class MockMessagingServiceImpl implements MessagingService {
  private logs: MessagingLogEntry[] = [];
  private defaultPhone: string;

  constructor() {
    this.defaultPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919600992709';
  }

  /**
   * Sanitizes phone number by removing non-numeric characters and ensuring
   * standard Indian country code (91) if a 10-digit number is provided.
   */
  private sanitizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `91${digits}`;
    }
    return digits || this.defaultPhone;
  }

  /**
   * Generates a direct WhatsApp click-to-chat URL: https://wa.me/{phone}?text={encodedText}
   */
  public generateWhatsAppLink(phone: string, text?: string): string {
    const cleanPhone = this.sanitizePhone(phone);
    const baseUrl = `https://wa.me/${cleanPhone}`;
    if (!text || text.trim().length === 0) {
      return baseUrl;
    }
    return `${baseUrl}?text=${encodeURIComponent(text.trim())}`;
  }

  /**
   * Generates customer-facing WhatsApp link referencing their booking.
   */
  public generateBookingWhatsAppLink(reference: string, customMessage?: string): string {
    const text =
      customMessage ||
      `Hello Key2Drive Team, I am inquiring regarding my chauffeur booking reference: ${reference}.`;
    return this.generateWhatsAppLink(this.defaultPhone, text);
  }

  /**
   * Simulates dispatching an SMS confirmation upon booking creation.
   */
  public async sendBookingConfirmation(payload: BookingNotificationPayload): Promise<MessagingResult> {
    const formattedDate = new Date(payload.pickupDateTime).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const body =
      `Key2Drive Booking Confirmed! Ref: ${payload.reference}. ` +
      `Service: ${payload.serviceTitle}. Pickup: ${payload.pickupAddress} on ${formattedDate}. ` +
      `Est. Fare: ₹${payload.estimatedFare}. Track at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${payload.reference}`;

    const entry: MessagingLogEntry = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channel: 'SMS',
      recipient: payload.customerPhone,
      message: body,
      bookingReference: payload.reference,
      type: 'CONFIRMATION',
      status: 'SENT',
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`\x1b[36m[MOCK SMS OUTBOUND]\x1b[0m Ref: ${payload.reference} | To: ${payload.customerPhone} | Message: "${body}"`);
    }

    return {
      success: true,
      messageId: entry.id,
      channel: entry.channel,
      recipient: entry.recipient,
      status: 'SENT',
      timestamp: entry.timestamp,
    };
  }

  /**
   * Simulates dispatching status updates (CONFIRMED, COMPLETED, CANCELLED, REJECTED).
   */
  public async sendStatusUpdateNotification(
    customerPhone: string,
    customerName: string,
    reference: string,
    newStatus: string,
    note?: string
  ): Promise<MessagingResult> {
    const noteSuffix = note ? ` Note: ${note}` : '';
    const body =
      `Key2Drive Update: Your booking ${reference} is now ${newStatus}.${noteSuffix} ` +
      `Support: ${process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91 96009 92709'}`;

    const entry: MessagingLogEntry = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channel: 'SMS',
      recipient: customerPhone,
      message: body,
      bookingReference: reference,
      type: 'STATUS_UPDATE',
      status: 'SENT',
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`\x1b[35m[MOCK SMS STATUS]\x1b[0m Ref: ${reference} | Status: ${newStatus} | To: ${customerPhone}`);
    }

    return {
      success: true,
      messageId: entry.id,
      channel: 'SMS',
      recipient: customerPhone,
      status: 'SENT',
      timestamp: entry.timestamp,
    };
  }

  /**
   * Simulates dispatching an acknowledgment SMS for a submitted contact enquiry.
   */
  public async sendEnquiryAcknowledgment(
    customerPhone: string,
    customerName: string,
    enquiryId: string
  ): Promise<MessagingResult> {
    const body = `Hi ${customerName}, thanks for contacting Key2Drive! We received your enquiry (#${enquiryId.slice(-6)}) and a chauffeur specialist will contact you shortly.`;

    const entry: MessagingLogEntry = {
      id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channel: 'SMS',
      recipient: customerPhone,
      message: body,
      type: 'ENQUIRY_ACKNOWLEDGMENT',
      status: 'SENT',
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);

    return {
      success: true,
      messageId: entry.id,
      channel: 'SMS',
      recipient: customerPhone,
      status: 'SENT',
      timestamp: entry.timestamp,
    };
  }

  public getLogs(): MessagingLogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const messagingService: MessagingService = new MockMessagingServiceImpl();
export default messagingService;

/**
 * Mock Integration Boundaries Contract Specifications (Requirement R5 & PROJECT.md § 4)
 */

export interface MessagingNotification {
  type: 'WHATSAPP' | 'SMS';
  recipient: string;
  template: string;
  variables: Record<string, string>;
  sentAt: string;
}

export class MockMessagingService {
  private notifications: MessagingNotification[] = [];

  public async sendNotification(
    type: 'WHATSAPP' | 'SMS',
    recipient: string,
    template: string,
    variables: Record<string, string>
  ): Promise<{ success: boolean; messageId: string }> {
    const sentAt = new Date().toISOString();
    this.notifications.push({ type, recipient, template, variables, sentAt });
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
  }

  public getHistory(): readonly MessagingNotification[] {
    return [...this.notifications];
  }

  public clear(): void {
    this.notifications = [];
  }
}

export interface PaymentAuthResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: 'INR';
  status: 'AUTHORIZED' | 'FAILED';
  authCode: string;
}

export class MockPaymentService {
  public async authorize(amount: number, metadata: Record<string, string>): Promise<PaymentAuthResult> {
    if (amount <= 0) {
      return {
        success: false,
        transactionId: '',
        amount,
        currency: 'INR',
        status: 'FAILED',
        authCode: 'ERR_INVALID_AMOUNT',
      };
    }

    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      amount,
      currency: 'INR',
      status: 'AUTHORIZED',
      authCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }
}

export interface RouteEstimate {
  distanceKm: number;
  durationMinutes: number;
  status: 'OK' | 'NOT_FOUND';
}

export class MockMapsService {
  public async getRouteEstimate(origin: string, destination: string): Promise<RouteEstimate> {
    if (!origin || !destination) {
      return { distanceKm: 0, durationMinutes: 0, status: 'NOT_FOUND' };
    }

    // Deterministic simulation based on string lengths
    const hash = (origin.length * 31 + destination.length * 17) % 50;
    const distanceKm = Math.max(10, hash + 15);
    const durationMinutes = Math.round(distanceKm * 2.2);

    return {
      distanceKm,
      durationMinutes,
      status: 'OK',
    };
  }
}

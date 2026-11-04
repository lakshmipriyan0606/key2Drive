/**
 * Key2Drive Mock Payment Gateway Service
 * Target path: src/lib/integrations/payment.ts
 *
 * Simulates online payment gateways (Razorpay & Stripe) for upfront authorization
 * as well as post-trip Cash/UPI Driver Collection workflows.
 */

export type PaymentMode = 'CASH_AFTER_SERVICE' | 'ONLINE_ADVANCE';
export type PaymentStatus = 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

export interface CreatePaymentOrderInput {
  bookingReference: string;
  amount: number;
  currency?: string; // Default 'INR'
  customerEmail: string;
  customerPhone: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  orderId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  status: 'CREATED';
  keyId: string; // Public mock gateway key
  clientSecret?: string;
  createdAt: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  orderId: string;
  paymentId: string;
  transactionId?: string;
  status: 'CAPTURED' | 'FAILED';
  errorMessage?: string;
  timestamp: string;
}

export interface AuthorizeAdvanceInput {
  bookingReference: string;
  amount: number;
  paymentMethod: string; // e.g., 'card', 'upi', 'netbanking'
}

export interface AuthorizationResult {
  authorizationId: string;
  bookingReference: string;
  amount: number;
  status: 'AUTHORIZED' | 'FAILED';
  expiresAt: string;
  timestamp: string;
}

export interface StoredPaymentRecord {
  orderId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  mode: PaymentMode;
  status: PaymentStatus;
  paymentId?: string;
  transactionId?: string;
  authorizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentService {
  createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;
  verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult>;
  authorizeAdvance(input: AuthorizeAdvanceInput): Promise<AuthorizationResult>;
  recordCashPayment(bookingReference: string, amount: number): Promise<StoredPaymentRecord>;
  getPaymentByReference(bookingReference: string): StoredPaymentRecord | null;
  getPaymentByOrderId(orderId: string): StoredPaymentRecord | null;
  refundPayment(transactionId: string, amount?: number): Promise<{ success: boolean; refundId: string }>;
  clearRecords(): void;
}

class MockPaymentServiceImpl implements PaymentService {
  private records: Map<string, StoredPaymentRecord> = new Map();

  /**
   * Generates a synthetic payment gateway order (analogous to Razorpay Orders or Stripe PaymentIntents).
   */
  public async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    const orderId = `order_k2d_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const currency = input.currency || 'INR';

    const order: PaymentOrder = {
      orderId,
      bookingReference: input.bookingReference,
      amount: Math.round(input.amount * 100) / 100,
      currency,
      status: 'CREATED',
      keyId: 'rzp_mock_live_key2drive_public',
      clientSecret: `cs_mock_${Math.random().toString(36).substring(2, 16)}`,
      createdAt: new Date().toISOString(),
    };

    const record: StoredPaymentRecord = {
      orderId,
      bookingReference: input.bookingReference,
      amount: input.amount,
      currency,
      mode: 'ONLINE_ADVANCE',
      status: 'CREATED',
      createdAt: order.createdAt,
      updatedAt: order.createdAt,
    };

    this.records.set(orderId, record);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`\x1b[32m[MOCK PAYMENT ORDER CREATED]\x1b[0m Order: ${orderId} | Ref: ${input.bookingReference} | Amount: ₹${input.amount}`);
    }

    return order;
  }

  /**
   * Validates mock cryptographic signature or token.
   * Deterministic test hook: pass 'fail' in paymentId or signature to simulate decline.
   */
  public async verifyPayment(input: VerifyPaymentInput): Promise<PaymentVerificationResult> {
    const record = this.records.get(input.orderId);
    const now = new Date().toISOString();

    if (!record) {
      return {
        verified: false,
        orderId: input.orderId,
        paymentId: input.paymentId,
        status: 'FAILED',
        errorMessage: 'Order not found in mock payment registry',
        timestamp: now,
      };
    }

    const isDecline =
      input.paymentId.toLowerCase().includes('fail') ||
      input.signature.toLowerCase().includes('fail');

    if (isDecline) {
      record.status = 'FAILED';
      record.updatedAt = now;
      return {
        verified: false,
        orderId: input.orderId,
        paymentId: input.paymentId,
        status: 'FAILED',
        errorMessage: 'Simulated payment authorization failed by card issuer',
        timestamp: now,
      };
    }

    const transactionId = `txn_k2d_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    record.status = 'CAPTURED';
    record.paymentId = input.paymentId;
    record.transactionId = transactionId;
    record.updatedAt = now;

    if (process.env.NODE_ENV !== 'test') {
      console.log(`\x1b[32m[MOCK PAYMENT CAPTURED]\x1b[0m Order: ${input.orderId} | Txn: ${transactionId} | Amount: ₹${record.amount}`);
    }

    return {
      verified: true,
      orderId: input.orderId,
      paymentId: input.paymentId,
      transactionId,
      status: 'CAPTURED',
      timestamp: now,
    };
  }

  /**
   * Authorizes an advance payment hold on customer card/UPI without immediate capture.
   */
  public async authorizeAdvance(input: AuthorizeAdvanceInput): Promise<AuthorizationResult> {
    const authorizationId = `auth_k2d_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const record: StoredPaymentRecord = {
      orderId: `ord_auth_${Date.now()}`,
      bookingReference: input.bookingReference,
      amount: input.amount,
      currency: 'INR',
      mode: 'ONLINE_ADVANCE',
      status: 'AUTHORIZED',
      authorizationId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.records.set(authorizationId, record);

    return {
      authorizationId,
      bookingReference: input.bookingReference,
      amount: input.amount,
      status: 'AUTHORIZED',
      expiresAt,
      timestamp: now.toISOString(),
    };
  }

  /**
   * Records a cash/UPI transaction collected by driver upon trip completion.
   */
  public async recordCashPayment(bookingReference: string, amount: number): Promise<StoredPaymentRecord> {
    const transactionId = `cash_k2d_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const record: StoredPaymentRecord = {
      orderId: `cash_${Date.now()}`,
      bookingReference,
      amount,
      currency: 'INR',
      mode: 'CASH_AFTER_SERVICE',
      status: 'CAPTURED',
      transactionId,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(transactionId, record);
    return record;
  }

  public getPaymentByReference(bookingReference: string): StoredPaymentRecord | null {
    for (const record of this.records.values()) {
      if (record.bookingReference === bookingReference) {
        return record;
      }
    }
    return null;
  }

  public getPaymentByOrderId(orderId: string): StoredPaymentRecord | null {
    return this.records.get(orderId) || null;
  }

  public async refundPayment(
    transactionId: string,
    amount?: number
  ): Promise<{ success: boolean; refundId: string }> {
    const refundId = `ref_k2d_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return { success: true, refundId };
  }

  public clearRecords(): void {
    this.records.clear();
  }
}

export const paymentService: PaymentService = new MockPaymentServiceImpl();
export default paymentService;

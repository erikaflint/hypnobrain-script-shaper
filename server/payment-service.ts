import Stripe from "stripe";

export interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
  clientSecret?: string;
}

export interface IPaymentService {
  createPaymentIntent(amount: number, metadata: Record<string, string>): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<boolean>;
}

// Mock implementation for testing/development
export class MockPaymentService implements IPaymentService {
  async createPaymentIntent(amount: number, metadata: Record<string, string>): Promise<PaymentIntent> {
    return {
      id: `mock_pi_${Date.now()}`,
      amount,
      status: "pending_payment",
      clientSecret: undefined,
    };
  }
  
  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    return true;
  }
}

// Real Stripe implementation
export class StripePaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    });
  }

  async createPaymentIntent(amount: number, metadata: Record<string, string>): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount is already in cents
      currency: "usd",
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret ?? undefined,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('Error confirming payment:', error);
      return false;
    }
  }
}

// Feature flag for Stripe integration
const STRIPE_ENABLED = process.env.STRIPE_ENABLED === "true";

// Export the appropriate service based on feature flag
export const paymentService: IPaymentService = STRIPE_ENABLED
  ? new StripePaymentService()
  : new MockPaymentService();

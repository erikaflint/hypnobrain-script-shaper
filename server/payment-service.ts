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

// Mock implementation until Stripe keys are available
export class MockPaymentService implements IPaymentService {
  async createPaymentIntent(amount: number, metadata: Record<string, string>): Promise<PaymentIntent> {
    // Return a mock payment intent
    return {
      id: `mock_pi_${Date.now()}`,
      amount,
      status: "pending_payment",
      clientSecret: undefined, // No client secret in mock mode
    };
  }
  
  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    // In mock mode, all payments are "confirmed" but with pending status
    return true;
  }
}

// Feature flag for Stripe integration
const STRIPE_ENABLED = process.env.STRIPE_ENABLED === "true";

// Export the appropriate service based on feature flag
export const paymentService: IPaymentService = STRIPE_ENABLED
  ? (() => {
      throw new Error("Stripe service not yet implemented - keys available Monday");
    })()
  : new MockPaymentService();

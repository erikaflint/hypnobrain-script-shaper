import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Clock, Loader2, Lock } from "lucide-react";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  loading?: boolean;
  clientSecret?: string;
  amount?: number;
  tier?: string;
  paymentIntentId?: string;
}

const STRIPE_ENABLED = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? true : false;

const stripePromise = STRIPE_ENABLED ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

function StripeCheckoutForm({ onSuccess, amount, tier, paymentIntentId }: { onSuccess: () => void; amount: number; tier: string; paymentIntentId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    // Confirm payment with Stripe
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessing(false);
      return;
    }

    // Verify payment status with backend before proceeding
    try {
      const confirmResponse = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
        }),
      });

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok || !confirmData.confirmed) {
        toast({
          title: "Payment Verification Failed",
          description: confirmData.message || "Could not verify payment. Please contact support.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      toast({
        title: "Payment Successful",
        description: "Generating your script...",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: "Failed to verify payment. Please contact support.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Script Generation - {tier === 'create_new' ? 'Create New' : 'Remix'}</span>
          <span className="font-semibold">${(amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3 h-3" />
        <span>Secure payment powered by Stripe</span>
      </div>

      <Button 
        type="submit"
        className="w-full"
        disabled={!stripe || processing}
        data-testid="button-confirm-payment"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

function MockCheckout({ onProceed, loading, tier, amount }: { onProceed: () => void; loading: boolean; tier: string; amount: number }) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <DialogTitle className="text-center">Payment Integration Coming Soon</DialogTitle>
        <DialogDescription className="text-center">
          Stripe payment processing will be enabled soon. Your generation has been queued
          with status "pending_payment".
        </DialogDescription>
      </DialogHeader>

      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">Script Generation - {tier === 'create_new' ? 'Create New' : 'Remix'}</span>
          <span className="font-semibold">${(amount / 100).toFixed(2)}</span>
        </div>
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">What happens next:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your script settings are saved</li>
              <li>• Payment integration will be active soon</li>
              <li>• You can test the full flow then</li>
            </ul>
          </div>
        </div>
      </div>

      <DialogFooter className="sm:flex-col gap-2">
        <Button 
          onClick={onProceed} 
          className="w-full"
          disabled={loading}
          data-testid="button-queue-generation"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Script...
            </>
          ) : (
            'Queue My Generation'
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

export function PaymentModal({ 
  open, 
  onClose, 
  onProceed, 
  loading = false,
  clientSecret,
  amount = 300,
  tier = 'create_new',
  paymentIntentId
}: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        {STRIPE_ENABLED && clientSecret && paymentIntentId ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center">Complete Your Purchase</DialogTitle>
              <DialogDescription className="text-center">
                Enter your payment details to generate your hypnosis script
              </DialogDescription>
            </DialogHeader>

            <Elements stripe={stripePromise!} options={{ clientSecret }}>
              <StripeCheckoutForm onSuccess={onProceed} amount={amount} tier={tier} paymentIntentId={paymentIntentId} />
            </Elements>
          </>
        ) : (
          <MockCheckout onProceed={onProceed} loading={loading} tier={tier} amount={amount} />
        )}

        <Button 
          onClick={onClose} 
          variant="outline" 
          className="w-full"
          disabled={loading}
          data-testid="button-cancel-payment"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}

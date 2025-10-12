import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Clock, Loader2 } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  loading?: boolean;
}

export function PaymentModal({ open, onClose, onProceed, loading = false }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Payment Integration Coming Soon</DialogTitle>
          <DialogDescription className="text-center">
            Stripe payment processing will be enabled on Monday. Your generation has been queued
            with status "pending_payment".
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">What happens next:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your script settings are saved</li>
                <li>• Payment integration will be active Monday</li>
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
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full"
            disabled={loading}
            data-testid="button-cancel-payment"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

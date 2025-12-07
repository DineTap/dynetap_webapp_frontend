"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { TableNumberInput } from "./TableNumberInput";
import { formatPrice } from "~/utils/formatPrice";
import z from "zod";

// Validation schema for checkout form
const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  tableNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface OrderCheckoutModalProps {
  totalPrice: number; // in cents
  orderNumber: string;
  itemCount: number;
  onCheckout: (data: CheckoutFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

/**
 * Modal to collect customer information before payment
 * Requires: email, phone, optional: table number and notes
 */
export function OrderCheckoutModal({
  totalPrice,
  orderNumber,
  itemCount,
  onCheckout,
  onCancel,
  isLoading = false,
  error,
}: OrderCheckoutModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = checkoutSchema.safeParse({
      email,
      phone: phone.replace(/\D/g, ""), // Remove non-digits for validation
      tableNumber: tableNumber || undefined,
      notes: notes || undefined,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        errors[path] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    await onCheckout(result.data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="mb-1 text-2xl font-bold">Order Summary</h2>
        <p className="mb-6 text-sm text-slate-600">
          Order #{orderNumber} • {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Total */}
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Total Amount</p>
            <p className="text-3xl font-bold">{formatPrice(totalPrice)}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className={validationErrors.email ? "border-red-500" : ""}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+27 123 456 7890"
              disabled={isLoading}
              className={validationErrors.phone ? "border-red-500" : ""}
            />
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.phone}
              </p>
            )}
          </div>

          {/* Table Number */}
          <div>
            <label className="block text-sm font-medium">Table Number (Optional)</label>
            <TableNumberInput
              value={tableNumber}
              onChange={setTableNumber}
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium">Special Requests (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="e.g., No onions, extra hot, allergies, etc."
              disabled={isLoading}
              className="h-20 resize-none"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex gap-2 rounded-lg bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email || !phone}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatPrice(totalPrice)}`
              )}
            </Button>
          </div>
        </form>

        {/* Security Note */}
        <p className="mt-6 text-xs text-slate-500 text-center">
          Your payment information is secure and processed by Yoco
        </p>
      </div>
    </div>
  );
}

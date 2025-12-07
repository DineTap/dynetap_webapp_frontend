"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { AlertCircle } from "lucide-react";

interface JoinOrderModalProps {
  onJoin: (orderNumber: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

/**
 * Modal to join an existing order by 5-digit order number
 * Multiple people can add items to the same order
 */
export function JoinOrderModal({
  onJoin,
  onCancel,
  isLoading = false,
  error,
}: JoinOrderModalProps) {
  const [orderNumber, setOrderNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.length === 5) {
      await onJoin(orderNumber);
    }
  };

  const isValid = /^\d{5}$/.test(orderNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-xl font-bold">Join an Order</h2>
        <p className="mb-6 text-sm text-slate-600">
          Ask your friends for their 5-digit order number to add items together
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Order Number</label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="12345"
              className="mt-1 border-2 text-center text-lg tracking-widest"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-slate-500">
              Enter exactly 5 digits
            </p>
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

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
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? "Joining..." : "Join Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

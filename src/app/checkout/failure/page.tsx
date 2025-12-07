"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";

/**
 * Payment failure page shown when Yoco payment fails
 * Allows user to retry payment or continue shopping
 */
export default function CheckoutFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("orderNumber");
  const reason = searchParams.get("reason");

  // Redirect if no order number (shouldn't happen in normal flow)
  useEffect(() => {
    if (!orderNumber) {
      router.push("/");
    }
  }, [orderNumber, router]);

  if (!orderNumber) {
    return null;
  }

  const handleRetry = () => {
    // Redirect back to checkout with order number
    router.push(`/?orderNumber=${orderNumber}`);
  };

  const reasonMessages: Record<string, string> = {
    "card_declined": "Your card was declined. Please try a different payment method.",
    "insufficient_funds": "Insufficient funds. Please check your account balance.",
    "expired_card": "Your card has expired. Please use a valid card.",
    "invalid_card": "The card details are invalid. Please check and try again.",
    "timeout": "The payment request timed out. Please try again.",
    "network_error": "A network error occurred. Please check your connection and try again.",
  };

  const errorMessage =
    reason && reasonMessages[reason]
      ? reasonMessages[reason]
      : "Payment could not be processed. Please try again or contact support.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white px-4 py-12">
      <div className="mx-auto max-w-md">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          Payment Failed
        </h1>
        <p className="mb-8 text-center text-slate-600">
          We couldn't process your payment. Your order hasn't been charged.
        </p>

        {/* Error Details */}
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>

          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-xs text-red-700 font-medium">Order #: {orderNumber}</p>
            <p className="text-xs text-red-700 mt-1">
              Your order is temporarily on hold. Retry payment below to continue.
            </p>
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="mb-8 rounded-lg bg-slate-50 p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Try these:</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="font-bold text-slate-400">•</span>
              <span>Check your card details and try again</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-400">•</span>
              <span>Try a different payment method</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-slate-400">•</span>
              <span>Contact your bank if the issue persists</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleRetry} size="lg" className="w-full">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Retry Payment
          </Button>
          <Link href="/" className="block">
            <Button variant="outline" size="lg" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-900">
            Still having trouble?{" "}
            <Link href="/contact" className="font-medium text-blue-600 hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

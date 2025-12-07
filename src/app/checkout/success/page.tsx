"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Check, Clock, MapPin, Copy } from "lucide-react";
import { formatPrice } from "~/utils/formatPrice";

/**
 * Order confirmation page shown after successful payment
 * Displays order number, expected wait time, and tracking link
 */
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const orderNumber = searchParams.get("orderNumber");
  const totalPrice = searchParams.get("totalPrice");
  const itemCount = searchParams.get("itemCount");

  // Redirect if missing required params
  useEffect(() => {
    if (!orderNumber) {
      router.push("/");
    }
  }, [orderNumber, router]);

  if (!orderNumber) {
    return null;
  }

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate estimated wait time: 15 mins base + 2 mins per item
  const estimatedWait = 15 + (parseInt(itemCount || "0") || 0) * 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-12">
      <div className="mx-auto max-w-md">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          Order Confirmed!
        </h1>
        <p className="mb-8 text-center text-slate-600">
          Your payment was successful. Your order is being prepared.
        </p>

        {/* Order Details Card */}
        <div className="mb-8 rounded-lg border border-slate-200 p-6">
          {/* Order Number */}
          <div className="mb-6 flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                Order Number
              </p>
              <p className="text-3xl font-bold text-slate-900 font-mono">
                {orderNumber}
              </p>
            </div>
            <button
              onClick={handleCopyOrderNumber}
              className="rounded-lg p-2 hover:bg-slate-200 transition-colors"
              title="Copy order number"
            >
              <Copy className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Summary Info */}
          <div className="space-y-4 border-t border-slate-200 pt-6">
            {itemCount && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Items</span>
                <span className="font-medium text-slate-900">
                  {itemCount} {parseInt(itemCount) === 1 ? "item" : "items"}
                </span>
              </div>
            )}

            {totalPrice && (
              <div className="flex justify-between text-sm border-b border-slate-200 pb-4">
                <span className="text-slate-600">Total Paid</span>
                <span className="font-medium text-slate-900">
                  {formatPrice(parseInt(totalPrice))}
                </span>
              </div>
            )}

            {/* Wait Time */}
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3">
              <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">
                  ~{estimatedWait} minutes
                </p>
                <p className="text-xs text-blue-700">Estimated wait time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-bold text-slate-900 uppercase tracking-wide">
            What's Next?
          </h2>
          <ol className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 flex-shrink-0">
                1
              </span>
              <span>Save your order number or take a screenshot</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 flex-shrink-0">
                2
              </span>
              <span>We'll prepare your order</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 flex-shrink-0">
                3
              </span>
              <span>You'll receive a notification when it's ready</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href={`/order/${orderNumber}`} className="block">
            <Button className="w-full">
              <MapPin className="mr-2 h-4 w-4" />
              Track Your Order
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Support Note */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Questions?{" "}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}

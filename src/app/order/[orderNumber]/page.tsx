"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { AlertCircle, Home, RefreshCw, Copy, Clock, ChefHat } from "lucide-react";
import { formatPrice } from "~/utils/formatPrice";
import { api } from "~/trpc/react";

const statusSteps = [
  { id: "pending", label: "Order Received", icon: Clock },
  { id: "preparing", label: "Being Prepared", icon: ChefHat },
  { id: "served", label: "Ready for Pickup", icon: "✓" },
];

/**
 * Order tracking page
 * Polls server every 5 seconds to show real-time order status
 * Displays: order items, status progress, customer info
 */
export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // tRPC query with polling
  const { data: order, isLoading, error, refetch } = api.checkout.getOrderStatus.useQuery(
    { orderNumber },
    {
      enabled: !!orderNumber,
      staleTime: 0, // Always consider data stale to enable auto-refresh
    }
  );

  // Setup auto-refresh polling
  useEffect(() => {
    if (!autoRefresh || !orderNumber) return;

    pollIntervalRef.current = setInterval(() => {
      refetch();
    }, 5000); // Poll every 5 seconds

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [autoRefresh, orderNumber, refetch]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Invalid Order Number</h1>
          <Button onClick={() => router.push("/")} className="mt-4">
            <Home className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="mb-4 text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
          >
            <Home className="h-3 w-3" />
            Back to Menu
          </button>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Order Tracking</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "Live" : "Paused"}
              </Button>
            </div>
          </div>

          {/* Order Number Display */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase">Order #</p>
              <p className="text-2xl font-bold font-mono text-slate-900">{orderNumber}</p>
            </div>
            <button
              onClick={handleCopyOrderNumber}
              className="ml-auto p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Copy className={`h-5 w-5 ${copied ? "text-green-600" : "text-slate-600"}`} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !order && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
            <p className="mt-4 text-slate-600">Loading order details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Order not found</p>
              <p className="text-sm text-red-700">
                Please check the order number and try again.
              </p>
            </div>
          </div>
        )}

        {order && (
          <>
            {/* Status Timeline */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Order Status</h2>
              <div className="relative">
                <div className="space-y-4">
                  {statusSteps.map((step, index) => {
                    const isCompleted = statusSteps.findIndex((s) => s.id === order.status) >= index;
                    const isActive = order.status === step.id;

                    return (
                      <div key={step.id} className="flex gap-4">
                        {/* Timeline Dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                              isCompleted
                                ? "bg-green-600 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isCompleted ? "✓" : index + 1}
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`h-8 w-0.5 transition-colors ${
                                isCompleted ? "bg-green-600" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>

                        {/* Status Info */}
                        <div className="pt-2">
                          <p
                            className={`font-medium ${
                              isActive ? "text-slate-900" : "text-slate-600"
                            }`}
                          >
                            {step.label}
                          </p>
                          {isActive && (
                            <p className="text-sm text-green-600 mt-1">
                              {order.status === "pending" && "We received your order!"}
                              {order.status === "preparing" && "Chef is working on your order"}
                              {order.status === "served" && "Ready for pickup!"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Order Details</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div>
                      <h3 className="font-medium text-slate-900 mb-3">Items</h3>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div>
                              <p className="text-slate-900">{item.dishName}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-slate-900">
                              {formatPrice(item.priceAtTime * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>{formatPrice(order.totalPrice)}</span>
                      </div>
                    </div>
                  )}

                  {/* Customer Info */}
                  {(order.customerEmail || order.customerPhone || order.tableNumber) && (
                    <div className="pt-4 border-t border-slate-200">
                      <h3 className="font-medium text-slate-900 mb-3">Delivery Information</h3>
                      <div className="space-y-2 text-sm">
                        {order.customerEmail && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Email</span>
                            <span className="text-slate-900">{order.customerEmail}</span>
                          </div>
                        )}
                        {order.customerPhone && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Phone</span>
                            <span className="text-slate-900">{order.customerPhone}</span>
                          </div>
                        )}
                        {order.tableNumber && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Table</span>
                            <span className="text-slate-900">{order.tableNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Special Notes */}
                  {order.notes && (
                    <div className="pt-4 border-t border-slate-200">
                      <h3 className="font-medium text-slate-900 mb-2">Special Requests</h3>
                      <p className="text-sm text-slate-700 italic">"{order.notes}"</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Auto-refresh Info */}
            <div className="text-center text-xs text-slate-500">
              {autoRefresh ? (
                <p>
                  Updates automatically every 5 seconds
                  <br />
                  Last updated:{" "}
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : (
                <p>Auto-refresh paused</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

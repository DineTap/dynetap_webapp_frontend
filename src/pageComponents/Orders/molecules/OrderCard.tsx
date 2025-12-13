"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { ChevronDown, ChevronUp, Clock, MapPin, User, Phone, MessageSquare } from "lucide-react";
import { formatPrice } from "~/utils/formatPrice";
import { mockApi as api } from "~/lib/mockApi";
import { cn } from "~/utils/cn";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  preparing: { label: "Preparing", color: "bg-blue-100 text-blue-800" },
  served: { label: "Ready", color: "bg-green-100 text-green-800" },
};

interface OrderCardProps {
  order: any;
  onStatusUpdated: () => void;
}

/**
 * Individual order card with status management
 * Shows order items, customer info, and status controls
 */
export function OrderCard({ order, onStatusUpdated }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const { mutate: updateStatus } = api.checkout.updateOrderStatus.useMutation({
    onSuccess: () => {
      onStatusUpdated();
    },
  });

  const handleStatusChange = (newStatus: "preparing" | "served" | "cancelled") => {
    setIsUpdating(true);
    updateStatus(
      { orderId: order.id, newStatus },
      {
        onSettled: () => setIsUpdating(false),
      }
    );
  };

  const nextStatus =
    order.status === "pending"
      ? "preparing"
      : order.status === "preparing"
        ? "served"
        : null;

  const createdAtTime = new Date(order.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const createdAtDate = new Date(order.createdAt).toLocaleDateString();

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {/* Order Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Order Number & Status */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold font-mono text-slate-900">
                #{order.orderNumber}
              </span>
              <Badge className={cn(STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.color || "")}>
                {STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.label || order.status}
              </Badge>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{createdAtTime}</span>
              </div>
              <span>{createdAtDate}</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="text-right">
            <p className="text-sm text-slate-600">{order.items?.length || 0} items</p>
            <p className="text-xl font-bold">{formatPrice(order.totalPrice)}</p>
          </div>
        </div>

        {/* Customer Info */}
        {(order.customerEmail || order.customerPhone || order.tableNumber) && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-sm">
            {order.customerEmail && (
              <div>
                <p className="text-slate-600">Email</p>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
            )}
            {order.customerPhone && (
              <div>
                <p className="text-slate-600">Phone</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            )}
            {order.tableNumber && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-slate-600">Table</p>
                  <p className="font-medium">{order.tableNumber}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expandable Items Section */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm font-medium text-slate-900 hover:text-slate-600"
          >
            <span>Order Items ({order.items?.length || 0})</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm py-2 px-2 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium">{item.dishName}</p>
                    <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.priceAtTime * item.quantity)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Special Notes */}
        {order.notes && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex gap-2">
              <MessageSquare className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Special Requests</p>
                <p className="text-sm text-slate-600 italic mt-1">"{order.notes}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Controls */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
          {nextStatus && (
            <Button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={isUpdating}
              className="flex-1"
              size="sm"
            >
              {isUpdating ? "Updating..." : `Mark as ${nextStatus}`}
            </Button>
          )}

          {order.status !== "served" && (
            <Button
              onClick={() => handleStatusChange("cancelled")}
              disabled={isUpdating}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          )}

          {order.status === "served" && (
            <div className="flex-1 flex items-center justify-center text-sm text-green-600 font-medium">
              ✓ Completed
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

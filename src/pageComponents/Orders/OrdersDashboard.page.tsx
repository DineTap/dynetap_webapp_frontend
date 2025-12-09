"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { mockApi as api } from "~/lib/mockApi";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { AlertCircle, RefreshCw, TrendingUp, Clock, ChefHat, CheckCircle } from "lucide-react";
import { formatPrice } from "~/utils/formatPrice";
import { LoadingScreen } from "~/components/Loading";
import { OrderCard } from "./molecules/OrderCard";
import { OrderAnalytics } from "./molecules/OrderAnalytics";
import { StatusFilter } from "./molecules/StatusFilter";

type OrderStatus = "pending" | "preparing" | "served";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  preparing: { label: "Preparing", color: "bg-blue-100 text-blue-800", icon: ChefHat },
  served: { label: "Ready", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

/**
 * Restaurant orders dashboard
 * Displays incoming orders, status management, and basic analytics
 */
export function OrdersDashboard() {
  const searchParams = useSearchParams();
  const menuId = searchParams.get("menuId");

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // Get orders for current menu
  const { data: orders, isLoading, error, refetch } = api.checkout.getOrdersByMenu.useQuery(
    { menuId: menuId || "" },
    { enabled: !!menuId, staleTime: 0 }
  );

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh || !menuId) return;

    pollIntervalRef.current = setInterval(() => {
      refetch();
    }, 5000); // Poll every 5 seconds

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [autoRefresh, menuId, refetch]);

  // Filter orders by status
  const filteredOrders = orders?.orders?.filter((order: any) =>
    selectedStatus === "all" ? true : order.status === selectedStatus
  ) || [];

  // Calculate analytics
  const analytics = {
    totalOrders: orders?.orders?.length || 0,
    pendingCount: orders?.orders?.filter((o: any) => o.status === "pending").length || 0,
    preparingCount: orders?.orders?.filter((o: any) => o.status === "preparing").length || 0,
    completedCount: orders?.orders?.filter((o: any) => o.status === "served").length || 0,
    totalRevenue: orders?.orders?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0,
    popularDishes: calculatePopularDishes(orders?.orders || []),
  };

  if (!menuId) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">No Menu Selected</h1>
          <p className="text-slate-600">Please select a menu from your dashboard</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Error Loading Orders</h1>
          <p className="text-slate-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-slate-600 mt-1">Manage incoming orders and track preparation</p>
        </div>
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

      {/* Analytics Cards */}
      <OrderAnalytics analytics={analytics} />

      {/* Filters & Status */}
      <div className="flex items-center justify-between">
        <StatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          counts={{
            all: analytics.totalOrders,
            pending: analytics.pendingCount,
            preparing: analytics.preparingCount,
            served: analytics.completedCount,
          }}
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <p className="text-slate-600">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusUpdated={() => refetch()} />
          ))
        )}
      </div>

      {/* Auto-refresh Info */}
      <div className="text-center text-xs text-slate-500 mt-8">
        {autoRefresh ? (
          <p>
            Updates automatically every 5 seconds
            <br />
            Last updated:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        ) : (
          <p>Auto-refresh paused</p>
        )}
      </div>
    </div>
  );
}

/**
 * Calculate popular dishes from orders
 */
function calculatePopularDishes(
  orders: any[]
): Array<{ name: string; count: number; revenue: number }> {
  const dishMap = new Map<string, { count: number; revenue: number }>();

  for (const order of orders) {
    for (const item of order.items || []) {
      const key = item.dishName || "Unknown";
      const existing = dishMap.get(key) || { count: 0, revenue: 0 };
      dishMap.set(key, {
        count: existing.count + item.quantity,
        revenue: existing.revenue + (item.priceAtTime * item.quantity),
      });
    }
  }

  return Array.from(dishMap.entries())
    .map(([name, data]) => ({
      name,
      ...data,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

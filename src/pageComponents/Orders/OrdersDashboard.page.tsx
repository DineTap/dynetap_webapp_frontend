"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { mockApi as api } from "~/lib/mockApi";
import { Button } from "~/components/ui/button";
import { AlertCircle, RefreshCw, Clock, ChefHat, CheckCircle } from "lucide-react";
import { LoadingScreen } from "~/components/Loading";
import { OrderCard } from "./molecules/OrderCard";

type OrderStatus = "pending" | "preparing" | "served";

const COLUMN_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-50 text-yellow-900 border-yellow-200", icon: Clock },
  preparing: { label: "Preparing", color: "bg-blue-50 text-blue-900 border-blue-200", icon: ChefHat },
  served: { label: "Ready", color: "bg-green-50 text-green-900 border-green-200", icon: CheckCircle },
};

interface OrdersDashboardProps {
  menuId?: string;
  restaurantName?: string;
}

export function OrdersDashboard({ menuId: propMenuId, restaurantName }: OrdersDashboardProps) {
  const searchParams = useSearchParams();
  const searchParamMenuId = searchParams.get("menuId");
  const menuId = propMenuId || searchParamMenuId;

  const [autoRefresh, setAutoRefresh] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Group orders by status
  const ordersByStatus = {
    pending: orders?.orders?.filter((o: any) => o.status === "pending") || [],
    preparing: orders?.orders?.filter((o: any) => o.status === "preparing") || [],
    served: orders?.orders?.filter((o: any) => o.status === "served") || [],
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
    <div className="flex-1 space-y-8 p-6 max-w-[1600px] mx-auto overflow-hidden h-[calc(100vh-65px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {restaurantName && `${restaurantName} `}Orders
          </h1>
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

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
        {(Object.keys(COLUMN_CONFIG) as OrderStatus[]).map((status) => {
          const config = COLUMN_CONFIG[status];
          const statusOrders = ordersByStatus[status];

          return (
            <div key={status} className="flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden">
              {/* Column Header */}
              <div className={`p-4 border-b flex items-center justify-between ${config.color} bg-opacity-40`}>
                <div className="flex items-center gap-2 font-semibold">
                  <config.icon className="h-5 w-5" />
                  <span>{config.label}</span>
                </div>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-sm font-medium border border-black/5">
                  {statusOrders.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                {statusOrders.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                    <p className="text-sm">No orders</p>
                  </div>
                ) : (
                  statusOrders.map((order: any) => (
                    <OrderCard key={order.id} order={order} onStatusUpdated={() => refetch()} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Auto-refresh Info */}
      <div className="text-center text-xs text-slate-500 mt-2 shrink-0 pb-2">
        {autoRefresh ? (
          <p>
            Last info: {new Date().toLocaleTimeString()}
          </p>
        ) : (
          <p>Auto-refresh paused</p>
        )}
      </div>
    </div>
  );
}

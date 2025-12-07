"use client";

import { Card } from "~/components/ui/card";
import { TrendingUp, Clock, ChefHat, CheckCircle, DollarSign, Flame } from "lucide-react";
import { formatPrice } from "~/utils/formatPrice";

interface Analytics {
  totalOrders: number;
  pendingCount: number;
  preparingCount: number;
  completedCount: number;
  totalRevenue: number;
  popularDishes: Array<{ name: string; count: number; revenue: number }>;
}

interface OrderAnalyticsProps {
  analytics: Analytics;
}

/**
 * Analytics dashboard showing orders summary and popular dishes
 */
export function OrderAnalytics({ analytics }: OrderAnalyticsProps) {
  const stats = [
    {
      title: "Total Orders",
      value: analytics.totalOrders,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Pending",
      value: analytics.pendingCount,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      title: "Preparing",
      value: analytics.preparingCount,
      icon: ChefHat,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Ready",
      value: analytics.completedCount,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Total Revenue",
      value: formatPrice(analytics.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
      isPrice: true,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.isPrice ? "" : ""}`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}

      {/* Popular Dishes */}
      {analytics.popularDishes.length > 0 && (
        <Card className="p-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-orange-600" />
            <p className="font-semibold text-slate-900">Top Dishes</p>
          </div>
          <div className="space-y-2">
            {analytics.popularDishes.slice(0, 3).map((dish, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-slate-900 truncate">{dish.name}</p>
                  <span className="text-xs font-bold text-orange-600">×{dish.count}</span>
                </div>
                <p className="text-xs text-slate-500">{formatPrice(dish.revenue)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

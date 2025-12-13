"use client";

import { useSearchParams } from "next/navigation";
import { mockApi as api } from "~/lib/mockApi";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { LoadingScreen } from "~/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DailyAnalytics } from "./DailyAnalytics";
import { GeneralAnalytics } from "./GeneralAnalytics";

interface AnalyticsDashboardProps {
    menuId?: string;
    restaurantName?: string;
}

const calculateAnalytics = (orderList: any[]) => ({
    totalOrders: orderList.length,
    pendingCount: orderList.filter((o: any) => o.status === "pending").length,
    totalRevenue: orderList.reduce(
        (sum: number, o: any) => sum + (o.totalPrice || 0),
        0
    ),
    ordersCount: orderList.length,
    aov:
        orderList.length > 0
            ? orderList.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) /
            orderList.length
            : 0,
});

export function AnalyticsDashboard({
    menuId: propMenuId,
    restaurantName,
}: AnalyticsDashboardProps) {
    const searchParams = useSearchParams();
    const searchParamMenuId = searchParams.get("menuId");
    const menuId = propMenuId || searchParamMenuId;

    // Get all orders
    const {
        data: orders,
        isLoading,
        error,
        refetch,
    } = api.checkout.getOrdersByMenu.useQuery(
        { menuId: menuId || "" },
        { enabled: !!menuId }
    );

    const allOrders = orders?.orders || [];

    // Filter for daily orders (created today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyOrders = allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today;
    });

    const dailyStats = calculateAnalytics(dailyOrders);

    if (!menuId) {
        return (
            <div className="flex h-screen items-center justify-center px-4">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">No Menu Selected</h1>
                    <p className="text-slate-600">
                        Please select a menu from your dashboard
                    </p>
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
                    <h1 className="text-xl font-bold mb-2">Error Loading Analytics</h1>
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
                    <h1 className="text-3xl font-bold tracking-tight">
                        {restaurantName && `${restaurantName} `}Analytics
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Track your restaurant performance
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    <RefreshCw
                        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                </Button>
            </div>

            <Tabs defaultValue="daily" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="daily">Daily Analytics</TabsTrigger>
                    <TabsTrigger value="general">General Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="outline-none">
                    <DailyAnalytics
                        revenue={dailyStats.totalRevenue}
                        ordersCount={dailyStats.ordersCount}
                        aov={dailyStats.aov}
                        pendingCount={dailyStats.pendingCount}
                    />
                </TabsContent>
                <TabsContent value="general" className="outline-none">
                    <GeneralAnalytics />
                </TabsContent>
            </Tabs>
        </div>
    );
}

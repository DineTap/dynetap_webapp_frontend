"use client";

import { Card } from "~/components/ui/card";
import {
    DollarSign,
    ShoppingBag,
    Clock,
    UtensilsCrossed,
    Timer,
    AlertCircle,
    QrCode,
    Users,
} from "lucide-react";
import { AnalyticsCard } from "./molecules/AnalyticsCard";
import { SimpleLineChart } from "./molecules/SimpleLineChart";
import { SimpleBarList } from "./molecules/SimpleBarList";
import { formatPrice } from "~/utils/formatPrice";
import { generateHourlyRevenue, generateTopItems, generateWorstItems, generateFrequentPairs } from "./utils/mockAnalyticsData";

interface DailyAnalyticsProps {
    revenue: number;
    ordersCount: number;
    aov: number;
    pendingCount: number;
    avgPrepTime?: number; // mock
}

export function DailyAnalytics({
    revenue,
    ordersCount,
    aov,
    pendingCount,
    avgPrepTime = 18, // mock default
}: DailyAnalyticsProps) {
    const hourlyData = generateHourlyRevenue();
    const topItems = generateTopItems();
    const worstItems = generateWorstItems();
    const frequentPairs = generateFrequentPairs();

    const chartData = hourlyData.map((d) => ({
        label: d.hour,
        value: d.revenue,
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Sales & Revenue Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Sales & Revenue (Today)</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <AnalyticsCard
                        title="Total Revenue"
                        value={formatPrice(revenue)}
                        icon={DollarSign}
                        trend={{ value: 12, isPositive: true }}
                        color="text-emerald-600"
                    />
                    <AnalyticsCard
                        title="Total Orders"
                        value={ordersCount}
                        icon={ShoppingBag}
                        color="text-blue-600"
                    />
                    <AnalyticsCard
                        title="Average Order Value"
                        value={formatPrice(aov)}
                        icon={DollarSign}
                        color="text-violet-600"
                    />
                </div>

                {/* Hourly Revenue Chart */}
                <Card className="p-6">
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg">Revenue by Hour</h3>
                        <p className="text-sm text-slate-500">Peak hours performance today</p>
                    </div>
                    <SimpleLineChart data={chartData} height={250} color="#10b981" />
                </Card>
            </section>

            {/* Orders & Speed Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Orders & Speed</h2>
                <div className="grid gap-4 md:grid-cols-4">
                    <AnalyticsCard
                        title="Orders / Hour"
                        value={(ordersCount / 10).toFixed(1)} // Mock: assuming 10h open
                        icon={Timer}
                        color="text-orange-600"
                    />
                    <AnalyticsCard
                        title="Avg Prep Time"
                        value={`${avgPrepTime} min`}
                        icon={Clock}
                        trend={{ value: 5, isPositive: true }} // Faster is positive usually, but here green means good
                        description="vs yesterday"
                        color="text-indigo-600"
                    />
                    <AnalyticsCard
                        title="Avg time order → paid"
                        value="18 min"
                        icon={Timer}
                        description="Order to Payment"
                        color="text-yellow-600"
                    />
                    <AnalyticsCard
                        title="Cancelled"
                        value="2" // Mock
                        icon={AlertCircle}
                        description="1.5% rate"
                        color="text-red-500"
                    />
                </div>
            </section>

            {/* Menu Performance */}
            <div className="grid gap-6 md:grid-cols-3">
                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Top Selling Items</h2>
                    <Card className="p-6 h-full">
                        <SimpleBarList
                            items={topItems.map((i) => ({
                                label: i.name,
                                value: i.count,
                                formattedValue: `${i.count} orders`,
                                subLabel: formatPrice(i.revenue),
                                color: "#10b981",
                            }))}
                        />
                    </Card>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Needs Attention</h2>
                    <Card className="p-6 h-full">
                        <h3 className="font-medium text-slate-700 mb-4">Worst Performing Items</h3>
                        <SimpleBarList
                            items={worstItems.map((i) => ({
                                label: i.name,
                                value: i.count,
                                formattedValue: `${i.count} orders`,
                                subLabel: "Consider removing or promoting",
                                color: "#ef4444",
                            }))}
                        />
                    </Card>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Common Pairs</h2>
                    <Card className="p-6 h-full">
                        <h3 className="font-medium text-slate-700 mb-4">Frequently Ordered Together</h3>
                        <div className="space-y-4">
                            {frequentPairs.map((pair, i) => (
                                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="text-sm font-medium text-slate-700">
                                        {pair.item1} + {pair.item2}
                                    </div>
                                    <div className="text-sm text-slate-500 font-bold">{pair.count}x</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>
            </div>

            {/* Table & QR Usage */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Table & QR Usage</h2>
                <div className="grid gap-4 md:grid-cols-4">
                    <AnalyticsCard
                        title="Active Tables"
                        value="12/20"
                        icon={Users}
                        description="60% occupancy"
                        color="text-slate-700"
                    />
                    <AnalyticsCard
                        title="QR Scans"
                        value="145"
                        icon={QrCode}
                        trend={{ value: 8, isPositive: true }}
                        color="text-blue-600"
                    />
                    <AnalyticsCard
                        title="Scan Conversion"
                        value="85%"
                        icon={ShoppingBag}
                        description="Scans turning into orders"
                        color="text-green-600"
                    />
                    <AnalyticsCard
                        title="Dead Tables"
                        value="3"
                        icon={AlertCircle}
                        description="Occupied > 15m no order"
                        color="text-amber-600"
                    />
                </div>
            </section>
        </div>
    );
}

"use client";

import { Card } from "~/components/ui/card";
import {
    TrendingUp,
    Users,
    Utensils,
    Smartphone,
    Calendar,
    Zap,
    DollarSign,
    ArrowUpRight,
} from "lucide-react";
import { AnalyticsCard } from "./molecules/AnalyticsCard";
import { SimpleLineChart } from "./molecules/SimpleLineChart";
import { SimpleBarList } from "./molecules/SimpleBarList";
import { formatPrice } from "~/utils/formatPrice";
import {
    generateDailyTrends,
    generateGeneralStats,
    PAYMENT_METHODS,
    CHANNELS
} from "./utils/mockAnalyticsData";

export function GeneralAnalytics() {
    const dailyTrends = generateDailyTrends();
    const stats = generateGeneralStats();

    const revenueTrendData = dailyTrends.map((d) => ({
        label: d.day,
        value: d.revenue,
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Executive Summary */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-xl font-bold tracking-tight">Business Health Snapshot</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-5">
                    <AnalyticsCard
                        title="Revenue Trend"
                        value="Upward"
                        icon={TrendingUp}
                        trend={{ value: stats.revenueGrowth, isPositive: true }}
                        color="text-emerald-600"
                    />
                    <AnalyticsCard
                        title="AOV Trend"
                        value="Stable"
                        icon={DollarSign}
                        description="Last 30 days"
                        color="text-blue-600"
                    />
                    <AnalyticsCard
                        title="Repeat Customers"
                        value={stats.repeatRate}
                        icon={Users}
                        description="Returning guests"
                        color="text-violet-600"
                    />
                    <AnalyticsCard
                        title="Peak Hour"
                        value={stats.peakHour}
                        icon={ClockIcon} // Helper defined below or import
                        description="High volume"
                        color="text-orange-600"
                    />
                    <AnalyticsCard
                        title="QR Adoption"
                        value={stats.qrAdoption}
                        icon={Smartphone}
                        description="Digital orders"
                        color="text-slate-600"
                    />
                </div>
            </section>

            {/* Revenue Trends */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Revenue Trends (Weekly)</h2>
                    <div className="flex gap-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-full"></div> Revenue</span>
                    </div>
                </div>
                <Card className="p-6">
                    <div className="h-[300px] w-full">
                        <SimpleLineChart data={revenueTrendData} height={300} color="#2563eb" />
                    </div>
                </Card>
            </section>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Customer Behavior */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Customer Behavior</h2>
                    <Card className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-slate-500">Avg Visits / Customer</p>
                                <p className="text-2xl font-bold">{stats.avgVisits}</p>
                            </div>
                            <Users className="h-8 w-8 text-slate-200" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-slate-500">Order Abandonment</p>
                                <p className="text-2xl font-bold">{stats.orderAbandonment}</p>
                            </div>
                            <ArrowUpRight className="h-8 w-8 text-slate-200" />
                        </div>
                    </Card>
                </section>

                {/* Payment Methods */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Payment Methods</h2>
                    <Card className="p-6">
                        <SimpleBarList
                            items={PAYMENT_METHODS.map(p => ({
                                label: p.name,
                                value: p.value,
                                formattedValue: `${p.value}%`,
                                color: p.color
                            }))}
                        />
                    </Card>
                </section>

                {/* Order Channels */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Order Channels</h2>
                    <Card className="p-6">
                        <SimpleBarList
                            items={CHANNELS.map(c => ({
                                label: c.name,
                                value: c.value,
                                formattedValue: `${c.value}%`,
                                color: c.color
                            }))}
                        />
                    </Card>
                </section>
            </div>
        </div>
    );
}

function ClockIcon(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

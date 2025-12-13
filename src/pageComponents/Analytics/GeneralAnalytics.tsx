"use client";

import { useState } from "react";
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
    Clock,
    ArrowUp,
    ArrowDown,
    Minus,
    User,
    Store,
    AlertTriangle,
    ThumbsUp,
    MessageSquare,
    UtensilsCrossed,
} from "lucide-react";
import { AnalyticsCard } from "./molecules/AnalyticsCard";
import { SimpleLineChart } from "./molecules/SimpleLineChart";
import { SimpleBarList } from "./molecules/SimpleBarList";
import { formatPrice } from "~/utils/formatPrice";
import {
    generateDailyTrends,
    generateGeneralStats,
    generateMenuIntelligence,
    generateChannelPerformance,
    generateTableEfficiency,
    generateOperationalStats,
    generateCustomerExperience,
    PAYMENT_METHODS,
    CHANNELS
} from "./utils/mockAnalyticsData";

export function GeneralAnalytics() {
    const [revenueFilter, setRevenueFilter] = useState<"weekly" | "monthly" | "overall">("weekly");

    // Data Loading
    const dailyTrends = generateDailyTrends();
    const stats = generateGeneralStats();
    const menuIntelligence = generateMenuIntelligence();
    const channelPerf = generateChannelPerformance();
    const tableEff = generateTableEfficiency();
    const opsStats = generateOperationalStats();
    const cxStats = generateCustomerExperience();

    // Mock filtering logic for revenue
    const revenueTrendData = dailyTrends.map((d) => {
        let multiplier = 1;
        if (revenueFilter === "monthly") multiplier = 4;
        if (revenueFilter === "overall") multiplier = 52;
        return {
            label: d.day, // In real app, this would change to weeks/months
            value: d.revenue * multiplier,
        };
    });

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
                        icon={Clock}
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
                    <h2 className="text-xl font-bold tracking-tight">Revenue Trends</h2>
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                        {(["weekly", "monthly", "overall"] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setRevenueFilter(filter)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${revenueFilter === filter
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <Card className="p-6">
                    <div className="h-[300px] w-full">
                        <SimpleLineChart data={revenueTrendData} height={300} color="#2563eb" />
                    </div>
                </Card>
            </section>

            {/* Menu Intelligence (The Big Value) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-xl font-bold tracking-tight">Menu Intelligence</h2>
                </div>
                <Card className="overflow-hidden">
                    <div className="p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Item Name</th>
                                    <th className="px-6 py-4 text-right">Revenue</th>
                                    <th className="px-6 py-4 text-right">Profit Contribution</th>
                                    <th className="px-6 py-4 text-center">Trend</th>
                                    <th className="px-6 py-4 text-center">AOV Driver</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {menuIntelligence.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{item.name}</td>
                                        <td className="px-6 py-4 text-right">{formatPrice(item.revenue)}</td>
                                        <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                                            {formatPrice(item.profit)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.trend === "up" && <ArrowUp className="h-4 w-4 text-emerald-500 mx-auto" />}
                                            {item.trend === "down" && <ArrowDown className="h-4 w-4 text-red-500 mx-auto" />}
                                            {item.trend === "stable" && <Minus className="h-4 w-4 text-slate-400 mx-auto" />}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.aov_boost && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    Boosts AOV
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Order Channel Performance */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Order Channels</h2>
                    <Card className="p-6 space-y-6">
                        {channelPerf.channels.map((channel, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {channel.name === "QR Menu" && <Smartphone className="h-4 w-4 text-blue-500" />}
                                        {channel.name === "Waiter" && <User className="h-4 w-4 text-orange-500" />}
                                        {channel.name === "Counter" && <Store className="h-4 w-4 text-slate-500" />}
                                        <span className="font-medium">{channel.name}</span>
                                    </div>
                                    <span className="text-sm font-bold">{formatPrice(channel.revenue)}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                                    <div className="text-center">
                                        <div className="font-semibold text-slate-700">{channel.orders}</div>
                                        <div>Orders</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-slate-700 text-emerald-600">${channel.aov}</div>
                                        <div>AOV</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-slate-700">{channel.conversion}</div>
                                        <div>Conv.</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Card>
                </section>

                {/* Table & Space Efficiency */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Table Efficiency</h2>
                    <Card className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Rev / Table</p>
                                <p className="text-2xl font-bold text-slate-800">${tableEff.avgRevPerTable}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg text-center">
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Turnover</p>
                                <p className="text-2xl font-bold text-slate-800">{tableEff.turnoverTime}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                Underperforming Areas
                            </p>
                            <ul className="space-y-1">
                                {tableEff.underperforming.map((area, i) => (
                                    <li key={i} className="text-sm text-slate-600 bg-amber-50 px-2 py-1 rounded">
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </section>

                {/* Operational Efficiency */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Ops Efficiency</h2>
                    <Card className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Avg Prep Time</span>
                            <span className="font-bold text-lg">{opsStats.avgPrepTime} min</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Bottleneck Hours
                            </p>
                            {opsStats.bottlenecks.map((b, i) => (
                                <div key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                                    {b}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm text-slate-500">Refund Rate</span>
                            <span className="font-mono text-sm">{opsStats.refundRate}</span>
                        </div>
                    </Card>
                </section>
            </div>

            {/* Customer Experience Signals */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-bold tracking-tight">Customer Experience Signals</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <AnalyticsCard
                        title="Abandonment"
                        value={cxStats.abandonmentRate}
                        icon={Minus}
                        description="Cart abandonment"
                        color="text-red-500"
                    />
                    <AnalyticsCard
                        title="Drop-off"
                        value={cxStats.paymentDropOff}
                        icon={AlertTriangle}
                        description="Payment failure"
                        color="text-orange-500"
                    />
                    <AnalyticsCard
                        title="Avg Rating"
                        value={cxStats.avgRating}
                        icon={ThumbsUp}
                        description="Post-payment rating"
                        color="text-yellow-500"
                    />
                    <Card className="p-6 bg-slate-50 border-dashed">
                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-medium">
                            <MessageSquare className="h-4 w-4" /> Common Issues
                        </div>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                            {cxStats.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </section>
        </div>
    );
}



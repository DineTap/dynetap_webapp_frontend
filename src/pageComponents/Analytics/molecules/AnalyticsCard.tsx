"use client";

import { Card } from "~/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "~/utils/cn";

interface AnalyticsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
    color?: string; // Tailwind text color class
    className?: string;
}

export function AnalyticsCard({
    title,
    value,
    icon: Icon,
    trend,
    description,
    color = "text-slate-600",
    className,
}: AnalyticsCardProps) {
    return (
        <Card className={cn("p-6", className)}>
            <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div className="flex flex-col gap-1">
                <div className="text-2xl font-bold">{value}</div>
                {(trend || description) && (
                    <p className="text-xs text-slate-500">
                        {trend && (
                            <span
                                className={cn(
                                    "font-medium mr-2",
                                    trend.isPositive ? "text-green-600" : "text-red-600"
                                )}
                            >
                                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                            </span>
                        )}
                        {description}
                    </p>
                )}
            </div>
        </Card>
    );
}

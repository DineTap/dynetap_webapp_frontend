"use client";

import { formatPrice } from "~/utils/formatPrice";

interface BarItem {
    label: string;
    subLabel?: string;
    value: number;
    formattedValue?: string;
    color?: string;
}

interface SimpleBarListProps {
    items: BarItem[];
    showValue?: boolean;
}

export function SimpleBarList({ items, showValue = true }: SimpleBarListProps) {
    const max = Math.max(...items.map((i) => i.value));

    return (
        <div className="space-y-4">
            {items.map((item, idx) => (
                <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 truncate pr-4">{item.label}</span>
                        {showValue && (
                            <span className="text-slate-500 tabular-nums">
                                {item.formattedValue || item.value}
                            </span>
                        )}
                    </div>
                    <div className="h-2 w-full rouned-full bg-slate-100 overflow-hidden rounded-full">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-in-out"
                            style={{
                                width: `${(item.value / max) * 100}%`,
                                backgroundColor: item.color || "#3b82f6",
                            }}
                        />
                    </div>
                    {item.subLabel && <p className="text-xs text-slate-400">{item.subLabel}</p>}
                </div>
            ))}
        </div>
    );
}

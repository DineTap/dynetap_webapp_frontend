"use client";

import { useMemo } from "react";

interface DataPoint {
    label: string;
    value: number;
}

interface SimpleLineChartProps {
    data: DataPoint[];
    height?: number;
    color?: string;
}

export function SimpleLineChart({ data, height = 200, color = "#2563eb" }: SimpleLineChartProps) {
    const points = useMemo(() => {
        if (!data.length) return "";
        const max = Math.max(...data.map((d) => d.value));
        const min = 0;
        const range = max - min;

        return data
            .map((d, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 100 - ((d.value - min) / range) * 100;
                return `${x},${y}`;
            })
            .join(" ");
    }, [data]);

    return (
        <div className="w-full relative" style={{ height }}>
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
            >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                    <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="100"
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                    />
                ))}

                {/* Line */}
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-400">
                {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d) => (
                    <span key={d.label}>{d.label}</span>
                ))}
            </div>
        </div>
    );
}

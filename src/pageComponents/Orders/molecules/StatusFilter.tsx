"use client";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/utils/cn";

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: "all" | "pending" | "preparing" | "served") => void;
  counts: {
    all: number;
    pending: number;
    preparing: number;
    served: number;
  };
}

const STATUSES = [
  {
    id: "all",
    label: "All Orders",
    color: "bg-slate-100 hover:bg-slate-200 text-slate-900",
  },
  {
    id: "pending",
    label: "Pending",
    color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-900",
  },
  {
    id: "preparing",
    label: "Preparing",
    color: "bg-blue-100 hover:bg-blue-200 text-blue-900",
  },
  {
    id: "served",
    label: "Ready",
    color: "bg-green-100 hover:bg-green-200 text-green-900",
  },
];

/**
 * Filter buttons for order status
 */
export function StatusFilter({ selectedStatus, onStatusChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((status) => {
        const count = counts[status.id as keyof typeof counts];
        const isSelected = selectedStatus === status.id;

        return (
          <Button
            key={status.id}
            onClick={() => onStatusChange(status.id as any)}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              isSelected ? "" : status.color,
              "transition-colors"
            )}
          >
            {status.label}
            <Badge variant="secondary" className="ml-2">
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}

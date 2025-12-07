"use client";

import { Input } from "~/components/ui/input";

interface TableNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Input for table number assignment
 * Format is flexible: "5", "A3", "Window-1", etc.
 * Optional field - can be left blank for delivery or added later
 */
export function TableNumberInput({
  value,
  onChange,
  placeholder = "e.g., 5, Table A3, Window-1",
  disabled = false,
}: TableNumberInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Where are you sitting? (Optional)</label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={10}
        disabled={disabled}
        className="border-2"
      />
      <p className="text-xs text-slate-500">
        Leave blank if you're not dining in, or add it later at pickup
      </p>
    </div>
  );
}

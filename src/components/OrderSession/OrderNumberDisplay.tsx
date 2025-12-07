"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface OrderNumberDisplayProps {
  orderNumber: string;
  onClose?: () => void;
}

/**
 * Display current order number prominently
 * Allows customer to copy and share with others to add items together
 */
export function OrderNumberDisplay({ orderNumber, onClose }: OrderNumberDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-lg">
        <h2 className="mb-2 text-sm text-slate-600">Your Order Number</h2>
        
        <div className="mb-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="text-5xl font-bold tracking-widest text-primary">
            {orderNumber}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Share this number with others to add items together
          </p>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-slate-700">
            You can now add items to your order, or share this number with friends at your table.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Number
              </>
            )}
          </Button>
          
          {onClose && (
            <Button onClick={onClose} className="flex-1">
              Start Adding Items
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

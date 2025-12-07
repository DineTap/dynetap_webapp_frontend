import crypto from "crypto";

/**
 * Yoco Checkout API utilities
 * https://developer.yoco.com/docs/checkout-api
 * https://developer.yoco.com/guides/online-payments/accepting-a-payment
 */

interface YocoCheckoutRequest {
  amount: number; // Amount in cents (e.g., 2500 = R25.00)
  currency: string; // e.g., "ZAR"
  metadata?: Record<string, string>; // Custom data (orderNumber, customerId, etc)
  successUrl?: string; // URL to redirect after successful payment (for reference only)
  failureUrl?: string; // URL to redirect after failed payment (for reference only)
}

interface YocoCheckoutResponse {
  id: string; // Checkout session ID
  redirectUrl: string; // URL to send customer for payment
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  createdAt?: string;
}

/**
 * Create a Yoco checkout session
 * Per Yoco docs: Always call from server, never from browser
 * https://developer.yoco.com/api-reference/checkout-api/checkout/create-checkout
 */
export async function createYocoCheckout(
  request: YocoCheckoutRequest,
  apiKey: string
): Promise<YocoCheckoutResponse> {
  if (!apiKey || !apiKey.startsWith("sk_")) {
    throw new Error("Invalid Yoco API key (must start with sk_)");
  }

  const response = await fetch("https://payments.yoco.com/api/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: request.amount,
      currency: request.currency,
      metadata: request.metadata,
      successUrl: request.successUrl,
      failureUrl: request.failureUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Yoco API error:", error);
    throw new Error(
      `Yoco checkout creation failed: ${error.message || response.statusText}`
    );
  }

  const checkout = await response.json();
  return checkout;
}

/**
 * Verify Yoco webhook signature
 * Per Yoco docs: verify event authenticity using signature
 * https://developer.yoco.com/guides/online-payments/webhooks/verifying-the-events
 */
export function verifyYocoSignature(
  body: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    // Yoco uses HMAC-SHA256 with the raw body
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(body);
    const expectedSignature = hmac.digest("hex");

    // Compare signatures
    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Yoco webhook payload structure
 * Per Yoco docs: https://developer.yoco.com/api-reference/checkout-api/webhook-events
 *
 * Event types:
 * - payment_notification: when payment succeeds or fails
 * - refund_notification: when refund is processed
 */
export interface YocoPaymentData {
  id: string;
  status: "success" | "failed" | "pending";
  amount: number;
  currency: string;
  failureReason?: string;
}

export interface YocoCheckoutData {
  id: string; // Checkout session ID
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface YocoWebhookPayload {
  type: "payment_notification" | "refund_notification";
  created: string; // ISO timestamp
  id: string; // Event ID
  metadata: {
    checkoutId: string; // Match this with your checkout ID
  };
  data: {
    checkout: YocoCheckoutData;
    payment: YocoPaymentData;
  };
}

export function parseYocoWebhook(body: string): YocoWebhookPayload {
  return JSON.parse(body) as YocoWebhookPayload;
}

/**
 * Generate a 5-digit order number
 * Used for customer-facing order identification
 */
export function generateOrderNumber(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * Format currency amount for Yoco (cents)
 * Yoco expects amounts in the smallest currency unit (cents for ZAR)
 */
export function formatYocoAmount(rands: number): number {
  return Math.round(rands * 100);
}

/**
 * Parse Yoco amount (cents) to readable format
 */
export function parseYocoAmount(cents: number): number {
  return cents / 100;
}

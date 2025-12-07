import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env.mjs";
import { verifyYocoSignature, parseYocoWebhook } from "~/utils/yoco";
import { db } from "~/server/db";

/**
 * Webhook handler for Yoco payment events (Checkout API)
 * POST /api/webhooks/yoco
 *
 * Per Yoco Checkout API docs:
 * - https://developer.yoco.com/guides/online-payments/webhooks/listen-for-events
 *
 * Handles:
 * - payment_notification: Customer completed payment, create Order record
 * - refund_notification: Payment was refunded, update order status
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("x-yoco-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 401 }
      );
    }

    // Verify webhook came from Yoco
    const isValid = verifyYocoSignature(
      body,
      signature,
      env.YOCO_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.warn("Invalid Yoco webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const webhook = parseYocoWebhook(body);

    console.log("Received Yoco webhook:", webhook.type);

    // Handle payment_notification (payment completed successfully)
    // Per Yoco docs: https://developer.yoco.com/guides/online-payments/webhooks/listen-for-events
    if (webhook.type === "payment_notification") {
      const { checkout, payment } = webhook.data;

      // Only process successful payments
      if (payment.status !== "success") {
        console.log("Ignoring non-success payment status:", payment.status);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Extract metadata from checkout
      const metadata = checkout.metadata || {};
      if (!metadata.orderNumber || !metadata.menuId) {
        console.error("Missing required metadata in webhook");
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      try {
        // Create order in database
        const order = await db.orders.create({
          data: {
            yocoChargeId: payment.id,
            yocoCheckoutId: checkout.id,
            orderNumber: metadata.orderNumber,
            menuId: metadata.menuId,
            totalPrice: checkout.amount ? checkout.amount / 100 : 0, // Yoco returns amount in cents
            status: "pending",
            paymentStatus: "paid",
            customerEmail: metadata.customerEmail || "unknown@example.com",
            customerPhone: metadata.customerPhone || "unknown",
            tableNumber: metadata.tableNumber || null,
            notes: metadata.notes || null,
          },
        });

        console.log("Order created from payment_notification:", order.id);

        // TODO: Create OrderItems from metadata if stored there
        // TODO: Emit real-time event to restaurant dashboard
        // TODO: Send order confirmation email to customer

        return NextResponse.json(
          { success: true, orderId: order.id },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error creating order from payment:", error);
        return NextResponse.json(
          { error: "Failed to create order" },
          { status: 500 }
        );
      }
    }

    // Handle refund_notification
    // Per Yoco docs: https://developer.yoco.com/guides/online-payments/webhooks/listen-for-events
    if (webhook.type === "refund_notification") {
      const { checkout, payment } = webhook.data;

      try {
        // Find order by payment ID or checkout ID
        const order = await db.orders.findFirst({
          where: {
            OR: [
              { yocoChargeId: payment.id },
              { yocoCheckoutId: checkout.id },
            ],
          },
        });

        if (order) {
          await db.orders.update({
            where: { id: order.id },
            data: {
              paymentStatus: "refunded",
            },
          });

          console.log("Order refunded:", order.id);
          // TODO: Send refund confirmation email to customer
        } else {
          console.warn(
            "Refund webhook received but no matching order found",
            payment.id
          );
        }

        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error("Error processing refund:", error);
        return NextResponse.json(
          { error: "Failed to process refund" },
          { status: 500 }
        );
      }
    }

    // Unknown webhook type
    console.warn("Unknown webhook type:", webhook.type);
    return NextResponse.json(
      { error: "Unknown webhook type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

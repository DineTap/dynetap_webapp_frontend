import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createYocoCheckout } from "~/utils/yoco";
import { env } from "~/env.mjs";
import { getBaseUrl } from "~/utils/getBaseUrl";

// Validation schemas
const initiateCheckoutSchema = z.object({
  menuId: z.string().uuid("Invalid menu ID"),
  orderNumber: z.string().min(5).max(5),
  items: z.array(
    z.object({
      dishId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  tableNumber: z.string().max(10).optional(),
  notes: z.string().max(500).optional(),
});

const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  newStatus: z.enum(["preparing", "served", "cancelled"]),
});

const getOrderStatusSchema = z.object({
  orderNumber: z.string().min(5).max(5),
});

const getOrdersByMenuSchema = z.object({
  menuId: z.string().uuid(),
  status: z.enum(["pending", "preparing", "served", "cancelled"]).optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

const getOrderHistorySchema = z.object({
  menuId: z.string().uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const createOrJoinSessionSchema = z.object({
  menuId: z.string().uuid(),
  action: z.enum(["create", "join"]),
  orderNumber: z.string().min(5).max(5).optional(),
});

export const checkoutRouter = createTRPCRouter({
  /**
   * Create a new checkout session with Yoco
   * Per Yoco docs: https://developer.yoco.com/guides/online-payments/accepting-a-payment
   * Flow:
   * 1. This endpoint creates a checkout session on Yoco
   * 2. Returns redirectUrl to send customer to Yoco's hosted checkout
   * 3. Customer pays on Yoco's secure page
   * 4. Yoco sends webhook to /api/webhooks/yoco when payment completes
   * 5. Webhook creates the Order record in our database
   */
  initiateCheckout: publicProcedure
    .input(initiateCheckoutSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate menu exists
      const menu = await ctx.db.menus.findUnique({
        where: { id: input.menuId },
      });

      if (!menu) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu not found",
        });
      }

      // Validate all dishes exist and belong to menu
      for (const item of input.items) {
        const dish = await ctx.db.dishes.findUnique({
          where: { id: item.dishId },
        });

        if (!dish || dish.menuId !== input.menuId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Dish ${item.dishId} not found in this menu`,
          });
        }
      }

      // Calculate total price from fresh dish prices
      let totalPrice = 0;
      for (const item of input.items) {
        const dish = await ctx.db.dishes.findUniqueOrThrow({
          where: { id: item.dishId },
        });
        totalPrice += dish.price * item.quantity;
      }

      try {
        // Create checkout session with Yoco
        // This returns a redirectUrl that customer visits to pay
        const yocoCheckout = await createYocoCheckout(
          {
            amount: totalPrice, // Already in cents from database
            currency: "ZAR",
            metadata: {
              orderNumber: input.orderNumber,
              menuId: input.menuId,
              customerEmail: input.customerEmail,
              customerPhone: input.customerPhone,
              tableNumber: input.tableNumber || "",
              notes: input.notes || "",
            },
            // These URLs are just for reference in Yoco dashboard
            // Do NOT rely on redirect to confirm payment - use webhook instead!
            successUrl: `${getBaseUrl()}/checkout/success?orderNumber=${input.orderNumber}`,
            failureUrl: `${getBaseUrl()}/checkout/failure?orderNumber=${input.orderNumber}`,
          },
          env.YOCO_SECRET_KEY
        );

        return {
          checkoutId: yocoCheckout.id,
          redirectUrl: yocoCheckout.redirectUrl, // Customer visits this URL to pay
          totalPrice,
          orderNumber: input.orderNumber,
        };
      } catch (error) {
        console.error("Yoco checkout creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
    }),

  /**
   * Get order status by order number
   * Called by customers to track their order
   * PUBLIC endpoint - anyone with order number can access
   */
  getOrderStatus: publicProcedure
    .input(getOrderStatusSchema)
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.orders.findFirst({
        where: {
          orderNumber: input.orderNumber,
        },
        include: {
          items: {
            include: {
              dish: true,
            },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      return order;
    }),

  /**
   * Get all orders for a menu
   * PRIVATE endpoint - menu owner only
   * Only returns PAID orders
   */
  getOrdersByMenu: privateProcedure
    .input(getOrdersByMenuSchema)
    .query(async ({ ctx, input }) => {
      // Verify user owns this menu
      const menu = await ctx.db.menus.findUnique({
        where: { id: input.menuId },
      });

      if (!menu || menu.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this menu",
        });
      }

      // Build where clause
      const where: any = {
        menuId: input.menuId,
        paymentStatus: "paid", // Only paid orders
      };

      if (input.status) {
        where.status = input.status;
      }

      // Get orders
      const orders = await ctx.db.orders.findMany({
        where,
        include: {
          items: {
            include: {
              dish: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        skip: input.offset,
      });

      // Get total count
      const total = await ctx.db.orders.count({ where });

      return {
        orders,
        total,
      };
    }),

  /**
   * Update order status (pending → preparing, preparing → served, etc.)
   * PRIVATE endpoint - menu owner only
   */
  updateOrderStatus: privateProcedure
    .input(updateOrderStatusSchema)
    .mutation(async ({ ctx, input }) => {
      // Get order with menu
      const order = await ctx.db.orders.findUnique({
        where: { id: input.orderId },
        include: { menu: true },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Verify user owns the menu
      if (order.menu.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this order",
        });
      }

      // Can only update paid orders
      if (order.paymentStatus !== "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only update status for paid orders",
        });
      }

      // Validate status transition
      const validNextStatuses: Record<string, string[]> = {
        pending: ["preparing", "cancelled"],
        preparing: ["served", "cancelled"],
        served: [],
        cancelled: [],
      };

      if (!validNextStatuses[order.status]?.includes(input.newStatus)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot transition from ${order.status} to ${input.newStatus}`,
        });
      }

      // Update order
      const updatedOrder = await ctx.db.orders.update({
        where: { id: input.orderId },
        data: {
          status: input.newStatus,
          updatedAt: new Date(),
        },
      });

      // TODO: Emit real-time event to customer (via WebSocket or polling mechanism)
      // Customers can see status changes within 5 seconds via polling

      return updatedOrder;
    }),

  /**
   * Get order history for analytics
   * PRIVATE endpoint - menu owner only
   * Returns metrics: total revenue, order count, status breakdown, popular dishes
   */
  getOrderHistory: privateProcedure
    .input(getOrderHistorySchema)
    .query(async ({ ctx, input }) => {
      // Verify user owns menu
      const menu = await ctx.db.menus.findUnique({
        where: { id: input.menuId },
      });

      if (!menu || menu.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this menu",
        });
      }

      // Build where clause
      const where: any = {
        menuId: input.menuId,
        paymentStatus: "paid",
      };

      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) {
          where.createdAt.gte = input.startDate;
        }
        if (input.endDate) {
          where.createdAt.lte = input.endDate;
        }
      }

      // Get all orders
      const orders = await ctx.db.orders.findMany({
        where,
        include: {
          items: {
            include: {
              dish: true,
            },
          },
        },
      });

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
      const orderCount = orders.length;
      const statusBreakdown = {
        pending: orders.filter((o) => o.status === "pending").length,
        preparing: orders.filter((o) => o.status === "preparing").length,
        served: orders.filter((o) => o.status === "served").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
      };

      // Get popular dishes
      const dishCounts: Record<string, { count: number; name: string; revenue: number }> = {};
      for (const order of orders) {
        for (const item of order.items) {
          const dishId = item.dishId;
          if (!dishCounts[dishId]) {
            dishCounts[dishId] = {
              count: 0,
              name: item.dishName || item.dish?.name || "Unknown Dish",
              revenue: 0,
            };
          }
          const dish = dishCounts[dishId];
          dish.count += item.quantity;
          dish.revenue += item.priceAtTime * item.quantity;
        }
      }

      const popularDishes = Object.entries(dishCounts)
        .map(([_, data]) => data)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        orders,
        totalRevenue,
        orderCount,
        statusBreakdown,
        popularDishes,
      };
    }),

  /**
   * Create or join an order session
   * Returns a session ID or validates existing order number
   * PUBLIC endpoint
   */
  createOrJoinSession: publicProcedure
    .input(createOrJoinSessionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify menu exists
      const menu = await ctx.db.menus.findUnique({
        where: { id: input.menuId },
      });

      if (!menu) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Menu not found",
        });
      }

      if (input.action === "create") {
        // Generate new 5-digit order number
        // TODO: In production, use a proper sequence or UUID-based number
        const orderNumber = Math.floor(10000 + Math.random() * 90000).toString();

        return {
          orderNumber,
          action: "create",
          message: `Order #${orderNumber} created. Share this number with others to add items together.`,
        };
      }

      if (input.action === "join") {
        if (!input.orderNumber) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Order number required to join",
          });
        }

        // Validate order number exists and is active (created within last hour, not yet paid)
        // This is a simplified check - in production, you'd validate against actual session storage
        const existingOrder = await ctx.db.orders.findFirst({
          where: {
            orderNumber: input.orderNumber,
            menuId: input.menuId,
          },
        });

        // If no database record yet, session is still in progress (not yet paid)
        // If record exists and unpaid, allow joining
        if (existingOrder && existingOrder.paymentStatus !== "unpaid") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This order number is not available to join",
          });
        }

        return {
          orderNumber: input.orderNumber,
          action: "join",
          valid: true,
          message: `Successfully joined order #${input.orderNumber}`,
        };
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid action",
      });
    }),
});
